module.exports = (req, res, next) => {
  if (!req.query.page) {
    const params = new URLSearchParams(req.query);
    params.set("page", "1");

    return res.redirect(`${req.baseUrl}${req.path}?${params.toString()}`);
  }

  next();
};
