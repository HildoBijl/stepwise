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

import { arraysToObject } from 'step-wise/util'
import { pick } from 'step-wise/skillTracking'

let courses = {
	stepwiseTutorial: {
		name: 'Step-Wise Tutorial',
		goals: [
			'fillInInteger',
			'fillInFloat',
			'fillInUnit',
			'lookUpConstant',
			'summationAndMultiplication',
		],
		priorKnowledge: [],
		startingPoints: [
			'fillInInteger',
			'fillInFloat',
			'fillInUnit',
			'lookUpConstant',
			'summation',
			'multiplication',
		],
		blocks: [
			{
				name: 'Fill in answers',
				goals: ['fillInInteger', 'fillInFloat', 'fillInUnit', 'lookUpConstant'],
			},
			{
				name: 'Demo Step-Wise exercises',
				goals: ['summationAndMultiplication'],
			},
		],
	},

	algebraBasics: {
		name: 'Mathematics: algebra basics',
		goals: ['solveGeneralLinearEquation'],
		priorKnowledge: [],
		startingPoints: [
			'expandBrackets',
			'addRemoveFractionFactors',
			'mergeSplitBasicFractions',
			'multiplyDivideFractions',
			'moveATerm',
		],
		blocks: [
			{
				name: 'Merge/split fractions',
				goals: ['mergeSplitFractions'],
			},
			{
				name: 'Simplify fractions within fractions',
				goals: ['simplifyFraction'],
			},
			{
				name: 'Using brackets',
				goals: ['pullOutOfBrackets'],
			},
			{
				name: 'Rearranging equations',
				goals: ['moveATerm', 'multiplyDivideAllTerms'],
			},
			{
				name: 'Solve linear equations',
				goals: ['solveGeneralLinearEquation'],
			},
		],
		setup: pick(['simplifyFraction', 'solveBasicLinearEquation', 'solveGeneralLinearEquation']),
	},

	mathematicsFundamentals: {
		name: 'Mathematics: fundamentals',
		goals: ['solveBasicSystemOfLinearEquations', 'solveGeneralSystemOfLinearEquations', 'solveGeneralQuadraticEquation', 'calculateTriangle', 'calculate3DShape'],
		priorKnowledge: [],
		startingPoints: [
			'expandBrackets',
			'addRemoveFractionFactors',
			'mergeSplitBasicFractions',
			'multiplyDivideFractions',
			'moveATerm',
			'applySquareRoot',
			'applyQuadraticFormula',
			'determine2DAngles',
			'applyPythagoreanTheorem',
			'applySineCosineTangent',
			'applySimilarTriangles',
			'calculate2DShape',
		],
		blocks: [
			{
				name: 'Basic rules of algebra',
				goals: ['expandBrackets', 'simplifyFraction'],
			},
			{
				name: 'Linear equations',
				goals: ['solveGeneralLinearEquation'],
			},
			{
				name: 'Angles and distances',
				goals: ['determine2DDistances'],
			},
			{
				name: 'Systems of equations',
				goals: ['solveBasicSystemOfLinearEquations', 'solveGeneralSystemOfLinearEquations'],
			},
			{
				name: 'Quadratic equations',
				goals: ['solveBasicQuadraticEquation', 'solveGeneralQuadraticEquation'],
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
		setup: pick(['solveBasicSystemOfLinearEquations', 'solveGeneralSystemOfLinearEquations', 'solveBasicQuadraticEquation', 'solveGeneralQuadraticEquation', 'determine2DDistances', 'calculateTriangle', 'calculate2DShape']),
	},

	mathematicsDerivatives: {
		name: 'Mathematics: derivatives',
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

// Add ids for the courses.
Object.keys(courses).forEach(key => {
	courses[key].id = key
})

// Turn all keys into lower case.
courses = arraysToObject(Object.keys(courses).map(key => key.toLowerCase()), Object.values(courses))

export default courses