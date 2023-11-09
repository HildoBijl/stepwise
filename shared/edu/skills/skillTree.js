const { isBasicObject, applyMapping, union } = require('../../util')
const { and, or, repeat, pick, part, defaultLinkOrder } = require('../../skillTracking')

let skillTree = {
	// Testing exercises.
	test: {
		name: 'Test exercise',
		exercises: ['testExercise'],
	},
	demo: {
		name: 'Demo exercise',
		exercises: ['demoExercise'],
	},

	// Tutorial exercises.
	fillInInteger: {
		name: 'Fill in an integer',
		exercises: ['fillInInteger'],
	},
	fillInFloat: {
		name: 'Fill in a decimal number',
		exercises: ['fillInFloat'],
	},
	fillInUnit: {
		name: 'Fill in a unit',
		exercises: ['fillInUnit'],
	},
	lookUpConstant: {
		name: 'Look up a constant',
		exercises: ['lookUpConstant'],
	},
	summation: {
		name: 'Add numbers',
		exercises: ['summation1'],
	},
	multiplication: {
		name: 'Multiply numbers',
		exercises: ['multiplication1'],
	},
	summationAndMultiplication: {
		name: 'Add and multiply numbers',
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
		name: 'Add/remove fraction factors',
		exercises: ['addRemoveFractionFactors1', 'addRemoveFractionFactors1Reverse', 'addRemoveFractionFactors2', 'addRemoveFractionFactors2Reverse', 'addRemoveFractionFactors3', 'addRemoveFractionFactors3Reverse'],
	},
	mergeSplitBasicFractions: {
		name: 'Merge/split fractions with equal denominator',
		exercises: ['mergeSplitBasicFractions1', 'mergeSplitBasicFractions2', 'mergeSplitBasicFractions3'],
	},
	mergeSplitFractions: {
		name: 'Merge/split general fractions',
		setup: and(repeat('addRemoveFractionFactors', 2), 'mergeSplitBasicFractions'),
		exercises: ['mergeSplitFractions1', 'mergeSplitFractions1Reverse', 'mergeSplitFractions2', 'mergeSplitFractions2Reverse', 'mergeSplitFractions3', 'mergeSplitFractions3Reverse'],
	},
	multiplyDivideFractions: {
		name: 'Multiply/divide fractions',
		exercises: ['multiplyDivideFractions1', 'multiplyDivideFractions2', 'multiplyDivideFractions3', 'multiplyDivideFractions4'],
	},
	simplifyFraction: {
		name: 'Simplify a fraction',
		setup: and('mergeSplitFractions', 'multiplyDivideFractions'),
		exercises: ['simplifyFraction1', 'simplifyFraction2', 'simplifyFraction3', 'simplifyFraction4'],
	},

	// Basic algebra: manipulating brackets.
	expandBrackets: {
		name: 'Expand brackets',
		exercises: ['expandBrackets1', 'expandBrackets2'],
	},
	pullOutOfBrackets: {
		name: 'Pull factor out of brackets',
		setup: and('mergeSplitFractions', 'expandBrackets'),
		exercises: ['pullOutOfBrackets1', 'pullOutOfBrackets2', 'pullOutOfBrackets3'],
	},

	// Basic algebra: manipulating expressions.
	moveATerm: {
		name: 'Move a term',
		exercises: ['moveATerm1', 'moveATerm2'],
	},
	multiplyDivideAllTerms: {
		name: 'Multiply/divide all terms',
		setup: and('expandBrackets', 'addRemoveFractionFactors'),
		exercises: ['multiplyDivideAllTerms1', 'multiplyDivideAllTerms2'],
	},

	// Basic algebra: solving linear equations.
	solveBasicLinearEquation: {
		name: 'Solve a basic linear equations',
		setup: and(repeat('moveATerm', 2), 'pullOutOfBrackets', 'multiplyDivideAllTerms'),
		exercises: ['solveBasicLinearEquation1'],
		// exercises: ['solveBasicLinearEquation1', 'solveBasicLinearEquation2', 'solveBasicLinearEquation3'],
	},
	solveGeneralLinearEquation: {
		name: 'Solve a general linear equations',
		setup: and(pick(['simplifyFraction', 'expandBrackets', 'multiplyDivideAllTerms'], 2), 'multiplyDivideAllTerms', 'solveBasicLinearEquation'),
		exercises: ['solveGeneralLinearEquation1', 'solveGeneralLinearEquation2', 'solveGeneralLinearEquation3'],
	},

	// Basic algebra: solving quadratic equations.
	applySquareRoot: {
		name: 'Apply a square root',
		exercises: [], // ToDo
	},
	applyQuadraticFormula: {
		name: 'Apply the quadratic formula',
		exercises: ['applyQuadraticFormulaNoSolutions', 'applyQuadraticFormulaOneSolution', 'applyQuadraticFormulaTwoIntegerSolutions', 'applyQuadraticFormulaTwoRandomSolutions'],
	},
	solveBasicQuadraticEquation: {
		name: 'Solve a basic quadratic equation',
		setup: and('moveATerm', 'multiplyDivideAllTerms', 'applySquareRoot', 'applyQuadraticFormula'),
		exercises: [], // ToDo
	},
	solveGeneralQuadraticEquation: {
		name: 'Solve a general quadratic equation',
		setup: and('moveATerm', 'multiplyDivideAllTerms', 'applySquareRoot', 'applyQuadraticFormula'),
		exercises: [], // ToDo
	},

	// Basic algebra: solving systems of linear equations.
	solveBasicSystemOfLinearEquations: {
		name: 'Solve a basic system of linear equations',
		setup: repeat('solveBasicLinearEquation', 2),
		exercises: ['solveBasicSystemOfLinearEquations1'],
	},
	solveGeneralSystemOfLinearEquations: {
		name: 'Solve a general system of linear equations',
		setup: and('solveBasicLinearEquation', 'solveGeneralLinearEquation'),
		links: { skill: 'solveBasicSystemOfLinearEquations', correlation: 0.5 },
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
		name: 'Determine 2D angles',
		exercises: ['determine2DAnglesTriangleX', 'determine2DAnglesTriangleZ', 'determine2DAnglesCircleSymmetry'],
	},
	applyPythagoreanTheorem: {
		name: 'Apply the Pythagorean theorem',
		exercises: ['applyPythagoreanTheoremGeneral'],
	},
	applySineCosineTangent: {
		name: 'Apply the sine/cosine/tangent',
		exercises: ['applySineCosineTangentTwoSides', 'applySineCosineTangentSideAndAngle'],
	},
	applySimilarTriangles: {
		name: 'Apply similar triangles',
		exercises: ['applySimilarTrianglesGeneral'],
	},
	determine2DDistances: {
		name: 'Determine 2D distances',
		setup: and('determine2DAngles', repeat(pick(['applyPythagoreanTheorem', 'applySineCosineTangent', 'applySimilarTriangles']), 2)),
		exercises: [], // ToDo
		thresholds: { pass: 0.35 },
	},

	// Basic geometry: general triangles.
	calculateTriangle: {
		name: 'Calculate a triangle',
		setup: and(pick(['determine2DAngles', 'applySineCosineTangent']), pick(['solveBasicLinearEquation', 'solveBasicQuadraticEquation'])),
		exercises: ['calculateTriangleASAS', 'calculateTriangleSSAA', 'calculateTriangleASSA', 'calculateTriangleSASS', 'calculateTriangleSSAS', 'calculateTriangleSASA', 'calculateTriangleSSSA'],
	},

	// Basic geometry: areas and volumes.
	calculate2DShape: {
		name: 'Calculate a 2D shape',
		exercises: [], // ToDo
	},
	calculate3DShape: {
		name: 'Calculate a 3D shape',
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
		name: 'Look up an elementary derivative',
		exercises: ['lookUpElementaryDerivative'],
	},
	findBasicDerivative: {
		name: 'Determine a basic derivative',
		setup: repeat('lookUpElementaryDerivative', 2),
		exercises: ['findBasicDerivativeTwoTerms', 'findBasicDerivativeThreeTerms'],
	},

	// Derivatives: the product/quotient/chain rule.
	applyProductRule: {
		name: 'Apply the product rule',
		setup: and('lookUpElementaryDerivative', 'findBasicDerivative'),
		exercises: ['applyProductRuleTwoElementary', 'applyProductRuleElementaryAndBasic'],
	},
	applyQuotientRule: {
		name: 'Apply the quotient rule',
		setup: and('lookUpElementaryDerivative', 'findBasicDerivative'),
		exercises: ['applyQuotientRuleTwoElementary', 'applyQuotientRuleElementaryAndBasic'],
	},
	applyChainRule: {
		name: 'Apply the chain rule',
		setup: and('lookUpElementaryDerivative', 'findBasicDerivative'),
		exercises: ['applyChainRuleTwoElementary', 'applyChainRuleElementaryAndBasic'],
	},

	// Derivatives: general derivatives.
	findGeneralDerivative: {
		name: 'Determine a general derivative',
		setup: pick(['applyProductRule', 'applyQuotientRule', 'applyChainRule']),
		exercises: ['findGeneralDerivativeProductRule', 'findGeneralDerivativeQuotientRule', 'findGeneralDerivativeChainRule'],
	},
	findAdvancedDerivative: {
		name: 'Determine an advanced derivative',
		setup: and('findBasicDerivative', 'findGeneralDerivative', pick(['applyProductRule', 'applyQuotientRule', 'applyChainRule'])),
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
		name: 'Calculate a force or moment',
		exercises: ['calculateForceOrMomentUseVerticalForces', 'calculateForceOrMomentUseHorizontalForces', 'calculateForceOrMomentUseDiagonalForces', 'calculateForceOrMomentUseMomentsWithOnlyForces', 'calculateForceOrMomentUseMomentsWithMomentAsked', 'calculateForceOrMomentUseMomentsWithMomentGiven'],
	},

	// Calculating support reactions for beams.
	schematizeSupport: {
		name: 'Schematize a support',
		exercises: ['schematizeFixedSupport', 'schematizeRollerSupport', 'schematizeHingeSupport', 'schematizeRollerHingeSupport'],
	},
	drawFreeBodyDiagram: {
		name: 'Draw a free body diagram',
		setup: repeat('schematizeSupport', 2),
		exercises: ['drawFreeBodyDiagram1'],
	},
	calculateBasicSupportReactions: {
		name: 'Calculate basic support reactions',
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
		name: 'Solve a linear equation',
		exercises: ['solveLinearEquation1', 'solveLinearEquation2', 'solveLinearEquation3', 'solveLinearEquation4'],
	},
	solveExponentEquation: {
		name: 'Solve an exponent equation',
		exercises: ['solveExponentEquation1', 'solveExponentEquation2', 'solveExponentEquation3', 'solveExponentEquation4'],
	},
	linearInterpolation: {
		name: 'Apply linear interpolation',
		setup: repeat('solveLinearEquation', 2),
		exercises: ['linearInterpolationPopulation', 'linearInterpolationKettle', 'linearInterpolationChild'],
	},

	// Basic physics
	calculateWithPressure: {
		name: 'Calculate with pressure',
		exercises: ['calculateWithPressure'],
	},
	calculateWithVolume: {
		name: 'Calculate with volume',
		exercises: ['calculateWithVolume'],
	},
	calculateWithMass: {
		name: 'Calculate with mass',
		exercises: ['calculateWithMass'],
	},
	calculateWithTemperature: {
		name: 'Calculate with temperature',
		exercises: ['calculateWithTemperature'],
	},

	// Thermodynamics
	specificGasConstant: {
		name: 'Look up a specific gas constant',
		path: 'physics/thermodynamics/basicLaws',
		exercises: ['specificGasConstant'],
	},
	specificHeatRatio: {
		name: 'Look up a specific heat ratio',
		path: 'physics/thermodynamics/basicLaws',
		exercises: ['specificHeatRatio'],
	},
	specificHeats: {
		name: 'Look up specific heats',
		path: 'physics/thermodynamics/basicLaws',
		exercises: ['specificHeats'],
		links: { skills: ['specificGasConstant', 'specificHeatRatio'], correlation: 0.5 },
	},
	gasLaw: {
		name: 'Apply the gas law',
		path: 'physics/thermodynamics/basicLaws',
		setup: and(pick(['calculateWithPressure', 'calculateWithVolume', 'calculateWithMass', 'calculateWithTemperature'], 2), 'specificGasConstant', 'solveLinearEquation'),
		exercises: ['gasLawLightBulb', 'gasLawHeliumBalloon', 'gasLawDivingCylinder', 'gasLawBicyclePump', 'gasLawWeatherBalloon'],
	},
	recognizeProcessTypes: {
		name: 'Recognize process types',
		path: 'physics/thermodynamics/basicLaws',
		exercises: ['processNameToProperty', 'propertyToProcessName', 'findProcessCoefficient'], // ToDo later: add questions with p-V-plots too.
	},
	poissonsLaw: {
		name: `Apply Poisson's law`,
		path: 'physics/thermodynamics/basicLaws',
		setup: and(pick(['calculateWithPressure', 'calculateWithVolume', 'calculateWithTemperature']), part('specificHeatRatio', 2 / 3), pick(['solveLinearEquation', 'solveExponentEquation'], 1, [1, 2])),
		exercises: ['poissonsLawBicyclePump', 'poissonsLawCompressor', 'poissonsLawTurbine'],
	},
	calculateProcessStep: {
		name: 'Calculate a process step',
		path: 'physics/thermodynamics/basicLaws',
		setup: and('gasLaw', 'recognizeProcessTypes', part('poissonsLaw', 1 / 2), part('gasLaw', 1 / 2)),
		exercises: ['calculateProcessStepCompressor', 'calculateProcessStepDivingCylinder', 'calculateProcessStepBalloon', 'calculateProcessStepGasTurbine'],
	},
	calculateClosedCycle: {
		name: 'Calculate a closed cycle',
		path: 'physics/thermodynamics/closedCycles',
		setup: repeat('calculateProcessStep', 3),
		exercises: ['calculateClosedCycleVTp', 'calculateClosedCycleTsV', 'calculateClosedCycleSTST', 'calculateClosedCycleSVSV'],
		thresholds: { pass: 0.5 },
	},
	calculateHeatAndWork: {
		name: 'Calculate heat and work',
		path: 'physics/thermodynamics/basicLaws',
		setup: and('recognizeProcessTypes', pick(['calculateWithPressure', 'calculateWithVolume', 'calculateWithTemperature', 'calculateWithMass'], 2), pick(['specificGasConstant', 'specificHeatRatio', 'specificHeats'], 2)),
		exercises: ['calculateHeatAndWorkIsobaric', 'calculateHeatAndWorkIsochoric', 'calculateHeatAndWorkIsothermal', 'calculateHeatAndWorkIsentropic', 'calculateHeatAndWorkPolytropic'],
	},
	calculateWithInternalEnergy: {
		name: 'Calculate with internal energy',
		path: 'physics/thermodynamics/basicLaws',
		setup: and(pick(['gasLaw', 'poissonsLaw']), pick(['specificHeats', 'calculateHeatAndWork']), 'solveLinearEquation'),
		exercises: ['calculateWithInternalEnergyEngine', 'calculateWithInternalEnergyBalloon', 'calculateWithInternalEnergyTire'],
	},
	createClosedCycleEnergyOverview: {
		name: 'Create a closed-cycle energy overview',
		path: 'physics/thermodynamics/closedCycles',
		setup: and(repeat('calculateHeatAndWork', 2), or('calculateHeatAndWork', 'calculateWithInternalEnergy')),
		exercises: ['createClosedCycleEnergyOverviewVTp', 'createClosedCycleEnergyOverviewTsV', 'createClosedCycleEnergyOverviewSTST', 'createClosedCycleEnergyOverviewSVSV'],
		thresholds: { pass: 0.5 },
	},
	calculateWithEfficiency: {
		name: 'Calculate with efficiency',
		path: 'physics/fundamentals',
		exercises: ['calculateWithEfficiencyGenerator', 'calculateWithEfficiencyBattery'],
	},
	calculateWithCOP: {
		name: 'Calculate with the COP',
		links: { skill: 'calculateWithEfficiency', correlation: 0.5 },
		path: 'physics/thermodynamics/coolingCycles',
		exercises: ['calculateWithCOPRefrigerator', 'calculateWithCOPHeatPump'],
	},
	analyseClosedCycle: {
		name: 'Analyse a closed cycle',
		setup: and('calculateClosedCycle', 'createClosedCycleEnergyOverview', pick(['calculateWithEfficiency', 'calculateWithCOP'])),
		path: 'physics/thermodynamics/closedCycles',
		exercises: ['analyseClosedCycleVTp', 'analyseClosedCycleTsV', 'analyseClosedCycleSTST', 'analyseClosedCycleSVSV'],
		thresholds: { pass: 0.4 },
	},

	calculateWithSpecificQuantities: {
		name: 'Calculate with specific quantities',
		exercises: ['calculateWithSpecificQuantitiesDensity', 'calculateWithSpecificQuantitiesBoiler', 'calculateWithSpecificQuantitiesTurbine']
	},
	massFlowTrick: {
		name: 'Apply the mass flow trick',
		exercises: ['massFlowTrickCompressor', 'massFlowTrickWater', 'massFlowTrickEngine'],
	},
	calculateOpenProcessStep: {
		name: 'Calculate an open process step',
		setup: and('gasLaw', 'calculateWithSpecificQuantities', 'recognizeProcessTypes', part('poissonsLaw', 1 / 2), part('gasLaw', 1 / 2)),
		links: { skill: 'calculateProcessStep', correlation: 0.7 },
		exercises: ['calculateOpenProcessStepWing', 'calculateOpenProcessStepCompressor', 'calculateOpenProcessStepGasTurbine'],
	},
	calculateOpenCycle: {
		name: 'Calculate an open cycle',
		setup: repeat('calculateOpenProcessStep', 3),
		links: { skill: 'calculateClosedCycle', correlation: 0.6 },
		exercises: ['calculateOpenCyclespsp', 'calculateOpenCycleNspsp', 'calculateOpenCycleTsp'],
		thresholds: { pass: 0.5 },
	},
	calculateSpecificHeatAndMechanicalWork: {
		name: 'Calculate specific heat and mechanical work',
		setup: and('recognizeProcessTypes', pick(['calculateWithPressure', 'calculateWithVolume', 'calculateWithTemperature', 'calculateWithMass'], 2), pick(['specificGasConstant', 'specificHeatRatio', 'specificHeats'], 2), 'calculateWithSpecificQuantities'),
		links: { skill: 'calculateHeatAndWork', correlation: 0.4 },
		exercises: ['calculateSpecificHeatAndMechanicalWorkIsobaric', 'calculateSpecificHeatAndMechanicalWorkIsothermal', 'calculateSpecificHeatAndMechanicalWorkIsentropic'],
	},
	calculateWithEnthalpy: {
		name: 'Calculate with enthalpy',
		setup: and(pick(['massFlowTrick', 'calculateWithSpecificQuantities']), 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation'),
		links: { skill: 'calculateWithInternalEnergy', correlation: 0.3 },
		exercises: ['calculateWithEnthalpyCompressor', 'calculateWithEnthalpyBoiler', 'calculateWithEnthalpyTurbine'],
	},
	createOpenCycleEnergyOverview: {
		name: 'Create an open cycle energy overview',
		setup: and(repeat('calculateSpecificHeatAndMechanicalWork', 2), 'calculateWithEnthalpy'),
		links: { skill: 'createClosedCycleEnergyOverview', correlation: 0.4 },
		exercises: ['createOpenCycleEnergyOverviewspsp', 'createOpenCycleEnergyOverviewNspsp', 'createOpenCycleEnergyOverviewTsp'],
		thresholds: { pass: 0.5 },
	},
	analyseOpenCycle: {
		name: 'Analyse an open cycle',
		setup: and('calculateOpenCycle', 'createOpenCycleEnergyOverview', pick(['calculateWithEfficiency', 'calculateWithCOP']), 'massFlowTrick'),
		links: { skill: 'analyseClosedCycle', correlation: 0.5 },
		exercises: ['analyseOpenCyclespsp', 'analyseOpenCycleNspsp', 'analyseOpenCycleTsp'],
		thresholds: { pass: 0.4 },
	},

	calculateEntropyChange: {
		name: 'Calculate an entropy change',
		setup: and('calculateWithTemperature', pick(['specificGasConstant', 'specificHeats']), 'solveLinearEquation'),
		exercises: ['calculateEntropyChangeIsotherm', 'calculateEntropyChangeWithTemperature', 'calculateEntropyChangeWithProperties'],
	},
	calculateMissedWork: {
		name: 'Calculate the missed work',
		setup: and('calculateEntropyChange', 'solveLinearEquation'),
		exercises: ['calculateMissedWorkIsotherm', 'calculateMissedWorkPiston', 'calculateMissedWorkCompressor'],
		thresholds: { pass: 0.5 },
	},

	useIsentropicEfficiency: {
		name: 'Use the isentropic efficiency',
		setup: and(pick([repeat('calculateSpecificHeatAndMechanicalWork', 2), repeat('calculateWithEnthalpy', 2)]), 'solveLinearEquation'),
		exercises: ['useIsentropicEfficiencyCompressor1', 'useIsentropicEfficiencyCompressor2', 'useIsentropicEfficiencyTurbine1', 'useIsentropicEfficiencyTurbine2'],
	},
	analyseGasTurbine: {
		name: 'Analyse gas turbines',
		setup: and('calculateOpenCycle', 'useIsentropicEfficiency', 'createOpenCycleEnergyOverview', 'calculateWithEfficiency', 'massFlowTrick'),
		exercises: ['analyseGasTurbine1', 'analyseGasTurbine2', 'analyseGasTurbine3'],
		thresholds: { pass: 0.4 },
	},

	lookUpSteamProperties: {
		name: 'Look up steam properties',
		exercises: ['steamPropertiesAtTemperature', 'steamPropertiesAtPressure', 'steamPropertiesSuperheated'],
	},
	useVaporFraction: {
		name: 'Use the vapor fraction',
		setup: and('lookUpSteamProperties', 'linearInterpolation'),
		exercises: ['useVaporFractionWithEnthalpy', 'useVaporFractionWithEntropy'],
	},
	createRankineCycleOverview: {
		name: 'Create a Rankine cycle overview',
		setup: and(repeat('lookUpSteamProperties', 2), 'recognizeProcessTypes', 'useVaporFraction'),
		exercises: ['createRankineCycleOverview'],
		thresholds: { pass: 0.5 },
	},
	analyseRankineCycle: {
		name: 'Analyse a Rankine cycle',
		setup: and('createRankineCycleOverview', 'useIsentropicEfficiency', part('useVaporFraction', 1 / 2), 'calculateWithEfficiency', 'massFlowTrick'),
		exercises: ['analyseRankineCycleWithEtai', 'analyseRankineCycleWithX3'],
		thresholds: { pass: 0.4 },
	},

	findFridgeTemperatures: {
		name: 'Find refrigerator temperatures',
		path: 'physics/thermodynamics/coolingCycles',
		exercises: ['findFridgeTemperaturesInternal', 'findFridgeTemperaturesExternal'],
	},
	determineRefrigerantProcess: {
		name: 'Determine a refrigerant process',
		exercises: ['determineRefrigerantProcessIsobaric', 'determineRefrigerantProcessIsentropic'],
	},
	createCoolingCycleOverview: {
		name: 'Create a cooling cycle overview',
		setup: and('findFridgeTemperatures', repeat('determineRefrigerantProcess', 3)),
		exercises: ['createCoolingCycleOverviewFromPressures', 'createCoolingCycleOverviewFromTemperatures'],
		thresholds: { pass: 0.5 },
	},
	analyseCoolingCycle: {
		name: 'Analyse a cooling cycle',
		setup: and('createCoolingCycleOverview', 'useIsentropicEfficiency', 'calculateWithCOP', 'massFlowTrick'),
		exercises: ['analyseCoolingCycleWithEtai', 'analyseCoolingCycleWithT2'],
		thresholds: { pass: 0.4 },
	},

	readMollierDiagram: {
		name: 'Read a Mollier diagram',
		path: 'physics/thermodynamics/humidity',
		exercises: ['readMollierDiagramRH', 'readMollierDiagramAH'],
	},
	analyseAirco: {
		name: 'Analyse an air conditioner',
		setup: repeat('readMollierDiagram', 3),
		path: 'physics/thermodynamics/humidity',
		exercises: ['analyseAircoBasic', 'analyseAircoWaterDischarge', 'analyseAircoPower'],
	},
}

// Process the basic skill object properties.
Object.keys(skillTree).forEach(key => {
	const skill = skillTree[key]
	skill.id = key // Inform the skills of their own id.
	skill.prerequisites = skill.setup ? skill.setup.getSkillList() : [] // If no set-up is given, there are no prerequisites.
	if (!skill.exercises) // Ensure all skills have an exercises array (albeit an empty one).
		skill.exercises = []
	if (!Array.isArray(skill.exercises)) // Ensure that the exercises parameter is an array.
		skill.exercises = [skill.exercises]
})

// Set up continuations.
Object.values(skillTree).forEach(skill => { skill.continuations = [] }) // Prepare an empty continuations array.
Object.values(skillTree).forEach(skill => {
	skill.prerequisites.forEach(prerequisiteId => {
		const prerequisite = skillTree[prerequisiteId]
		if (!prerequisite)
			throw new Error(`Invalid prerequisite skill "${prerequisiteId}" given for skill "${skill.id}".`)
		prerequisite.continuations.push(skill.id)
	})
})

// Process links properties.
Object.values(skillTree).forEach(skill => {
	// Ensure that the links is an array.
	if (!skill.links)
		skill.links = []
	else if (!Array.isArray(skill.links) || skill.links.every(link => (typeof link === 'string')))
		skill.links = [skill.links]

	// Ensure that each element is a properly formatted object.
	skill.links = skill.links.map(link => {
		if (typeof link === 'string')
			return { skills: [link], order: defaultLinkOrder }
		if (Array.isArray(link))
			return { skills: link, order: defaultLinkOrder }
		if (!isBasicObject(link))
			throw new Error(`Invalid skill link: expected a basic object, string or array, but got something of type "${typeof link}".`)
		if (link.skill) {
			if (!link.skills) // Allow a "skill" property to be set instead of a "skills" property.
				link.skills = Array.isArray(link.skill) ? link.skill : [link.skill]
			delete link.skill
		}
		if (link.correlation) {
			if (!link.order) {
				if (link.correlation <= 0 || link.correlation >= 1)
					throw new Error(`Invalid skill correlation: expected a correlation between 0 and 1, but received one of "${link.correlation}".`)
				link.order = Math.round(2 * link.correlation / (1 - link.correlation))
			}
			delete link.correlation
		}
		return link
	})

	// Extract all linked skills.
	skill.linkedSkills = [...union(...skill.links.map(link => new Set(link.skills)))]
})

// Copy links to the skills that have been linked.
const skillLinks = applyMapping(skillTree, skill => [...skill.links]) // Copy links lists to prevent reference loops.
applyMapping(skillLinks, (links, skillId) => {
	const skill = skillTree[skillId]
	links.forEach(link => {
		link.skills.forEach(linkedSkill => {
			if (!skillTree[linkedSkill])
				throw new Error(`Invalid skill link: received a skill ID "${linkedSkill}" in the linked skills of skill "${skill.id}". This is not a known skill ID and cannot be processed further.`)
			skillTree[linkedSkill].links.push({
				...link,
				skills: [...link.skills.filter(skill => skill !== linkedSkill), skill.id], // Adjust list to change skill ID into linking skill ID.
			})
		})
	})
})
Object.values(skillTree).forEach(skill => {
	skill.linkedSkills = skill.links.map(link => link.skills).flat()
})

module.exports.skillTree = skillTree
