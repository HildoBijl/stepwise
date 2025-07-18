/* This file defines all courses existing on the website. Each course should have the following properties.
 * - An ID, defined as the object key.
 * - name: a name, for display purposes.
 * - goals: an array of skills with the final course goals, which is the bottom part of the tree.
 * - priorKnowledge: an array of skills that are assumed to already have been mastered. This is the top part of the tree, where it ends for this course.
 * - startingPoints: an array of skills that ARE part of the course, but have NO subskills above them. (Otherwise these subskills can be set as prior knowledge and everything is fine.) These starting skills are not used in the script but serve as unit-test safety check: so we can be sure that the course tree ends here. If later on extra skills are added, then the unit test throws an error, and we don't have a course with suddenly dozens of subskills in it.
 * - blocks: an array of objects with properties
 *   x name: for display purposes, the name of the course.
 *   x goals: an array of skills that should be mastered at the end of this block.
 * - setup (optional): a Skill Tracking set-up that represents the final exam of the course. If given, it is used to display a grade estimate.
 * That's all there is to it!
 *  
 * ToDo later: put courses in database.
 * Step 1: put user registration of courses into database. So users can subscribe to courses.
 * Step 2: put courses itself in the database too.
 */

import { arraysToObject, isBasicObject } from 'step-wise/util'
import { pick } from 'step-wise/skillTracking'

