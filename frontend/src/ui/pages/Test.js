import React, { useEffect, useRef, useState } from 'react'

import { Par, Head } from 'ui/components/containers'
import { M, BM } from 'ui/components/equations'

import EngineeringDiagram, { PositionedElement, Group, Distance, Force, Moment, Beam, Hinge, HingeSupport, RollerSupport } from 'ui/edu/content/mechanics/EngineeringDiagram'

import CAS from 'step-wise/CAS'

import { Float } from 'step-wise/inputTypes/Float'
import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'

window.CAS = CAS

window.Float = Float
window.FloatUnit = FloatUnit

export default function Test() {
	const eq = CAS.asEquation('E=mc^2')
	eq.left.color = '881111'
	eq.right.color = '00bb44'
	eq.color = '4488ff'

	const [x, setX] = useState(0)
	useEffect(() => {
		const interval = setInterval(() => setX(x => x + 1), 10)
		return () => clearInterval(interval)
	}, [setX])

	const svgContents = <>
		<Group style={{ opacity: 0.6 + 0.4 * Math.sin(x / 50) }}>
			<Beam points={[[150, 100], [350, 100], [350, 200], [450, 200]]} />
			<Force points={{ vector: [0, 80], end: [250 + 50 * Math.sin(x / 20), 100] }} color="darkred" />
			<Moment position={[350, 100]} color="darkblue" opening={Math.PI - x / 100} />
			<RollerSupport position={[150, 100]} angle={Math.PI} />
		</Group>

		<Group>
			<Beam points={[[450, 200], [550, 100], [650, 100]]} color="darkgreen" />
			<HingeSupport position={[650, 100]} angle={Math.PI / 4 * (1 + Math.sin(x / 20))} color="darkgreen" />
			<Moment position={[550, 100]} color="darkred" clockwise={true} />
		</Group>

		<Hinge position={[450, 200]} color="darkred" />
		<Force points={{ vector: [0, 150], end: [450, 200] }} color="darkblue" />

		<Distance points={{ start: [150, 250], end: [450, 250] }} />
		<Distance points={{ start: [450, 250], end: [650, 250] }} />
		<Distance points={{ start: [720, 100], end: [720, 200] }} />
	</>

	const htmlContents = <>
		<PositionedElement position={[300 + 20 * Math.sin(x / 30), 250]} anchor={[0.5, 1]} scale={1.2} ><M>L_1 = 3\ (\rm m)</M></PositionedElement>
		<PositionedElement position={[550 + 20 * Math.sin(x / 40), 250]} anchor={[0.5, 1]} scale={1.2}><M>L_2 = 2\ (\rm m)</M></PositionedElement>
		<PositionedElement position={[720, 150]} anchor={[0.5, 1]} scale={1.2} rotate={Math.PI / 2}><M>h = 1\ (\rm m)</M></PositionedElement>
	</>

	const ref = useRef()
	return (
		<>
			<Par>Dit is een testpagina. Hij wordt gebruikt om simpele dingen te testen en te kijken hoe ze werken. Vaak staat er willekeurige zooi op.</Par>
			<Head>Tests</Head>
			<BM>x=\frac(-b\pm\sqrt[2](b^2-4ac))(2a).</BM>
			<BM>{eq}</BM>
			<EngineeringDiagram
				ref={ref}
				maxWidth={800}
				width={800}
				height={300}
				svgContents={svgContents}
				htmlContents={htmlContents}
			/>
		</>
	)
}
