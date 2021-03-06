const apiRouter = require('express').Router();
const usersRouter = require('./users-router');
const topicsRouter = require('./topics-router');
const articlesRouter = require('./articles-router');
const commentsRouter = require('./comments-router');
const { getApiEndpoints } = require('../controllers/api');
const { handle405s } = require('../errors');

apiRouter
  .route('/')
  .get(getApiEndpoints)
  .all(handle405s);

apiRouter.use('/users', usersRouter);
apiRouter.use('/topics', topicsRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/comments', commentsRouter);

module.exports = apiRouter;
