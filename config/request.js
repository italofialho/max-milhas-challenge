const get = require("lodash.get");
const axios = require("axios");

/**
 * Create an axios instance to interact with the API.
 * @param token
 */
const request = token => {
	token = token || "default_token";

	const instance = axios.create({
		baseURL: `${process.env.API_URL}`,
		headers: {
			common: {
				Authorization: `Bearer ${token}`,
			},
		},
	});

	// Always return the data property of the API response.
	instance.interceptors.response.use(
		response => get(response, "data"),
		error => {
			throw get(error, "response", error);
		},
	);

	return instance;
};

module.exports = request;