let courses = {
	stepwiseTutorial: {
		name: 'Step-Wise Tutorial',
		description: 'In this brief demo you can play around with how Step-Wise works.',
		goals: [
			'enterInteger',
			'enterFloat',
			'enterUnit',
			'lookUpConstant',
			{ skillId: 'enterExpression', weight: 2 },
			{ skillId: 'enterEquation', weight: 2 },
			{ skillId: 'summationAndMultiplication', weight: 4 },
		],
		priorKnowledge: [],
		startingPoints: [
			'enterInteger',
			'enterFloat',
			'enterUnit',
			'lookUpConstant',
			'enterExpression',
			'enterEquation',
			'summation',
			'multiplication',
		],
		blocks: [
			{
				name: 'Number input fields',
				goals: ['enterInteger', 'enterFloat', 'enterUnit', 'lookUpConstant'],
			},
			{
				name: 'Mathematical input fields',
				goals: ['enterExpression', 'enterEquation'],
			},
			{
				name: 'Demo Step-Wise exercises',
				goals: ['summationAndMultiplication'],
			},
		],
	},

	algebraBasics: {
		name: 'Mathematics: algebra basics',
		description: 'This small course walks you through the basics of algebra, from simplifying fractions to solving various types of linear equations.',
		goals: ['addFractionsWithVariables', 'solveLinearEquation', 'simplifyFractionOfFractionSumsWithMultipleVariables', 'solveMultiVariableLinearEquation'],
		priorKnowledge: [
			'simplifyNumberProduct', 'mergeSimilarTerms', // Prerequisites for expanding brackets.
			'cancelFractionFactors', // Prerequisites for adding fractions.
			'multiplyDivideFractions', 'simplifyFraction', 'rewritePower', // Prerequisites for simplifying fractions.
			'checkEquationSolution', 'cancelSumTerms', 'addTermToBothEquationSides', 'multiplyBothEquationSides', // Prerequisites for solving linear equations.
			'checkMultiVariableEquationSolution', // Prerequisites for solving multi-variable linear equations.
		],
		startingPoints: ["expandBrackets", "expandDoubleBrackets", "addLikeFractionsWithVariables", "addFractionsWithVariables", "simplifyFractionWithVariables", "simplifyFractionOfFractionsWithVariables", "moveEquationTerm", "moveEquationFactor", "solveLinearEquation", "solveProductEquation", "solveMultiVariableProductEquation"],
		blocks: [
			{
				name: 'Expanding brackets',
				goals: ['expandDoubleBrackets'],
			},
			{
				name: 'Adding fractions',
				goals: ['addFractionsWithVariables'],
			},
			{
				name: 'Simplifying fractions',
				goals: ['simplifyFractionOfFractionsWithVariables'],
			},
			{
				name: 'Solving linear equations',
				goals: ['solveLinearEquation'],
			},
			{
				name: 'Simplifying fractions with multiple variables',
				goals: ['simplifyFractionOfFractionSumsWithMultipleVariables'],
			},
			{
				name: 'Solve linear equations with multiple variables',
				goals: ['solveMultiVariableLinearEquation'],
			},
		],
		setup: pick(['solveLinearEquation', 'simplifyFractionOfFractionSumsWithMultipleVariables', 'solveMultiVariableLinearEquation']),
	},

	mathematicsFundamentals: {
		name: 'Mathematics: fundamentals',
		description: 'This course discusses the fundamentals of algebra, up to solving quadratic equations as well as solving systems of linear equations.',
		goals: ['addFractionsWithVariables', 'solveLinearEquationWithFractions', 'solveMultiVariableLinearEquationWithFractions', 'solveSystemOfLinearEquations', 'solveMultiVariableSystemOfLinearEquations', 'solveRewrittenQuadraticEquation', 'calculateTriangle', 'calculate3DShape'],
		priorKnowledge: [
			'cancelFractionFactors', 'expandDoubleBrackets', 'addLikeFractionsWithVariables', // For addFractionsWithVariables
			'multiplyDivideFractions', 'simplifyFractionWithVariables', // For simplifyFractionOfFractionsWithVariables
			'addFractionsWithMultipleVariables', // For simplifyFractionOfFractionSumsWithMultipleVariables
			'expandBrackets', 'moveEquationTerm', 'mergeSimilarTerms', 'solveProductEquation', 'moveEquationFactor', // For solveLinearEquation
			'pullFactorOutOfBrackets', 'solveMultiVariableProductEquation', // For solveMultiVariableLinearEquation
			'substituteANumber', 'substituteAnExpression', // For solveSystemOfLinearEquations
			'calculateSumOfProducts', 'simplifyFractionSum', 'simplifyRoot', 'checkEquationSolution', 'multiplyAllEquationTerms', // For solveQuadraticEquation
		],
		startingPoints: [ // The starting points are mainly for the geometry part, which doesn't have a tree going up all the way.
			'applyPythagoreanTheorem',
			'applySineCosineTangent',
			'applySimilarTriangles',
			'determine2DAngles',
			'calculate2DShape',
			"addFractionsWithVariables", "solveLinearEquationWithFractions", "solveSystemOfLinearEquations", "solveMultiVariableSystemOfLinearEquations", "solveRewrittenQuadraticEquation", "solveLinearEquation", "solveQuadraticEquation",
		],
		blocks: [
			{
				name: 'Basic rules of algebra',
				goals: ['addFractionsWithVariables', 'solveLinearEquation', 'simplifyFractionOfFractionSumsWithMultipleVariables', 'solveMultiVariableLinearEquation'],
			},
			{
				name: 'Rewritten linear equations',
				goals: ['solveLinearEquationWithFractions', 'solveMultiVariableLinearEquationWithFractions'],
			},
			{
				name: 'Angles and distances',
				goals: ['determine2DDistances'],
			},
			{
				name: 'Systems of equations',
				goals: ['solveSystemOfLinearEquations', 'solveMultiVariableSystemOfLinearEquations'],
			},
			{
				name: 'Quadratic equations',
				goals: ['solveRewrittenQuadraticEquation'],
			},
			{
				name: 'Analyzing triangles',
				goals: ['calculateTriangle'],
			},
			{
				name: 'Areas and volumes',
				goals: ['calculate3DShape'],
			},
		],
		setup: pick(['solveLinearEquationWithFractions', 'solveMultiVariableLinearEquationWithFractions', 'solveSystemOfLinearEquations', 'solveMultiVariableSystemOfLinearEquations', 'solveRewrittenQuadraticEquation', 'calculateTriangle', 'calculate3DShape']),
	},

	mathematicsDerivatives: {
		name: 'Mathematics: derivatives',
		description: 'This course teaches derivatives, starting with looking up basic derivatives, and building up to applying combinations of rules.',
		goals: ['findAdvancedDerivative'],
		priorKnowledge: [],
		startingPoints: ['lookUpElementaryDerivative'],
		blocks: [
			{
				name: 'Derivative basics',
				goals: ['findBasicDerivative'],
			},
			{
				name: 'Derivative rules',
				goals: ['applyProductRule', 'applyQuotientRule', 'applyChainRule'],
			},
			{
				name: 'Determine derivatives',
				goals: ['findAdvancedDerivative'],
			},
		],
	},

	staticsFundamentals: {
		name: 'Statics: fundamentals',
		description: 'This tiny course is used to demonstrate the possibilities of Step-Wise related to engineering mechanics. It is not a fully fledged course yet.',
		goals: ['calculateBasicSupportReactions'],
		priorKnowledge: [],
		startingPoints: [
			'schematizeSupport',
			'calculateForceOrMoment',
		],
		blocks: [
			{
				name: 'Drawing free body diagrams',
				goals: ['drawFreeBodyDiagram'],
			},
			{
				name: 'Calculate support reactions',
				goals: ['calculateBasicSupportReactions'],
			}
		],
	},

	thermodynamicsFundamentals: {
		name: 'Thermodynamics: fundamentals',
		description: 'This introduction course on thermodynamics teaches the basics of thermodynamic processes, analyzing closed thermodynamic cycles.',
		goals: ['analyseClosedCycle', 'findFridgeTemperatures', 'analyseAirco'],
		priorKnowledge: [
			'calculateWithPressure',
			'calculateWithVolume',
			'calculateWithTemperature',
			'calculateWithMass',
			'solveLinearEquation',
			'solveExponentEquation',
		],
		startingPoints: [
			'specificGasConstant',
			'specificHeatRatio',
			'specificHeats',
			'recognizeProcessTypes',
			'calculateWithEfficiency',
			'calculateWithCOP',
			'findFridgeTemperatures',
			'readMollierDiagram',
		],
		blocks: [
			{
				name: 'Gas properties and the gas law',
				goals: ['gasLaw'],
			},
			{
				name: 'Thermodynamic processes and Poisson\'s law',
				goals: ['calculateProcessStep'],
			},
			{
				name: 'Work and heat',
				goals: ['calculateWithInternalEnergy'],
			},
			{
				name: 'Cycles: analysis',
				goals: ['calculateClosedCycle', 'createClosedCycleEnergyOverview'],
			},
			{
				name: 'Cycles: energy and efficiency',
				goals: ['analyseClosedCycle'],
			},
			{
				name: `Steam turbines and cooling machines`,
				goals: ['findFridgeTemperatures'],
			},
			{
				name: `Humidity and air conditioning`,
				goals: ['analyseAirco'],
			},
		],
		setup: pick(['calculateClosedCycle', 'createClosedCycleEnergyOverview', 'calculateWithEfficiency', 'calculateWithCOP', 'findFridgeTemperatures', 'analyseAirco'], 1, [3, 3, 1, 1, 1, 2]),
	},

	thermodynamicsApplications: {
		name: 'Thermodynamics: applications',
		description: 'This advanced thermodynamics course teaches all sorts of thermodynamic cycles, including gas turbines, Rankine cycles and cooling cycles.',
		goals: [
			'analyseClosedCycle',
			'analyseOpenCycle',
			'calculateMissedWork',
			'analyseGasTurbine',
			'analyseRankineCycle',
			'analyseCoolingCycle',
		],
		priorKnowledge: [
			'calculateWithPressure',
			'calculateWithVolume',
			'calculateWithTemperature',
			'calculateWithMass',
			'specificGasConstant',
			'specificHeatRatio',
			'specificHeats',
			'solveLinearEquation',
			'gasLaw',
			'poissonsLaw',
			'recognizeProcessTypes',
		],
		startingPoints: [
			'calculateWithEfficiency',
			'calculateWithCOP',
			'calculateWithSpecificQuantities',
			'massFlowTrick',
			'lookUpSteamProperties',
			'findFridgeTemperatures',
			'determineRefrigerantProcess',
		],
		blocks: [
			{
				name: 'Closed systems and cycles',
				goals: ['analyseClosedCycle'],
			},
			{
				name: 'Open systems and enthalpy',
				goals: ['analyseOpenCycle'],
			},
			{
				name: 'Entropy and the second law',
				goals: ['calculateMissedWork'],
			},
			{
				name: 'Gas turbines',
				goals: ['analyseGasTurbine'],
			},
			{
				name: 'Vapors and diagrams',
				goals: ['useVaporFraction', 'determineRefrigerantProcess'],
			},
			{
				name: 'Steam turbines',
				goals: ['analyseRankineCycle'],
			},
			{
				name: 'Cooling machines and heat pumps',
				goals: ['analyseCoolingCycle'],
			},
		],
		setup: pick(['calculateClosedCycle', 'createClosedCycleEnergyOverview', 'calculateOpenCycle', 'createOpenCycleEnergyOverview', 'calculateWithEfficiency', 'calculateWithCOP', 'useIsentropicEfficiency', 'massFlowTrick', 'createRankineCycleOverview', 'useVaporFraction', 'createCoolingCycleOverview'], 1, [2, 2, 2, 2, 1, 1, 2, 2, 2, 1, 2]),
	},

	thermodynamicsApplications2: {
		name: 'Thermodynamics: applications',
		description: 'This advanced thermodynamics course teaches all sorts of thermodynamic cycles, including gas turbines, Rankine cycles and cooling cycles.',
		languages: ['nl'],
		goals: [
			'analyseClosedCycle',
			'analyseOpenCycle',
			'calculateMissedWork',
			'analyseGasTurbine',
			'analyseRankineCycle',
			'analyseCoolingCycle',
		],
		priorKnowledge: [
			'calculateWithPressure',
			'calculateWithVolume',
			'calculateWithTemperature',
			'calculateWithMass',
			'solveLinearEquation',
			'solveExponentEquation',
		],
		startingPoints: [
			'specificGasConstant',
			'specificHeatRatio',
			'specificHeats',
			'recognizeProcessTypes',
			'calculateWithEfficiency',
			'calculateWithCOP',
			'calculateWithSpecificQuantities',
			'massFlowTrick',
			'lookUpSteamProperties',
			'findFridgeTemperatures',
			'determineRefrigerantProcess',
		],
		blocks: [
			{
				name: 'Thermodynamic processes',
				goals: ['calculateProcessStep', 'calculateWithInternalEnergy'],
			},
			{
				name: 'Closed systems and cycles',
				goals: ['analyseClosedCycle'],
			},
			{
				name: 'Open systems and enthalpy',
				goals: ['analyseOpenCycle'],
			},
			{
				name: 'Entropy and the second law',
				goals: ['calculateMissedWork'],
			},
			{
				name: 'Gasturbines',
				goals: ['analyseGasTurbine'],
			},
			{
				name: 'Vapors and diagrams',
				goals: ['useVaporFraction', 'determineRefrigerantProcess'],
			},
			{
				name: 'Steam turbines',
				goals: ['analyseRankineCycle'],
			},
			{
				name: 'Cooling machines and heat pumps',
				goals: ['analyseCoolingCycle'],
			},
		],
		setup: pick(['calculateClosedCycle', 'createClosedCycleEnergyOverview', 'calculateOpenCycle', 'createOpenCycleEnergyOverview', 'calculateWithEfficiency', 'calculateWithCOP', 'useIsentropicEfficiency', 'massFlowTrick', 'createRankineCycleOverview', 'useVaporFraction', 'createCoolingCycleOverview'], 1, [2, 2, 2, 2, 1, 1, 2, 2, 2, 1, 2]),
	},
}

// Turn all keys into lower case.
courses = arraysToObject(Object.keys(courses).map(key => key.toLowerCase()), Object.values(courses))

// Add ids for the courses.
Object.keys(courses).forEach(key => {
	courses[key].id = key
})

// Turn the goals array into an array of basic objects with weights. (Weights are used by the free practice mode.)
Object.values(courses).forEach(course => {
	course.goals = course.goals.map(goal => {
		if (typeof goal === 'string')
			goal = { skillId: goal }
		if (isBasicObject(goal)) {
			if (goal.weight === undefined)
				goal.weight = 1
			return goal
		}
		throw new Error(`Invalid course goals: received something of type "${typeof goal}".`)
	})
})

export { courses }
