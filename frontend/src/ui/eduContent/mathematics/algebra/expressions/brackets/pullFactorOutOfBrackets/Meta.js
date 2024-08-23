import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>pull a factor out of brackets</Term>. If you see an expression like <M>8x^2 - 12x</M> you will be able to pull a factor <M>4</M> and a factor <M>x</M> out of brackets to wind up with <M>4x\left(2x - 3\right)</M>. This includes understanding the reasoning behind why this works: writing the expression as a fraction and subsequently splitting the fraction and simplifying the result. The skill does not include recognizing which factor would be wise to pull out of the brackets.</Par>
	</Translation>
}
