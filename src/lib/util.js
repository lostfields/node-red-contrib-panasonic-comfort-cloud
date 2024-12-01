function gettersToJson(instance) {
    let proto = Object.getPrototypeOf(instance),
        json = {},
        hasProperties = false

    for (const property of Object.getOwnPropertyNames(proto)) {
        if (proto.hasOwnProperty(property)) {
            const descriptor = Object.getOwnPropertyDescriptor(proto, property)
            if (descriptor?.get) {
                let value = descriptor?.get.call(instance)

                if (value !== null && typeof value == 'object' && ('toJSON' in value))
                    value = value.toJSON.call(value)

                if (value !== undefined) {
                    json[property] = value
                    
                    hasProperties = true
                }
            }
        }
    }

    return hasProperties ? json : undefined
}

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

module.exports = {
    gettersToJson,
    validatePayload
}
