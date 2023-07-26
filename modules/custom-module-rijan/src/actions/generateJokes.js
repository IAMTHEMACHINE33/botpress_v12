
const axios = require('axios')

/**
 * Small description of your action
 * @title Generate Joke
 * @category Joke
 * @author Rijan
 */
const myAction = async () =>
{
  try
  {
    // Data To Call Api
    const options = {
      method: 'GET',
      url: 'https://matchilling-chuck-norris-jokes-v1.p.rapidapi.com/jokes/random',
      headers: {
        accept: 'application/json',
        'X-RapidAPI-Key': 'e98508fd3cmsh9d8e8cd76837f72p1f6bd0jsn9bbd6eb57aa1',
        'X-RapidAPI-Host': 'matchilling-chuck-norris-jokes-v1.p.rapidapi.com'
      }
    }

    // Calls The Api
    const joke = await axios(options)

    // Prints In Log
    bp.logger.info('jokes:: ', joke.data.value)

    // Message For The User
    const message = {
      type: 'text',
      text: joke.data.value,
      markdown: true
    }

    // Send The Message To The User
    await bp.events.replyToEvent(event, [message])
  } catch (error)
  {
    bp.logger.error(error)
  }
}

return myAction()
