const { expressionEqualityLevels, equationEqualityLevels } = require('../../options')

module.exports = {
	onlyOrderChanges: (correct, input) => correct.equals(input, {
		expression: expressionEqualityLevels.onlyOrderChanges,
		equation: equationEqualityLevels.keepSides,
	}),
	onlyOrderChangesAndSwitch: (correct, input) => correct.equals(input, {
		expression: expressionEqualityLevels.onlyOrderChanges,
		equation: equationEqualityLevels.allowSwitch,
	}),
	equivalent: (correct, input) => correct.equals(input, {
		equation: equationEqualityLevels.allowRewrite,
	}),
}