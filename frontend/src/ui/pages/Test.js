import React from 'react'
import { Button } from '@mui/material'

import * as c from '@step-wise/cas'
import { Arc, Axes, Circle, Crosshair, Curve, Drawing, DrawingTarget, Grid, HtmlElement, Line, Plot, PlotArea, Polygon, Rectangle, anchors, useDrawingPointerState } from '@step-wise/drawing'
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
	const plotPoints = [[-3, 7], [-2, 2], [-1, -1], [0, -2], [1, -1], [2, 2], [3, 7]]

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

			<Head>Plot toolbox</Head>
			<Plot
				bounds={{ min: [-3, -2], max: [3, 8] }}
				view={{ type: 'fit', maxWidth: 600, maxHeight: 360, margin: [20, 10] }}
				maxWidth={600}
				style={{ color: '#37474f' }}
				axes={{ x: { ticks: { step: 0.5 } }, y: { ticks: { step: 1.5 } } }}
			>
				<Grid />
				<PlotArea>
					<Curve positions={plotPoints} smoothing={{ mode: 'through' }} stroke="#1565c0" strokeWidth={3} />
				</PlotArea>
				{plotPoints.map((point, index) => <Circle key={index} center={point} radius={{ pixelDistance: 4 }} style={{ fill: '#1565c0' }} />)}
				<Axes x={{ label: <M>x</M> }} y={{ label: <M>f\left(x\right) = x^2</M> }} />
				<Crosshair getPointLabel={([x, y]) => `(${x.toFixed(2)}, ${y.toFixed(2)})`} labelProps={{ style: { background: 'white', border: '1px solid currentColor', borderRadius: 3, padding: '1px 4px' } }} />
			</Plot>

			<Head>Drawing toolbox</Head>
			<Drawing
				view={{ type: 'bounds', bounds: { min: [0, 0], max: [10, 6] }, width: 600, height: 360, margin: 30, yDirection: 'up' }}
				maxWidth={600}
				style={{ color: '#1565c0' }}
			>
				<Rectangle corners={[[0, 0], [10, 6]]} cornerRadius={{ pixelDistance: 12 }} fill="#e3f2fd" stroke="currentColor" strokeWidth={2} style={{ opacity: 0.5 }} />

				<Line endArrow positions={[[1, 1], [3, 4.5], [5, 1.5]]} stroke="#f0897b" strokeWidth={3} />

				<Curve startArrow endArrow positions={[[1, 2], [2.5, 3.5], [4, 2.2], [5.5, 4.2]]} smoothing={{ ratio: 0.8, mode: 'around' }} stroke="#8e24aa" strokeWidth={2} />

				<Polygon positions={[[6.2, 1], [8.8, 1.2], [8, 3.2], [6.5, 2.8]]} fill="#ffcc80" stroke="#ef6c00" strokeWidth={2} />

				<Circle center={[7.5, 4.3]} fill="#ffcdd2" radius={0.7} stroke="#c62828" strokeWidth={2} />

				<Arc center={[7.5, 4.3]} endAngle={Math.PI * 1.75} endArrow radius={1.1} startAngle={Math.PI * 0.25} stroke="#c62828" strokeWidth={3} />

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

				<HtmlElement anchor={anchors.left} position={[4.2, 2.2]} style={{ color: '#263238', fontWeight: 600 }} behind>
					Behind the SVG layer
				</HtmlElement>
				<HtmlElement anchor={anchors.left} position={[4.2, 1.6]} style={{ color: '#263238', fontWeight: 600 }}>
					In front of the SVG layer
				</HtmlElement>

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
