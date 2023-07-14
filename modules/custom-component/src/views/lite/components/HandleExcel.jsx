import React from 'react'
import * as xlsx from 'xlsx'
import { Button, Card, Elevation, Classes, Icon, FileInput, AnchorButton, HTMLTable } from '@blueprintjs/core'

export class HandleExcel extends React.Component {
  // state = {
  //   username: null,
  //   password: null
  // }
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.state = {
      result: {},
      file: '',
      data: [],
      finalResult: {}
    }
  }
  handleClick(e) {
    this.refs.fileUploader.click()
  }

  filePathSet(e) {
    e.stopPropagation()
    e.preventDefault()
    const file = e.target.files[0]
    console.log('file: ', file)
    this.setState({ file })
    // console.log('state file: ', this.state.file)
  }

  readFile() {
    const f = this.state.file
    const name = f.name
    const reader = new FileReader()
    reader.onload = evt => {
      /* Parse data */
      const bstr = evt.target.result
      const wb = xlsx.read(bstr, { type: 'binary' })
      /* Get first worksheet */
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      /* Convert array of arrays */
      const data = xlsx.utils.sheet_to_csv(ws, { header: 1 })
      /* Update state */
      // console.log(this.convertToJson(data)) // shows data in json format
      this.setState({ data: this.convertToJson(data) })
      console.log('from state data: ', this.state.data)
      const finalResult = []
      console.log('after state data:', this.state.data[0].sno)
      for (let i = 1, j = this.state.data.length; i < j; i++) {
        if (this.state.data[i - 1].sno != this.state.data[i].sno || i + 1 == j) {
          finalResult.push({
            id: this.state.data[i - 1].sno,
            data: {
              questions: {
                en: []
              },
              answers: {
                en: [this.state.data[i - 1].answer]
              },
              redirectFlow: '',
              redirectNode: '',
              action: 'text',
              enabled: true,
              contexts: ['global']
            }
          })
        }
      }

      for (let a = 0, b = finalResult.length; a < b; a++) {
        for (let i = 1, j = this.state.data.length; i < j; i++) {
          if (this.state.data[i - 1].sno == a + 1) {
            finalResult[a].data.questions.en.push(this.state.data[i - 1].questions)
          }
        }
      }

      // for (let i = 1, j = this.state.data.length; i < j; i++) {
      //   // console.log(this.state.data[i - 1].sno, i - 1)
      //   // console.log(this.state.data[i].sno, i)

      //   tempResult.data.questions.en[i - 1] = this.state.data[i - 1].questions
      //   if (this.state.data[i - 1].sno != this.state.data[i].sno || i + 1 == j) {
      //     console.log('asd')
      //     tempResult.id = this.state.data[i - 1].sno
      //   }
      //   // if (i == 1 || this.state.data[i - 1].sno != this.state.data[i]?.sno) {
      //   //   tempResult.id = this.state.data[i - 1].sno
      //   //   tempResult.answer = this.state.data[i - 1].answer.en[0]
      //   // }
      // }
      //console.log('tempResult', tempResult)
      console.log('finalResult', finalResult)
      this.setState({ qna: { qnas: finalResult } })
    }
    reader.readAsBinaryString(f)
  }

  convertToJson(csv) {
    const lines = csv.split('\n')
    const result = []
    const result2 = []
    const headers = lines[0].split(',')
    for (let i = 1; i < lines.length; i++) {
      const obj = {}
      const currentline = lines[i].split(',')
      if (currentline[1] != '') {
        if (currentline[0] == '') {
          currentline[0] = result[i - 2].sno
        }
        if (currentline[2] == '') {
          currentline[2] = result[i - 2].answer
        }
      }

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j]
      }
      if (obj.questions != '') {
        result.push(obj)
        // console.log(obj)
      }
    }

    //return result; //JavaScript object
    return result //JSON
  }

  //Your login logic would go here
  login = async () => {
    alert(`This would be sent to the configured endpoint: ${this.props.endpoint}`)

    /*
    if (this.state.username && this.state.password) {
      const result = await this.props.bp.axios.post('/mywebsite/login', { username, password })
    }
    */
  }

  sendCustomEvent = () => {
    //This will act as if the user typed 'bla bla' and pressed enter.
    this.props.onSendData({ type: 'text', text: 'bla bla' })

    //You can send any type of (valid) event using the above method.
  }

  render() {
    return (
      <div
        style={{
          maxWidth: '200px',
          maxHeight: '200px'
        }}
      >
        <Card interactive={true}>
          <FileInput fill={true} text="Add xlsx File" buttonText="Upload" onChange={this.filePathSet.bind(this)} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <Button
              intent="warning"
              outlined={true}
              minimal={true}
              fill={true}
              size="small"
              onClick={() => {
                this.readFile()
              }}
            >
              <Icon icon="repeat" />
              <Icon />
            </Button>

            <AnchorButton
              intent="success"
              outlined={true}
              minimal={true}
              fill={true}
              size="small"
              href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(this.state.qna))}`}
              download="dummier.json"
            >
              <Icon icon="import" />
              <Icon />
            </AnchorButton>
            <AnchorButton
              intent="primary"
              outlined={true}
              minimal={true}
              fill={true}
              href="/assets/modules/custom-component/qna.xlsx"
              download="sample.xlsx"
            >
              <Icon icon="archive" />
              <Icon />
            </AnchorButton>
          </div>
        </Card>
      </div>
    )
  }
}
