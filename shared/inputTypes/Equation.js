// An Equation is an input type containing two expressions with an equals sign in-between.

const { equationStrToSI, equationSItoFO, equationSOtoFO } = require('../CAS')

module.exports.SOtoFO = (SO) => equationSOtoFO(SO)
module.exports.SItoFO = (value, settings) => equationSItoFO(value, settings)
module.exports.FOtoSI = (equation) => equationStrToSI(equation.str)