import React, { useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'

import { Plurals } from 'i18n'
import { getHexColor } from 'ui/theme'
import { Par, Head, M, BM } from 'ui/components'

import CAS from 'step-wise/CAS'

import { Float } from 'step-wise/inputTypes/Float'
import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'

import { useLanguage, useSetLanguage, Translation, loadLanguageFile } from 'i18n'

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

	const [months, setCount] = useState(0)

	// const { t, i18n } = useTranslation(['translation', 'welcome'])
	// const changeLanguage = code => {
	// 	i18n.changeLanguage(code);
	// }
	const name = 'Hildo'
	const age = 34
	const days = 5

	const language = useLanguage()
	const setLanguage = useSetLanguage()

	return (
		<>
			<Head>Own language package</Head>
			<button type="button" onClick={async () => {
				console.log('Loading...')
				const res = await loadLanguageFile('de', 'welcome')
				console.log(res)
				// const lng = 'de'
				// const ns = 'welcome'
				// const options = {				}
				// const url = `/locales/${lng}/${ns}.json`
				// const callback = (...args) => console.log(args)
				// const payload = undefined
				// request(url, payload, (err, res) => {
				// 	if (res && ((res.status >= 500 && res.status < 600) || !res.status)) return callback('failed loading ' + url + '; status code: ' + res.status, true /* retry */)
				// 	if (res && res.status >= 400 && res.status < 500) return callback('failed loading ' + url + '; status code: ' + res.status, false /* no retry */)
				// 	if (!res && err && err.message && err.message.indexOf('Failed to fetch') > -1) return callback('failed loading ' + url + ': ' + err.message, true /* retry */)
				// 	if (err) return callback(err, false)

				// 	let ret, parseErr
				// 	try {
				// 		if (typeof res.data === 'string') {
				// 			console.log(res.data)
				// 			ret = JSON.parse(res.data)
				// 			console.log(ret)
				// 		} else { // fallback, which omits calling the parse function
				// 			ret = res.data
				// 		}
				// 	} catch (e) {
				// 		parseErr = 'failed parsing ' + url + ' to json'
				// 	}
				// 	if (parseErr) return callback(parseErr, false)
				// 	callback(null, ret)
				// }, options)
			}}>Load!</button>
			<Par>Current setting: <strong>{language}</strong></Par>
			<button type="button" onClick={() => setLanguage('de')}>German</button>
			<button type="button" onClick={() => setLanguage('en')}>English</button>
			<button type="button" onClick={() => setLanguage('nl')}>Dutch</button>
			<Translation path="welcome" entry="content.text">Test <Par>Name: {{name}}<br/>Age: <strong>{age} years</strong></Par></Translation>
			{/* <Translation path="welcome" entry="content.text"><Par>Good morning <strong>{name}</strong>, you are {age} years and {months} months old!</Par></Translation> */}
			{/* <Head>I18n Package</Head>
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
			<Par><Trans i18nKey="welcome:content.text">Welcome at <strong>our place</strong>.</Trans></Par> */}
			{/* <Par><Trans i18nKey="welcome:content.second">Some <strong>new</strong> stuff.</Trans></Par>
			<Par><Trans i18nKey="welcome:content.third">And an <strong>untranslated</strong> text.</Trans></Par> */}

			{/* <Par><Outer><Trans i18nKey="welcome:name"><Intermediate>Hello <strong>dear</strong> {{ name }}. You are {{ age }} years and {{ months }} months and {{ days }} days old. Your equation is <BM>{{ eq }}.</BM></Intermediate></Trans></Outer></Par> */}

			{/* <Par><button type="button" onClick={() => setCount(count => count + 1)}>Increase</button> The button has been clicked <Plurals count={months}><Plurals.One>one</Plurals.One><Plurals.Zero>zero</Plurals.Zero><Plurals.Multiple>{months}</Plurals.Multiple> time<Plurals.NotOne>s</Plurals.NotOne></Plurals>.</Par> */}

			{/* <Par><button type="button" onClick={() => setCount(count => count + 1)}>Increase</button> <Trans i18nKey="welcome:content.pluralTest" count={count}>The button has been clicked <Plurals count={count}><Plurals.One>one</Plurals.One><Plurals.Zero>zero</Plurals.Zero><Plurals.Multiple>{{ count }}</Plurals.Multiple> time<Plurals.NotOne>s</Plurals.NotOne></Plurals>.</Trans></Par> */}

			<Par>Dit is een testpagina. Hij wordt gebruikt om simpele dingen te testen en te kijken hoe ze werken. Vaak staat er willekeurige zooi op. Zoals vergelijkingen als <M>E = mc^2.</M></Par>
			<Head>Tests</Head>
			<BM>x=\frac(-b\pm\sqrt[2](b^2-4ac))(2a).</BM>
			<BM>{eq}</BM>
		</>
	)
}

// function Outer({ children }) {
// 	// console.log(children)

// 	// window.tes = children
// 	return children
// }

// function Intermediate({ children }) {
// 	// console.log(children)
// 	// window.tes2 = children
// 	return children
// }
