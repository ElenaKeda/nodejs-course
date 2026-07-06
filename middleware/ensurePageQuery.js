module.exports = (req, res, next) => {
  if (!req.query.page) {
    return res.redirect(`${req.path}?page=1`);
  }

  next();
};
