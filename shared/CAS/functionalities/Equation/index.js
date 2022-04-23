const Equation = require('./Equation')
const comparisons = require('./comparisons')
const checks = require('./checks')

module.exports = {
	...Equation,
	equationComparisons: comparisons,
	equationChecks: checks,
}