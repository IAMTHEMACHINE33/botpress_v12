import * as sdk from 'botpress/sdk'
import fs from 'fs'
import _ from 'lodash'
import tmp from 'tmp'

import { ExtractedSlot, Intent, Utterance, UtteranceToken } from '../../engine2'
import { BIO } from '../../typings'

import * as featurizer from './featurizer2'
import * as labeler from './labeler2'

const debug = DEBUG('nlu').sub('slots')
const debugTrain = debug.sub('train')
const debugExtract = debug.sub('extract')

// TODO grid search / optimization for those hyperparams
const NUM_CLUSTERS = 8
const KMEANS_OPTIONS = {
  iterations: 250,
  initialization: 'random',
  seed: 666 // so training is consistent
} as sdk.MLToolkit.KMeans.KMeansOptions

const CRF_TRAINER_PARAMS = {
  c1: '0.0001',
  c2: '0.01',
  max_iterations: '500',
  'feature.possible_transitions': '1',
  'feature.possible_states': '1'
}

export default class CRFExtractor2 {
  private _isTrained: boolean = false
  private _crfModelFn = ''
  private _crfTagger!: sdk.MLToolkit.CRF.Tagger
  private _kmeansModel: sdk.MLToolkit.KMeans.KmeansResult

  constructor(private mlToolkit: typeof sdk.MLToolkit) {}

  load(intents: Intent<Utterance>[], crf: Buffer) {
    this._trainKmeans(intents) // retrain because we don't have access to KmeansResult class

    this._crfModelFn = tmp.tmpNameSync()
    fs.writeFileSync(this._crfModelFn, crf)
    this._readTagger()
    this._isTrained = true
  }

  private _readTagger() {
    debugTrain('reading tagger')
    this._crfTagger = this.mlToolkit.CRF.createTagger()
    this._crfTagger.open(this._crfModelFn)
  }

  async train(intents: Intent<Utterance>[]): Promise<void> {
    this._isTrained = false
    if (intents.length < 2) {
      debugTrain('training set too small, skipping training')
      return
    }
    debugTrain('start training')

    intents = intents.filter(i => i.name !== 'none') // none intent makes no sens for slot tagger
    this._trainKmeans(intents)
    this._trainCrf(intents)
    this._readTagger()
    this._isTrained = true

    debugTrain('done training')
  }

  get serialized() {
    return (async () => await Promise.fromCallback(cb => fs.readFile(this._crfModelFn, cb)))()
  }

  private _trainKmeans(intents: Intent<Utterance>[]) {
    debugTrain('training kmeans')
    const data = _.chain(intents)
      .flatMapDeep(i => i.utterances.map(u => u.tokens))
      .uniqBy((t: UtteranceToken) => t.value)
      .map((t: UtteranceToken) => t.vectors)
      .value() as number[][]

    if (_.isEmpty(data)) {
      return
    }

    const k = data.length > NUM_CLUSTERS ? NUM_CLUSTERS : 2

    this._kmeansModel = this.mlToolkit.KMeans.kmeans(data, k, KMEANS_OPTIONS)
  }

  private _trainCrf(intents: Intent<Utterance>[]) {
    debugTrain('training CRF')
    this._crfModelFn = tmp.fileSync({ postfix: '.bin' }).name
    const trainer = this.mlToolkit.CRF.createTrainer()

    trainer.set_params(CRF_TRAINER_PARAMS)
    trainer.set_callback(str => debugTrain('CRFSUITE', str))

    for (const intent of intents) {
      for (const utterance of intent.utterances) {
        const features: string[][] = utterance.tokens.map(this.tokenSliceFeatures.bind(this, intent, utterance, false))
        const labels = labeler.labelizeUtterance(utterance)

        trainer.append(features, labels)
      }
    }

    trainer.train(this._crfModelFn)
  }

