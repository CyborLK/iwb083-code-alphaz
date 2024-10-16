'use server'
import jwt from "jsonwebtoken";
const serviceServerUrl = process.env.SERVICE_SERVER_URL;
const jwtSecret = process.env.JWT_SECRET;

async function jwtProvider() {
	return jwt.sign({}, jwtSecret);
}

async function serverFetches(url, headers, body, method = "GET") {
	try {
		const response = await fetch(url, {
			method: method,
			headers: {
				"Content-Type": "application/json",
				...headers,
			},
			body: JSON.stringify(body),
		})

		return response;

	} catch (error) {
		console.log(error);
		return {
			status: 500,
			statusText: "Server is not responding. Try again later.",
		};
	}
}

async function serverAuthorization() {
	const token = await jwtProvider();
	const response = await serverFetches(`${serviceServerUrl}/authorize`, { "Authorization": "Bearer " + token });

	const serverResponse = {
		code: response.status,
		accepted: response.statusText === "Accepted",
		aliveToken: response.headers?.get("keep-alive-token") || null,
	};

	return serverResponse;
}

async function serverLogin(credentials, aliveToken) {
	const response = await serverFetches(`${serviceServerUrl}/auth/login`, { "keep-alive-token": aliveToken }, credentials, "POST");

	let responseBody;
	try {
		if (response.headers.get("Content-Length") !== "0") {
			responseBody = await response.json();
		} else {
			responseBody = null;
		}
	} catch (error) {
		responseBody = null;
	}

	return {
		ok: response.ok,
		status: response.status,
		message: response.statusText,
		body: responseBody
	};
}

export default {
	serverAuthorization,
	serverLogin
}

/* 
// User should authorized by the server with the token before accessing further server actions:nivindulakshitha

if (serverAuth.serverAthorization.accepted) {
	fetch(`${serviceServerUrl}/auth/signup`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"keep-alive-token": serverAuth.serverAthorization.aliveToken // server generated keep-alive-token should be provided with every request:nivindulakshitha
		},
		body: JSON.stringify({ // Credentials for signup request:nivindulakshitha
			fullname: "Admin",
			email: "admin@localhost",
			password: "admin",
		})
	}).then(response => {
		if (response.status === 202) {
			console.log("Signup successful.");
		} else {
			console.log("Signup failed because,", response.statusText); // Fail reason can be accessed from response, can be used to present to user:nivindulakshitha
		}
	}).catch(error => {
		console.log(error);
	});
}

// After server authorization user can request other actions with retrieved token which is generated by the server:nivindulakshitha
if (serverAuth.serverAthorization.accepted) {
	fetch(`${serviceServerUrl}/auth/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"keep-alive-token": serverAuth.serverAthorization.aliveToken // server generated keep-alive-token should be provided with every request:nivindulakshitha
		},
		body: JSON.stringify({ // Credentials for login request:nivindulakshitha
			email: "admin@localhost",
			password: "admin",
		})
	}).then(response => {
		if (response.status === 202) {
			console.log("Login successful.");
		} else {
			console.log("Login failed because,", response.statusText); // Fail reason can be accessed from response, can be used to present to user:nivindulakshitha
		}
	}).catch(error => {
		console.log(error);
	});
} */