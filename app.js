const express = require("express");
const app = express();
const apiRouter = require("./routes/api-router");
const { handle400s, handle404s, handle500s } = require("./errors");

app.use(express.json());
app.use("/api", apiRouter);

// wildcard
app.all("/*", (req, res, next) => {
  res.status(404).send({ msg: "not found" });
});

// error-handling middleware functions
app.use(handle400s);
app.use(handle404s);
app.use(handle500s);

module.exports = app;
