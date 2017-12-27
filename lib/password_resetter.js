const express = require('express');
const bodyParser = require('body-parser');

module.exports = function passwordResetter(forgotPath, resetPasswordPath, options) {
	const router = buildRouter();
	router.post(forgotPath, forgot(options));
	router.post(resetPasswordPath, resetPassword(options));
	return router;
}

function buildRouter() {
	const router = express.Router();
	router.use(bodyParser.json());
	router.use(bodyParser.urlencoded({ extended: false }));
	return router;
}

function forgot(options) {
	return async (req, res) => {
		const email = req.body.email;
		await isValidEmail(options, email)
			? runPasswordReset(options, res, email)
			: sendInvalidEmailResponse(res);
	};
}

async function isValidEmail(options, email) {
	return await (await options.validateUserEmail(email)) === true;
}

async function runPasswordReset(options, res, email) {
	try {
		const passwordResetToken = await options.generatePasswordResetToken();
		await options.setUserPasswordResetToken(passwordResetToken);
		await options.sendMail({email, passwordResetToken});
		sendPasswordResetRequestSucceeded(res);
	} catch (exception) {
		sendSetPasswordResetTokenError(res, exception.message);
	}
}

function sendPasswordResetRequestSucceeded(res) {
	res.send('success');
}

function sendSetPasswordResetTokenError(res, message) {
	res.status(500).send(message);
}

function sendInvalidEmailResponse(res) {
	res.status(400).send('Invalid email');
}

function resetPassword(options) {
	return async (req, res) => {
		try {
			await areValidDetails(options, req.body)
				? (await updatePassword(options, req.body, res))
				: res.status(400).send('Invalid data');
		} catch (error) {
			res.status(500).send(error.message);
		}
	};
}

async function areValidDetails(options, args) {
	return options.validatePassword(args) &&
		(await options.validatePasswordResetToken(args));
}

async function updatePassword(options, args, res) {
	await options.updatePassword(args);
	res.send('success');
}
