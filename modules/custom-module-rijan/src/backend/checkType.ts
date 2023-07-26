const checkType = (req, res, next) => {
  console.log('req.file', req.file)
  console.log('mimeType', req.body.allowedMimeTypes)
  next()
}

export default checkType;