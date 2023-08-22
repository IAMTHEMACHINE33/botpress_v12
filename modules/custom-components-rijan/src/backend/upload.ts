import multer from 'multer'
import path from 'path'
// import _ from 'lodash'

const storage = botpressConfig =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './data/assets/uploads')
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + file.originalname)
    }
  })

const filter = botpressConfig => (req, file, cb) => {
  // console.log('botpressConfig', botpressConfig)
  // const allowedMimeTypes = req.body.allowedMimeTypes.split(',')
  const allowedMimeTypes = botpressConfig

  for (let i = 0, j = allowedMimeTypes.length; i < j; i++) {
    if (file.mimetype == allowedMimeTypes[i]) {
      cb(null, true)
      return
    }
  }

  req.body.fileValidationError = 'Not allowed type'
  return cb(null, false)
}

const upload = botpressConfig => {
  const storageConfig = storage(botpressConfig)
  const filterConfig = filter(botpressConfig)

  return multer({
    storage: storageConfig,
    fileFilter: filterConfig
  })
}

// const upload = multer({
//   storage: storage,
//   fileFilter: filter
// })

export default upload
