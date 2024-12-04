// import { Device, Group, ComfortCloudClient } from 'panasonic-comfort-cloud-client';
const {
    Power,
    AirSwingLR,
    AirSwingUD,
    FanAutoMode,
    EcoMode,
    OperationMode,
    FanSpeed,
    NanoeMode,
    InsideCleaning
} = require('panasonic-comfort-cloud-client');
const { handleError, getClient } = require('./tools');

const { validatePayload } = require('./lib/util');

Object.defineProperty(Object.prototype, "getProp", {
    value: function (prop) {
        var key, self = this;
        for (key in self) {
            if (key.toLowerCase() == prop.toLowerCase()) {
                return self[key];
            }
        }
    },
    //this keeps jquery happy
    enumerable: false
});

module.exports = function (RED) {
    function ComfortCloudCommand(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const _config = config;
        
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
                if (!payloadValidation.result) {
                    throw payloadValidation.err;
                }
                const payload = payloadValidation.payload;

                if (!_config.deviceId && (!payload || (!payload.deviceId && !payload.deviceGuid))) {
                    throw new Error('Missing Device ID. Send Device ID via payload or define in config.');
                }

                const pid = (payload.deviceId ? payload.deviceId : payload.deviceGuid);
                const deviceId = pid ? pid : _config.deviceId;
                // const device = await CLIENT.getDevice(deviceId);
                const parameters = {};

                if (payload.operate) {
                    const operate = Number(isNaN(payload.operate)
                        ? Power.getProp(payload.operate)
                        : payload.operate);
                    node.log(`Power: ${operate}`);
                    if (!isNaN(operate))
                        parameters.operate = operate;
                }
                if (payload.operationMode) {
                    const operationMode = Number(isNaN(payload.operationMode)
                        ? OperationMode.getProp(payload.operationMode)
                        : payload.operationMode);
                    node.log(`Operation Mode: ${operationMode}`);
                    if (!isNaN(operationMode))
                        parameters.operationMode = operationMode;
                }
                if (payload.ecoMode) {
                    const ecoMode = Number(isNaN(payload.ecoMode)
                        ? EcoMode.getProp(payload.ecoMode)
                        : payload.ecoMode);
                    node.log(`Eco Mode: ${ecoMode}`);
                    if (!isNaN(ecoMode))
                        parameters.ecoMode = ecoMode;
                }
                if (payload.temperatureSet) {
                    const temperature = Number(payload.temperatureSet);
                    node.log(`Temperature: ${temperature}`);
                    if (!isNaN(temperature))
                        parameters.temperatureSet = temperature;
                }
                if (payload.airSwingUD) {
                    const airSwingUD = Number(isNaN(payload.airSwingUD)
                        ? AirSwingUD.getProp(payload.airSwingUD)
                        : payload.airSwingUD);
                    node.log(`Air swing UD: ${airSwingUD}`);
                    if (!isNaN(airSwingUD))
                        parameters.airSwingUD = airSwingUD;
                }
                if (payload.airSwingLR) {
                    const airSwingLR = Number(isNaN(payload.airSwingLR)
                        ? AirSwingLR.getProp(payload.airSwingLR)
                        : payload.airSwingLR);
                    node.log(`Air swing LR: ${airSwingLR}`);
                    if (!isNaN(airSwingLR))
                        parameters.airSwingLR = airSwingLR;
                }
                if (payload.fanAutoMode) {
                    const fanAutoMode = Number(isNaN(payload.fanAutoMode)
                        ? FanAutoMode.getProp(payload.fanAutoMode)
                        : payload.fanAutoMode);
                    node.log(`Fan auto mode: ${fanAutoMode}`);
                    if (!isNaN(fanAutoMode))
                        parameters.fanAutoMode = fanAutoMode;
                }
                if (payload.fanSpeed) {
                    const fanSpeed = Number(isNaN(payload.fanSpeed)
                        ? FanSpeed.getProp(payload.fanSpeed)
                        : payload.fanSpeed);
                    node.log(`Fan speed: ${fanSpeed}`);
                    if (!isNaN(fanSpeed))
                        parameters.fanSpeed = fanSpeed;
                }
                if (payload.nanoe) {
                    const nanoe = Number(isNaN(payload.nanoe)
                        ? NanoeMode.getProp(payload.nanoe)
                        : payload.nanoe);
                    node.log(`Nanoe mode: ${nanoe}`);
                    if (!isNaN(nanoe))
                        parameters.nanoe = nanoe;
                }
                if (payload.insideCleaning) {
                    const insideCleaning = Number(isNaN(payload.insideCleaning)
                        ? InsideCleaning.getProp(payload.insideCleaning)
                        : payload.insideCleaning);
                    node.log(`insideCleaning: ${insideCleaning}`);
                    if (!isNaN(insideCleaning))
                        parameters.insideCleaning = insideCleaning;
                }

                msg.payload = await CLIENT.setParameters(deviceId, parameters);
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
    RED.nodes.registerType("pcc-command", ComfortCloudCommand);
}
