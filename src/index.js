const tcp = require('../../../tcp');
const instance_skel = require('../../../instance_skel')
const zlib = require('zlib')

class instance extends instance_skel {
	CHOICES_CHANNELS = [
		{id: 'A', label: 'Channel A'},
		{id: 'B', label: 'Channel B'},
		{id: 'C', label: 'Channel C'},
		{id: 'D', label: 'Channel D'}
	];

	init() {
		this.data = {};
	
		this.status(this.STATUS_WARNING, 'connecting')
	
		this.init_channels();
		this.init_tcp();
	
		this.actions() // export actions
		this.init_presets()
		this.init_variables()
		this.checkVariables()
		this.init_feedbacks()
		this.checkFeedbacks()
	}

	destroy() {
		if (this.socket !== undefined) {
			this.socket.destroy();
			delete this.socket;
		}
	}
	
	updateConfig(config) {
		// @todo only reconnect and such if connection info actually cahnged
		this.destroy()

		this.config = config
		this.status(this.STATUS_UNKNOWN)

		this.init_channels();
		this.init_tcp();

		this.actions() // export actions
		this.init_presets()
		this.init_variables()
		this.checkVariables()
		this.init_feedbacks()
		this.checkFeedbacks()
	}

	init_channels() {
		let channelCount = parseInt(this.config.channels);

		if ((channelCount <= 0) || (channelCount === 'NaN')) {
			channelCount = 4;
		}

		// @todo figure out why we're setting these at the start, probably aren't needed... also the way they were setup, they would change if you had multiple devices!
		this.CHOICES_CHANNELS = [];

		for (let i = 0; i < channelCount; i++) {
			let channelObj = {};
			//convert the number to a letter
			let letterLower = String.fromCharCode(97 + i);
			let letterUpper = String.fromCharCode(65 + i);
			channelObj.id = letterUpper;
			channelObj.label = 'Channel ' + letterUpper;
			this.CHOICES_CHANNELS.push(channelObj);

			this.data['channel_' + letterLower + '_clip'] = '';
			this.data['channel_' + letterLower + '_command'] = '';
			this.data['channel_' + letterLower + '_status'] = '';
			this.data['channel_' + letterLower + '_mode'] = '';
		}
	}

	init_tcp() {
		if (this.socket !== undefined) {
			this.socket.destroy();
			delete this.socket;
		}

		if (this.config.host) {
			if (this.config.port === undefined) {
				this.config.port = 7788;
			}
			this.socket = new tcp(this.config.host, this.config.port);

			this.socket.on('status_change', (status, message) => {
				this.status(status, message);
			});

			this.socket.on('error', (err) => {
				this.debug('Network error', err);
				this.status(this.STATE_ERROR, err);
				this.log('error', 'Network error: ' + err.message);
			});

			this.socket.on('connect', () => {
				this.status(this.STATE_OK);
				this.debug('Connected to server');
			});

			this.socket.on('data', (data) => {
				//do something with the data here
			});
		}
	}

