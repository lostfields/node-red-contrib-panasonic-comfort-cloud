// import { Device, Group, ComfortCloudClient } from 'panasonic-comfort-cloud-client';
const { ComfortCloudClient } = require('panasonic-comfort-cloud-client');
const { Client } = require('./lib/client');
const { validatePayload } = require('./lib/util');

module.exports = function (RED) {
    function ComfortCloudDevice(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const _config = config;
        // const _tools = new Tools();
        // var context = this.context();
        // var globalContext = this.context().global;
        const global = this.context().global
        const clientKey = `client-${config.comfortCloudConfig}`
        if (!global.get(clientKey)) global.set(clientKey, new Client(RED, config))

        const CLIENT = global.get(clientKey)
        
        node.on('input', async function (msg, send, done) {
            // For maximum backwards compatibility, check that send exists.
            // If this node is installed in Node-RED 0.x, it will need to
            // fallback to using `node.send`
            send = send || function () { node.send.apply(node, arguments) }

            try {
                const payloadValidation = validatePayload(msg.payload)
                const payload = payloadValidation.result ? payloadValidation.payload : {};
    
                if (!_config.deviceId && (!payload || (!payload.deviceId && !payload.deviceGuid))) {
                    throw new Error('Missing Device ID. Send Device ID via payload or define in config.');
                }

                const pid = (payload.deviceId ? payload.deviceId : payload.deviceGuid);
                const deviceId = pid ? pid : _config.deviceId;
                const device = await CLIENT.getDevice(deviceId);

                msg.payload = 'toJSON' in device ? device.toJSON() : device;

                send(msg);
            } catch (error) {
                if (done) {
                    done(error);
                } else {
                    node.error(error, msg);
                }

                return;
            }

            if (done) {
                done();
            }
        });
    }
    RED.nodes.registerType("pcc-device", ComfortCloudDevice);
}