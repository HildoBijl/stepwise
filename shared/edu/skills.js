const skills = {
	fillInInteger: {
		name: 'Fill in an integer',
		prerequisites: [],
		continuations: ['summation','multiplication','example'],
		exercises: ['fillInInteger'],
	},
	example: {
		name: 'Example skill',
		prerequisites: ['fillInInteger'],
		continuations: [],
		exercises: ['exampleExercise1'],
	},
	summation: {
		name: 'Summation',
		prerequisites: ['fillInInteger'],
		continuations: ['summationOfMultiplication'],
		exercises: ['summation1'],
	},
	multiplication: {
		name: 'Multiplication',
		prerequisites: ['fillInInteger'],
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
