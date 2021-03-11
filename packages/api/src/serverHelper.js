const http = require('http');
const { createLightship } = require('lightship');
const jsLogger = require('js-logger');
const app = require('./app');

const initialiseServer = (config, callback) => {
  const { PORT = new Date().getTime() % 65537 } = config || {};

  const lightshipPort = PORT + 1;
  jsLogger.debug('Creating lightship...', { PORT, lightshipPort });

  const httpServer = http.createServer(app);
  const lightship = createLightship({ port: lightshipPort });
  lightship.registerShutdownHandler(() => {
    jsLogger.warn('Shutting down server!');
    httpServer.close();
    jsLogger.warn('httpServer has shut down!');
  });

  const response = {
    httpServer,
    lightshipServer: lightship.server,
    shutdown: async () => lightship.shutdown(),
  };
  httpServer.listen(PORT, () => {
    jsLogger.info('Server running!', { PORT });
    lightship.signalReady();
    if (callback) {
      callback(response);
    }
  });

  return response;
};

const initialiseServerAsync = async (config) => new Promise((resolve, reject) => {
  try {
    initialiseServer(config, (server) => {
      resolve(server);
    });
  } catch (error) {
    reject(error);
  }
});

module.exports = {
  initialiseServer,
  initialiseServerAsync,
};
