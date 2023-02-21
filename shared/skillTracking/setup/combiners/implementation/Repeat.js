// Repeat is the combiner requiring the user to do a skill successful multiple times in a row. Repeat("X", 3) is short for And("X", "X", "X") and similar for other repeat values.

const { ensureInt } = require('../../../../util/numbers')

const { multiply } = require('../support')
const { SkillItemCombiner } = require('../fundamentals')

class Repeat extends SkillItemCombiner {
	constructor(skill, repeat) {
		super(skill)
		this.repeat = ensureInt(repeat, true, true)
	}

	getPolynomialMatrix() {
		// Get the polynomial matrix of the given skill.
		const matrix = this.skill.getPolynomialMatrix()
		const list = this.getSkillList()
		const matrices = new Array(this.repeat).fill(matrix)
		const lists = new Array(this.repeat).fill(list)
		return multiply(matrices, lists, list).matrix
	}
}
module.exports.Repeat = Repeat
