const skills = {
	example: {
		name: 'Example skill',
		prerequisites: [],
		continuations: [],
		exercises: ['exampleExercise1'],
	},
	a: {
		name: 'Child skill A',
		prerequisites: [],
		continuations: ['x'],
		exercises: ['exampleExercise1'],
	},
	b: {
		name: 'Child skill B',
		prerequisites: [],
		continuations: ['x'],
		exercises: ['exampleExercise1'],
	},
	x: {
		name: 'Parent skill X',
		prerequisites: ['a','b'],
		continuations: [],
		exercises: ['exampleExercise1'],
	},
}
Object.keys(skills).forEach(key => skills[key].key = key) // Inform the skills of their own key.
module.exports = skills
