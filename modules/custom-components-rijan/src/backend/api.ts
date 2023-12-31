import axios from 'axios'
import * as sdk from 'botpress/sdk'
import userInfo from '../../assets/user.json'
import openings from '../../assets/openings.json'
import apply from '../../assets/apply.json'
import uploadConfig from './upload'
import fs from 'fs'
import path from 'path'
// import { Configuration, OpenAIApi } from 'openai'
// require('dotenv').config()

export default async (bp: typeof sdk) => {
  const axiosConfig = bp.http.getAxiosConfigForBot('demo-bot')
  // console.log('axiosConfig', axiosConfig)
  const router = bp.http.createRouterForBot('custom-components-rijan', {
    checkAuthentication: false,
    enableJsonBodyParser: true
  })

  // Link to access this route: http://localhost:3000/api/v1/bots/BOT_NAME/mod/custom-component/test-end-point
  router.post('/test-end-point', async (req, res) => {
    const { botId } = req.params
    const { endpoint, inputValues } = req.body

    const config = (await bp.config.mergeBotConfig(botId, {})).form_header
    try {
      await axios.post(
        endpoint,
        { inputValues },
        {
          headers: { auth_token: config.auth_token }
        }
      )
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal server error')
    }
  })

  router.post('/addForm', async (req, res) => {
    try {
      console.log('running')
    } catch (error) {
      console.log('error')
    }
  })

  router.post('/login', (req, res) => {
    try {
      for (let i = 0, j = userInfo.length; i < j; i++) {
        if (userInfo[i].username == req.body.Username && userInfo[i].password == req.body.Password) {
          res.send({ message: 'login success' })
          return
        }
      }
      res.send({ message: 'invalid credentials' })
    } catch (error) {
      console.log('error', error)
    }
  })

  router.post('/addOpenings', (req, res) => {
    try {
      const filePath = path.join(__dirname, '../../assets/openings.json')

      // Data to append
      const newData = {
        position: req.body.Position,
        description: req.body.Description
      }
      // Step 1: Read existing JSON data
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err)
          return
        }

        try {
          // Step 2: Parse the JSON data
          const jsonData = JSON.parse(data)
          console.log('jsonData', jsonData)
          // Step 3: Modify the JavaScript object by appending the new data
          jsonData.openings.push(newData)
          console.log('data', jsonData)
          // Step 4: Write the updated object back to the JSON file
          fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', err => {
            if (err) {
              console.error('Error writing file:', err)
              return
            }

            console.log('Data appended successfully!')
          })
          res.send({ message: 'data added' })
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError)
        }
      })
    } catch (error) {
      console.log('error', error)
    }
  })

  router.get('/getOpenings', (req, res) => {
    try {
      const filePath = path.join(__dirname, '../../assets/openings.json')

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err)
          return
        }
        const jsonData = JSON.parse(data)
        console.log('data', jsonData)
        res.send({ message: 'success', data: jsonData })
      })
    } catch (error) {
      console.log('error', error)
    }
  })
  const botpressConfig = await bp.config.getBotpressConfig()
  const upload = uploadConfig(botpressConfig.fileUpload.allowedMimeTypes)

  router.post('/applyJob', upload.single('file'), (req, res) => {
    if (req.body.fileValidationError) {
      res.send({ message: req.body.fileValidationError })
      return
    }
    const filePathApply = path.join(__dirname, '../../assets/apply.json')
    // Data to append
    try {
      const newData = {
        name: req.body.name,
        email: req.body.email,
        position: req.body.position,
        resume: req.file?.filename
      }
      console.log('asd', req.body.Position)
      // Step 1: Read existing JSON data
      fs.readFile(filePathApply, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err)
          return
        }

        try {
          // Step 2: Parse the JSON data
          const jsonData = JSON.parse(data)

          // Step 3: Modify the JavaScript object by appending the new data
          jsonData.apply.push(newData)
          console.log('data', jsonData)
          // Step 4: Write the updated object back to the JSON file
          fs.writeFile(filePathApply, JSON.stringify(jsonData, null, 2), 'utf8', err => {
            if (err) {
              console.error('Error writing file:', err)
              return
            }

            console.log('Data appended successfully!')
          })
          res.send({ message: 'data added' })
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError)
        }
      })
    } catch (error) {
      console.log('error', error)
    }
  })

  router.get('/getApply', (req, res) => {
    try {
      const filePathApply = path.join(__dirname, '../../assets/apply.json')
      fs.readFile(filePathApply, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err)
          return
        }
        const jsonData = JSON.parse(data)
        console.log('data', jsonData)
        res.send({ message: 'success', data: jsonData })
      })
    } catch (error) {
      console.log('error', error)
    }
  })

  // router.post('/GPT', (req, res) => {
  //   try {
  //     const configuration = new Configuration({
  //       apiKey: process.env.S_KEY
  //     })

  //     const openai = new OpenAIApi(configuration)

  //     async function testic() {
  //       const completion = await openai.createChatCompletion({
  //         model: 'gpt-3.5-turbo',
  //         messages: [
  //           { role: 'system', content: 'you are a company chat bot in a website' },
  //           { role: 'user', content: req.body.prompt }
  //         ]
  //       })
  //       res.send({ message: completion.data.choices[0].message })
  //     }
  //     testic()
  //   } catch (error) {
  //     console.log('error', error)
  //   }
  // })
}
