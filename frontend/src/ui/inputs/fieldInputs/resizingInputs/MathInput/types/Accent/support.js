import { isLetter } from '@step-wise/utils'

import { greekAlphabet } from 'ui/form'

export function isAcceptableChar(key) {
	return isLetter(key) || greekAlphabet[key] !== undefined
}

export function filterAcceptableChar(str) {
	return str.split('').filter(isAcceptableChar).join('')
}
