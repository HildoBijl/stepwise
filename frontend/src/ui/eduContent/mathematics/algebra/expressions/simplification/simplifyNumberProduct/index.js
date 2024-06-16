import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>simplify a multiplication of numbers</Term> inside an expression. For instance when seeing <M>2 \cdot 3 \cdot x</M> you should immediately realize, "Oh, that's just <M>6x</M>." This also includes dealing with negative numbers: <M>-2 \cdot \left(-3\right) \cdot \left(-x\right)</M> should be adequately turned into <M>-6x</M>.</Par>
	</Translation>
}
