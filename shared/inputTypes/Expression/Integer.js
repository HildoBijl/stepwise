const Constant = require('./abstracts/Constant')

const Parent = Constant
const defaultSO = { ...Parent.defaultSO }

class Integer extends Parent {
	constructor(SO) {
		if (typeof SO === 'string' || typeof SO === 'number')
			SO = { value: parseInt(SO) }
		super(SO)
	}

	hasFloat() {
		return false
	}
}
Integer.defaultSO = defaultSO
Integer.type = 'Integer'
module.exports = Integer

Integer.zero = new Integer(0)
Integer.one = new Integer(1)
Integer.minusOne = new Integer(-1)