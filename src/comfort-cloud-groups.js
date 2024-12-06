// import { Device, Group, ComfortCloudClient } from 'panasonic-comfort-cloud-client';
const { ComfortCloudClient } = require('panasonic-comfort-cloud-client');
const { Client } = require('./lib/client');

// const Tools = require('./tools');

module.exports = function (RED) {
    function ComfortCloudGroups(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        // const _config = config;
        // const _tools = new Tools();

        const global = this.context().global
        const clientKey = `client-${config.comfortCloudConfig}`
        if (!global.get(clientKey)) global.set(clientKey, new Client(RED, config))

        const CLIENT = global.get(clientKey)

        node.on('input', async function (msg, send, done) {
            try {
                if (msg.payload === undefined || msg.payload === null || msg.payload === '') {
                    msg.payload = null;
                    send(msg);
                }

                msg.payload = await CLIENT.getGroups();
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

    RED.nodes.registerType("pcc-groups", ComfortCloudGroups);
};