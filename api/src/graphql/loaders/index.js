const createCourseLoaders = require('./Course')
const createSkillLoaders = require('./Skill')

// Create the data loaders. While doing so, pass previously generated data loaders to the next ones, so they can use it.
module.exports = context => {
	let dataLoaders = {}
	dataLoaders = { ...dataLoaders, ...createCourseLoaders(context, dataLoaders) }
	dataLoaders = { ...dataLoaders, ...createSkillLoaders(context, dataLoaders) }
	return dataLoaders
}
