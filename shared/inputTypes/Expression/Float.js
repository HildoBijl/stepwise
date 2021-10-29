import { decimalSeparator } from '../../settings'

import Constant from './abstracts/Constant'

const Parent = Constant
const defaultSO = { ...Parent.defaultSO }

export default class Float extends Parent {
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
