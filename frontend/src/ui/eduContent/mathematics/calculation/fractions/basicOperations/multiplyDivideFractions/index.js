import React from 'react'

import { Translation } from 'i18n'
import { Par, List, Term, M } from 'ui/components'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>This skill is about understanding how to <Term>multiply and divide fractions</Term>. This includes various situations.
			<List items={[
				<>Multiplying a number by a fraction: <M>2 \cdot \frac(3)(5) = \frac(2 \cdot 3)(5)</M>.</>,
				<>Multiplying two fractions: <M>\frac(2)(3) \cdot \frac(5)(7) = \frac(2 \cdot 5)(3 \cdot 7)</M>.</>,
				<>Dividing a number by fraction: <M>\frac(2)(3/5) = \frac(2 \cdot 5)(3)</M>.</>,
				<>Dividing a fraction by a number: <M>\frac(2/3)(5) = \frac(2)(3 \cdot 5)</M>.</>,
				<>Dividing a fraction by a fraction: <M>\frac(2/3)(5/7) = \frac(2 \cdot 7)(3 \cdot 5)</M>.</>,
			]} />
			Any multiplication/division of fractions should be reduced to a single fraction, where the key is that each factor appears on the correct side of this fraction. Further simplifications are not required.</Par>
	</Translation>
}
