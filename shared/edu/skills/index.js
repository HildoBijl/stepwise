const { and, or, repeat } = require('../../skillTracking')

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
		setup: and(repeat('multiplication', 2), 'summation'),
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
		setup: and(repeat('addRemoveFractionFactors', 2), 'mergeSplitBasicFractions'),
		exercises: ['mergeSplitFractions1', 'mergeSplitFractions1Reverse', 'mergeSplitFractions2', 'mergeSplitFractions2Reverse', 'mergeSplitFractions3', 'mergeSplitFractions3Reverse'],
	},
	multiplyDivideFractions: {
		name: 'Breuken vermenigvuldigen/delen',
		exercises: ['multiplyDivideFractions1', 'multiplyDivideFractions2', 'multiplyDivideFractions3', 'multiplyDivideFractions4'],
	},
	simplifyFraction: {
		name: 'Breuk simplificeren',
		setup: and('mergeSplitFractions', 'multiplyDivideFractions'),
		exercises: ['simplifyFraction1', 'simplifyFraction2', 'simplifyFraction3', 'simplifyFraction4'],
	},

	// Basic algebra: manipulating brackets.
	expandBrackets: {
		name: 'Haakjes uitwerken',
		exercises: ['expandBrackets1', 'expandBrackets2'],
	},
	pullOutOfBrackets: {
		name: 'Buiten haakjes halen',
		setup: and('mergeSplitFractions', 'expandBrackets'),
		exercises: ['pullOutOfBrackets1', 'pullOutOfBrackets2', 'pullOutOfBrackets3'],
	},

	// Basic algebra: manipulating expressions.
	moveATerm: {
		name: 'Een term verplaatsen',
		exercises: ['moveATerm1', 'moveATerm2'],
	},
	multiplyDivideAllTerms: {
		name: 'Alle termen vermenigvuldigen/delen',
		setup: and('expandBrackets', 'multiplyDivideFractions', 'mergeSplitFractions'), // ToDo later: change into a picking function.
		exercises: ['multiplyDivideAllTerms1', 'multiplyDivideAllTerms2'],
	},

	// Basic algebra: solving linear equations.
	solveBasicLinearEquation: {
		name: 'Basis lineaire vergelijking oplossen',
		setup: and(repeat('moveATerm', 2), 'pullOutOfBrackets', 'multiplyDivideAllTerms'),
		exercises: ['solveBasicLinearEquation1', 'solveBasicLinearEquation2', 'solveBasicLinearEquation3'],
	},
	solveGeneralLinearEquation: {
		name: 'Algemene lineaire vergelijking oplossen',
		setup: and('simplifyFraction', 'expandBrackets', 'multiplyDivideAllTerms', 'solveBasicLinearEquation'), // ToDo later: change into a picking function.
		exercises: ['solveGeneralLinearEquation1', 'solveGeneralLinearEquation2', 'solveGeneralLinearEquation3'],
	},

	// Basic algebra: solving quadratic equations.
	applySquareRoot: {
		name: 'Wortel toepassen',
		exercises: [], // ToDo
	},
	applyQuadraticFormula: {
		name: 'Wortelformule toepassen',
		exercises: ['applyQuadraticFormulaNoSolutions', 'applyQuadraticFormulaOneSolution', 'applyQuadraticFormulaTwoIntegerSolutions', 'applyQuadraticFormulaTwoRandomSolutions'],
	},
	solveBasicQuadraticEquation: {
		name: 'Basis kwadratische vergelijking oplossen',
		setup: and('moveATerm', 'multiplyDivideAllTerms', 'applySquareRoot', 'applyQuadraticFormula'),
		exercises: [], // ToDo
	},
	solveGeneralQuadraticEquation: {
		name: 'Algemene kwadratische vergelijking oplossen',
		setup: and('moveATerm', 'multiplyDivideAllTerms', 'applySquareRoot', 'applyQuadraticFormula'),
		exercises: [], // ToDo
	},

	// Basic algebra: solving systems of linear equations.
	solveBasicSystemOfLinearEquations: {
		name: 'Basis stelsel van lineaire vergelijkingen oplossen',
		setup: repeat('solveBasicLinearEquation', 2),
		exercises: ['solveBasicSystemOfLinearEquations1'],
	},
	solveGeneralSystemOfLinearEquations: {
		name: 'Algemeen stelsel van lineaire vergelijkingen oplossen',
		setup: and('solveBasicLinearEquation', 'solveGeneralLinearEquation'),
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
	applyPythagoreanTheorem: {
		name: 'De stelling van Pythagoras toepassen',
		exercises: ['applyPythagoreanTheoremGeneral'],
	},
	applySineCosineTangent: {
		name: 'Sinus/cosinus/tangens toepassen',
		exercises: ['applySineCosineTangentTwoSides', 'applySineCosineTangentSideAndAngle'],
	},
	applySimilarTriangles: {
		name: 'Gelijkvormige driehoeken toepassen',
		exercises: ['applySimilarTrianglesGeneral'],
	},
	determine2DDistances: {
		name: '2D afstanden bepalen',
		setup: and('determine2DAngles', repeat(or('applyPythagoreanTheorem', 'applySineCosineTangent', 'applySimilarTriangles'), 2)), // ToDo later: change into a picking function.
		exercises: [], // ToDo
	},

	// Basic geometry: general triangles.
	calculateTriangle: {
		name: 'Driehoek doorrekenen',
		setup: and(or('determine2DAngles', 'applySineCosineTangent'), or('solveBasicLinearEquation', 'solveBasicQuadraticEquation')), // ToDo later: change into a picking function.
		exercises: ['calculateTriangleASAS', 'calculateTriangleSSAA', 'calculateTriangleASSA', 'calculateTriangleSASS', 'calculateTriangleSSAS', 'calculateTriangleSASA', 'calculateTriangleSSSA'],
	},

	// Basic geometry: areas and volumes.
	calculate2DShape: {
		name: '2D vorm doorrekenen',
		exercises: [], // ToDo
	},
	calculate3DShape: {
		name: '3D vorm doorrekenen',
		setup: and('determine2DDistances', 'calculate2DShape'),
		exercises: [], // ToDo
	},

	/*
	 * Derivatives.
	 * - The basic rules.
	 * - The product/quotient/chain rule.
	 * - General derivatives.
	 * - Applying derivatives.
	 */

	// Derivatives: the basic rules.
	lookUpElementaryDerivative: {
		name: 'Elementaire afgeleide opzoeken',
		exercises: ['lookUpElementaryDerivative'],
	},
	findBasicDerivative: {
		name: 'Basis afgeleide bepalen',
		setup: repeat('lookUpElementaryDerivative', 2),
		exercises: ['findBasicDerivativeTwoTerms', 'findBasicDerivativeThreeTerms'],
	},

	// Derivatives: the product/quotient/chain rule.
	applyProductRule: {
		name: 'Productregel toepassen',
		setup: and('lookUpElementaryDerivative', 'findBasicDerivative'),
		exercises: ['applyProductRuleTwoElementary', 'applyProductRuleElementaryAndBasic'],
	},
	applyQuotientRule: {
		name: 'Quotiëntregel toepassen',
		setup: and('lookUpElementaryDerivative', 'findBasicDerivative'),
		exercises: ['applyQuotientRuleTwoElementary', 'applyQuotientRuleElementaryAndBasic'],
	},
	applyChainRule: {
		name: 'Kettingregel toepassen',
		setup: and('lookUpElementaryDerivative', 'findBasicDerivative'),
		exercises: ['applyChainRuleTwoElementary', 'applyChainRuleElementaryAndBasic'],
	},

	// Derivatives: general derivatives.
	findGeneralDerivative: {
		name: 'Algemene afgeleide bepalen',
		setup: and('applyProductRule', 'applyQuotientRule', 'applyChainRule'), // ToDo later: change into a picking function.
		exercises: ['findGeneralDerivativeProductRule', 'findGeneralDerivativeQuotientRule', 'findGeneralDerivativeChainRule'],
	},
	findAdvancedDerivative: {
		name: 'Geavanceerde afgeleide bepalen',
		setup: and('findBasicDerivative', 'findGeneralDerivative', or('applyProductRule', 'applyQuotientRule', 'applyChainRule')), // ToDo later: include expandBrackets, expandPowers and rewriteLogarithms, as well as change into a picking function.
		exercises: ['findAdvancedDerivativeChainOfProduct', 'findAdvancedDerivativeChainOfFraction', 'findAdvancedDerivativeProductOfChain', 'findAdvancedDerivativeFractionOfProduct', 'findAdvancedDerivativeFractionOfChain'],
	},

	// Derivatives: applying derivatives.
	// ToDo later: use this to optimize a function.

	/*
	 * Engineering mechanics.
	 * - Skills for 2D point masses.
	 * - Calculating support reactions for point masses.
	 * - Skills for 2D situations with rotation.
	 * - Calculating support reactions for beams.
	 */

	// Skills for 2D point masses.
	// ToDo

	// Calculating support reactions for point masses.
	// ToDo

	// Skills for 2D situations with rotation.
	calculateForceOrMoment: {
		name: 'Kracht of moment berekenen',
		exercises: ['calculateForceOrMomentUseVerticalForces', 'calculateForceOrMomentUseHorizontalForces', 'calculateForceOrMomentUseDiagonalForces', 'calculateForceOrMomentUseMomentsWithOnlyForces', 'calculateForceOrMomentUseMomentsWithMomentAsked', 'calculateForceOrMomentUseMomentsWithMomentGiven'],
	},

	// Calculating support reactions for beams.
	schematizeSupport: {
		name: 'Bevestiging schematiseren',
		exercises: ['schematizeFixedSupport', 'schematizeRollerSupport', 'schematizeHingeSupport', 'schematizeRollerHingeSupport'],
	},
	drawFreeBodyDiagram: {
		name: 'Vrijlichaamsschema tekenen',
		setup: repeat('schematizeSupport', 2),
		exercises: ['drawFreeBodyDiagram1'],
	},
	calculateBasicSupportReactions: {
		name: 'Basis reactiekrachten berekenen',
		setup: and('drawFreeBodyDiagram', repeat('calculateForceOrMoment', 2)),
		exercises: ['calculateBasicSupportReactionsDiagonalSupport', 'calculateBasicSupportReactionsDiagonalBeam', 'calculateBasicSupportReactionsFixedWithDiagonalLoad', 'calculateBasicSupportReactionsFixedWithElevatedLoad'],
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
		setup: repeat('solveLinearEquation', 2),
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
		setup: and('calculateWithPressure', 'calculateWithVolume', 'calculateWithMass', 'calculateWithTemperature', 'specificGasConstant', 'solveLinearEquation'), // ToDo later: use a "combinerPick(..., 3)" to pick three of the given four unit calculation skills.
		exercises: ['gasLawLightBulb', 'gasLawHeliumBalloon', 'gasLawDivingCylinder', 'gasLawBicyclePump', 'gasLawWeatherBalloon'],
	},
	recognizeProcessTypes: {
		name: 'Soorten processen herkennen',
		exercises: ['processNameToProperty', 'propertyToProcessName', 'findProcessCoefficient'], // ToDo later: add questions with p-V-plots too.
	},
	poissonsLaw: {
		name: `Poisson's wet`,
		setup: and('calculateWithTemperature', 'specificHeatRatio', 'solveExponentEquation'), // ToDo later: use "combinerPart('specificHeatRatio', 2/3)" to indicate it's not always needed.
		exercises: ['poissonsLawBicyclePump', 'poissonsLawCompressor', 'poissonsLawTurbine'],
	},
	calculateProcessStep: {
		name: 'Processtap doorrekenen',
		setup: and('gasLaw', 'recognizeProcessTypes', 'poissonsLaw'), // ToDo later: use "combinerPart('poissonsLaw', 1/2)" and possibly "combinerPart('gasLaw', 3/2)" to indicate it's not always needed.
		exercises: ['calculateProcessStepCompressor', 'calculateProcessStepDivingCylinder', 'calculateProcessStepBalloon', 'calculateProcessStepGasTurbine'],
	},

	calculateClosedCycle: {
		name: 'Gesloten kringproces doorrekenen',
		setup: repeat('calculateProcessStep', 3),
		exercises: ['calculateClosedCycleVTp', 'calculateClosedCycleTsV', 'calculateClosedCycleSTST', 'calculateClosedCycleSVSV'],
	},
	calculateHeatAndWork: {
		name: 'Warmte en arbeid berekenen',
		setup: and('recognizeProcessTypes', or('calculateWithPressure', 'calculateWithVolume', 'calculateWithTemperature', 'calculateWithMass'), or('specificGasConstant', 'specificHeatRatio', 'specificHeats')),
		exercises: ['calculateHeatAndWorkIsobaric', 'calculateHeatAndWorkIsochoric', 'calculateHeatAndWorkIsothermal', 'calculateHeatAndWorkIsentropic', 'calculateHeatAndWorkPolytropic'],
	},
	calculateWithInternalEnergy: {
		name: 'Rekenen met inwendige energie',
		setup: and(or('gasLaw', 'poissonsLaw'), or('specificHeats', 'solveLinearEquation'), 'calculateHeatAndWork'), // ToDo later: adjust this to something more sensible.
		exercises: ['calculateWithInternalEnergyEngine', 'calculateWithInternalEnergyBalloon', 'calculateWithInternalEnergyTire'],
	},
	createClosedCycleEnergyOverview: {
		name: 'Gesloten kringproces energie-overzicht maken',
		setup: and(repeat('calculateHeatAndWork', 2), 'calculateWithInternalEnergy'),
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
		setup: and('calculateClosedCycle', 'createClosedCycleEnergyOverview', or('calculateWithEfficiency', 'calculateWithCOP')),
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
		setup: and('gasLaw', 'calculateWithSpecificQuantities', 'recognizeProcessTypes', 'poissonsLaw'), // ToDo later: use "combinerPart('poissonsLaw', 1/2)" and possibly "combinerPart('gasLaw', 3/2)" to indicate it's not always needed.
		exercises: ['calculateOpenProcessStepWing', 'calculateOpenProcessStepCompressor', 'calculateOpenProcessStepGasTurbine'],
	},
	calculateOpenCycle: {
		name: 'Open kringproces doorrekenen',
		setup: repeat('calculateOpenProcessStep', 3),
		exercises: ['calculateOpenCyclespsp', 'calculateOpenCycleNspsp', 'calculateOpenCycleTsp'],
	},
	calculateSpecificHeatAndMechanicalWork: {
		name: 'Specifieke warmte en technische arbeid berekenen',
		setup: and('recognizeProcessTypes', or('calculateWithPressure', 'calculateWithVolume', 'calculateWithTemperature', 'calculateWithMass'), or('specificGasConstant', 'specificHeatRatio', 'specificHeats'), 'calculateWithSpecificQuantities'), // ToDo: check this.
		exercises: ['calculateSpecificHeatAndMechanicalWorkIsobaric', 'calculateSpecificHeatAndMechanicalWorkIsothermal', 'calculateSpecificHeatAndMechanicalWorkIsentropic'],
	},
	calculateWithEnthalpy: {
		name: 'Rekenen met enthalpie',
		setup: and(or('calculateWithSpecificQuantities', 'calculateSpecificHeatAndMechanicalWork'), 'solveLinearEquation'), // ToDo later: adjust this to something more sensible, like a combinerPick.
		exercises: ['calculateWithEnthalpyCompressor', 'calculateWithEnthalpyBoiler', 'calculateWithEnthalpyTurbine'],
	},
	createOpenCycleEnergyOverview: {
		name: 'Open kringproces energie-overzicht maken',
		setup: and(repeat('calculateSpecificHeatAndMechanicalWork', 2), 'calculateWithEnthalpy'),
		exercises: ['createOpenCycleEnergyOverviewspsp', 'createOpenCycleEnergyOverviewNspsp', 'createOpenCycleEnergyOverviewTsp'],
	},
	analyseOpenCycle: {
		name: 'Open kringproces analyseren',
		setup: and('calculateOpenCycle', 'createOpenCycleEnergyOverview', or('calculateWithEfficiency', 'calculateWithCOP'), 'massFlowTrick'),
		exercises: ['analyseOpenCyclespsp', 'analyseOpenCycleNspsp', 'analyseOpenCycleTsp'],
	},

	calculateEntropyChange: {
		name: 'Entropieverandering berekenen',
		setup: and('calculateWithTemperature', 'specificGasConstant', 'specificHeats', 'solveLinearEquation'),
		exercises: ['calculateEntropyChangeIsotherm', 'calculateEntropyChangeWithTemperature', 'calculateEntropyChangeWithProperties'],
	},
	calculateMissedWork: {
		name: 'Gemiste arbeid berekenen',
		setup: and('calculateEntropyChange', 'solveLinearEquation'),
		exercises: ['calculateMissedWorkIsotherm', 'calculateMissedWorkPiston', 'calculateMissedWorkCompressor'],
	},

	useIsentropicEfficiency: {
		name: 'Isentropisch rendement gebruiken',
		setup: and('calculateSpecificHeatAndMechanicalWork', 'calculateWithEnthalpy', 'solveLinearEquation'), // ToDo later: adjust this to either twice wt or twice dh.
		exercises: ['useIsentropicEfficiencyCompressor1', 'useIsentropicEfficiencyCompressor2', 'useIsentropicEfficiencyTurbine1', 'useIsentropicEfficiencyTurbine2'],
	},
	analyseGasTurbine: {
		name: 'Gasturbine analyseren',
		setup: and('calculateOpenCycle', 'useIsentropicEfficiency', 'createOpenCycleEnergyOverview', 'calculateWithEfficiency', 'massFlowTrick'),
		exercises: ['analyseGasTurbine1', 'analyseGasTurbine2', 'analyseGasTurbine3'],
	},

	lookUpSteamProperties: {
		name: 'Stoomeigenschappen opzoeken',
		exercises: ['steamPropertiesAtTemperature', 'steamPropertiesAtPressure', 'steamPropertiesSuperheated'],
	},
	useVaporFraction: {
		name: 'Dampfractie gebruiken',
		setup: and('lookUpSteamProperties', 'linearInterpolation'),
		exercises: ['useVaporFractionWithEnthalpy', 'useVaporFractionWithEntropy'],
	},
	createRankineCycleOverview: {
		name: 'Overzicht Rankine-cyclus maken',
		setup: and(repeat('lookUpSteamProperties', 2), 'recognizeProcessTypes', 'useVaporFraction'),
		exercises: ['createRankineCycleOverview'],
	},
	analyseRankineCycle: {
		name: 'Rankine-cyclus analyseren',
		setup: and('createRankineCycleOverview', 'useIsentropicEfficiency', 'calculateWithEfficiency', 'massFlowTrick'), // ToDo later: add 'half the time useVaporFraction' to this.
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
		setup: and('findFridgeTemperatures', repeat('determineRefrigerantProcess', 3)),
		exercises: ['createCoolingCycleOverviewFromPressures', 'createCoolingCycleOverviewFromTemperatures'],
	},
	analyseCoolingCycle: {
		name: 'Koelcyclus analyseren',
		setup: and('createCoolingCycleOverview', 'useIsentropicEfficiency', 'calculateWithCOP', 'massFlowTrick'),
		exercises: ['analyseCoolingCycleWithEtai', 'analyseCoolingCycleWithT2'],
	},

	readMollierDiagram: {
		name: 'Mollier diagram aflezen',
		exercises: ['readMollierDiagramRH', 'readMollierDiagramAH'],
	},
	analyseAirco: {
		name: 'Airco analyseren',
		setup: repeat('readMollierDiagram', 3),
		exercises: ['analyseAircoBasic', 'analyseAircoWaterDischarge', 'analyseAircoPower'],
	},
}

// Process the skill object.
Object.keys(skills).forEach(key => {
	const skill = skills[key]
	skill.id = key // Inform the skills of their own id.
	skill.prerequisites = skill.setup ? skill.setup.getSkillList() : [] // If no set-up is given, there are no prerequisites.
	skill.linkedSkills = skill.links ? skill.links : [] // If no links are given, there are no linked skills.
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
