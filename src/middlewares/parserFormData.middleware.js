const parserFormData = (req, res, next) => {
  req.body = Object.fromEntries(
    Object.entries(req.body).map(([key, value]) => {
      try {
        return [key, JSON.parse(value)];
      } catch (error) {
        return [key, value];
      }
    }),
  );

  next();
};

module.exports = parserFormData;
