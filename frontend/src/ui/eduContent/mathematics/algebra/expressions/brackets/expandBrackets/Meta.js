import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you should master <Term>expanding brackets</Term>. If you see a term like <M>-4x\left(2-x\right)</M> you should turn this into <M>-8x+4x^2</M>. This includes simplifying the number multiplications (so <M>-4 \cdot 2</M> becomes <M>8</M>) and turning multiplications of identical factors into powers (so <M>x \cdot x</M> becomes <M>x^2</M>).</Par>
	</Translation>
}
