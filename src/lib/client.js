const { ComfortCloudClient } = require('panasonic-comfort-cloud-client');
const { Device } = require('./device');

class Client extends ComfortCloudClient {
    _RED = null
    _configKey = {}

    _isLocked = false;
    _lockQueue = [];

    constructor(RED, config) {
        super();

        this._RED = RED;

        switch(typeof config) {
            case 'string':
                this._configKey = config;
                break;
            
            case 'object':
                if(config != null)
                    this._configKey = config?.comfortCloudConfig;
                break;
        }
    }

    get isAuthenticated() {
        if(this.oauthClient.token) {
            const [header, payload, signature] = this.oauthClient.token.split('.')
            try {
                const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8') || '{}')  
                if((decodedPayload.exp * 1000) > Date.now()) {
                    return true
                }
            } catch (error) {
                return false
            }
        }

        return false;
    }

    async login() {
        await this._acquireLock();
        try {
            const credentials = this._RED.nodes.getCredentials(this._configKey);

            await super.login(credentials?.username, credentials?.password, credentials?.refreshToken);

            const newCredentials = {
                ...credentials,
                accessToken: this.oauthClient.token,
                refreshToken: this.oauthClient.tokenRefresh
            }

            this._RED.nodes.addCredentials(this._configKey, newCredentials);
        } finally {
            this._releaseLock();
        }        
    }
    
    async getGroups() {
        if(!this.isAuthenticated)
            await this.login();
        
        const groups = [];
        for (const group of await super.getGroups()) {
            groups.push({
                id: group.id,
                name: group.name,
                devices: group.devices.map(device => new Device(device.guid, device.name, device))
            });
        }

        return groups;
    }

    async getDevice(deviceId, name) {
        if(!this.isAuthenticated)
            await this.login()

        const device = await super.getDevice(deviceId, name);

        return new Device(device.guid, device.name, {
            guid: device.guid,
            name: device.name,
            operate: device.operate,
            operationMode: device.operationMode,
            temperatureSet: device.temperatureSet,
            fanSpeed: device.fanSpeed,
            fanAutoMode: device.fanAutoMode,
            airSwingLR: device.airSwingLR,
            airSwingUD: device.airSwingUD,
            ecoMode: device.ecoMode,
            ecoNavi: device.ecoNavi,
            nanoe: device.nanoe,
            iAuto: device.iAuto,
            actualNanoe: device.actualNanoe,
            airDirection:  device.airDirection,
            ecoFunctionData: device.ecoFunctionData,
            insideTemperature: device.insideTemperature,
            outTemperature: device.outTemperature
        });
    }

    async setParameters(deviceId, parameters) {
        if(!this.isAuthenticated)
            await this.login()

        const result = await super.setParameters(deviceId, parameters)

        if(result && result.status === 200) {
            return true
        }

        return false
    }

    async retry(action) {
        let retryCount = 0;
            const maxRetry = 3;   

        while (retryCount++ < maxRetry) {
            try {
                msg.payload = await Promise.resolve(action());
                return msg
            } catch (error) {
                try {
                    if (error.httpCode === 401) {
                        this.login()
                        node.log('Obtained a new access token.');
                    } else if (error.httpCode === 403) {
                        throw new Error(`An error ocurred while trying to get group. Check credentials: ${JSON.stringify(error)}`)                        
                    } else {
                        throw new Error(`An error ocurred while trying to get group: ${JSON.stringify(error)}`)
                    }
                } catch (loginErr) {
                    // if (done) {
                    //     done(loginErr);
                    // } else {
                    //     node.error(loginErr, msg);
                    // }
                    break;
                }
            }
        }
        if (retryCount >= maxRetry) {
            // node.error('Reached max retry count ' + maxRetry + '. Please check your credentials, or read the logs for more information.')
        }

    }

    async _acquireLock() {
        if (this._isLocked) {
            // Wait for lock to be released
            await new Promise(resolve => this._lockQueue.push(resolve));
        }
        this._isLocked = true;
    }

    _releaseLock() {
        this._isLocked = false;
        const nextResolver = this._lockQueue.shift();
        if (nextResolver) {
            nextResolver();
        }
    }
}

module.exports = {
    Client
}
