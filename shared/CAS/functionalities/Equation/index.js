const Equation = require('./Equation')
const checks = require('./checks')

module.exports = {
	...Equation,
	equationChecks: checks,
}