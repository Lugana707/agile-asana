const config = require('./config/server');
const { initialiseServer } = require('./serverHelper');

const { httpServer } = initialiseServer(config);
module.exports = httpServer;
