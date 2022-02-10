module.exports = {
	// ##########################
	// #### Define Variables ####
	// ##########################
	setVariables: function (i) {
		let self = i
		let variables = []

		for (let i = 0; i < self.CHOICES_CHANNELS.length; i++) {
			let letterLower = String.fromCharCode(97 + i);
			let letterUpper = String.fromCharCode(65 + i);

			variables.push({ name: 'channel_' + letterLower + '_clip', label: 'Channel ' + letterUpper + ' Last Clip' });
			variables.push({ name: 'channel_' + letterLower + '_command', label: 'Channel ' + letterUpper + ' Last Command' });
			variables.push({ name: 'channel_' + letterLower + '_status', label: 'Channel ' + letterUpper + ' Status' });
			variables.push({ name: 'channel_' + letterLower + '_mode', label: 'Channel ' + letterUpper + ' Mode' });
		}

		return variables
	},

	// #########################
	// #### Check Variables ####
	// #########################
	checkVariables: function (i) {
		try {
			let self = i;

			for (let i = 0; i < self.CHOICES_CHANNELS.length; i++) {
				let letterLower = String.fromCharCode(97 + i);
	
				self.setVariable('channel_' + letterLower + '_clip', self.data['channel_' + letterLower + '_clip']);
				self.setVariable('channel_' + letterLower + '_command', self.data['channel_' + letterLower + '_command']);
				self.setVariable('channel_' + letterLower + '_status', self.data['channel_' + letterLower + '_status']);
				self.setVariable('channel_' + letterLower + '_mode', self.data['channel_' + letterLower + '_mode']);
			}
		}
		catch(error) {
			self.log('error', 'Error parsing Variables: ' + String(error))
		}
	}
}
