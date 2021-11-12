const { expressionEqualityLevels } = require('../../options')

module.exports = {
	exactEqual: (correct, input) => correct.equals(input, expressionEqualityLevels.exact),
	onlyOrderChanges: (correct, input) => correct.equals(input, expressionEqualityLevels.onlyOrderChanges),
	equivalent: (correct, input) => correct.equals(input, expressionEqualityLevels.equivalent),
	constantMultiple: (correct, input) => correct.equals(input, expressionEqualityLevels.constantMultiple),
}