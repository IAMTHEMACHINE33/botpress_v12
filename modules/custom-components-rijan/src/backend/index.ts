import * as sdk from 'botpress/sdk'
import api from './api'

const onServerStarted = async (bp: typeof sdk) => {}

const onServerReady = async (bp: typeof sdk) => {
  await api(bp)
}

// This is not required for the custom component, but it makes it easier to test this example
const botTemplates: sdk.BotTemplate[] = [
  {
    id: 'custom-components-rijan-demo',
    name: 'Demo - Custom Components',
    desc: 'This module shows how to implement custom components on channel web'
  }
]

const entryPoint: sdk.ModuleEntryPoint = {
  botTemplates,
  onServerReady,
  onServerStarted,
  definition: {
    name: 'custom-components-rijan',
    menuText: 'Custom Component',
    fullName: 'My Custom Component',
    noInterface: true, // This prevents your module from being displayed in the menu, since we only add custom components here
    homepage: 'https://botpress.com'
  }
}

export default entryPoint
