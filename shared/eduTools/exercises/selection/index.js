module.exports = {
	...require('./util'),
	getSelectionRates: require('./selectExercise').getSelectionRates,
	...require('./getExercise'),
}
