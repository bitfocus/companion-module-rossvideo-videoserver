module.exports = {
	// ######################
	// #### Send Actions ####
	// ######################

	sendCommand: function (i, str) {
		let self = i

		if (str !== undefined) {
			debug('Sending Rosstalk (TCP) command: ', cmd, 'to', self.config.host);

			if (self.socket !== undefined && self.socket.connected) {
				self.socket.send(cmd + '\r\n');
			}
			else {
				debug('Socket not connected :(');
			}
		}
	},

	// ##########################
	// #### Instance Actions ####
	// ##########################
	setActions: function (i) {
		let self = i
		let actions = {}
		let cmd = ''

		actions.cue = {
			label: 'Cue Clip into Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: self.CHOICES_CHANNELS[0].id,
					choices: self.CHOICES_CHANNELS
				},
				{
					type: 'textinput',
					label: 'Clip Name',
					id: 'clip',
					default: ''
				}
			],
			callback: function (action, bank) {
				cmd = 'CUE ' + action.options.channel + ':' + action.options.clip;
				self.sendCommand(cmd);
				self.data['channel_' + action.options.channel.toLowerCase() + '_clip'] = actions.options.clip;
				self.data['channel_' + action.options.channel.toLowerCase() + '_command'] = cmd;
			}
		}

		actions.cueTimecode = {
			label: 'Cue Clip into Channel at Timecode Position',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: self.CHOICES_CHANNELS[0].id,
					choices: self.CHOICES_CHANNELS
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
			callback: function (action, bank) {
				cmd = 'CUE ' + action.options.channel + ':' + action.options.clip + ':' + action.options.timecode;
				self.sendCommand(cmd);
				self.data['channel_' + action.options.channel.toLowerCase() + '_clip'] = actions.options.clip;
				self.data['channel_' + action.options.channel.toLowerCase() + '_command'] = cmd;
			}
		}

		actions.play = {
			label: 'Play Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: self.CHOICES_CHANNELS[0].id,
					choices: self.CHOICES_CHANNELS
				}	
			],
			callback: function (action, bank) {
				cmd = 'PLAY ' + action.options.channel;
				self.sendCommand(cmd);
				self.data['channel_' + action.options.channel.toLowerCase() + '_command'] = cmd;
			}
		}

		actions.playClip = {
			label: 'Load Clip and Play Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: self.CHOICES_CHANNELS[0].id,
					choices: self.CHOICES_CHANNELS
				},
				{
					type: 'textinput',
					label: 'Clip Name',
					id: 'clip',
					default: ''
				}	
			],
			callback: function (action, bank) {
				cmd = 'PLAY ' + action.options.channel + ':' + action.options.clip;
				self.sendCommand(cmd);
				self.data['channel_' + action.options.channel.toLowerCase() + '_clip'] = actions.options.clip;
				self.data['channel_' + action.options.channel.toLowerCase() + '_command'] = cmd;
				self.data['channel_' + action.options.channel.toLowerCase() + '_status'] = 'playing';
			}
		}

		actions.playClipTimecode = {
			label: 'Load Clip and Play Channel at Timecode Position',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: self.CHOICES_CHANNELS[0].id,
					choices: self.CHOICES_CHANNELS
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
			callback: function (action, bank) {
				cmd = 'PLAY ' + action.options.channel + ':' + action.options.clip + ':' + action.options.timecode;
				self.sendCommand(cmd);
				self.data['channel_' + action.options.channel.toLowerCase() + '_clip'] = actions.options.clip;
				self.data['channel_' + action.options.channel.toLowerCase() + '_command'] = cmd;
				self.data['channel_' + action.options.channel.toLowerCase() + '_status'] = 'playing';
			}
		}

		actions.stop = {
			label: 'Stop Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: self.CHOICES_CHANNELS[0].id,
					choices: self.CHOICES_CHANNELS
				}
			],
			callback: function (action, bank) {
				cmd = 'STOP ' + action.options.channel;
				self.sendCommand(cmd);
				self.data['channel_' + action.options.channel.toLowerCase() + '_command'] = cmd;
				self.data['channel_' + action.options.channel.toLowerCase() + '_status'] = 'stopped';
			}
		}

		actions.gotoTimecode = {
			label: 'Go To Timecode Position in Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: self.CHOICES_CHANNELS[0].id,
					choices: self.CHOICES_CHANNELS
				},
				{
					type: 'textinput',
					label: 'Timecode',
					id: 'timecode',
					default: '00,00,00,00',
					tooltip: 'Use in format: HH,MM,SS,FF'
				}
			],
			callback: function (action, bank) {
				cmd = 'GOTO ' + action.options.channel + ':' + action.options.timecode;
				self.sendCommand(cmd);
				self.data['channel_' + action.options.channel.toLowerCase() + '_command'] = cmd;
			}
		}

		actions.jog = {
			label: 'Jog Backwards/Forwards by amount in Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: self.CHOICES_CHANNELS[0].id,
					choices: self.CHOICES_CHANNELS
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
			callback: function (action, bank) {
				cmd = 'JOG ' + action.options.channel + ':' + action.options.direction + action.options.amount + 'F';
				self.sendCommand(cmd);
				self.data['channel_' + action.options.channel.toLowerCase() + '_command'] = cmd;
			}
		}

		actions.loop = {
			label: 'Set the clip repeat mode for Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: self.CHOICES_CHANNELS[0].id,
					choices: self.CHOICES_CHANNELS
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
			callback: function (action, bank) {
				cmd = 'LOOP ' + action.options.channel + ':' + action.options.mode;
				self.sendCommand(cmd);
				self.data['channel_' + action.options.channel.toLowerCase() + '_command'] = cmd;
				self.data['channel_' + action.options.channel.toLowerCase() + '_mode'] = mode;
			}
		}

		actions.angle = {
			label: 'Set Camera Angle into Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: self.CHOICES_CHANNELS[0].id,
					choices: self.CHOICES_CHANNELS
				},
				{
					type: 'textinput',
					label: 'Angle Number',
					id: 'angle',
					default: '1'
				}
			],
			callback: function (action, bank) {
				cmd = 'ANGLE ' + action.options.channel + ':' + action.options.angle;
				self.sendCommand(cmd);
				self.data['channel_' + action.options.channel.toLowerCase() + '_command'] = cmd;
			}
		}

		actions.eject = {
			label: 'Eject Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: self.CHOICES_CHANNELS[0].id,
					choices: self.CHOICES_CHANNELS
				}
			],
			callback: function (action, bank) {
				cmd = 'EJECT ' + action.options.channel;
				self.sendCommand(cmd);
				self.data['channel_' + action.options.channel.toLowerCase() + '_command'] = cmd;
				self.data['channel_' + action.options.channel.toLowerCase() + '_status'] = 'ejected';
			}
		}

		actions.custom = {
			label: 'Send Custom RossTalk Command',
			options: [
				{
					type: 'textinput',
					label: 'Command',
					id: 'command',
					default: ''
				}
			],
			callback: function (action, bank) {
				cmd = action.options.command;
				self.sendCommand(cmd);
			}
		}

		return actions
	}
}
