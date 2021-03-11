const morgan = require('morgan');
const { Writable } = require('stream');
const util = require('util');
const jsLogger = require('js-logger');

module.exports = () => {
  /* eslint-disable-next-line func-names */
  const WriteStream = function () {
    Writable.call(this, { objectMode: true });
  };
  util.inherits(WriteStream, Writable);
  /* eslint-disable-next-line no-underscore-dangle */
  WriteStream.prototype._write = (chunk, encoding, callback) => {
    jsLogger.debug(chunk);
    callback();
  };
  return morgan('combined', { stream: new WriteStream() });
};
