module.exports = function (res) {
  let statusCode = 200;

  return {
    ...res,
    headers: {
      "Content-Type": "application/json",
    },

    json(body) {
      res.writeHead(res.statusCode, this.headers);

      res.write(JSON.stringify(body));

      res.end();

      return this;
    },

    status(code) {
      res.statusCode = code;
      return this;
    },
  };
};
