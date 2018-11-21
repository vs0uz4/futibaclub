module.exports = (req, res, next) => {
  if (req.url.includes('/admin') && (!req.session.user || req.session.user.role === 'user')) {
    res.locals.url = req.url
    res.redirect('/')
  } else if (req.url.includes('/groups') && (!req.session.user)) {
    res.locals.url = req.url
    res.redirect('/sign-in')
  } else if (req.session.user) {
    res.locals.url = req.url
    res.locals.user = req.session.user
    next()
  } else {
    res.locals.url = req.url
    next()
  }
}
