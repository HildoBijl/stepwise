const createExerciseLoaders = require('./Exercise')

// Create the data loaders. While doing so, pass previously generated data loaders to the next ones, so they can use it.
module.exports = context => {
	let dataLoaders = {}
	dataLoaders = { ...dataLoaders, ...createExerciseLoaders(context, dataLoaders) }
	return dataLoaders
}
