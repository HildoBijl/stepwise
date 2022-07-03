const { getCombinerSkills, combinerAnd, combinerOr, combinerRepeat } = require('../../skillTracking/combiners')

const skills = {
	// Testing exercises.
	test: {
		name: 'Testopgave',
		exercises: ['testExercise'],
	},
	demo: {
		name: 'Demo-opgave',
		exercises: ['demoExercise'],
	},

	// Tutorial exercises.
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
	fillInExpression: {
		name: 'Uitdrukking invoeren',
		exercises: ['fillInExpression'],
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

	/*
	 * Basic algebra.
	 * - Manipulating fractions.
	 * - Manipulating brackets.
	 * - Manipulating expressions.
	 * - Solving linear equations.
	 * - Solving quadratic equations.
	 * - Solving systems of linear equations.
	 */

	// Basic algebra: manipulating fractions.
	addRemoveFractionFactors: {
		name: 'Breukfactoren toevoegen/wegstrepen',
		exercises: ['addRemoveFractionFactors1', 'addRemoveFractionFactors1Reverse', 'addRemoveFractionFactors2', 'addRemoveFractionFactors2Reverse', 'addRemoveFractionFactors3', 'addRemoveFractionFactors3Reverse'],
	},
	mergeSplitBasicFractions: {
		name: 'Gelijknamige breuken samenvoegen/splitsen',
		exercises: ['mergeSplitBasicFractions1', 'mergeSplitBasicFractions2', 'mergeSplitBasicFractions3'],
	},
	mergeSplitFractions: {
		name: 'Algemene breuken samenvoegen/splitsen',
		setup: combinerAnd(combinerRepeat('addRemoveFractionFactors', 2), 'mergeSplitBasicFractions'),
		exercises: ['mergeSplitFractions1', 'mergeSplitFractions1Reverse', 'mergeSplitFractions2', 'mergeSplitFractions2Reverse', 'mergeSplitFractions3', 'mergeSplitFractions3Reverse'],
	},
	multiplyDivideFractions: {
		name: 'Breuken vermenigvuldigen/delen',
		exercises: ['multiplyDivideFractions1', 'multiplyDivideFractions2', 'multiplyDivideFractions3', 'multiplyDivideFractions4'],
	},
	simplifyFraction: {
		name: 'Breuk simplificeren',
		setup: combinerAnd('mergeSplitFractions', 'multiplyDivideFractions'),
		exercises: ['simplifyFraction1', 'simplifyFraction2', 'simplifyFraction3', 'simplifyFraction4'],
	},

	// Basic algebra: manipulating brackets.
	expandBrackets: {
		name: 'Haakjes uitwerken',
		exercises: ['expandBrackets1', 'expandBrackets2'],
	},
	pullOutOfBrackets: {
		name: 'Buiten haakjes halen',
		setup: combinerAnd('mergeSplitFractions', 'expandBrackets'),
		exercises: ['pullOutOfBrackets1', 'pullOutOfBrackets2', 'pullOutOfBrackets3'],
	},

	// Basic algebra: manipulating expressions.
	moveATerm: {
		name: 'Een term verplaatsen',
		exercises: ['moveATerm1', 'moveATerm2'],
	},
	multiplyDivideAllTerms: {
		name: 'Alle termen vermenigvuldigen/delen',
		setup: combinerAnd('expandBrackets', 'multiplyDivideFractions', 'mergeSplitFractions'), // ToDo later: change into a picking function.
		exercises: ['multiplyDivideAllTerms1', 'multiplyDivideAllTerms2'],
	},

	// Basic algebra: solving linear equations.
	solveBasicLinearEquation: {
		name: 'Basis lineaire vergelijking oplossen',
		setup: combinerAnd(combinerRepeat('moveATerm', 2), 'pullOutOfBrackets', 'multiplyDivideAllTerms'),
		exercises: ['solveBasicLinearEquation1', 'solveBasicLinearEquation2', 'solveBasicLinearEquation3'],
	},
	solveGeneralLinearEquation: {
		name: 'Algemene lineaire vergelijking oplossen',
		setup: combinerAnd('simplifyFraction', 'expandBrackets', 'multiplyDivideAllTerms', 'solveBasicLinearEquation'), // ToDo later: change into a picking function.
		exercises: ['solveGeneralLinearEquation1', 'solveGeneralLinearEquation2', 'solveGeneralLinearEquation3'],
	},

	// Basic algebra: solving quadratic equations.
	// applySquareRoot: {
	// 	name: 'Wortel toepassen',
	// 	exercises: [],
	// },
	applyQuadraticFormula: {
		name: 'Wortelformule toepassen',
		exercises: ['applyQuadraticFormulaNoSolutions', 'applyQuadraticFormulaOneSolution', 'applyQuadraticFormulaTwoIntegerSolutions', 'applyQuadraticFormulaTwoRandomSolutions'],
	},
	// solveBasicQuadraticEquation: {
	// 	name: 'Basis kwadratische vergelijking oplossen',
	// 	setup: combinerAnd('moveATerm', 'multiplyDivideAllTerms', 'applyQuadraticFormula', 'applySquareRoot'),
	// 	exercises: [],
	// },
	// solveGeneralQuadraticEquation: {
	// 	name: 'Algemene kwadratische vergelijking oplossen',
	// 	setup: combinerAnd('moveATerm', 'multiplyDivideAllTerms', 'applyQuadraticFormula', 'applySquareRoot'),
	// 	exercises: [],
	// },

	// Basic algebra: solving systems of linear equations.
	solveBasicSystemOfLinearEquations: {
		name: 'Basis stelsel van lineaire vergelijkingen oplossen',
		setup: combinerRepeat('solveBasicLinearEquation', 2),
		exercises: ['solveBasicSystemOfLinearEquations1'],
	},
	solveGeneralSystemOfLinearEquations: {
		name: 'Algemeen stelsel van lineaire vergelijkingen oplossen',
		setup: combinerAnd('solveBasicLinearEquation', 'solveGeneralLinearEquation'),
		exercises: ['solveGeneralSystemOfLinearEquations1', 'solveGeneralSystemOfLinearEquations2'],
	},

	/*
	 * Basic geometry.
	 * - Angles and distances.
	 * - General triangles.
	 * - Areas and volumes.
	 */

	// Basic geometry: angles and distances.
	determine2DAngles: {
		name: '2D hoeken bepalen',
		exercises: ['determine2DAnglesTriangleX', 'determine2DAnglesTriangleZ', 'determine2DAnglesCircleSymmetry'],
	},
	applyPythagoras: {
		name: 'De stelling van Pythagoras toepassen',
	},
	applySinCosTan: {
		name: 'Sinus/cosinus/tangens toepassen',
	},
	applySimilarTriangles: {
		name: 'Gelijkvormige driehoeken toepassen',
	},
	determine2DDistances: {
		name: '2D afstanden bepalen',
		setup: combinerAnd('determine2DAngles', combinerOr('applyPythagoras', 'applySinCosTan', 'applySimilarTriangles')), // ToDo later: change into a picking function.
	},

	// Basic geometry: general triangles.
	calculateTriangle: {
		name: 'Driehoek doorrekenen',
		// ToDo later: set up an appropriate set-up by picking from solveBasicLinearEquation and solveBasicQuadraticEquation.
	},

	// Basic geometry: areas and volumes.
	calculate2DShape: {
		name: '2D vorm doorrekenen',
	},
	calculate3DShape: {
		name: '3D vorm doorrekenen',
		setup: combinerAnd('determine2DDistances', 'calculate2DShape'),
	},

	/*
	 * Basic physics.
	 * - Physics mathematics: solving float-problems.
	 * - Working with units.
	 * - Thermodynamics.
	 */

	// Physics mathematics: solving float-problems.
	solveLinearEquation: {
		name: 'Lineaire vergelijking oplossen',
		exercises: ['solveLinearEquation1', 'solveLinearEquation2', 'solveLinearEquation3', 'solveLinearEquation4'],
	},
	solveExponentEquation: {
		name: 'Exponent-vergelijking oplossen',
		exercises: ['solveExponentEquation1', 'solveExponentEquation2', 'solveExponentEquation3', 'solveExponentEquation4'],
	},
	linearInterpolation: {
		name: 'Lineair interpoleren',
		setup: combinerRepeat('solveLinearEquation', 2),
		exercises: ['linearInterpolationPopulation', 'linearInterpolationKettle', 'linearInterpolationChild'],
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
		exercises: ['useIsentropicEfficiencyCompressor1', 'useIsentropicEfficiencyCompressor2', 'useIsentropicEfficiencyTurbine1', 'useIsentropicEfficiencyTurbine2'],
	},
	analyseGasTurbine: {
		name: 'Gasturbine analyseren',
		setup: combinerAnd('calculateOpenCycle', 'useIsentropicEfficiency', 'createOpenCycleEnergyOverview', 'calculateWithEfficiency', 'massFlowTrick'),
		exercises: ['analyseGasTurbine1', 'analyseGasTurbine2', 'analyseGasTurbine3'],
	},

	lookUpSteamProperties: {
		name: 'Stoomeigenschappen opzoeken',
		exercises: ['steamPropertiesAtTemperature', 'steamPropertiesAtPressure', 'steamPropertiesSuperheated'],
	},
	useVaporFraction: {
		name: 'Dampfractie gebruiken',
		setup: combinerAnd('lookUpSteamProperties', 'linearInterpolation'),
		exercises: ['useVaporFractionWithEnthalpy', 'useVaporFractionWithEntropy'],
	},
	createRankineCycleOverview: {
		name: 'Overzicht Rankine-cyclus maken',
		setup: combinerAnd(combinerRepeat('lookUpSteamProperties', 2), 'recognizeProcessTypes', 'useVaporFraction'),
		exercises: ['createRankineCycleOverview'],
	},
	analyseRankineCycle: {
		name: 'Rankine-cyclus analyseren',
		setup: combinerAnd('createRankineCycleOverview', 'useIsentropicEfficiency', 'calculateWithEfficiency', 'massFlowTrick'), // ToDo later: add 'half the time useVaporFraction' to this.
		exercises: ['analyseRankineCycleWithEtai', 'analyseRankineCycleWithX3'],
	},

	findFridgeTemperatures: {
		name: 'Koelmachinetemperaturen bepalen',
		exercises: ['findFridgeTemperaturesInternal', 'findFridgeTemperaturesExternal'],
	},
	determineRefrigerantProcess: {
		name: 'Koelmiddelproces bepalen',
		exercises: ['determineRefrigerantProcessIsobaric', 'determineRefrigerantProcessIsentropic'],
	},
	createCoolingCycleOverview: {
		name: 'Overzicht koelcyclus maken',
		setup: combinerAnd('findFridgeTemperatures', combinerRepeat('determineRefrigerantProcess', 3)),
		exercises: ['createCoolingCycleOverviewFromPressures', 'createCoolingCycleOverviewFromTemperatures'],
	},
	analyseCoolingCycle: {
		name: 'Koelcyclus analyseren',
		setup: combinerAnd('createCoolingCycleOverview', 'useIsentropicEfficiency', 'calculateWithCOP', 'massFlowTrick'),
		exercises: ['analyseCoolingCycleWithEtai', 'analyseCoolingCycleWithT2'],
	},

	readMollierDiagram: {
		name: 'Mollier diagram aflezen',
		exercises: ['readMollierDiagramRH', 'readMollierDiagramAH'],
	},
	analyseAirco: {
		name: 'Airco analyseren',
		setup: combinerRepeat('readMollierDiagram', 3),
		exercises: ['analyseAircoBasic', 'analyseAircoWaterDischarge', 'analyseAircoPower'],
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
	if (!Array.isArray(skill.exercises)) // Ensure that the exercises parameter is an array.
		skill.exercises = [skill.exercises]
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
