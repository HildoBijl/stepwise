const skills = {
	example: {
		title: 'Example skill',
		prerequisites: [],
		continuations: [],
		exercises: ['exampleExercise1'],
	},
	a: {
		title: 'Child skill A',
		prerequisites: [],
		continuations: ['x'],
	},
	b: {
		title: 'Child skill B',
		prerequisites: [],
		continuations: ['x'],
	},
	x: {
		title: 'Parent skill X',
		prerequisites: ['a','b'],
		continuations: [],
	},
}
Object.keys(skills).forEach(key => skills[key].key = key) // Inform the skills of their own key.
module.exports = {
	skills
}
