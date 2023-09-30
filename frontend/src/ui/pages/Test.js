import React from 'react'
import { useTranslation, Trans } from 'react-i18next'

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

	const { t, i18n } = useTranslation(['translation', 'welcome'])
	const changeLanguage = code => {
		i18n.changeLanguage(code);
	}

	return (
		<>
			<button type="button" onClick={() => changeLanguage('de')}>
				{t('translation:de')}
			</button>
			<button type="button" onClick={() => changeLanguage('en')}>
				{t('translation:en')}
			</button>
			<button type="button" onClick={() => changeLanguage('nl')}>
				{t('translation:nl')}
			</button>
			<Head>{t('welcome:title', 'Hello!')}</Head>
			<Par><Trans i18nKey="welcome:content.text">Welcome at <strong>our place</strong>.</Trans></Par>
			<Par><Trans i18nKey="welcome:content.second">Some <strong>new</strong> stuff.</Trans></Par>
			<Par><Trans i18nKey="welcome:content.third">And an <strong>untranslated</strong> text.</Trans></Par>
			<Par>Dit is een testpagina. Hij wordt gebruikt om simpele dingen te testen en te kijken hoe ze werken. Vaak staat er willekeurige zooi op. Zoals vergelijkingen als <M>E = mc^2.</M></Par>
			<Head>Tests</Head>
			<BM>x=\frac(-b\pm\sqrt[2](b^2-4ac))(2a).</BM>
			<BM>{eq}</BM>
		</>
	)
}
