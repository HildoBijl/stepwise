const { Unit, interpretUnitInputValue, UnitToInputValue } = require('@step-wise/physics-core')

module.exports.Unit = Unit
module.exports.SOtoFO = SO => new Unit(SO)
module.exports.SItoFO = SI => interpretUnitInputValue(SI)
module.exports.FOtoSI = unit => UnitToInputValue(unit)
module.exports.FOtoSO = unit => unit.toStorageValue()
