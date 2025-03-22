import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>calculate a sum of products</Term>. You will for instance be asked to calculate <M>2 + 3 \cdot \left(7 - 5\right)</M> as the number <M>8</M>. Important here is to determine the order of operations, and then execute the operations in this specific order. Operations include addition, subtraction and multiplication. This skill does not involve fractions, powers and functions.</Par>
	</Translation>
}
