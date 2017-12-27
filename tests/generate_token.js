const test = require('tape');
const generateToken = require('../lib/generate_token');

test('generates token asynchronously', async (t) => {
	t.plan(1);
	const token = await generateToken(64);
	console.log(token);
	t.equal(typeof token, 'string');
});
