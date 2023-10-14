import React from 'react'

import { getHexColor } from 'ui/theme'
import { Par, Head, M, BM } from 'ui/components'

import CAS from 'step-wise/CAS'

import { Float } from 'step-wise/inputTypes/Float'
import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'

window.CAS = CAS

window.Float = Float
window.FloatUnit = FloatUnit

export default function Test() {
	const [primary, info, warning] = getHexColor(['primary', 'info', 'warning'])
	const eq = CAS.asEquation('E=mc^2')
	eq.left.color = primary
	eq.right.color = info
	eq.color = warning
	window.eq = eq

	return (
		<>
			<Par>This is a test page. It's used to test small functionalities and see how they work. Often it contains random left-over stuff. Like silly equations such as <M>E = mc^2.</M></Par>
			<Head>Tests</Head>
			<BM>x=\frac(-b\pm\sqrt[2](b^2-4ac))(2a).</BM>
			<BM>{eq}</BM>
		</>
	)
}
