const http = require("http");
const responseParser = require("./response");

const { parse } = require("url");

function mainMiddleware(req, res, routeMiddlewares, routeCallback) {
  const parsedUrl = parse(req.url);

  let body = [];

  let bodyParsed = {};

  req
    .on("error", (err) => {
      console.error(err);
    })
    .on("data", (chunk) => {
      body.push(chunk);
    })
    .on("end", () => {
      body = Buffer.concat(body).toString();
      bodyParsed = Array.isArray(body) ? body : JSON.parse(body);

      req.body = bodyParsed;
      req.query = parsedUrl.query;

      const parsedResponse = responseParser(res);

      let currentMiddleware = 0;
      const lastMiddleware = routeMiddlewares.length - 1;

      function next() {
        currentMiddleware === lastMiddleware
          ? routeCallback(req, parsedResponse)
          : routeMiddlewares[++currentMiddleware](req, parsedResponse, next);
      }

      lastMiddleware >= 0
        ? routeMiddlewares[currentMiddleware](req, parsedResponse, next)
        : routeCallback(req, parsedResponse);
    });
}

function getRouteMiddlewares(pathname, middlewares) {
  // console.log(pathname);
  if (pathname === "/")
    return middlewares[pathname] ? middlewares[pathname] : [];

  const routeMiddlewares = middlewares[pathname] ? middlewares[pathname] : [];

  const splittedPathname = pathname.split("/");

  splittedPathname.pop();

  const parentPathname =
    splittedPathname.length > 1 ? splittedPathname.join("/") : "/";

  return [
    ...getRouteMiddlewares(parentPathname, middlewares),
    ...routeMiddlewares,
  ];
}

module.exports = function () {
  const server = http.createServer();

  const middlewares = {};

  const routes = {};

  return {
    listen(port) {
      server
        .on("request", (request, response) => {
          const { url, method } = request;
          const { pathname } = parse(url);

          const routeCallback = routes[pathname] && routes[pathname][method];

          const routeMiddlewares = getRouteMiddlewares(pathname, middlewares);

          routeCallback
            ? mainMiddleware(request, response, routeMiddlewares, routeCallback)
            : console.log("This route not exists");
        })
        .listen(port);

      console.log("running in port ", port);
      return this;
    },

    use(fn) {
      if (arguments.length > 1) {
        const [path, ...functions] = [...arguments];
        if (!(typeof path === "string"))
          throw new Error("first argument should be the path");

        middlewares[path] = middlewares[path]
          ? [...middlewares[path], ...functions]
          : [...functions];
      } else {
        const path = "/";
        middlewares[path] = middlewares[path]
          ? middlewares[path].push(arguments[0])
          : [arguments[0]];
      }
      return this;
    },

    ...["get", "post", "put", "delete"].reduce(
      (memo, method) => ({
        ...memo,
        [method]: function (path, handlePathCallback) {
          routes[path] = routes[path]
            ? {
                [method.toUpperCase()]: handlePathCallback,
                ...routes[path],
              }
            : { [method.toUpperCase()]: handlePathCallback };

          return this;
        },
      }),
      {}
    ),
  };
};