	config_fields() {
		return [
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module controls Ross Video Mira, Tria, and Kiva Video Servers using the Ross Talk protocol.',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Host/IP of server',
				width: 4,
				regex: this.REGEX_IP
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Port',
				width: 6,
				default: '7788',
				regex: this.REGEX_NUMBER
			},
			{
				type: 'textinput',
				id: 'channels',
				label: 'Number of Channels',
				width: 6,
				default: '4',
				regex: this.REGEX_NUMBER
			}
		]
	}

	init_presets() {
		let presets = []

		const foregroundColor = this.rgb(255, 255, 255) // White
		const backgroundColorRed = this.rgb(255, 0, 0) // Red

		for (let i = 0; i < this.CHOICES_CHANNELS.length; i++) {
			let letterUpper = String.fromCharCode(65 + i);

			presets.push({
				category: 'Channel Status',
				label: 'Play ' + letterUpper,
				bank: {
					style: 'text',
					text: 'PLAY\\n' + letterUpper,
					size: '18',
					color: '16777215',
					bgcolor: this.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'play',
						options: {
							channel: letterUpper
						}
					}
				],
				feedbacks: [
					{
						type: 'channelStatus',
						options: {
							channel: letterUpper,
							option: 'playing',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			});

			presets.push({
				category: 'Channel Status',
				label: 'Stop Channel ' + letterUpper,
				bank: {
					style: 'text',
					text: 'STOP\\n' + letterUpper,
					size: '18',
					color: '16777215',
					bgcolor: this.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'stop',
						options: {
							channel: letterUpper
						}
					}
				],
				feedbacks: [
					{
						type: 'channelStatus',
						options: {
							channel: letterUpper,
							option: 'stopped',
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			});
		}

		return presets
	}

	init_variables() {
		let variables = []

		for (let i = 0; i < this.CHOICES_CHANNELS.length; i++) {
			let letterLower = String.fromCharCode(97 + i);
			let letterUpper = String.fromCharCode(65 + i);

			variables.push({ name: 'channel_' + letterLower + '_clip', label: 'Channel ' + letterUpper + ' Last Clip' });
			variables.push({ name: 'channel_' + letterLower + '_command', label: 'Channel ' + letterUpper + ' Last Command' });
			variables.push({ name: 'channel_' + letterLower + '_status', label: 'Channel ' + letterUpper + ' Status' });
			variables.push({ name: 'channel_' + letterLower + '_mode', label: 'Channel ' + letterUpper + ' Mode' });
		}

		this.setVariableDefinitions(variables);
	}

	checkVariables() {
		try {
			for (let i = 0; i < this.CHOICES_CHANNELS.length; i++) {
				let letterLower = String.fromCharCode(97 + i);
	
				this.setVariable('channel_' + letterLower + '_clip', this.data['channel_' + letterLower + '_clip']);
				this.setVariable('channel_' + letterLower + '_command', this.data['channel_' + letterLower + '_command']);
				this.setVariable('channel_' + letterLower + '_status', this.data['channel_' + letterLower + '_status']);
				this.setVariable('channel_' + letterLower + '_mode', this.data['channel_' + letterLower + '_mode']);
			}
		} catch(error) {
			this.log('error', 'Error parsing Variables: ' + String(error))
		}
	}

	init_feedbacks(system) {
		const feedbacks = {
			channelStatus: {
				type: 'boolean',
				label: 'Channel Status',
				description: 'Indicate if Channel is in Selected Status',
				style: {
					color: this.rgb(255, 255, 255),
					bgcolor: this.rgb(255, 0, 0),
				},
				options: [
					{
						type: 'dropdown',
						label: 'Channel',
						id: 'channel',
						default: this.CHOICES_CHANNELS[0].id,
						choices: this.CHOICES_CHANNELS
					},
					{
						type: 'dropdown',
						label: 'Indicate in X State',
						id: 'option',
						default: 'playing',
						choices: [
							{ id: 'playing', label: 'Playing' },
							{ id: 'stopped', label: 'Stopped' },
							{ id: 'ejected', label: 'Ejected' }
						]
					}
				],
				callback: (feedback, bank) => {
					let opt = feedback.options;
					if (this.data['channel_' + opt.channel.toLowerCase() + '_status'] === opt.option) {
						return true;
					}

					return false;
				}
			}
		}

		this.setFeedbackDefinitions(feedbacks)
	}

	sendCommand(cmd) {
		if (this.socket !== undefined && this.socket.connected) {
			this.socket.send(cmd + '\r\n')
		} else {
			this.log('debug', 'Tried to send command when not connected.')
		}
	}

	actions() {
		this.setActions({
			cue: {
				label: 'Cue Clip into Channel',
				options: [
					{
						type: 'dropdown',
						label: 'Channel',
						id: 'channel',
						default: this.CHOICES_CHANNELS[0].id,
						choices: this.CHOICES_CHANNELS
					},
					{
						type: 'textinput',
						label: 'Clip Name',
						id: 'clip',
						default: ''
					}
				],
				callback: (action, bank) => {
					const cmd = 'CUE ' + action.options.channel + ':' + action.options.clip;
					this.sendCommand(cmd);
					this.data['channel_' + action.options.channel.toLowerCase() + '_clip'] = action.options.clip;
					this.data['channel_' + action.options.channel.toLowerCase() + '_command'] = cmd;
				}
			},
			cueTimecode: {
				label: 'Cue Clip into Channel at Timecode Position',
				options: [
					{
						type: 'dropdown',
						label: 'Channel',
						id: 'channel',
						default: this.CHOICES_CHANNELS[0].id,
						choices: this.CHOICES_CHANNELS
					},
					{
						type: 'textinput',
						label: 'Clip Name',
						id: 'clip',
						default: ''
					},
					{
						type: 'textinput',
						label: 'Timecode',
						id: 'timecode',
						default: '00,00,00,00',
						tooltip: 'Use in format: HH,MM,SS,FF'
					}
				],
				callback: (action, bank) => {
					const cmd = 'CUE ' + action.options.channel + ':' + action.options.clip + ':' + action.options.timecode;
					this.sendCommand(cmd);
					this.data['channel_' + action.options.channel.toLowerCase() + '_clip'] = action.options.clip;
					this.data['channel_' + action.options.channel.toLowerCase() + '_command'] = cmd;
				}
			},
			play: {
				label: 'Play Channel',
				options: [
					{
						type: 'dropdown',
						label: 'Channel',
						id: 'channel',
						default: this.CHOICES_CHANNELS[0].id,
						choices: this.CHOICES_CHANNELS
					}	
				],
				callback: (action, bank) => {
					const cmd = 'PLAY ' + action.options.channel;
					console.log(cmd)

					this.sendCommand(cmd);
					this.data['channel_' + action.options.channel.toLowerCase() + '_command'] = cmd;
				}
			},
			playClip: {
				label: 'Load Clip and Play Channel',
				options: [
					{
						type: 'dropdown',
						label: 'Channel',
						id: 'channel',
						default: this.CHOICES_CHANNELS[0].id,
						choices: this.CHOICES_CHANNELS
					},
					{
						type: 'textinput',
						label: 'Clip Name',
						id: 'clip',
						default: ''
					}	
				],
				callback: (action, bank) => {
					const cmd = 'PLAY ' + action.options.channel + ':' + action.options.clip;
					this.sendCommand(cmd);
					this.data['channel_' + action.options.channel.toLowerCase() + '_clip'] = action.options.clip;
					this.data['channel_' + action.options.channel.toLowerCase() + '_command'] = cmd;
					this.data['channel_' + action.options.channel.toLowerCase() + '_status'] = 'playing';
				}
			},
			playClipTimecode: {
				label: 'Load Clip and Play Channel at Timecode Position',
				options: [
					{
						type: 'dropdown',
						label: 'Channel',
						id: 'channel',
						default: this.CHOICES_CHANNELS[0].id,
						choices: this.CHOICES_CHANNELS
					},
					{
						type: 'textinput',
						label: 'Clip Name',
						id: 'clip',
						default: ''
					},
					{
						type: 'textinput',
						label: 'Timecode',
						id: 'timecode',
						default: '00,00,00,00',
						tooltip: 'Use in format: HH,MM,SS,FF'
					}	
				],
				callback: (action, bank) => {
					const cmd = 'PLAY ' + action.options.channel + ':' + action.options.clip + ':' + action.options.timecode;
					this.sendCommand(cmd);
					this.data['channel_' + action.options.channel.toLowerCase() + '_clip'] = action.options.clip;
					this.data['channel_' + action.options.channel.toLowerCase() + '_command'] = cmd;
					this.data['channel_' + action.options.channel.toLowerCase() + '_status'] = 'playing';
				}
			},
			stop: {
				label: 'Stop Channel',
				options: [
					{
						type: 'dropdown',
						label: 'Channel',
						id: 'channel',
						default: this.CHOICES_CHANNELS[0].id,
						choices: this.CHOICES_CHANNELS
					}
				],
				callback: (action, bank) => {
					const cmd = 'STOP ' + action.options.channel;
					this.sendCommand(cmd);
					this.data['channel_' + action.options.channel.toLowerCase() + '_command'] = cmd;
					this.data['channel_' + action.options.channel.toLowerCase() + '_status'] = 'stopped';
				}
			},
			gotoTimecode: {
				label: 'Go To Timecode Position in Channel',
				options: [
					{
						type: 'dropdown',
						label: 'Channel',
						id: 'channel',
						default: this.CHOICES_CHANNELS[0].id,
						choices: this.CHOICES_CHANNELS
					},
					{
						type: 'textinput',
						label: 'Timecode',
						id: 'timecode',
						default: '00,00,00,00',
						tooltip: 'Use in format: HH,MM,SS,FF'
					}
				],
				callback: (action, bank) => {
					const cmd = 'GOTO ' + action.options.channel + ':' + action.options.timecode;
					this.sendCommand(cmd);
					this.data['channel_' + action.options.channel.toLowerCase() + '_command'] = cmd;
				}
			},
			jog: {
				label: 'Jog Backwards/Forwards by amount in Channel',
				options: [
					{
						type: 'dropdown',
						label: 'Channel',
						id: 'channel',
						default: this.CHOICES_CHANNELS[0].id,
						choices: this.CHOICES_CHANNELS
					},
					{
						type: 'dropdown',
						label: 'Direction',
						id: 'direction',
						default: '-',
						choices: [
							{ id: '-', label: 'Backwards (Reverse)' },
							{ id: '', label: 'Forward' }
						]
					},
					{
						type: 'textinput',
						label: 'Amount in frames',
						id: 'amount',
						default: '20'
					}
				],
				callback: (action, bank) => {
					const cmd = 'JOG ' + action.options.channel + ':' + action.options.direction + action.options.amount + 'F';
					this.sendCommand(cmd);
					this.data['channel_' + action.options.channel.toLowerCase() + '_command'] = cmd;
				}
			},
			loop: {
				label: 'Set the clip repeat mode for Channel',
				options: [
					{
						type: 'dropdown',
						label: 'Channel',
						id: 'channel',
						default: this.CHOICES_CHANNELS[0].id,
						choices: this.CHOICES_CHANNELS
					},
					{
						type: 'dropdown',
						label: 'Mode',
						id: 'mode',
						default: 'off',
						choices: [
							{ id: 'off', label: 'Off' },
							{ id: 'loop', label: 'Loop' },
							{ id: 'loop-to', label: 'Loop To' },
							{ id: 'ping-pong', label: 'Ping Pong' },
							{ id: 'ping-pong-to', label: 'Ping Pong To' }
						]
					}
				],
				callback: (action, bank) => {
					const cmd = 'LOOP ' + action.options.channel + ':' + action.options.mode;
					this.sendCommand(cmd);
					this.data['channel_' + action.options.channel.toLowerCase() + '_command'] = cmd;
					this.data['channel_' + action.options.channel.toLowerCase() + '_mode'] = action.options.mode;
				}
			},
			angle: {
				label: 'Set Camera Angle into Channel',
				options: [
					{
						type: 'dropdown',
						label: 'Channel',
						id: 'channel',
						default: this.CHOICES_CHANNELS[0].id,
						choices: this.CHOICES_CHANNELS
					},
					{
						type: 'textinput',
						label: 'Angle Number',
						id: 'angle',
						default: '1'
					}
				],
				callback: (action, bank) => {
					const cmd = 'ANGLE ' + action.options.channel + ':' + action.options.angle;
					this.sendCommand(cmd);
					this.data['channel_' + action.options.channel.toLowerCase() + '_command'] = cmd;
				}
			},
			eject: {
				label: 'Eject Channel',
				options: [
					{
						type: 'dropdown',
						label: 'Channel',
						id: 'channel',
						default: this.CHOICES_CHANNELS[0].id,
						choices: this.CHOICES_CHANNELS
					}
				],
				callback: (action, bank) => {
					const cmd = 'EJECT ' + action.options.channel;
					this.sendCommand(cmd);
					this.data['channel_' + action.options.channel.toLowerCase() + '_command'] = cmd;
					this.data['channel_' + action.options.channel.toLowerCase() + '_status'] = 'ejected';
				}
			},
			custom: {
				label: 'Send Custom RossTalk Command',
				options: [
					{
						type: 'textinput',
						label: 'Command',
						id: 'command',
						default: ''
					}
				],
				callback: (action, bank) => {
					const cmd = action.options.command;
					this.sendCommand(cmd);
				}
			}
		})
	}
}

exports = module.exports = instance;
