import React, { useRef, useEffect } from 'react'

import { Par, Head } from 'ui/components/containers'
import { BM } from 'ui/components/equations'

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

		// Draw beam.
		diagram.drawBeam([
			new Vector(150, 150),
			new Vector(350, 150),
			new Vector(350, 200),
			new Vector(450, 200),
			new Vector(550, 150),
			new Vector(650, 150),
		])

		// Draw distances.
		diagram.drawDistance({
			start: new Vector(150, 250),
			end: new Vector(650, 250),
		})

		// Draw forces.
		diagram.drawForce({ vector: new Vector(0, 100), end: new Vector(250, 150) }, { color: 'darkred' })
		diagram.drawForce({ vector: new Vector(0, 100), end: new Vector(500, 175) }, { color: 'darkred' })

		// Draw moments.
		diagram.drawMoment({ position: new Vector(150, 150) }, { color: 'darkred' })
		diagram.drawMoment({ position: new Vector(450, 200), clockwise: true }, { color: 'darkred' })

	}, [diagramRef])

	return (
		<>
			<Par>Dit is een testpagina. Hij wordt gebruikt om simpele dingen te testen en te kijken hoe ze werken. Vaak staat er willekeurige zooi op.</Par>
			<Head>Tests</Head>
			<BM>x=\frac(-b\pm\sqrt[2](b^2-4ac))(2a).</BM>
			<BM>{eq}</BM>
			<EngineeringDiagram ref={diagramRef} maxWidth={500} width={800} height={400} />
		</>
	)
}
