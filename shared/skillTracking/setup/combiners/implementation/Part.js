// Part is the combiner requiring the user to do only do a skill a part of the times. 

const { ensureNumber } = require('../../../../util/numbers')

const { oneMinus, multiplyByConstant, multiply } = require('../support')
const { SkillItemCombiner } = require('../fundamentals')

const { And } = require('./And')
const { Or } = require('./Or')

class Part extends SkillItemCombiner {
	constructor(skill, part) {
		super(skill)
		this.part = ensureNumber(part)
		if (this.part < 0 || this.part > 1)
			throw new Error(`Invalid skill part: the "part" parameter of the skill combiner must be a number between 0 and 1. This is not the case: a value of "${this.part}" was given.`)
	}

	getPolynomialMatrix(parent = null) {
		// Get the polynomial matrix of the given skill.
		const matrix = this.skill.getPolynomialMatrix()

		// For a Repeat inside an And, use "1 - p*(1 - x)" with "x" the skill polynomial.
		if (parent instanceof And)
			return oneMinus(multiplyByConstant(oneMinus(matrix), this.part))

		// For a Repeat inside an And, use "px" with "x" the skill polynomial.
		if (parent instanceof Or)
			return multiplyByConstant(matrix, this.part)

		// Unknown parent type. Something is wrong.
		throw new Error(`Invalid polynomial matrix request: cannot determine the polynomial matrix of a Part combiner inside a combiner of type "${parent?.constructor?.name}". Either an "And" or "Or" combiner is expected around it.`)
	}
}
module.exports.Part = Part
