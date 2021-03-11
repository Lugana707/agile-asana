const request = require('supertest');
const { initialiseServerAsync } = require('./serverHelper');

describe('server', () => {
  test('should start without issue', async () => {
    const { lightshipServer, ...server } = await initialiseServerAsync();
    try {
      const { statusCode, text } = await request(lightshipServer)
        .get('/ready')
        .send();
      expect(statusCode).toEqual(200);
      expect(text).toEqual('SERVER_IS_READY');
    } finally {
      await server.shutdown();
    }
  });

  test('should start on specified port', async () => {
    const { httpServer, lightshipServer, ...server } = await initialiseServerAsync({ PORT: 18000 });
    try {
      expect(httpServer.address().port).toEqual(18000);
      expect(lightshipServer.address().port).not.toEqual(18000);
    } finally {
      await server.shutdown();
    }
  });

  test('should start under 100ms', async () => {
    const { lightshipServer, ...server } = await initialiseServerAsync();
    try {
      const { statusCode, text } = await request(lightshipServer)
        .get('/ready')
        .send();
      expect(statusCode).toEqual(200);
      expect(text).toEqual('SERVER_IS_READY');
    } finally {
      await server.shutdown();
    }
  }, 100);
});
