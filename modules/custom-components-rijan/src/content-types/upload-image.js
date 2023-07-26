function render(data)
{
  return [
    {
      // This tells channel-web to tread the event as a custom component
      type: 'custom',

      // The name of your module
      module: 'custom-components-rijan',

      // The name of the component to load. In this example, the name of the component is "LoginForm",
      // Components created for the web chat must be in the `lite` views
      component: 'UploadImage',

      // Add anything else that you would want your module to process
      // ... data from the content manager forms:
      endpoint: data.endpoint,

      // Or hardcoded stuff
      moredata: 'anything...',
      another: 'more stuff'
    }
  ]
}

function renderElement(data, channel)
{
  if (channel === 'web' || channel === 'api')
  {
    return render(data)
  }

  return [] // TODO
}

module.exports = {
  id: 'custom_upload_image',
  group: 'Custom Component',
  title: 'Upload Image',
  jsonSchema: {
    description: 'Upload Image Using File Input',
    type: 'object',
    required: ['endpoint'],
    properties: {
      endpoint: {
        type: 'string',
        title: 'Endpoint'
      }
    }
  },
  uiSchema: {},
  computePreviewText: formData => 'Login Form: ' + formData.endpoint,
  renderElement: renderElement
}