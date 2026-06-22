const { FloatUnit, interpretFloatUnitInputValue, floatUnitToInputValue } = require('@step-wise/physics-core')

module.exports.FloatUnit = FloatUnit
module.exports.SOtoFO = SO => new FloatUnit(SO)
module.exports.SItoFO = SI => interpretFloatUnitInputValue(SI)
module.exports.FOtoSI = floatUnit => floatUnitToInputValue(floatUnit)
module.exports.FOtoSO = floatUnit => floatUnit.toStorageValue()
