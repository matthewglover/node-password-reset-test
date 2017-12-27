const test = require('tape');
const request = require('supertest');
const express = require('express');
const sinon = require('sinon');
const passwordResetter = require('../lib/password_resetter');

const options = stubOptions();
const app = setupApp();
const email = 'test@test.com';
const passwordResetToken = 'test-token';
const password = 'new-password';

test('POST to /forgot with valid email, responds with 200 and calls sendMail with email and reset token', (t) => {
	clearStubs();
	t.plan(2);
	setSuccessfulForgotRequestOptions();
	sendForgotRequest(email)
		.expect(200)
		.end((err) => {
			t.error(err, 'responds with 200 OK');
			t.deepEqual(getSendMailOptions(), {passwordResetToken, email});
		});
});

test('POST to /forgot with invalid email, responds with 400', (t) => {
	clearStubs();
	t.plan(1);
	setInvalidEmailOptions();
	sendForgotRequest(email)
		.expect(400)
		.end((err) => {
			t.error(err, 'responds with 400');
		});
});

test('POST to /forgot responds with 500 when token generation fails',
	runDependencyFailure(generateTokenFails));

test('POST to /forgot responds with 500 when storing token fails', 
	runDependencyFailure(saveResetTokenFails));

test('POST to /forgot responds with 500 when sending reset email fails',
	runDependencyFailure(sendResetEmailFails));

test('POST to /reset-password with valid token and matching password responds with 200', (t) => {
	const expectedArgs = { passwordResetToken, password, confirmPassword: password };
	clearStubs();
	t.plan(4);
	setSuccessfulUpdatePasswordRequestOptions();
	sendUpdatePasswordRequest()
		.expect(200)
		.end((err) => {
			t.error(err, 'responds with 200 OK');
			t.deepEqual(options.validatePasswordResetToken.lastCall.args[0],
				expectedArgs);
			t.deepEqual(options.validatePassword.lastCall.args[0],
				expectedArgs);
			t.deepEqual(options.updatePassword.lastCall.args[0],
				expectedArgs);
		});
});

test('POST to /reset-password with invalid password token responds with 400', (t) => {
	clearStubs();
	t.plan(1);
	setInvalidPasswordTokenRequestOptions();
	sendUpdatePasswordRequest()
		.expect(400)
		.end((err) => {
			t.error(err, 'responds with 400');
		});
});

test('POST to /reset-password with invalid password responds with 400', (t) => {
	clearStubs();
	t.plan(1);
	setInvalidPasswordRequestOptions();
	sendUpdatePasswordRequest()
		.expect(400)
		.end((err) => {
			t.error(err, 'responds with 400');
		});
});

test('POST to /reset-password when updatePassword fails responds with 500', (t) => {
	clearStubs();
	t.plan(1);
	setFailUpdatePasswordRequestOptions();
	sendUpdatePasswordRequest()
		.expect(500)
		.end((err) => {
			t.error(err, 'responds with 500');
		});
});

function stubOptions() {
	return {
		sendMail: sinon.stub(),
		validateUserEmail: sinon.stub(),
		generatePasswordResetToken: sinon.stub(),
		setUserPasswordResetToken: sinon.stub(),
		validatePasswordResetToken: sinon.stub(),
		validatePassword: sinon.stub(),
		updatePassword: sinon.stub()
	};
}

function setupApp() {
	const app = express();
	app.use(passwordResetter('/forgot', '/reset-password', options));
	return app;
}

function setSuccessfulForgotRequestOptions() {
	options.sendMail.returns(true);
	options.validateUserEmail.resolves(true);
	options.generatePasswordResetToken.resolves(passwordResetToken);
	options.setUserPasswordResetToken.resolves(true);
}

function generateTokenFails() {
	setSuccessfulForgotRequestOptions();
	options.generatePasswordResetToken.rejects('Reset token generation failed');
}

function saveResetTokenFails() {
	setSuccessfulForgotRequestOptions();
	options.setUserPasswordResetToken.rejects('Store reset token failed');
}

function sendResetEmailFails() {
	setSuccessfulForgotRequestOptions();
	options.sendMail.rejects('Send mail failed');
}

function clearStubs() {
	Object.keys(options).forEach(method => options[method].reset());
}

function setInvalidEmailOptions() {
	options.validateUserEmail.returns(Promise.resolve(false));
}

function getSendMailOptions() {
	return options.sendMail.lastCall.args[0];
}

function sendForgotRequest(email) {
	return request(app)
		.post('/forgot')
		.send({ email });
}

function runDependencyFailure(setDependencyFailure) {
	return (t) => {
		clearStubs();
		t.plan(1);
		setDependencyFailure();
		sendForgotRequest(email)
			.expect(500)
			.end((err) => {
				t.error(err, 'responds with 500');
			});
	};
}

function setSuccessfulUpdatePasswordRequestOptions() {
	options.validatePasswordResetToken.resolves(true);
	options.validatePassword.returns(true);
	options.updatePassword.resolves(true);
}

function setInvalidPasswordTokenRequestOptions() {
	setSuccessfulUpdatePasswordRequestOptions();
	options.validatePasswordResetToken.resolves(false);
}

function setInvalidPasswordRequestOptions() {
	setSuccessfulUpdatePasswordRequestOptions();
	options.validatePassword.returns(false);
}

function setFailUpdatePasswordRequestOptions() {
	setSuccessfulUpdatePasswordRequestOptions();
	options.updatePassword.rejects(true);
}

function sendUpdatePasswordRequest(params = {}) {
	return request(app)
		.post('/reset-password')
		.send({ passwordResetToken, password, confirmPassword: password, ...params });
}

function getValidatePasswordResetTokenOptions() {
	return options.validatePasswordResetToken.lastCall.args[0];
}
