function getType(p) {
    if (Array.isArray(p)) return 'array';
    else if (typeof p == 'string') return 'string';
    else if (p != null && typeof p == 'object') return 'object';
    else return 'other';
}

function validatePayload(payload) {
    if (payload) {
        try {
            if (getType(payload) === 'string')
                payload = JSON.parse(payload);
            if (getType(payload) === 'object')
                return { result: true, payload };
        } catch (error) {
            let err = new Error(`An error ocurred while parsing payload. Payload must be valid JSON. Error: ${error}`);
            return { result: false, payload, err };
        }
    }
    const err = new Error('Payload must be valid JSON.');
    return { result: false, payload, err };
}

function pick(keys, obj) {
    return keys.reduce((acc, key) => {
        if (obj[key] !== undefined) {
            acc[key] = obj[key];
        }
        return acc;
    }, {});
}

module.exports = {
    validatePayload,
    pick
}
