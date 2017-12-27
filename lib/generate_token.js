const crypto = require('crypto');

module.exports = function generateToken(len) {
	return new Promise((res, rej) => {
		crypto.randomBytes(len, (err, buf) =>
			err ? rej(err) : res(buf.toString('hex')));
	});
};
