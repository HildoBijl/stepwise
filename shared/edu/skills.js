const skills = {
	example: {
		name: 'Example skill',
		prerequisites: [],
		continuations: [],
		exercises: ['exampleExercise1'],
	},
	summation: {
		name: 'Summation',
		prerequisites: [],
		continuations: ['summationOfMultiplication'],
		exercises: ['summation1'],
	},
	multiplication: {
		name: 'Multiplication',
		prerequisites: [],
		continuations: ['summationOfMultiplication'],
		exercises: ['multiplication1'],
	},
	summationOfMultiplications: {
		name: 'Summation of multiplications',
		prerequisites: ['summation','multiplication'],
		continuations: [],
		exercises: ['summationOfMultiplications1'],
	},
}
Object.keys(skills).forEach(key => skills[key].key = key) // Inform the skills of their own key.
module.exports = skills
