const skills = {
	fillIn: {
		name: 'Fill in x',
		prerequisites: [],
		continuations: [],
		exercises: ['fillIn'],
	},
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
		exercises: ['summationOfMultiplications1','summationOfMultiplications2'],
	},
}
Object.keys(skills).forEach(key => skills[key].id = key) // Inform the skills of their own id.
module.exports = skills
