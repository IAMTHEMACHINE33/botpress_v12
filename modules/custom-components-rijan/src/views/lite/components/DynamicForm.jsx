import React, { useState, useEffect } from 'react'
import { input } from './style.scss'

export const DynamicForm = props => {
  const [fields, setFields] = useState([])
  const [inputValues, setInputValues] = useState({})
  const form = new FormData()
  const visible = props.isLastGroup && props.isLastOfGroup
  const handleSubmit = async (e, form) => {
    e.preventDefault()

    if (fields.length > 0) {
      // const confirm = window.confirm(`This would be sent to the configured endpoint: ${props.endpoint}`)
      // console.log('props.endpoint', props.endpoint)
      // console.log('input from out', inputValues)
      // console.log('form file out', form.get('file'))
      // console.log('asd', Object.keys(inputValues)[i])

      for (let i = 0, j = Object.keys(inputValues).length; i < j; i++) {
        form.append(Object.keys(inputValues)[i], Object.values(inputValues)[i])
      }
      // console.log('form ', form.get('file'))
      console.log('form first', form.get('first'))
      console.log('form second', form.get('second'))
      const response = await props.bp.axios.post(props.endpoint, inputValues)
      console.log('response', response)
      props.onSendData({ type: props.endpoint, value: response })
    }
  }

  const handleInputChange = (e, field) => {
    // setInputValues(prevStste =>
    //   prevStste.append(field?.title, event.target.type == 'file' ? e.target.files[0] : e?.target?.value)
    // )
    setInputValues({
      ...inputValues,
      [field?.title]: e?.target?.value
    })
    // console.log('------Input values-----', inputValues)
  }
  const handleFileInputChange = (e, field, form) => {
    console.log('event.target.type', event.target.type)
    console.log(e.target.files)

    form.append(field?.title, e.target.files[0])
    // if (event.target.type == 'file') {
    //   form.append(field?.title, e.target.files[0])
    // } else {
    //   form.append(field?.title, e?.target?.value)
    // }
  }

  const renderInputField = field => {
    switch (field?.type) {
      case 'dropdown':
        return (
          <>
            <select
              name={field?.title}
              id={field?.title}
              onChange={e => handleInputChange(e, field)}
              className="dropdown"
            >
              {field?.options?.split(',')?.map((option, index) => {
                return (
                  <option value={option} className="dropdown_option">
                    {option}
                  </option>
                )
              })}
            </select>
          </>
        )
      case 'radio':
        return (
          <>
            <div onChange={e => handleInputChange(e, field)}>
              {field?.options?.split(',')?.map((option, index) => {
                return (
                  <>
                    <input type={field?.type} value={option} name={field?.title} className="input_field_radio" />
                    {option}
                  </>
                )
              })}
            </div>
            <br />
          </>
        )
      case 'checkbox':
        return (
          <>
            <div>
              {field?.options?.split(',')?.map((option, index) => {
                return (
                  <>
                    <input
                      type={field?.type}
                      onChange={e => handleInputChange(e, field)}
                      value={option}
                      name={field?.title}
                      className="input_field_box"
                    />
                    {option}
                  </>
                )
              })}
            </div>
            <br />
          </>
        )
      case 'text':
        return (
          <>
            <input
              name={field.title}
              id={field.title}
              type={field.type}
              className="input_field_type"
              value={inputValues[field.title] || ''}
              onChange={e => handleInputChange(e, field)}
            />
          </>
        )
      case 'file':
        return (
          <>
            <input
              name={field.title}
              id={field.title}
              type={field.type}
              className="input_field_type"
              value={inputValues[field.title] || ''}
              onChange={e => handleFileInputChange(e, field, form)}
            />
          </>
        )
      case 'email':
        return (
          <>
            <input
              name={field.title}
              id={field.title}
              type={field.type}
              className="input_field_type"
              value={inputValues[field.title] || ''}
              onChange={e => handleInputChange(e, field)}
            />
          </>
        )
      case 'password':
        return (
          <>
            <input
              name={field.title}
              id={field.title}
              type={field.type}
              className="input_field_type"
              value={inputValues[field.title] || ''}
              onChange={e => handleInputChange(e, field)}
            />
          </>
        )

      default:
        return <></>
    }
  }

  useEffect(() => {
    const filterFields = props.response?.data?.input_fields?.filter(field => field !== undefined)
    setFields(filterFields)
  }, [props])

  useEffect(() => {
    for (const field of fields) {
      setInputValues(prevState => {
        return { ...prevState, [field.title]: '' }
      })
    }
  }, [fields])
  let whatToShow
  console.log('visible', visible)
  if (visible) {
    whatToShow = (
      <div>
        <form className="form_container">
          <h3 className="form_title">{props.response?.data?.title}</h3>
          {props.response?.data?.input_fields?.map((field, index) => (
            <div className="input_group" key={index}>
              <label htmlFor={field.title} className="input_field_label">
                {field.title}
              </label>

              <br />

              {renderInputField(field)}

              <br />
            </div>
          ))}

          <br />

          <button onClick={e => handleSubmit(e, form)} className="form_button">
            Submit
          </button>
        </form>
      </div>
    )
  } else {
    whatToShow = (
      <div>
        <h1>Done!!</h1>
      </div>
    )
  }
  return <div>{whatToShow}</div>
}
