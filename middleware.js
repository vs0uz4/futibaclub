module.exports = (req, res, next) => {
  if (req.url.includes('/admin') && (!req.session.user || req.session.user.role === 'user')) {
    res.redirect('/')
  } else if (req.session.user) {
    res.locals.user = req.session.user
    next()
  } else {
    next()
  }
}
