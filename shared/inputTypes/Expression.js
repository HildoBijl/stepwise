// The Expression class represents any type of mathematical expression, including with brackets, fractions, functions, variables with subscripts, powers and more. It does NOT include an equals sign or other form of comparison: that would make it an equation or inequality.

const { Expression, expressionStrToSI, expressionSItoFO, expressionSOtoFO } = require('../CAS')

module.exports.Expression = Expression
module.exports.SOtoFO = (SO) => expressionSOtoFO(SO)
module.exports.SItoFO = (value, settings) => expressionSItoFO(value, settings)
module.exports.FOtoSI = (expression) => expressionStrToSI((expression instanceof Expression ? expression.str : expression))
