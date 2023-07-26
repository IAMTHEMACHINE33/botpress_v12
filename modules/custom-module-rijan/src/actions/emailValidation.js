/**
 * Small description of your action
 * @title Validates email
 * @category Validation
 * @author Rijan
 * @param {string} email -Email of user
 */
const myAction = async email =>
{
  const isValid = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
  session.isValidEmail = isValid
  //temp //session //user
}

return myAction(args.email)
