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

		// Draw distances.
		diagram.drawDistance({
			start: new Vector(100, 320),
			end: new Vector(700, 320),
		})

		const testVector = new Vector(0, 100)
		console.log(`Vector is ${testVector} with magnitude ${testVector.magnitude} and argument ${testVector.argument}`)
		// Draw forces.
		const xValues = [100, 200, 300, 400, 500, 600, 700]
		xValues.forEach(x => diagram.drawForce({ start: new Vector(x, 100), vector: new Vector(0, 100) }, { color: 'red' }))

		// Draw moments.
		diagram.drawMoment({ position: new Vector(150, 250), clockwise: true }, { size: 3, radius: 30 })
		diagram.drawMoment({ position: new Vector(300, 250) }, { size: 8, radius: 50, color: 'green' })
		diagram.drawMoment({ position: new Vector(450, 250) }, { size: 5, radius: 30, color: 'blue' })
		diagram.drawMoment({ position: new Vector(600, 250) }, { size: 5, radius: 50, color: 'orange', opening: Math.PI / 2 })
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
