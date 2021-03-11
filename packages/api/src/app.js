const express = require('express');
const { Router } = require('express');
const locale = require('locale');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const Logger = require('js-logger');
const cors = require('cors');
// const NDIMiddleware = require('node-dependency-injection-express-middleware');
const morganLogger = require('./handlers/morganLogger');
const config = require('./config/server');

const { LOG_LEVEL, ORIGIN } = config;

Logger.useDefaults({ defaultLevel: Logger[LOG_LEVEL] });
Logger.debug('Configured logger!', { logLevel: Logger.getLevel(), LOG_LEVEL });

Logger.info('Configuring app...', { ORIGIN });
module.exports = express()
  .use(morganLogger())
  .use(helmet())
  .use(
    cors({
      credentials: true,
      origin: new RegExp(ORIGIN),
    }),
  )
  .use(locale(['en'], 'en'))
  .use(
    '/:environment',
    Router()
      .use(bodyParser.urlencoded({ extended: false }))
      .use(bodyParser.json()),
  )
  /* jshint -W098 */
  /* eslint-disable-next-line no-unused-vars */
  .use((error, request, response, next) => {
    /* jshint +W098 */
    const callStack = error.callSack || error;
    Logger.error(callStack);
    return response.status(error.statusCode || 500).send({ callStack });
  });
