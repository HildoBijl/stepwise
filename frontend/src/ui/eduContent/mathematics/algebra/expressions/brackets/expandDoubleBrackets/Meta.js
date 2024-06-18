import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>expand double brackets</Term>. If we multiply a sum within brackets by another sum within brackets, like in <M>\left(2x+3\right)\left(4x+5\right)</M>, you should be able to write this without brackets. In this example this results in <M>8x^2 + 22x + 15</M>. This skill also includes somewhat more complicated terms in the sums inside said brackets and/or larger sums with more terms.</Par>
	</Translation>
}
