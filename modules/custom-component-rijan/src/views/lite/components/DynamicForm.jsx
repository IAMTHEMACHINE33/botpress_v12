import React, { useState, useEffect } from 'react'
import { input } from './style.scss'

export const DynamicForm = props => {
  const [fields, setFields] = useState([])
  const [inputValues, setInputValues] = useState({})

  const handleSubmit = async e => {
    e.preventDefault()
    const form = new FormData()
    form.append()
    if (fields.length > 0) {
      // const confirm = window.confirm(`This would be sent to the configured endpoint: ${props.endpoint}`)
      console.log('props.endpoint', props)
      console.log('input', inputValues)
      props.onSendData({ type: props.endpoint, value: inputValues })

      // const response = await props.bp.axios.post(props.endpoint, {
      //   inputValues: inputValues
      // })
      // console.log('response', response)
    }
  }

  const handleInputChange = (e, field) => {
    setInputValues({
      ...inputValues,
      [field?.title]: e?.target?.value
    })
    form.append(field?.title, e?.target?.value)
    console.log('------Input values-----', inputValues)
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
              onChange={e => handleInputChange(e, field)}
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

  return (
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

        <button onClick={handleSubmit} className="form_button">
          Submit
        </button>
      </form>
    </div>
  )
}
