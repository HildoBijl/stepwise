const { and } = require('../../../../skillTracking')

// addSetupFromSteps takes an exercise metaData object and adds a set-up parameter based on the provided steps, assuming none exists yet. (If one exists, this function does nothing, unless overwrite is specifically set to true.) It modifies the given metaData object and also returns it.
function addSetupFromSteps(metaData, overwrite = false) {
	if (!metaData.steps)
		throw new Error(`Invalid addSetupFromSteps call: expected a steps parameter in the exercise metaData, but this was not present.`)
	if (!metaData.setup || overwrite)
	metaData.setup = and(...metaData.steps.flat().filter(x => !!x))
	return metaData
}
module.exports.addSetupFromSteps = addSetupFromSteps
