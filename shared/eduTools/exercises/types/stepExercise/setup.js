const { and } = require('../../../../skillTracking')

// addSetupFromSteps takes an exercise metaData object and adds a set-up parameter based on the provided steps, assuming none exists yet. (If one exists, this function does nothing, unless overwrite is specifically set to true.) It modifies the given metaData object and also returns it.
function addSetupFromSteps(metaData, overwrite = false) {
	if (!metaData.setup || overwrite)
		metaData.setup = getSetupFromSteps(metaData.steps)
	return metaData
}
module.exports.addSetupFromSteps = addSetupFromSteps

// getSetupFromSteps receives steps and turns it into a set-up.
function getSetupFromSteps(steps) {
	if (!steps || !Array.isArray(steps))
		throw new Error(`Invalid getSetupFromSteps call: expected a steps array, but received "${steps}".`)
	return and(...steps.flat().filter(x => !!x))
}
module.exports.getSetupFromSteps = getSetupFromSteps
