const { getCombinerSkills, combinerAnd, combinerOr, combinerRepeat } = require('../../skillTracking/combiners')

const skills = {
	// Testing exercises.
	fillInInteger: {
		name: 'Geheel getal invullen',
		exercises: ['fillInInteger'],
	},
	fillInFloat: {
		name: 'Kommagetal invullen',
		exercises: ['fillInFloat'],
	},
	fillInUnit: {
		name: 'Eenheid invullen',
		exercises: ['fillInUnit'],
	},
	lookUpConstant: {
		name: 'Constanten opzoeken',
		exercises: ['lookUpConstant'],
	},
	summation: {
		name: 'Optellen',
		exercises: ['summation1'],
	},
	multiplication: {
		name: 'Vermenigvuldigen',
		exercises: ['multiplication1'],
	},
	summationAndMultiplication: {
		name: 'Optellen en vermenigvuldigen',
		setup: combinerAnd(combinerRepeat('multiplication', 2), 'summation'),
		exercises: ['summationAndMultiplication1', 'summationAndMultiplication2'],
	},

	// Mathematics
	solveLinearEquation: {
		name: 'Lineaire vergelijking oplossen',
		exercises: ['solveLinearEquation1', 'solveLinearEquation2', 'solveLinearEquation3', 'solveLinearEquation4'],
	},
	solveExponentEquation: {
		name: 'Exponent-vergelijking oplossen',
		exercises: ['solveExponentEquation1', 'solveExponentEquation2', 'solveExponentEquation3', 'solveExponentEquation4'],
	},

	// Basic physics
	calculateWithPressure: {
		name: 'Rekenen met druk',
		exercises: ['calculateWithPressure'],
	},
	calculateWithVolume: {
		name: 'Rekenen met volume',
		exercises: ['calculateWithVolume'],
	},
	calculateWithMass: {
		name: 'Rekenen met massa',
		exercises: ['calculateWithMass'],
	},
	calculateWithTemperature: {
		name: 'Rekenen met temperatuur',
		exercises: ['calculateWithTemperature'],
	},

	// Thermodynamics
	specificGasConstant: {
		name: 'Specifieke gasconstante opzoeken',
		exercises: ['specificGasConstant'],
	},
	specificHeatRatio: {
		name: 'De k-waarde opzoeken',
		exercises: ['specificHeatRatio'],
	},
	specificHeats: {
		name: 'Soortelijke warmten opzoeken',
		exercises: ['specificHeats'],
	},
	gasLaw: {
		name: 'De gaswet',
		setup: combinerAnd('calculateWithPressure', 'calculateWithVolume', 'calculateWithMass', 'calculateWithTemperature', 'specificGasConstant', 'solveLinearEquation'), // ToDo later: use a "combinerPick(..., 3)" to pick three of the given four unit calculation skills.
		exercises: ['gasLawLightBulb', 'gasLawHeliumBalloon', 'gasLawDivingCylinder', 'gasLawBicyclePump', 'gasLawWeatherBalloon'],
	},
	recognizeProcessTypes: {
		name: 'Soorten processen herkennen',
		exercises: ['processNameToProperty', 'propertyToProcessName', 'findProcessCoefficient'], // ToDo later: add questions with p-V-plots too.
	},
	poissonsLaw: {
		name: `Poisson's wet`,
		setup: combinerAnd('calculateWithTemperature', 'specificHeatRatio', 'solveExponentEquation'), // ToDo later: use "combinerPart('specificHeatRatio', 2/3)" to indicate it's not always needed.
		exercises: ['poissonsLawBicyclePump', 'poissonsLawCompressor', 'poissonsLawTurbine'],
	},
	calculateProcessStep: {
		name: 'Processtap doorrekenen',
		setup: combinerAnd('gasLaw', 'recognizeProcessTypes', 'poissonsLaw'), // ToDo later: use "combinerPart('poissonsLaw', 1/2)" and possibly "combinerPart('gasLaw', 3/2)" to indicate it's not always needed.
		exercises: ['calculateProcessStepCompressor', 'calculateProcessStepDivingCylinder', 'calculateProcessStepBalloon', 'calculateProcessStepGasTurbine'],
	},
	calculateHeatAndWork: {
		name: 'Warmte en arbeid berekenen',
		setup: combinerAnd('recognizeProcessTypes', combinerOr('calculateWithPressure','calculateWithVolume','calculateWithTemperature','calculateWithMass'), combinerOr('specificGasConstant','specificHeatRatio','specificHeats')),
		exercises: ['calculateHeatAndWorkIsobaric', 'calculateHeatAndWorkIsochoric', 'calculateHeatAndWorkIsothermal', 'calculateHeatAndWorkIsentropic', 'calculateHeatAndWorkPolytropic'],
	},
}

// Process the skill object.
Object.keys(skills).forEach(key => {
	const skill = skills[key]
	skill.id = key // Inform the skills of their own id.
	skill.prerequisites = skill.setup ? getCombinerSkills(skill.setup) : [] // If no set-up is given, there are none.
	skill.continuations = [] // Prepare an empty array.
})

// Set up continuations.
Object.values(skills).forEach(skill => {
	skill.prerequisites.forEach(prerequisiteId => {
		const prerequisite = skills[prerequisiteId]
		if (!prerequisite)
			throw new Error(`Invalid prerequisite skill "${prerequisiteId}" given for skill "${skill.id}".`)
		prerequisite.continuations.push(skill.id)
	})
})

module.exports = skills