  private tokenSliceFeatures(
    intent: Intent<Utterance>,
    utterance: Utterance,
    isPredict: boolean,
    token: UtteranceToken
  ): string[] {
    const prevTok = utterance.tokens[token.index - 1]
    const nexTok = utterance.tokens[token.index + 1]

    const prevFeats = this._getTokenFeatures(intent, utterance, prevTok, isPredict).filter(f => f.name !== 'quartile')
    const current = this._getTokenFeatures(intent, utterance, token, isPredict).filter(f => f.name !== 'cluster')
    const nextFeats = this._getTokenFeatures(intent, utterance, nexTok, isPredict).filter(f => f.name !== 'quartile')

    const prevPairs = featurizer.getFeatPairs(prevFeats, current, ['word', 'vocab', 'weight'])
    const nextPairs = featurizer.getFeatPairs(current, nextFeats, ['word', 'vocab', 'weight'])

    const intentFeat = featurizer.getIntentFeature(intent)
    const bos = token.isBOS ? ['__BOS__'] : []
    const eos = token.isEOS ? ['__EOS__'] : []

    return [
      ...bos,
      featurizer.featToCRFsuiteAttr('', intentFeat),
      ...prevFeats.map(featurizer.featToCRFsuiteAttr.bind(this, 'w[-1]')),
      ...current.map(featurizer.featToCRFsuiteAttr.bind(this, 'w[0]')),
      ...nextFeats.map(featurizer.featToCRFsuiteAttr.bind(this, 'w[1]')),
      ...prevPairs.map(featurizer.featToCRFsuiteAttr.bind(this, 'w[-1]|w[0]')),
      ...nextPairs.map(featurizer.featToCRFsuiteAttr.bind(this, 'w[0]|w[1]')),
      ...eos
    ] as string[]
  }

  private _getTokenFeatures(
    intent: Intent<Utterance>,
    utterance: Utterance,
    token: UtteranceToken,
    isPredict: boolean
  ): featurizer.CRFFeature[] {
    if (!token || !token.value) {
      return []
    }

    return [
      featurizer.getTokenQuartile(utterance, token),
      featurizer.getClusterFeat(token, this._kmeansModel),
      featurizer.getWordWeight(token),
      featurizer.getInVocabFeat(token, intent),
      featurizer.getSpaceFeat(token),
      featurizer.getAlpha(token),
      featurizer.getNum(token),
      featurizer.getSpecialChars(token),
      featurizer.getWordFeat(token, isPredict),
      ...featurizer.getEntitiesFeats(token, intent.slot_entities, isPredict)
    ].filter(_.identity) // some features can be undefined
  }

  async extract(
    utterance: Utterance,
    intent: Intent<Utterance>
  ): Promise<{ slot: ExtractedSlot; start: number; end: number }[]> {
    const features: string[][] = utterance.tokens.map(this.tokenSliceFeatures.bind(this, intent, utterance, true))
    debugExtract('vectorize', features)

    const predictions = this._crfTagger
      .marginal(features)
      .map(labeler.predictionLabelToTagResult)
      .map(res => labeler.swapInvalidTags(res, intent))

    // move this into labeler ?
    return _.zip(utterance.tokens, predictions)
      .filter(([token, tag]) => tag.tag !== BIO.OUT)
      .reduce(
        (combined, [token, tag]) => {
          const prev = _.last(combined)
          const shouldConcatWithPrev = tag.tag === BIO.INSIDE && prev.slot.name === tag.name

          if (shouldConcatWithPrev) {
            prev.slot.source += token.toString()
            prev.end += token.value.length

            return [...combined.slice(0, -1), prev]
          } else {
            return [
              ...combined,
              {
                slot: {
                  name: tag.name,
                  confidence: tag.probability,
                  source: token.toString()
                },
                start: token.offset,
                end: token.offset + token.value.length
              }
            ]
          }
        },
        [] as { slot: ExtractedSlot; start: number; end: number }[]
      )
  }
}
