// The Expression class represents any type of mathematical expression, including with brackets, fractions, functions, variables with subscripts, powers and more. It does NOT include an equals sign or other form of comparison: that would make it an equation or inequality.

const { stringToInputValue } = require('@step-wise/math-input-value')
const { Expression, asExpression, serializeExpression, deserializeExpression } = require('@step-wise/cas')

module.exports.Expression = Expression
module.exports.SOtoFO = (SO, expressionSettings) => Expression.fromStorageValue(SO, expressionSettings)
module.exports.SItoFO = (value, expressionSettings) => asExpression({ type: 'Expression', value, expressionSettings })
module.exports.FOtoSI = (expression) => stringToInputValue(expression.toString(), expression.getInterpretationSettings(), expression.settings).value
module.exports.FOtoSO = (expression) => expression.toStorageValue()
