import React, { useRef, useEffect } from 'react'

import { Par, Head } from 'ui/components/containers'
import { M, BM } from 'ui/components/equations'

import EngineeringDiagram from 'ui/edu/content/mechanics/EngineeringDiagram'

import CAS from 'step-wise/CAS'
import { Vector } from 'step-wise/CAS/linearAlgebra'

import { Float } from 'step-wise/inputTypes/Float'
import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'
// import { columnTableInterpolate } from 'step-wise/util/interpolation'
// import stuff from 'step-wise/data/refrigerantProperties/R134A'
// import { getProperties } from 'step-wise/data/refrigerantProperties/support'
// import refr from 'step-wise/data/refrigerantProperties'

window.CAS = CAS

window.Float = Float
window.FloatUnit = FloatUnit



export default function Test() {
	const eq = CAS.asEquation('E=mc^2')
	eq.left.color = '881111'
	eq.right.color = '00bb44'
	eq.color = '4488ff'

	const diagramRef = useRef()
	useEffect(() => {
		const diagram = diagramRef.current

		// Draw beams.
		diagram.drawBeam([
			new Vector(150, 100),
			new Vector(350, 100),
			new Vector(350, 200),
			new Vector(450, 200),
		])
		diagram.drawBeam([
			new Vector(450, 200),
			new Vector(550, 100),
			new Vector(650, 100),
		], { color: 'darkgreen' })

		// Draw hinges.
		diagram.drawHinge(new Vector(450, 200), { color: 'darkred' })

		// Draw supports.
		diagram.drawRollerSupport(new Vector(150, 100), { angle: Math.PI })
		diagram.drawHingeSupport(new Vector(650, 100), { angle: 1 / 4 * Math.PI, color: 'darkgreen' })

		// Draw distances.
		diagram.drawDistance({
			start: new Vector(150, 250),
			end: new Vector(450, 250),
		})
		diagram.drawDistance({
			start: new Vector(450, 250),
			end: new Vector(650, 250),
		})
		diagram.drawDistance({
			start: new Vector(720, 100),
			end: new Vector(720, 200),
		})

		// Draw forces.
		diagram.drawForce({ vector: new Vector(0, 100), end: new Vector(250, 100) }, { color: 'darkred' })
		diagram.drawForce({ vector: new Vector(0, 100), end: new Vector(450, 200) }, { color: 'darkblue' })

		// Draw moments.
		diagram.drawMoment({ position: new Vector(350, 100) }, { color: 'darkblue', opening: Math.PI })
		diagram.drawMoment({ position: new Vector(550, 100), clockwise: true }, { color: 'darkred' })

		// Draw text.
		diagram.drawing.placeElement(<M>L_1 = 6\ (\rm m)</M>, { x: 300, y: 250, horizontalAnchor: 0.5, verticalAnchor: 1, scale: 1.2 })
		diagram.drawing.placeElement(<M>L_2 = 4\ (\rm m)</M>, { x: 550, y: 250, horizontalAnchor: 0.5, verticalAnchor: 1, scale: 1.2 })
		diagram.drawing.placeElement(<M>h = 1\ (\rm m)</M>, { x: 720, y: 150, horizontalAnchor: 0.5, verticalAnchor: 1, scale: 1.2, rotate: 90 })
	}, [diagramRef])

	return (
		<>
			<Par>Dit is een testpagina. Hij wordt gebruikt om simpele dingen te testen en te kijken hoe ze werken. Vaak staat er willekeurige zooi op.</Par>
			<Head>Tests</Head>
			<BM>x=\frac(-b\pm\sqrt[2](b^2-4ac))(2a).</BM>
			<BM>{eq}</BM>
			<EngineeringDiagram ref={diagramRef} maxWidth={800} width={800} height={400} />
		</>
	)
}
