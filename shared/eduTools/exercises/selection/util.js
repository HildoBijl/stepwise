const { ensureSetup } = require('@step-wise/skill-setup')

// getDifficulty takes the data object of an exercise and returns the difficulty, in the form of a setup object.
function getDifficulty(data) {
	return ensureSetup(data.setup || data.skill)
}
module.exports.getDifficulty = getDifficulty
