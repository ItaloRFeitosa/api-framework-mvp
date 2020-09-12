const server = require("../lib/server");

const app = server();

app.use("/", (req, res, next) => {
  req.body = {
    ...req.body,
    middleware1: "middleware in the root",
  };
  next();
});

app.use("/test", (req, res, next) => {
  req.body = {
    ...req.body,
    middleware2: "middleware in the test route",
  };
  next();
});

app.use("/test/test2", (req, res, next) => {
  req.body = {
    ...req.body,
    middleware3: "middleware in the test2 route",
  };
  next();
});

app.use("/test/test2/test3", (req, res, next) => {
  req.body = {
    ...req.body,
    middleware4: "middleware in the test3 route",
  };
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "it works", ...req.body });
});

app.get("/users", (req, res) => {
  res.status(400).json([{ name: "fulano", email: "fulano@email.com" }]);
});

app.post("/test", (req, res) => {
  const { body } = req;

  res.json(body);
});

app.post("/test/test2", (req, res) => {
  const { body } = req;

  res.json(body);
});

app.post("/test/test2/test3", (req, res) => {
  const { body } = req;

  res.json(body);
});

app.delete("/user/delete", (req, res) => {
  res.json({ message: "deleted" });
});

app.listen(3333);
