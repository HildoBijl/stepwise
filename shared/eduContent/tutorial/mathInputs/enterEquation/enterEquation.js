const { selectRandomly, getRandomInteger } = require('../../../../util')
const { asEquation, equationComparisons } = require('../../../../CAS')
const { getSimpleExerciseProcessor, selectRandomVariables, performComparison } = require('../../../../eduTools')

const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']

const metaData = {
	skill: 'enterEquation',
	comparison: { ans: (input, solution) => !equationComparisons.exactEqual(input, solution.switch()) && equationComparisons.equivalent(input, solution.switch()) },
}

function generateState() {
	const variableSet = selectRandomly(availableVariableSets)
	const variables = selectRandomVariables(variableSet, usedVariables)
	return {
		equation: selectRandomly([
			asEquation(`x^${getRandomInteger(2, 4)}+y^${getRandomInteger(2, 4)}=z^${getRandomInteger(2, 4)}`),
			asEquation(`(${getRandomInteger(-12, 12, [0, 1])}x+${getRandomInteger(-12, 12, [0, 1])}y)/(${getRandomInteger(-12, 12, [0])}z)=1`),
			asEquation(`x^y-${getRandomInteger(1, 8)}=z`),
			asEquation(`(x+${getRandomInteger(-12, 12, [0])})(y+${getRandomInteger(-12, 12, [0])})(z+${getRandomInteger(-12, 12, [0])}) = 1`),
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
