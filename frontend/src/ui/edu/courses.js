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
				name: 'Antwoorden invoeren',
				goals: ['fillInInteger', 'fillInFloat', 'fillInUnit', 'lookUpConstant'],
			},
			{
				name: 'Demo stapsgewijze oefeningen',
				goals: ['summationAndMultiplication'],
			},
		],
	},

	wiskundeBasis: {
		name: 'Wiskunde basisvaardigheden',
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
				name: 'Breuken samenvoegen/splitsen',
				goals: ['mergeSplitFractions'],
			},
			{
				name: 'Breuken binnen breuken simplificeren',
				goals: ['simplifyFraction'],
			},
			{
				name: 'Werken met haakjes',
				goals: ['pullOutOfBrackets'],
			},
			{
				name: 'Vergelijkingen omschrijven',
				goals: ['moveATerm', 'multiplyDivideAllTerms'],
			},
			{
				name: 'Lineaire vergelijkingen oplossen',
				goals: ['solveGeneralLinearEquation'],
			},
		],
		setup: pick(['simplifyFraction', 'solveBasicLinearEquation', 'solveGeneralLinearEquation']),
	},

	exactAWiskunde: {
		name: 'Exacte Wetenschap A: Wiskunde',
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
				name: 'Basisregels',
				goals: ['expandBrackets', 'simplifyFraction'],
			},
			{
				name: 'Lineaire vergelijkingen',
				goals: ['solveGeneralLinearEquation'],
			},
			{
				name: 'Hoeken en afstanden',
				goals: ['determine2DDistances'],
			},
			{
				name: 'Stelsels van vergelijkingen',
				goals: ['solveBasicSystemOfLinearEquations', 'solveGeneralSystemOfLinearEquations'],
			},
			{
				name: 'Kwadratische vergelijkingen',
				goals: ['solveBasicQuadraticEquation', 'solveGeneralQuadraticEquation'],
			},
			{
				name: 'Driehoeken doorrekenen',
				goals: ['calculateTriangle'],
			},
			{
				name: 'Oppervlakten en volumes',
				goals: ['calculate3DShape'],
			},
		],
		setup: pick(['solveBasicSystemOfLinearEquations', 'solveGeneralSystemOfLinearEquations', 'solveBasicQuadraticEquation', 'solveGeneralQuadraticEquation', 'determine2DDistances', 'calculateTriangle', 'calculate2DShape']),
	},

	exactAStatica: {
		name: 'Exacte Wetenschap A: Statica basisvaardigheden',
		goals: ['calculateBasicSupportReactions'],
		priorKnowledge: [],
		startingPoints: [
			'schematizeSupport',
			'calculateForceOrMoment',
		],
		blocks: [
			{
				name: 'Vrijlichaamsschema tekenen',
				goals: ['drawFreeBodyDiagram'],
			},
			{
				name: 'Reactiekrachten berekenen',
				goals: ['calculateBasicSupportReactions'],
			}
		],
	},

	exactBAfgeleiden: {
		name: 'Exacte Wetenschap B - Differentiëren',
		goals: ['findAdvancedDerivative'],
		priorKnowledge: [],
		startingPoints: ['lookUpElementaryDerivative'],
		blocks: [
			{
				name: 'Basis afgeleiden',
				goals: ['findBasicDerivative'],
			},
			{
				name: 'Differentieerregels toepassen',
				goals: ['applyProductRule', 'applyQuotientRule', 'applyChainRule'],
			},
			{
				name: 'Afgeleiden bepalen',
				goals: ['findAdvancedDerivative'],
			},
		],
	},

	exactDNatuurkunde: {
		name: 'Exacte Wetenschap D: Natuurkunde',
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
				name: 'Gaseigenschappen en de gaswet',
				goals: ['gasLaw'],
			},
			{
				name: 'Processen en Poisson\'s wet',
				goals: ['calculateProcessStep'],
			},
			{
				name: 'Arbeid en warmte',
				goals: ['calculateWithInternalEnergy'],
			},
			{
				name: 'Kringprocessen: doorrekenen',
				goals: ['calculateClosedCycle', 'createClosedCycleEnergyOverview'],
			},
			{
				name: 'Kringprocessen: energie en rendement',
				goals: ['analyseClosedCycle'],
			},
			{
				name: `Stoomturbines en koelmachines`,
				goals: ['findFridgeTemperatures'],
			},
			{
				name: `Luchtvochtigheid en airco's`,
				goals: ['analyseAirco'],
			},
		],
		setup: pick(['calculateClosedCycle', 'createClosedCycleEnergyOverview', 'calculateWithEfficiency', 'calculateWithCOP', 'findFridgeTemperatures', 'analyseAirco'], 1, [3, 3, 1, 1, 1, 2]),
	},

	promo: {
		name: 'Processen en Modelleren',
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
				name: 'Gesloten systemen en kringprocessen',
				goals: ['analyseClosedCycle'],
			},
			{
				name: 'Open systemen en enthalpie',
				goals: ['analyseOpenCycle'],
			},
			{
				name: 'Entropie en de tweede hoofdwet',
				goals: ['calculateMissedWork'],
			},
			{
				name: 'Gasturbines',
				goals: ['analyseGasTurbine'],
			},
			{
				name: 'Dampen en diagrammen',
				goals: ['useVaporFraction', 'determineRefrigerantProcess'],
			},
			{
				name: 'Stoomturbines',
				goals: ['analyseRankineCycle'],
			},
			{
				name: 'Koelmachines en warmtepompen',
				goals: ['analyseCoolingCycle'],
			},
		],
		setup: pick(['calculateClosedCycle', 'createClosedCycleEnergyOverview', 'calculateOpenCycle', 'createOpenCycleEnergyOverview', 'calculateWithEfficiency', 'calculateWithCOP', 'useIsentropicEfficiency', 'massFlowTrick', 'createRankineCycleOverview', 'useVaporFraction', 'createCoolingCycleOverview'], 1, [2, 2, 2, 2, 1, 1, 2, 2, 2, 1, 2]),
	},

	dlwmpn: {
		name: 'Deeltijd: Modelleren en Processen',
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
				name: 'Thermodynamische processen',
				goals: ['calculateProcessStep', 'calculateWithInternalEnergy'],
			},
			{
				name: 'Gesloten systemen en kringprocessen',
				goals: ['analyseClosedCycle'],
			},
			{
				name: 'Open systemen en enthalpie',
				goals: ['analyseOpenCycle'],
			},
			{
				name: 'Entropie en de tweede hoofdwet',
				goals: ['calculateMissedWork'],
			},
			{
				name: 'Gasturbines',
				goals: ['analyseGasTurbine'],
			},
			{
				name: 'Dampen en diagrammen',
				goals: ['useVaporFraction', 'determineRefrigerantProcess'],
			},
			{
				name: 'Stoomturbines',
				goals: ['analyseRankineCycle'],
			},
			{
				name: 'Koelmachines en warmtepompen',
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