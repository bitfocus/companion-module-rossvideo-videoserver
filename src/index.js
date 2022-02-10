var tcp = require('../../../tcp');
var instance_skel = require('../../../instance_skel')
var actions = require('./actions.js')
var presets = require('./presets.js')
var feedbacks = require('./feedbacks.js')
var variables = require('./variables.js')

var debug

instance.prototype.CHOICES_CHANNELS = [
	{id: 'A', label: 'Channel A'},
	{id: 'B', label: 'Channel B'},
	{id: 'C', label: 'Channel C'},
	{id: 'D', label: 'Channel D'}
];

instance.prototype.data = {};

// ########################
// #### Instance setup ####
// ########################
function instance(system, id, config) {
	let self = this

	// super-constructor
	instance_skel.apply(this, arguments)

	return self
}

instance.GetUpgradeScripts = function () {
}

// When module gets deleted
instance.prototype.destroy = function () {
	let self = this;

	if (this.socket !== undefined) {
		this.socket.destroy();
	}

	self.socket = null;

	debug('destroy', self.id)
}

// Initalize module
instance.prototype.init = function () {
	let self = this

	debug = self.debug
	log = self.log

	self.status(self.STATUS_WARNING, 'connecting')

	self.init_channels();
	self.init_tcp();

	self.actions() // export actions
	self.init_presets()
	self.init_variables()
	self.checkVariables()
	self.init_feedbacks()
	self.checkFeedbacks()
};

// Update module after a config change
instance.prototype.updateConfig = function (config) {
	let self = this
	self.config = config
	self.status(self.STATUS_UNKNOWN)

	self.init_channels();
	self.init_tcp();

	self.actions() // export actions
	self.init_presets()
	self.init_variables()
	self.checkVariables()
	self.init_feedbacks()
	self.checkFeedbacks()
};

instance.prototype.init_channels = function() {
	let self = this;

	let channelCount = parseInt(self.config.channels);

	if ((channelCount <= 0) || (channelCount === 'NaN')) {
		channelCount = 4;
	}

	self.CHOICES_CHANNELS = [];

	for (let i = 0; i < channelCount; i++) {
		let channelObj = {};
		//convert the number to a letter
		let letterLower = String.fromCharCode(97 + i);
		let letterUpper = String.fromCharCode(65 + i);
		channelObj.id = letterUpper;
		channelObj.label = 'Channel ' + letterUpper;
		self.CHOICES_CHANNELS.push(channelObj);

		self.data['channel_' + letterLower + '_clip'] = '';
		self.data['channel_' + letterLower + '_command'] = '';
		self.data['channel_' + letterLower + '_status'] = '';
		self.data['channel_' + letterLower + '_mode'] = '';
	}
};

instance.prototype.init_tcp = function () {
	let self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.host) {
		if (self.config.port === undefined) {
			self.config.port = 7788;
		}
		self.socket = new tcp(self.config.host, self.config.port);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug('Network error', err);
			self.status(self.STATE_ERROR, err);
			self.log('error', 'Network error: ' + err.message);
		});

		self.socket.on('connect', function () {
			self.status(self.STATE_OK);
			debug('Connected to server');
		});

		self.socket.on('data', function (data) {
			//do something with the data here
		});
	}
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	let self = this

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
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Port',
			width: 6,
			default: '7788',
			regex: self.REGEX_NUMBER
		},
		{
			type: 'textinput',
			id: 'channels',
			label: 'Number of Channels',
			width: 6,
			default: '4',
			regex: self.REGEX_NUMBER
		}
	]
}

// ##########################
// #### Instance Presets ####
// ##########################
instance.prototype.init_presets = function () {
	this.setPresetDefinitions(presets.setPresets(this));
}

// ############################
// #### Instance Variables ####
// ############################
instance.prototype.init_variables = function () {
	this.setVariableDefinitions(variables.setVariables(this));
}

// Setup Initial Values
instance.prototype.checkVariables = function () {
	variables.checkVariables(this);
}

// ############################
// #### Instance Feedbacks ####
// ############################
instance.prototype.init_feedbacks = function (system) {
	this.setFeedbackDefinitions(feedbacks.setFeedbacks(this));
}

// ##########################
// #### Instance Actions ####
// ##########################
instance.prototype.actions = function (system) {
	this.setActions(actions.setActions(this));
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;