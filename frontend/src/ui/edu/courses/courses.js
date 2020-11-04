// This file defines all courses existing on the website. It should be all put into the database later on.

const courses = {
	swbasics: {
		title: 'Step-Wise Basics',
		goals: ['fillInInteger', 'fillInFloat', 'fillInUnit', 'summationAndMultiplication'],
		priorKnowledge: [],
		blocks: [
			{
				title: 'Antwoorden invoeren',
				goals: ['fillInInteger', 'fillInFloat', 'fillInUnit'],
			},
			{
				title: 'Demo stapsgewijze oefeningen',
				goals: ['summationAndMultiplication'],
			},
		]
	},
	exactd: {
		title: 'Exacte Wetenschap D',
		goals: ['calculateProcessStep', 'calculateHeatAndWork'],
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
				title: 'De gaswet',
				goals: ['gasLaw'],
			},
			{
				title: 'Een processtap doorrekenen',
				goals: ['calculateProcessStep'],
			},
			{
				title: 'De warmte en arbeid berekenen',
				goals: ['calculateHeatAndWork'],
			},
		],
	},
	promo: {
		title: 'Processen en Modelleren',
		goals: ['calculateProcessStep'],
		priorKnowledge: ['gasLaw', 'recognizeProcessTypes', 'poissonsLaw'],
		blocks: [
			{
				title: 'Basisvaardigheden',
				goals: ['calculateProcessStep'],
			}
		],
	},
}
Object.keys(courses).forEach(key => {
	courses[key].name = key
})

export default courses