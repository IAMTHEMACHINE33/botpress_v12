import { IAgent } from './types'

export function agentName(agent: IAgent) {
  const { firstname, lastname } = agent.attributes || {}
  // console.log('firstname', firstname)
  console.log('email', agent)
  if (firstname || lastname) {
    return [firstname, lastname].filter(Boolean).join(' ')
  } else {
    return agent.attributes.email
  }
}
