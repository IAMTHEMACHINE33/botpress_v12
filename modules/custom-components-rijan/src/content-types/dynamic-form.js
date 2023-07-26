function render(data)
{
  const events = []

  return [
    {
      type: 'custom',
      module: 'custom-components-rijan',
      component: 'DynamicForm',
      endpoint: data.endpoint,
      response: { data }
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
  id: 'custom_dynamic_form',
  group: 'Custom Component',
  title: 'Dynamic Form',
  jsonSchema: {
    description: 'Custom dynamic form',
    type: 'object',
    required: ['input_fields', 'endpoint'],
    properties: {
      title: {
        type: 'string',
        title: 'Form title'
      },
      endpoint: {
        type: 'string',
        title: 'Endpoint'
      },
      input_fields: {
        type: 'array',
        title: 'Input field',
        minItems: 1,
        maxItems: 10,
        items: {
          type: 'object',
          required: ['title', 'type'],
          properties: {
            title: {
              title: 'Title',
              type: 'string'
            },
            type: {
              title: 'Type',
              type: 'string',
              enum: ['text', 'email', 'password', 'textarea', 'file', 'date', 'radio', 'checkbox', 'dropdown'],
              default: 'text'
            },
            options: {
              title: 'Options',
              type: 'string'
            }
          }
        }
      }
    }
  },
  uiSchema: {
    title: {
      'ui:field': 'il8n_field'
    },
    input_fields: {
      'ui:field': 'il8n_array'
    }
  },
  computePreviewText: formData => `Name: ${formData.title}(${formData.endpoint})`,
  renderElement: renderElement
}