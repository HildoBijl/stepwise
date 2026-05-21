// An Equation is an input type containing two expressions with an equals sign in-between.

const { stringToInputValue } = require('@step-wise/math-input-value')
const { Equation, asEquation, serializeExpression, deserializeEquation } = require('@step-wise/cas')

module.exports.Equation = Equation
module.exports.SOtoFO = (SO, equationSettings) => Expression.fromStorageValue(SO, equationSettings)
module.exports.SItoFO = (value, equationSettings) => asExpression({ type: 'Equation', value, expressionSettings: equationSettings })
module.exports.FOtoSI = (equation) => stringToInputValue(equation.toString(), equation.getInterpretationSettings(), equation.settings)
module.exports.FOtoSO = (equation) => equation.toStorageValue()
