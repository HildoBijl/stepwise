import React from 'react'
import { Button } from '@mui/material'

import * as c from '@step-wise/cas'
import * as m from '@step-wise/math-input-value'
import { Unit, PrecisionNumber, Quantity } from '@step-wise/physics-core'

// import { getHexColor } from 'ui/theme'
import { useUser } from 'api'
import { apiAddress } from 'settings'
import { Par, Head, M, BM } from 'ui/components'

window.c = c
window.m = m
window.asExpression = c.asExpression
window.asEquation = c.asEquation

window.Unit = Unit
window.PrecisionNumber = PrecisionNumber
window.Quantity = Quantity

export function Test() {
	// const [primary, info, warning] = getHexColor(['primary', 'info', 'warning'])
	const eq = c.asEquation('E=mc^2')
	const user = useUser()

	return (
		<>
			<Par>This is a test page. It's used to test small functionalities and see how they work. Often it contains random left-over stuff. Like silly equations such as <M>E = mc^2.</M></Par>
			<Head>SURFconext sign-in</Head>
			{user ?
				<Par>Signed in as {user.name} &lt;{user.email}&gt;</Par> :
				<Par>
					<Button variant='contained' onClick={() => startSurfConextSignIn('eduid')}>EduID sign-in</Button>{' '}
					<Button variant='contained' onClick={() => startSurfConextSignIn()}>General SURFconext sign-in</Button>
				</Par>
			}
			<Head>Tests</Head>
			<BM>x=\frac(-b\pm\sqrt[2](b^2-4ac))(2a).</BM>
			<BM>{eq}</BM>
			<Par>This note shows the CI scripts are using the main branch. Currently we're also using workspaces. And Vite is used as a bundler.</Par>
		</>
	)
}

function startSurfConextSignIn(identityProvider) {
	const providerPath = identityProvider ? `/${identityProvider}` : ''
	const redirect = window.location.pathname + window.location.search
	window.location.href = `${apiAddress}/auth/surfconext/initiate${providerPath}?redirect=${encodeURIComponent(redirect)}`
}
