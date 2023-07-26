import React from 'react'
import { Card, FileInput } from '@blueprintjs/core'

export class UploadImage extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.state = {
      image: '',
      file: ''
    }
  }

  handleClick(e) {
    this.refs.fileUploader.click()
  }

  // componentDidMount() {
  //   this.fetchConfig()
  // }

  async uploadFile(file) {
    var sendData = new FormData()
    // sendData.append('allowedMimeTypes', this.state.config)
    sendData.append('file', file)
    // console.log('sendData_allMime', sendData.get('allowedMimeTypes'))
    console.log('sendData_file', sendData.get('file'))
    console.log('before')
    const upload = await this.props.bp.axios.post('mod/custom-module-rijan/upload', sendData)
    console.log('after')
    console.log('upload', upload)
    return upload.data.data
  }

  // checkType() {
  //   // console.log(this.state.file.type)
  //   for (let i = 0, j = this.state.config.length; i < j; i++) {
  //     if (this.state.config[i] == this.state.file.type) {
  //       return true
  //     }
  //   }
  //   return false
  // }

  // async fetchConfig() {
  //   const config = await this.props.bp.axios.get('mod/custom-module-rijan/config')
  //   console.log(config.data.allowedMimeTypes)
  //   this.setState({ config: config.data.allowedMimeTypes })
  //   // console.log(this.state.config)
  //   return config
  // }

  filePathSet(e) {
    e.stopPropagation()
    e.preventDefault()
    const file = e.target.files[0]
    // console.log('file: ', file)
    this.setState({ file })
    // if (!this.checkType()) return
    this.uploadFile(file).then(data => {
      if (data) {
        this.setState({ image: '/assets/uploads/' + data })
        console.log('onSendData', this.props)
        this.props.onSendData({ type: 'image', file: this.state.image })

        console.log('this.state.image', this.state.image)
      }
    })
    // console.log(this.uploadFile(file))
    // console.log('state file: ', this.state.file)
  }
  render() {
    // let showImage
    // if (this.state.image.length) {
    //   showImage = (
    //     <div style={{ maxWidth: '200px', maxHeight: '200px' }}>
    //       <img src={this.state.image} style={{ maxWidth: '100%', maxHeight: '100%' }} />
    //     </div>
    //   )
    // } else {
    //   showImage = <div></div>
    // }
    return (
      <div
        style={{
          maxWidth: '200px'
        }}
      >
        <h3
          style={{
            textAlign: 'center'
          }}
        >
          Upload Image
        </h3>
        <Card interactive={true}>
          <FileInput fill={true} text="Add image" buttonText="Upload" onChange={this.filePathSet.bind(this)} />
        </Card>
        {/* {showImage} */}
      </div>
    )
  }
}
