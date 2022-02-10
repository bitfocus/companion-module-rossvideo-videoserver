module.exports = {
	setPresets: function (i) {
		let self = i
		let presets = []

		const foregroundColor = self.rgb(255, 255, 255) // White
		const backgroundColorRed = self.rgb(255, 0, 0) // Red
		const backgroundColorGreen = self.rgb(0, 255, 0) // Green
		const backgroundColorOrange = self.rgb(255, 102, 0) // Orange

		// ########################
		// #### System Presets ####
		// ########################

		for (let i = 0; i < self.CHOICES_CHANNELS.length; i++) {
			let letterUpper = String.fromCharCode(65 + i);

			presets.push({
				category: 'Channel Status',
				label: 'Play ' + letterUpper,
				bank: {
					style: 'text',
					text: 'PLAY\\n' + letterUpper,
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
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
					bgcolor: self.rgb(0, 0, 0)
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
}
