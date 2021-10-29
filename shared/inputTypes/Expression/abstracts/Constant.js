// The Constant class is an abstract class inherited by classes like Integer and Float in the CAS.

import { decimalSeparatorTex } from '../../../settings'
import { isInt } from '../../../util/numbers'

import Expression from './Expression'
import Integer from '../Integer'
import Float from '../Float'

const Parent = Expression
const defaultSO = { ...Parent.defaultSO, value: 0 }

export default class Constant extends Parent {
	constructor(SO) {
		super(SO)

		// This class may not be instantiated.
		if (this.constructor === Constant)
			throw new TypeError(`Abstract class "Constant" may not be instantiated directly.`)
	}

	toString() {
		return this.toNumber().toString()
	}

	toTex() {
		return this.str.replace('.', decimalSeparatorTex)
	}

	requiresBracketsFor(level) {
		if (this.value >= 0)
			return false
		if (level === Expression.bracketLevels.addition || level === Expression.bracketLevels.multiplication)
			return false
		return true
	}

	requiresPlusInSum() {
		return this.value >= 0
	}

	dependsOn() {
		return false
	}

	getVariableStrings() {
		return new Set() // Empty set: there are no variables.
	}

	substituteBasic() {
		return this.clone() // A constant does not change upon substitution.
	}

	applyMinus() {
		return Constant.toNumber(-this.toNumber())
	}

	isNumeric() {
		return true
	}

	toNumber() {
		return this.value
	}

	getDerivativeBasic() {
		return Integer.zero // The derivative of a constant is always zero.
	}

	simplifyBasic() {
		return this // You cannot simplify a number. It's as simple as it gets.
	}

	equalsBasic(expression, level) {
		if (!(expression instanceof Constant))
			return false
		return expression.toNumber() === this.toNumber()
	}

	static toNumber(number) {
		if (isInt(number)) {
			return new Integer(number)
		}
		return new Float(number)
	}
}
Constant.defaultSO = defaultSO
Constant.type = 'Constant'
