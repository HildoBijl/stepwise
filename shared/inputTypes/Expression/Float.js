const { decimalSeparator } = require('../../settings')

const Constant = require('./abstracts/Constant')
console.log(Constant)

const Parent = Constant
const defaultSO = { ...Parent.defaultSO }

class Float extends Parent {
	constructor(SO) {
		if (typeof SO === 'string')
			SO = { value: parseFloat(SO.replace(decimalSeparator, '.')) }
		if (typeof SO === 'number')
			SO = { value: SO }
		super(SO)
	}

	hasFloat() {
		return true
	}
}
Float.defaultSO = defaultSO
Float.type = 'Float'
module.exports = Float