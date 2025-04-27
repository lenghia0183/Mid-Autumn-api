const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { env, logger, morgan, i18nService } = require('./config');
const { errorConverter, errorHandler } = require('./middlewares/error.middleware');
const { createAdmin } = require('./services/user.service');
const cookieParser = require('cookie-parser');
const apiRoute = require('./routes/api');
const baseRouter = require('./routes/base.route');
const cors = require('cors');
const setupSocket = require('./socket');

const app = express();
const server = http.createServer(app);

app.set('trust proxy', 1);

app.use(cors({ origin: '*' }));

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  next(i18nService.setLocale(req, res));
});

if (env.nodeEnv !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.use('/api/v1', apiRoute);

app.use('/', baseRouter);

const io = setupSocket(server);

app.set('io', io);
app.use(errorConverter);
app.use(errorHandler);
mongoose
  .connect(env.mongoURI)
  .then(() => logger.info('MongoDB Connected...'))
  .then(() => {
    createAdmin();
    logger.info('admin created');
  })
  .then(() =>
    server.listen(env.port, () => {
      logger.info(`Server running on port ${env.port}`);
    }),
  )
  .catch((err) => logger.error(err));

server.on('close', () => {
  io.close();
  logger.info('Socket server closed');
});
