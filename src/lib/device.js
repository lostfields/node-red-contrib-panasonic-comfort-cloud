const { 
    Device: BaseDevice,
    Power,
    OperationMode,
    FanSpeed,
    AirSwingLR,
    AirSwingUD,
    EcoMode,
    FanAutoMode,
    NanoeMode
} = require('panasonic-comfort-cloud-client');

class Device extends BaseDevice {
    constructor(guid, name, parameters) {
        super(guid, name)

        Object.assign(this, parameters)
    }

    get operate() {
        return super.operate
    }
    
    set operate(value) {
        super.operate = typeof value == 'string' ? Power[value] : value
    }

    get operationMode() {
        return super.operationMode
    }
    
    set operationMode(value) {
        super.operationMode = typeof value == 'string' ? OperationMode[value] : value
    }
    
    get temperatureSet() {
        return super.temperatureSet
    }

    set temperatureSet(value) {
        super.temperatureSet = value
    }
    
    get fanSpeed() {
        return super.fanSpeed
    }

    set fanSpeed(value) {
        super.fanSpeed = typeof value == 'string' ? FanSpeed[value] : value
    }
    
    get fanAutoMode() {
        return super.fanAutoMode
    }

    set fanAutoMode(value) {
        super.fanAutoMode = typeof value == 'string' ? FanAutoMode[value] : value
    }
    
    get airSwingLR() {
        return super.airSwingLR
    }

    set airSwingLR(value) {
        super.airSwingLR = typeof value == 'string' ? AirSwingLR[value] : value
    }
    
    get airSwingUD() {
        return super.airSwingUD
    }

    set airSwingUD(value) {
        super.airSwingUD = typeof value == 'string' ? AirSwingUD[value] : value
    }
    
    get ecoMode() {
        return super.ecoMode
    }
    
    set ecoMode(value) {
        super.ecoMode = typeof value == 'string' ? EcoMode[value] : value
    }
    
    get ecoNavi() {
        return super.ecoNavi
    }
    
    set ecoNavi(value) {
        super.ecoNavi = value
    }
    
    get nanoe() {
        return super.nanoe
    }
    
    set nanoe(value) {
        super.nanoe = typeof value == 'string' ? NanoeMode[value] : value
    }
    
    get iAuto() {
        return super.iAuto
    }

    set iAuto(value) {
        super.iAuto = value
    }
    
    get actualNanoe() {
        return super.actualNanoe
    }
    
    set actualNanoe(value) {
        super.actualNanoe = typeof value == 'string' ? NanoeMode[value] : value
    }
    
    get airDirection() {
        return super.airDirection
    }

    set airDirection(value) {
        super.airDirection = value
    }
    
    
    get ecoFunctionData() {
        return super.ecoFunctionData
    }
    
    set ecoFunctionData(value) {
        super.ecoFunctionData = value
    }

    get insideTemperature() { 
        return super.insideTemperature
    }
    
    set insideTemperature(value) {
        super.insideTemperature = value
    }
    
    get outTemperature() {
        return super.outTemperature
    }
    
    set outTemperature(value) {
        super.outTemperature = value
    }
    
    toJSON() {
        return {
            guid: this.guid,
            name: this.name,
            operate: Power[this.operate],
            operationMode: OperationMode[this.operationMode],
            temperatureSet: this.temperatureSet,
            fanSpeed: FanSpeed[this.fanSpeed],
            fanAutoMode: FanAutoMode[this.fanAutoMode],
            airSwingLR: AirSwingLR[this.airSwingLR],
            airSwingUD: AirSwingUD[this.airSwingUD],
            ecoMode: EcoMode[this.ecoMode],
            ecoNavi: this.ecoNavi,
            nanoe: NanoeMode[this.nanoe],
            iAuto: this.iAuto,
            actualNanoe: this.actualNanoe,
            airDirection:  this.airDirection,
            ecoFunctionData: this.ecoFunctionData,
            insideTemperature: this.insideTemperature,
            outTemperature: this.outTemperature
        }
    }
}

module.exports = {
    Device
}
