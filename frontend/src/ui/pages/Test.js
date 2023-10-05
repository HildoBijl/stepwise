import React, { useState } from 'react'

import { Plurals, Check } from 'i18n'
import { getHexColor } from 'ui/theme'
import { Par, Head, M, BM } from 'ui/components'

import CAS from 'step-wise/CAS'

import { Float } from 'step-wise/inputTypes/Float'
import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'

import { useLanguage, useSetLanguage, Translation } from 'i18n'

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

	const [months, setMonths] = useState(0)

	const name = 'Hildo'
	const age = 34

	const language = useLanguage()
	const setLanguage = useSetLanguage()

	return (
		<>
			<Head>Own language package</Head>
			<Par>Current setting: <strong>{language}</strong></Par>
			<button type="button" onClick={() => setLanguage('de')}>German</button>
			<button type="button" onClick={() => setLanguage('en')}>English</button>
			<button type="button" onClick={() => setLanguage('nl')}>Dutch</button>
			<Translation path="welcome" entry="content.button"><Par><button type="button" onClick={() => setMonths(count => count + 1)}>Increase months</button></Par></Translation>
			<Translation path="welcome" entry="content.text"><Par>Hello! My name is <strong>{{ name }}</strong> <em>Bijl</em> and I'm <strong><em>{age}</em> years</strong> and <Plurals count={months}><strong><Plurals.One>one</Plurals.One><Plurals.Zero>zero</Plurals.Zero><Plurals.Multiple>{months}</Plurals.Multiple></strong> month<Plurals.NotOne>s</Plurals.NotOne></Plurals> old. This is <Check value={months > 5}><Check.True>more than</Check.True><Check.False>not more than</Check.False> five months.</Check></Par></Translation>
			<Translation path="welcome" entry="content.equation"><Par>Hello! Your equation is <BM>{eq}.</BM></Par></Translation>

			<Par>Dit is een testpagina. Hij wordt gebruikt om simpele dingen te testen en te kijken hoe ze werken. Vaak staat er willekeurige zooi op. Zoals vergelijkingen als <M>E = mc^2.</M></Par>
			<Head>Tests</Head>
			<BM>x=\frac(-b\pm\sqrt[2](b^2-4ac))(2a).</BM>
			<BM>{eq}</BM>
		</>
	)
}
