const { Unit, interpretUnitInputValue, unitToInputValue } = require('@step-wise/physics-core')

module.exports.Unit = Unit
module.exports.SOtoFO = SO => new Unit(SO)
module.exports.SItoFO = SI => interpretUnitInputValue(SI)
module.exports.FOtoSI = unit => unitToInputValue(unit)
module.exports.FOtoSO = unit => unit.toStorageValue()
