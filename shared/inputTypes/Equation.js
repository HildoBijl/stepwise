// An Equation is an input type containing two expressions with an equals sign in-between.

const { Equation, equationStrToSI, equationSItoFO, equationSOtoFO } = require('../CAS')

module.exports.Equation = Equation
module.exports.SOtoFO = (SO) => equationSOtoFO(SO)
module.exports.SItoFO = (value, settings) => equationSItoFO(value, settings)
module.exports.FOtoSI = (equation) => equationStrToSI(equation.str)
