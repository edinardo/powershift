/**
 *
 *
 */

'use strict';

const functions = require('firebase-functions');
const { smarthome } = require('actions-on-google');
const util = require('util');
const axios = require("axios");
const forge = require('node-forge');

/**
 * Handle OAuth Authorization.
 * Using Implicit flow based on
 * https://developers.google.com/actions/identity/oauth2?oauth=implicit
 */
exports.implicit = functions.https.onRequest(async (request, response) => {
	const pem = "-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAjzoAhjCpN1WxGB5DeBnJ90rSJWg536lC5S3qHVSNyM3DPY8LbtSj\nu++X+VXvPF6pFHzx9Hfrpngn3mJvc1XnT5V3vmF/Ar3tlGC3eVogU1x/llvSlp6n\ntxSEsaae4aCHUSrTR71F+U7BdFiiws6FKwA3fLQuNV75/OKncFDKrg8K2AdCDHZZ\nxSNvNR5gYvj9Q1xuWy3CDzpeePQkIbXi7y/jhxWh0h1vwmzrJ2EoZJ0QV8FmrtVA\nvRYC+7EYvBsGYIt57M1VtGICAxtMirAFY0HiS06i/Wlswqx0ftrw6dayCiaYs/DO\n/hFx/M0k4YwT6sjMdeYUI34xAdOatD0bTQIDAQAB\n-----END RSA PUBLIC KEY-----\n";
	const publicKey = forge.pki.publicKeyFromPem(pem);
	const encoded = forge.util.encode64(publicKey.encrypt(request.body.password));
	var access_token;

	axios.defaults.headers.common['Authorization'] = 'DigestE username="' + request.body.email + '"';
	await axios.post('https://nve.ecofactor.com/ws/v1.0/authenticate', {
		username: request.body.email,
		password: encoded
	}).then(function(response) {
		access_token = response.data.access_token;
	}).catch(function(error) {
		console.error(error);
	});

	const redirect_uri = 'https://oauth-redirect.googleusercontent.com/r/powershift-80989'

	const responseURL = util.format('%s#access_token=%s&token_type=bearer&state=%s',
		decodeURIComponent(redirect_uri), access_token, request.body.state);
	return response.redirect(responseURL);
});

const app = smarthome({
	debug: true,
	key: '<api-key>',
});

app.onSync(async (body, headers) => {
	const locations = [];
	const payload = {
		agentUserId: undefined,
		devices: []
	};
	axios.defaults.headers.common['Authorization'] = headers.authorization;
	await axios.get('https://nve.ecofactor.com/ws/v1.0/user').then(function(response) {
		locations.push(response.data.location_id_list);
		payload.agentUserId = response.data.user_id;
	});
	for (const location of locations) {
		await axios.get('https://nve.ecofactor.com/ws/v1.0/location/' + location).then(function(response) {
			for (const thermostat of response.data.thermostat_id_list) {
				payload.devices.push({
					id: thermostat,
					type: 'action.devices.types.THERMOSTAT',
					traits: [
						'action.devices.traits.TemperatureSetting'
					],
					name: {
						name: 'PowerShift Smart Thermostat',
						nicknames: [
							'Thermostat at ' + response.data.name]
					},
					willReportState: false,
					attributes: {
						availableThermostatModes: 'off,heat,cool',
						thermostatTemperatureUnit: 'F'
					}
				})
			}
		});
	};
	return {
		requestId: body.requestId,
		payload: payload
	}
});

const convertTemperature = (source, degrees) => {
	if (source == "C") {
		return Math.round(degrees * 9 / 5 + 32);
	} else {
		return Math.round((degrees - 32) * 5 / 9);
	}
};

app.onQuery(async (body, headers) => {
	const payload = {
		devices: {},
	};
	axios.defaults.headers.common['Authorization'] = headers.authorization;
	for (const input of body.inputs) {
		for (const device of input.payload.devices) {
			await axios.get('https://nve.ecofactor.com/ws/v1.0/thermostat/' + device.id + '/state').then(function(response) {
				var thermostatTemperatureSetpoint;
				switch (response.data.best_known_current_state_thermostat_data.hvac_mode) {
					case 'heat':
						thermostatTemperatureSetpoint = response.data.best_known_current_state_thermostat_data.heat_setpoint;
						break;
					case 'cool':
						thermostatTemperatureSetpoint = response.data.best_known_current_state_thermostat_data.cool_setpoint;
						break;
				}
				payload.devices[device.id] = {
					online: response.data.connected,
					thermostatMode: response.data.best_known_current_state_thermostat_data.hvac_mode,
					thermostatTemperatureSetpoint: convertTemperature('F', thermostatTemperatureSetpoint),
					thermostatTemperatureAmbient: convertTemperature('F', response.data.best_known_current_state_thermostat_data.temperature)
				}
			});
		};
	};
	return {
		requestId: body.requestId,
		payload: payload
	}
});

app.onExecute(async (body, headers) => {
	const payload = {
		commands: [{
			ids: [],
			status: 'SUCCESS',
			states: {
				online: true,
			},
		}],
	};
	axios.defaults.headers.common['Authorization'] = headers.authorization;
	for (const input of body.inputs) {
		for (const command of input.payload.commands) {
			for (const device of command.devices) {
				payload.commands[0].ids.push(device.id);
				for (const execution of command.execution) {
					const execCommand = execution.command;
					const { params } = execution;
					switch (execCommand) {
						case 'action.devices.commands.ThermostatTemperatureSetpoint':
							var setPointCommand;
							await axios.get('https://nve.ecofactor.com/ws/v1.0/thermostat/' + device.id + '/state').then(function(response) {
								switch (response.data.best_known_current_state_thermostat_data.hvac_mode) {
									case 'heat':
										setPointCommand = 'heat_setpoint';
										break;
									case 'cool':
										setPointCommand = 'cool_setpoint';
										break;
								}
							});
							await axios.patch('https://nve.ecofactor.com/ws/v1.0/thermostat/' + device.id + '/state', {
								[setPointCommand]: convertTemperature('C', params.thermostatTemperatureSetpoint)
							}).then(function(response) {
								payload.commands[0].states.thermostatTemperatureSetpoint = params.thermostatTemperatureSetpoint;
							});
							break;
						case 'action.devices.commands.ThermostatSetMode':
							await axios.patch('https://nve.ecofactor.com/ws/v1.0/thermostat/' + device.id + '/state', {
								hvac_mode: params.thermostatMode
							}).then(function(response) {
								payload.commands[0].states.thermostatMode = params.thermostatMode;
							});
							break;
					}
				}
			}
		}
	}
	return {
		requestId: body.requestId,
		payload: payload
	}
});

exports.smarthome = functions.https.onRequest(app);
