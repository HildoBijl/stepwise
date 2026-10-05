import React from 'react'
import { Button } from '@mui/material'

import * as c from '@step-wise/cas'
import { Arc, Circle, Curve, Drawing, DrawingTarget, HtmlElement, Line, Polygon, Rectangle, anchors, useDrawingPointerState } from '@step-wise/drawing'
import * as m from '@step-wise/math-input-value'
import { Unit, PrecisionNumber, Quantity } from '@step-wise/physics-core'
import { M, BM } from '@step-wise/math-display'

// import { getHexColor } from 'ui/theme'
import { useUser } from 'api'
import { apiAddress } from 'settings'
import { Par, Head } from 'ui/components'

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

			<Head>Drawing toolbox</Head>
			<Drawing
				view={{ type: 'bounds', bounds: { min: [0, 0], max: [10, 6] }, width: 600, height: 360, margin: 30, yDirection: 'up' }}
				maxWidth={600}
				style={{ color: '#1565c0' }}
			>
				<Rectangle corners={[[0, 0], [10, 6]]} cornerRadius={{ pixelDistance: 12 }} fill="#e3f2fd" stroke="currentColor" strokeWidth={2} />

				<Line positions={[[1, 1], [3, 4.5], [5, 1.5]]} stroke="#f0897b" strokeWidth={3} />

				<Curve positions={[[1, 2], [2.5, 3.5], [4, 2.2], [5.5, 4.2]]} smoothing={{ distance: 0.7, mode: 'around' }} stroke="#8e24aa" strokeWidth={3} />

				<Polygon positions={[[6.2, 1], [8.8, 1.2], [8, 3.2], [6.5, 2.8]]} fill="#ffcc80" stroke="#ef6c00" strokeWidth={2} />

				<Circle center={[7.5, 4.3]} fill="#ffcdd2" radius={0.7} stroke="#c62828" strokeWidth={2} />

				<Arc center={[7.5, 4.3]} startAngle={Math.PI * 0.25} endAngle={Math.PI * 1.75} radius={1.1} stroke="#c62828" strokeWidth={3} />

				<HtmlElement anchor={anchors.topLeft} position={[0.8, 5.2]} style={{ color: '#263238', fontWeight: 600 }} target="test-html-element">
					Ordinary <DrawingTarget target="test-html-text">HTML</DrawingTarget> inside the drawing
				</HtmlElement>
				<Line
					positions={[
						{ target: 'test-html-text', anchor: anchors.bottomLeft, pixelOffset: [0, -2] },
						{ target: 'test-html-text', anchor: anchors.bottomRight, pixelOffset: [0, -2] },
					]}
					stroke="#263238"
					strokeWidth={2}
				/>

				<HtmlElement
					anchor={anchors.left}
					position={{ target: 'test-html-element', anchor: anchors.right, pixelOffset: [80, 0] }}
					scale={1.25}
					style={{ color: '#263238' }}
					target="test-equation"
				>
					<M>E = mc^2</M>
				</HtmlElement>
				<Line
					positions={[
						{ target: 'test-html-element', anchor: anchors.right },
						{ target: 'test-equation', anchor: anchors.left },
					]}
					stroke="#607d8b"
					strokeWidth={1.5}
				/>

				<PointerMarker />
			</Drawing>
		</>
	)
}

function PointerMarker() {
	const { drawingPosition, isInside } = useDrawingPointerState()
	if (!isInside || drawingPosition === undefined) return null
	return <Circle center={drawingPosition} fill="#43a047" radius={{ pixelDistance: 7 }} stroke="#1b5e20" strokeWidth={2} />
}

function startSurfConextSignIn(identityProvider) {
	const providerPath = identityProvider ? `/${identityProvider}` : ''
	const redirect = window.location.pathname + window.location.search
	window.location.href = `${apiAddress}/auth/surfconext/initiate${providerPath}?redirect=${encodeURIComponent(redirect)}`
}
