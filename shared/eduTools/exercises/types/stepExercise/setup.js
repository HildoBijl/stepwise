const { and } = require('../../../../skillTracking')

// addSetupFromSteps takes a skill data object and adds a set-up parameter based on the provided steps, assuming none exists yet. (If one exists, this function does nothing, unless overwrite is specifically set to true.) It modifies the given data object and also returns it.
function addSetupFromSteps(data, overwrite = false) {
	if (!data.steps)
		throw new Error(`Invalid addSetupFromSteps call: expected a steps parameter in the exercise data, but this was not present.`)
	if (!data.setup || overwrite)
		data.setup = and(...data.steps.flat().filter(x => !!x))
	return data
}
module.exports.addSetupFromSteps = addSetupFromSteps
