const { Float, interpretFloatInputValue, floatToInputValue } = require('@step-wise/physics-core')

module.exports.Float = Float
module.exports.SOtoFO = SO => new Float(SO)
module.exports.SItoFO = SI => interpretFloatInputValue(SI)
module.exports.FOtoSI = float => floatToInputValue(float)
module.exports.FOtoSO = float => float.toStorageValue()
