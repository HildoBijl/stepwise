/* This file defines all courses existing on the website. Each course should have the following properties.
 * - An ID, defined as the object key.
 * - name: a name, for display purposes.
 * - goals: an array of skills with the final course goals, which is the bottom part of the tree.
 * - priorKnowledge: an array of skills that are assumed to already have been mastered. This is the top part of the tree, where it ends for this course.
 * - startingPoints: an array of skills that ARE part of the course, but have NO subskills above them. (Otherwise these subskills can be set as prior knowledge and everything is fine.) These starting skills are not used in the script but serve as unit-test safety check: so we can be sure that the course tree ends here. If later on extra skills are added, then the unit test throws an error, and we don't have a course with suddenly dozens of subskills in it.
 * - blocks: an array of objects with properties
 *   x name: for display purposes, the name of the course.
 *   x goals: an array of skills that should be mastered at the end of this block.
 * That's all there is to it!
 *  
 * ToDo later: put courses in database.
 * Step 1: put user registration of courses into database. So users can subscribe to courses.
 * Step 2: put courses itself in the database too.
 */

const courses = {
	swbasics: {
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
		]
	},
	
	exactd: {
		name: 'Exacte Wetenschap D',
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
				name: 'Een processtap doorrekenen',
				goals: ['calculateProcessStep'],
			},
			{
				name: 'Arbeid en warmte berekenen',
				goals: ['calculateWithInternalEnergy'],
			},
			{
				name: 'Een kringproces doorrekenen',
				goals: ['analyseClosedCycle'],
			},
			{
				name: `Koelmachines en airco's`,
				goals: ['findFridgeTemperatures', 'analyseAirco'],
			},
		],
	},

	promo: {
		name: 'Processen en Modelleren',
		goals: [
			'analyseClosedCycle',
			'analyseOpenCycle',
			'calculateMissedWork',
			'analyseGasTurbine',
			'analyseRankineCycle',
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
				goals: ['useVaporFraction'],
			},
			{
				name: 'Stoomturbines',
				goals: ['analyseRankineCycle'],
			},
			{
				name: 'Koelmachines en warmtepompen',
				goals: [],
			},
		],
	},

	dlwmpn: {
		name: 'Deeltijd: Modelleren en Processen',
		goals: [
			'analyseClosedCycle',
			'analyseOpenCycle',
			'calculateMissedWork',
			'analyseGasTurbine',
			'analyseRankineCycle',
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
				goals: ['useVaporFraction'],
			},
			{
				name: 'Stoomturbines',
				goals: ['analyseRankineCycle'],
			},
			{
				name: 'Koelmachines en warmtepompen',
				goals: [],
			},
		],
	},
}
Object.keys(courses).forEach(key => {
	courses[key].id = key
})

export default courses