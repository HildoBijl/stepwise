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

	calculateClosedCycle: {
		name: 'Gesloten kringproces doorrekenen',
		setup: combinerRepeat('calculateProcessStep', 3),
		exercises: ['calculateClosedCycleVTp', 'calculateClosedCycleTsV', 'calculateClosedCycleSTST', 'calculateClosedCycleSVSV'],
	},
	calculateHeatAndWork: {
		name: 'Warmte en arbeid berekenen',
		setup: combinerAnd('recognizeProcessTypes', combinerOr('calculateWithPressure', 'calculateWithVolume', 'calculateWithTemperature', 'calculateWithMass'), combinerOr('specificGasConstant', 'specificHeatRatio', 'specificHeats')),
		exercises: ['calculateHeatAndWorkIsobaric', 'calculateHeatAndWorkIsochoric', 'calculateHeatAndWorkIsothermal', 'calculateHeatAndWorkIsentropic', 'calculateHeatAndWorkPolytropic'],
	},
	calculateWithInternalEnergy: {
		name: 'Rekenen met inwendige energie',
		setup: combinerAnd(combinerOr('gasLaw', 'poissonsLaw'), combinerOr('specificHeats', 'solveLinearEquation'), 'calculateHeatAndWork'), // ToDo later: adjust this to something more sensible.
		exercises: ['calculateWithInternalEnergyEngine', 'calculateWithInternalEnergyBalloon', 'calculateWithInternalEnergyTire'],
	},
	createClosedCycleEnergyOverview: {
		name: 'Gesloten kringproces energie-overzicht maken',
		setup: combinerAnd(combinerRepeat('calculateHeatAndWork', 2), 'calculateWithInternalEnergy'),
		// setup: combinerAnd(combinerRepeat('calculateHeatAndWork', 2), combinerOr('calculateHeatAndWork', 'calculateWithInternalEnergy')), // ToDo later: use this instead.
		exercises: ['createClosedCycleEnergyOverviewVTp', 'createClosedCycleEnergyOverviewTsV', 'createClosedCycleEnergyOverviewSTST', 'createClosedCycleEnergyOverviewSVSV'],
	},
	calculateWithEfficiency: {
		name: 'Rekenen met rendement',
		exercises: ['calculateWithEfficiencyGenerator', 'calculateWithEfficiencyBattery'],
	},
	calculateWithCOP: {
		name: 'Rekenen met koudefactor/warmtefactor',
		exercises: ['calculateWithCOPRefrigerator', 'calculateWithCOPHeatPump'],
	},
	analyseClosedCycle: {
		name: 'Gesloten kringproces analyseren',
		setup: combinerAnd('calculateClosedCycle', 'createClosedCycleEnergyOverview', combinerOr('calculateWithEfficiency', 'calculateWithCOP')),
		exercises: ['analyseClosedCycleVTp', 'analyseClosedCycleTsV', 'analyseClosedCycleSTST', 'analyseClosedCycleSVSV'],
	},

	calculateWithSpecificQuantities: {
		name: 'Rekenen met specifieke grootheden',
		exercises: ['calculateWithSpecificQuantitiesDensity', 'calculateWithSpecificQuantitiesBoiler', 'calculateWithSpecificQuantitiesTurbine']
	},
	massFlowTrick: {
		name: 'De massastroom-truc',
		exercises: ['massFlowTrickCompressor', 'massFlowTrickWater', 'massFlowTrickEngine'],
	},
	calculateOpenProcessStep: {
		name: 'Open processtap doorrekenen',
		setup: combinerAnd('gasLaw', 'calculateWithSpecificQuantities', 'recognizeProcessTypes', 'poissonsLaw'), // ToDo later: use "combinerPart('poissonsLaw', 1/2)" and possibly "combinerPart('gasLaw', 3/2)" to indicate it's not always needed.
		exercises: ['calculateOpenProcessStepWing', 'calculateOpenProcessStepCompressor', 'calculateOpenProcessStepGasTurbine'],
	},
	calculateOpenCycle: {
		name: 'Open kringproces doorrekenen',
		setup: combinerRepeat('calculateOpenProcessStep', 3),
		exercises: ['calculateOpenCyclespsp', 'calculateOpenCycleNspsp', 'calculateOpenCycleTsp'],
	},
	calculateSpecificHeatAndMechanicalWork: {
		name: 'Specifieke warmte en technische arbeid berekenen',
		setup: combinerAnd('recognizeProcessTypes', combinerOr('calculateWithPressure', 'calculateWithVolume', 'calculateWithTemperature', 'calculateWithMass'), combinerOr('specificGasConstant', 'specificHeatRatio', 'specificHeats'), 'calculateWithSpecificQuantities'), // ToDo: check this.
		exercises: ['calculateSpecificHeatAndMechanicalWorkIsobaric', 'calculateSpecificHeatAndMechanicalWorkIsothermal', 'calculateSpecificHeatAndMechanicalWorkIsentropic'],
	},
	calculateWithEnthalpy: {
		name: 'Rekenen met enthalpie',
		setup: combinerAnd(combinerOr('calculateWithSpecificQuantities', 'calculateSpecificHeatAndMechanicalWork'), 'solveLinearEquation'), // ToDo later: adjust this to something more sensible, like a combinerPick.
		exercises: ['calculateWithEnthalpyCompressor', 'calculateWithEnthalpyBoiler', 'calculateWithEnthalpyTurbine'],
	},
	createOpenCycleEnergyOverview: {
		name: 'Open kringproces energie-overzicht maken',
		setup: combinerAnd(combinerRepeat('calculateSpecificHeatAndMechanicalWork', 2), 'calculateWithEnthalpy'),
		exercises: ['createOpenCycleEnergyOverviewspsp', 'createOpenCycleEnergyOverviewNspsp', 'createOpenCycleEnergyOverviewTsp'],
	},
	analyseOpenCycle: {
		name: 'Open kringproces analyseren',
		setup: combinerAnd('calculateOpenCycle', 'createOpenCycleEnergyOverview', combinerOr('calculateWithEfficiency', 'calculateWithCOP'), 'massFlowTrick'),
		exercises: ['analyseOpenCyclespsp', 'analyseOpenCycleNspsp', 'analyseOpenCycleTsp'],
	},

	calculateEntropyChange: {
		name: 'Entropieverandering berekenen',
		setup: combinerAnd('calculateWithTemperature', 'specificGasConstant', 'specificHeats', 'solveLinearEquation'),
		exercises: ['calculateEntropyChangeIsotherm', 'calculateEntropyChangeWithTemperature', 'calculateEntropyChangeWithProperties'],
	},
	calculateMissedWork: {
		name: 'Gemiste arbeid berekenen',
		setup: combinerAnd('calculateEntropyChange', 'solveLinearEquation'),
		exercises: ['calculateMissedWorkIsotherm', 'calculateMissedWorkPiston', 'calculateMissedWorkCompressor'],
	},

	useIsentropicEfficiency: {
		name: 'Isentropisch rendement gebruiken',
		setup: combinerAnd('calculateSpecificHeatAndMechanicalWork', 'calculateWithEnthalpy', 'solveLinearEquation'), // ToDo later: adjust this to either twice wt or twice dh.
		// ToDo: add exercises.
	},
	analyseGasTurbine: {
		name: 'Analyseer gasturbine',
		setup: combinerAnd('calculateOpenCycle', 'useIsentropicEfficiency', 'createOpenCycleEnergyOverview', 'calculateWithEfficiency', 'massFlowTrick'),
		exercises: ['analyseGasTurbine1'],
	},
}

// Process the skill object.
Object.keys(skills).forEach(key => {
	const skill = skills[key]
	skill.id = key // Inform the skills of their own id.
	skill.prerequisites = skill.setup ? getCombinerSkills(skill.setup) : [] // If no set-up is given, there are none.
	skill.continuations = [] // Prepare an empty array.
	if (!skill.exercises) // Ensure all skills have an exercises array (albeit an empty one).
		skill.exercises = []
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
