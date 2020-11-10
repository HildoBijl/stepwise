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
		goals: ['analyseCycle'],
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
				goals: ['analyseCycle'],
			},
		],
	},
	// promo: {
	// 	name: 'Processen en Modelleren',
	// 	goals: ['calculateProcessStep'],
	// 	priorKnowledge: ['gasLaw', 'recognizeProcessTypes', 'poissonsLaw'],
	// 	blocks: [
	// 		{
	// 			name: 'Basisvaardigheden',
	// 			goals: ['calculateProcessStep'],
	// 		}
	// 	],
	// },
}
Object.keys(courses).forEach(key => {
	courses[key].id = key
})

export default courses