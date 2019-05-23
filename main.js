"use strict";

/*
 * Created with @iobroker/create-adapter v1.14.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");

// Load your modules here, e.g.:
// const fs = require("fs");

class IrtransUp extends utils.Adapter {

	/**
	 * @param {Partial<ioBroker.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "irtrans_up",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("objectChange", this.onObjectChange.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */

async Connect(a,ip){
     //uwe
// Include Nodejs' net module.
const Net = require('net');
// The port number and hostname of the server.
const port = 8765;
//const host = '192.168.0.82';
var host = ip;


// Create a new TCP client.
const client = new Net.Socket();
// Send a connection request to the server.
client.connect( port, host , function() {
    // If there is no error, the server has accepted the request and created a new 
    // socket dedicated to us.
    
    a.log.info('TCP connection established with the server. '+ host);
	a.setStateAsync("info.connection", true);
     a.setStateAsync("TCPSocket", { val:'TCP connection established with the server.', ack: true });
    // The client can now send data to the server by writing to its socket.
    //client.write('Hello, server.');
});

// The client can also receive data from the server by reading from its socket.
client.on('data', function(chunk) {
    a.setStateAsync("TCPSocket", { val: chunk.toString(), ack: true });
    a.setStateAsync("Command", { val: chunk.toString().split(' ')[2], ack: true });
    a.setStateAsync("Device", { val: chunk.toString().split(' ')[3], ack: true });

    
     //this.log.info('Data received from the server: ${chunk.toString().replace("\n",'')}');
    
    // Request an end to the connection after the data has been received.
    client.end();
});

client.on('end', function(ex) {
    //log('Requested an end to the TCP connection'+ ex);
    //setState('javascript.1.TCPSocket','Requested an end to the TCP connection'+ ex);
a.setStateAsync("info.connection", false);
});

client.on('close', function(ex) {
    //log('Close TCP connection'+ ex);
    //setState('javascript.1.TCPSocket','Close TCP connection'+ ex);
a.setStateAsync("info.connection", false);
    client.connect(port, host);

});
client.on('error', function(ex) {
    
     a.log.info('Error TCP connection'+ ex.toString());
    a.setStateAsync("TCPSocket", { val: 'Error TCP connection'+ ex, ack: true });
});
//uwe

}




	async onReady() {
		// Initialize your adapter here

		// Reset the connection indicator during startup
		this.setState("info.connection", false, true);

		// The adapters config (in the instance object everything under the attribute "native") is accessible via
		// this.config:
		this.log.info("config option1: " + this.config.option1);
		this.log.info("config option2: " + this.config.option2);
		this.log.info("IP: " + this.config.ip);

		/*
		For every state in the system there has to be also an object of type state
		Here a simple template for a boolean variable named "testVariable"
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/
		    await this.setObjectAsync('TCPSocket', {
            type: 'state',
            common: {
                name: 'TCPSocket',
                type: 'string',
                role: '',
                read: true,
                write: true,
            },
            native: {},
});
    await this.setObjectAsync('Command', {
            type: 'state',
            common: {
                name: 'Command',
                type: 'string',
                role: '',
                read: true,
                write: true,
            },
            native: {},
});
    await this.setObjectAsync('Device', {
            type: 'state',
            common: {
                name: 'Device',
                type: 'string',
                role: '',
                read: true,
                write: true,
            },
            native: {},
});
		// in this template all states changes inside the adapters namespace are subscribed
		this.subscribeStates("*");

		/*
		setState examples
		you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
		*/
		// the variable testVariable is set to true as command (ack=false)
		//await this.setStateAsync("testVariable", true);

		// same thing, but the value is flagged "ack"
		// ack should be always set to true if the value is received from or acknowledged from the target system
		//await this.setStateAsync("testVariable", { val: true, ack: true });

		// same thing, but the state is deleted after 30s (getState will return null afterwards)
		//await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });

		// examples for the checkPassword/checkGroup functions
		//let result = await this.checkPasswordAsync("admin", "iobroker");
		//this.log.info("check user admin pw ioboker: " + result);

		//result = await this.checkGroupAsync("admin", "admin");
		//this.log.info("check group user admin group admin: " + result);

		await this.Connect(this,this.config.ip);
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			this.log.info("cleaned everything up...");
			callback();
		} catch (e) {
			callback();
		}
	}

	/**
	 * Is called if a subscribed object changes
	 * @param {string} id
	 * @param {ioBroker.Object | null | undefined} obj
	 */
	onObjectChange(id, obj) {
		if (obj) {
			// The object was changed
			this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
		} else {
			// The object was deleted
			this.log.info(`object ${id} deleted`);
		}
	}

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.message" property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === "object" && obj.message) {
	// 		if (obj.command === "send") {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info("send command");

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
	// 		}
	// 	}
	// }

}

// @ts-ignore parent is a valid property on module
if (module.parent) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<ioBroker.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new IrtransUp(options);
} else {
	// otherwise start the instance directly
	new IrtransUp();
}
