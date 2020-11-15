// This file defines all courses existing on the website. It should be all put into the database later on.

const courses = {
	swbasics: {
		name: 'Step-Wise Basics',
		goals: ['fillInInteger', 'fillInFloat', 'fillInUnit', 'summationAndMultiplication'],
		priorKnowledge: [],
		blocks: [
			{
				name: 'Antwoorden invoeren',
				goals: ['fillInInteger', 'fillInFloat', 'fillInUnit'],
			},
			{
				name: 'Demo stapsgewijze oefeningen',
				goals: ['summationAndMultiplication'],
			},
		]
	},
	exactd: {
		name: 'Exacte Wetenschap D',
		goals: ['analyseClosedCycle'],
		priorKnowledge: [
			'calculateWithPressure',
			'calculateWithVolume',
			'calculateWithTemperature',
			'calculateWithMass',
			'solveLinearEquation',
			'solveExponentEquation',
		],
		blocks: [
			{
				name: 'De gaswet',
				goals: ['gasLaw'],
			},
			{
				name: 'Een processtap doorrekenen',
				goals: ['calculateProcessStep'],
			},
			{
				name: 'Warmte en arbeid berekenen',
				goals: ['calculateHeatAndWork'],
			},
			{
				name: 'Een cyclus doorrekenen',
				goals: ['analyseClosedCycle'],
			},
		],
	},
	promo: {
		name: 'Processen en Modelleren',
		goals: ['analyseClosedCycle'],
		priorKnowledge: ['calculateProcessStep', 'calculateHeatAndWork'],
		blocks: [
			{
				name: 'Gesloten systemen en kringprocessen',
				goals: ['analyseClosedCycle'],
			},
			{
				name: 'Open systemen en enthalpie',
				goals: [],
			},
			{
				name: 'Entropie en de tweede hoofdwet',
				goals: [],
			},
			{
				name: 'Gasturbines',
				goals: [],
			},
			{
				name: 'Dampen en diagrammen',
				goals: [],
			},
			{
				name: 'Stoomturbines',
				goals: [],
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