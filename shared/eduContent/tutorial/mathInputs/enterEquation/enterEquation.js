const { sample, randomInteger } = require('../../../../util')
const { asEquation, equationComparisons } = require('../../../../CAS')
const { getSimpleExerciseProcessor, selectRandomVariables, performComparison } = require('../../../../eduTools')

const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']

const metaData = {
	skill: 'enterEquation',
	comparison: { ans: (input, solution) => !equationComparisons.exactEqual(input, solution.switch()) && equationComparisons.equivalent(input, solution.switch()) },
}

function generateState() {
	const variableSet = sample(availableVariableSets)
	const variables = selectRandomVariables(variableSet, usedVariables)
	return {
		equation: sample([
			asEquation(`x^${randomInteger(2, 4)}+y^${randomInteger(2, 4)}=z^${randomInteger(2, 4)}`),
			asEquation(`(${randomInteger(-12, 12, [0, 1])}x+${randomInteger(-12, 12, [0, 1])}y)/(${randomInteger(-12, 12, [0])}z)=1`),
			asEquation(`x^y-${randomInteger(1, 8)}=z`),
			asEquation(`(x+${randomInteger(-12, 12, [0])})(y+${randomInteger(-12, 12, [0])})(z+${randomInteger(-12, 12, [0])}) = 1`),
		]).regularClean().substituteVariables(variables)
	}
}

function getSolution({ equation }) {
	return { ans: equation.switch() }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

const exercise = { metaData, generateState, getSolution, checkInput }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
