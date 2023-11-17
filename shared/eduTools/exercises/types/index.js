module.exports = {
	...require('./simpleExercise'),
	...require('./stepExercise'), // stepExercise may overwrite functions from simpleExercise.
}
