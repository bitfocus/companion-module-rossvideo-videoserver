module.exports = {
	// ##########################
	// #### Define Feedbacks ####
	// ##########################
	setFeedbacks: function (i) {
		let self = i
		let feedbacks = {}
		
		const foregroundColor = self.rgb(255, 255, 255) // White
		const backgroundColorRed = self.rgb(255, 0, 0) // Red
		const backgroundColorGreen = self.rgb(0, 255, 0) // Green
		const backgroundColorOrange = self.rgb(255, 102, 0) // Orange

		feedbacks.channelStatus = {
			type: 'boolean',
			label: 'Channel Status',
			description: 'Indicate if Channel is in Selected Status',
			style: {
				color: foregroundColor,
				bgcolor: backgroundColorRed,
			},
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
			callback: function (feedback, bank) {
				let opt = feedback.options;
				if (self.data['channel_' + opt.channel.toLowerCase() + '_status'] === opt.option) {
					return true;
				}

				return false;
			}
		}
		

		return feedbacks
	}
}
