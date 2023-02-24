// Part is the set-up requiring the user to do only do a skill a part of the times. 

const { ensureNumber } = require('../../../util/numbers')

const { oneMinus, multiplyByConstant } = require('../../polynomials')

const { SkillItemSetup } = require('../fundamentals')

const { And } = require('./And')
const { Or } = require('./Or')

class Part extends SkillItemSetup {
	constructor(skill, part) {
		super(skill)
		this.part = ensureNumber(part)
		if (this.part < 0 || this.part > 1)
			throw new Error(`Invalid skill part: the "part" parameter of the skill set-up must be a number between 0 and 1. This is not the case: a value of "${this.part}" was given.`)
	}

	isDeterministic() {
		return false
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
		throw new Error(`Invalid polynomial matrix request: cannot determine the polynomial matrix of a Part set-up inside a set-up of type "${parent?.constructor?.name}". Either an "And" or "Or" set-up is expected around it.`)
	}
}
module.exports.Part = Part

module.exports.part = (...args) => new Part(...args)
