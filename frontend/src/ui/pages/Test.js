import React from 'react'

// import { getHexColor } from 'ui/theme'
import { Par, Head, M, BM } from 'ui/components'

import * as c from '@step-wise/cas'
import * as m from '@step-wise/math-input-value'
import { Unit, Float, FloatUnit } from '@step-wise/physics-core'

window.c = c
window.m = m
window.asExpression = c.asExpression
window.asEquation = c.asEquation

window.Unit = Unit
window.Float = Float
window.FloatUnit = FloatUnit

export function Test() {
	// const [primary, info, warning] = getHexColor(['primary', 'info', 'warning'])
	const eq = c.asEquation('E=mc^2')

	return (
		<>
			<Par>This is a test page. It's used to test small functionalities and see how they work. Often it contains random left-over stuff. Like silly equations such as <M>E = mc^2.</M></Par>
			<Head>Tests</Head>
			<BM>x=\frac(-b\pm\sqrt[2](b^2-4ac))(2a).</BM>
			<BM>{eq}</BM>
		</>
	)
}
