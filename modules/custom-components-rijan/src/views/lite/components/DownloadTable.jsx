import React, { useState, useEffect } from 'react'
import { Icon, AnchorButton, HTMLTable } from '@blueprintjs/core'
import { input } from './style.scss'

export const DownloadTable = props => {
  const [applicants, setApplicants] = useState([])

  // const handleSubmit = async e => {
  //   e.preventDefault()
  // }

  useEffect(() => {
    const fetchDataAndSetApplicants = async () => {
      try {
        const data = await fetchData()
        setApplicants(data)
      } catch (error) {
        console.error('Error fetching applicants:', error)
      }
    }
    fetchDataAndSetApplicants()
  }, [])

  // useEffect(() => {
  //   console.log('open', applicants)
  // }, [applicants])

  const fetchData = async () => {
    const response = await props.bp.axios.get('/mod/custom-components-rijan/getApply')
    return response.data.data.apply
  }

  return (
    <div>
      <div style={{ maxHeight: '480px', overflow: 'scroll' }}>
        <HTMLTable bordered={true} compact={true} interactive={true} striped={true}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Resume</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map(data => (
              <tr>
                <td>{data.name}</td>
                <td>{data.position}</td>
                <td>
                  <AnchorButton
                    intent="primary"
                    outlined={true}
                    minimal={true}
                    href={'/assets/uploads/' + data.resume}
                    download={data.name + '_resume'}
                  >
                    <Icon icon="archive" />
                    <Icon />
                  </AnchorButton>
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </div>
    </div>
  )
}
