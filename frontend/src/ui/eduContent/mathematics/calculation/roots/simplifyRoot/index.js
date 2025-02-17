import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>simplify roots</Term>. An expression like <M>\sqrt(12)</M> can for instance be written as <M>2\sqrt(3)</M> and similarly <M>\sqrt[3](150)</M> is simplified to <M>5\sqrt[3](6)</M>. Effectively, this skill is about pulling out (or pulling in) factors from roots, including both square roots and higher-power roots. It does not include roots within roots.</Par>
	</Translation>
}
