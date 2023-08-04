import React, { useState, useEffect } from 'react'
import { input } from './style.scss'
import Slider from 'react-slick'
import { Button, Icon, FileInput } from '@blueprintjs/core'

export const CarouselForm = props => {
  const [fields, setFields] = useState([])
  const [inputValues, setInputValues] = useState({})
  const [openings, setOpenings] = useState([])
  const form = new FormData()
  console.log('props', props)
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
      console.log('form first', form.get('name'))
      console.log('form second', form.get('email'))
      console.log('form position', form.get('position'))
      const response = await props.bp.axios.post(props.endpoint, form)
      console.log('response', response)
      props.onSendData({ type: props.endpoint, value: response })
    }
  }

  const handleInputChange = (e, field) => {
    // setInputValues(prevStste =>
    //   prevStste.append(field?.title, event.target.type == 'file' ? e.target.files[0] : e?.target?.value)
    // )
    if (field?.default) {
      setInputValues({
        ...inputValues,
        [field?.title]: field?.default
      })
    } else {
      setInputValues({
        ...inputValues,
        [field?.title]: e?.target?.value
      })
    }
    console.log('------Input values-----', inputValues)
  }
  const handleFileInputChange = (e, field, form, data) => {
    // console.log('event.target.type', event.target.type)
    // console.log(e.target.files)
    form.append('position', data)
    form.append(field?.title, e.target.files[0])
    console.log('asd', form.get(field?.title))
    handleSubmit(e, form)
    // if (event.target.type == 'file') {
    //   form.append(field?.title, e.target.files[0])
    // } else {
    //   form.append(field?.title, e?.target?.value)
    // }
  }

  const renderInputField = (field, data) => {
    switch (field?.type) {
      // case 'text':
      //   return (
      //     <>
      //       <input
      //         name={field.title}
      //         style={{ display: 'none' }}
      //         id={field.title}
      //         type={field.type}
      //         className="input_field_type"
      //         value={inputValues[field.title] || ''}
      //         onChange={e => handleInputChange(e, field)}
      //       />
      //     </>
      //   )
      case 'file':
        return (
          <>
            <label style={{ ...buttonLikeLabelStyle, ...buttonLikeLabelHoverStyle }}>
              <input
                name={field.title}
                id={field.title}
                type={field.type}
                className="input_field_type"
                style={{ display: 'none' }}
                value={inputValues[field.title] || ''}
                onChange={e => handleFileInputChange(e, field, form, data)}
              />
              <a>Apply</a>
            </label>
            {/* <input
              name={field.title}
              id={field.title}
              type={field.type}
              className="input_field_type"
              style={{ display: 'none' }}
              value={inputValues[field.title] || ''}
              onChange={e => handleFileInputChange(e, field, form)}
            /> */}
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
        return { ...prevState, [field.title]: field.default || '' }
      })
    }
  }, [fields])

  useEffect(() => {
    const fetchDataAndSetOpenings = async () => {
      try {
        const data = await fetchData()
        setOpenings(data)
      } catch (error) {
        console.error('Error fetching openings:', error)
      }
    }
    fetchDataAndSetOpenings()
  }, [])

  // useEffect(() => {
  //   console.log('open', openings)
  // }, [openings])

  const fetchData = async () => {
    const response = await props.bp.axios.get('/mod/custom-components-rijan/getOpenings')
    return response.data.data.openings
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  }

  const buttonLikeLabelStyle = {
    display: 'inline-block',
    color: '#E15241', // Replace this with the desired color for the border
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    textAlign: 'center',
    textDecoration: 'none',
    width: '100%', // Fill the width of the container
    border: '1px solid rgba(225, 82, 65, 0.7)', // Add a border with the desired color
    boxSizing: 'border-box', // Ensure the border width doesn't affect the total width
    transition: 'background-color 1s' // Add a smooth transition for the hover effect
  }

  const buttonLikeLabelHoverStyle = {
    backgroundColor: 'rgba(225, 82, 65, 0.03)' // Replace this with the desired transparent color
  }
  return (
    <div>
      <div style={{ width: 200, height: 370 }}>
        <Slider {...settings}>
          {openings?.map((data, index) => (
            <>
              <div style={{ width: 125, height: 320 }}>
                <h3>{data.position}</h3>
                <p>{data.description}</p>
              </div>
              <form className="form_container">
                {/* <h3 className="form_title">{props.response?.data?.title}</h3> */}
                {props.response?.data?.input_fields?.map((field, index) => (
                  <div className="input_group" key={index}>
                    {renderInputField(field, data.position)}
                  </div>
                ))}
              </form>
            </>
          ))}
        </Slider>
        {/* 
        <Button intent="warning" outlined={true} minimal={true} fill={true} size="small">
          Apply &nbsp; &nbsp;
          <Icon icon="send-message" />
          <Icon />
        </Button> */}
      </div>
    </div>
  )
}
