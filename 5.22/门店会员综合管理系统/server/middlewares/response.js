const responseHandler = (req, res, next) => {
  res.success = (data = null, message = 'success') => {
    res.json({
      code: 200,
      message,
      data
    })
  }

  res.error = (message = 'error', code = 400, data = null) => {
    res.json({
      code,
      message,
      data
    })
  }

  next()
}

module.exports = responseHandler
