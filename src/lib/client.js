const { ComfortCloudClient } = require('panasonic-comfort-cloud-client');
const { gettersToJson } = require('./util');

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

            credentials.accessToken = this.oauthClient.token;
            credentials.refreshToken = this.oauthClient.tokenRefresh;

            this._RED.nodes.addCredentials(this._configKey, credentials);
        } finally {
            this._releaseLock();
        }        
    }
    
    async getGroups() {
        if(!this.isAuthenticated)
            await this.login()
        
        const groups = await super.getGroups();

        return groups.map(gettersToJson);
    }

    async getDevice(deviceId, name) {
        if(!this.isAuthenticated)
            await this.login()

        const device = await super.getDevice(deviceId, name);

        return gettersToJson(device);
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
