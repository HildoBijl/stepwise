import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you get familiar with the <Term>definition of the power</Term>. It should become intuitive to rewrite <M>2 \cdot 2 \cdot 2</M> to <M>2^3</M>, and equivalently it should be second nature to realize <M>2^3</M> simply means <M>2 \cdot 2 \cdot 2</M>.</Par>
	</Translation>
}
