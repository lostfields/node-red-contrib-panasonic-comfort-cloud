// import { Device, Group, ComfortCloudClient } from 'panasonic-comfort-cloud-client';
const cloud = require('panasonic-comfort-cloud-client');

module.exports = function (RED) {
    function ComfortCloudDevice(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var context = this.context();
        var globalContext = this.context().global;
        let credentials = RED.nodes.getCredentials(config.comfortCloudConfig);
        node.on('input', async function (msg) {
            let client = new cloud.ComfortCloudClient();
            client.token = credentials.accessToken;
            let retryCount = 0;
            let maxRetry = 3;
            if (msg.payload === undefined || msg.payload === null || msg.payload === '') {
                msg.payload = null;
                node.send(msg);
            }
            let device = null;
            while (retryCount++ < 3) {
                try {
                    device = await client.getDevice(msg.payload);
                    msg.payload = device;
                    node.send(msg);
                    break;
                } catch (err) {
                    try {
                        let accessToken = await client.login(credentials.username, credentials.password);
                        credentials.accessToken = accessToken;
                        RED.nodes.addCredentials(config.comfortCloudConfig, credentials);
                        node.log('Obtained a new access token.');
                    } catch (loginErr) {
                        node.error(loginErr);
                        break;
                    }
                }
            }
            if (retryCount >= maxRetry) {
                node.error('Reached max retry count ' + maxRetry + '. Please check your credentials, or read the logs for more information.')
            }
        });
    }
    RED.nodes.registerType("pcc-device", ComfortCloudDevice);
}