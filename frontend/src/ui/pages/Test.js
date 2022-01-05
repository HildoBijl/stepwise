import React from 'react'

import { Par, Head } from 'ui/components/containers'
import { BM } from 'ui/components/equations'

import CAS from 'step-wise/CAS'

import { Float } from 'step-wise/inputTypes/Float'
import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'
// import { columnTableInterpolate } from 'step-wise/util/interpolation'
// import stuff from 'step-wise/data/refrigerantProperties/R134A'
// import { getProperties } from 'step-wise/data/refrigerantProperties/support'
// import refr from 'step-wise/data/refrigerantProperties'

window.CAS = CAS

window.Float = Float
window.FloatUnit = FloatUnit

// console.log(stuff)
// window.int = columnTableInterpolate
// window.stuff = stuff
// window.refr = refr
// const p = new FloatUnit('10.7 bar')
// // const T = new FloatUnit('40.5 dC')
// const h = new FloatUnit('420 kJ/kg')
// // console.log(getBoilingTemperature(p, stuff).str)
// // window.res = getBoilingPressure(T, stuff)
// // console.log(getBoilingPressure(T, stuff).str)
// // window.fin = getVaporProperties(T, 0.7, stuff)
// // window.sti = shiftingTableInterpolate
// // window.som = shiftingTableInterpolate(new FloatUnit('12.4 bar').makeExact(), 'pressure', new FloatUnit('40 dC'), 'temperature', stuff.dataByPressure, ['enthalpy', 'entropy'])
// // console.log(window.som)
// window.res = getProperties(p, h, stuff)
// console.log(window.res)
// console.log(Object.values(window.res).map(x => x.str || x))



export default function Test() {
	const eq = CAS.asEquation('E=mc^2')
	eq.left.color = '881111'
	eq.right.color = '00bb44'
	eq.color = '4488ff'

	return (
		<>
			<Par>Dit is een testpagina. Hij wordt gebruikt om simpele dingen te testen en te kijken hoe ze werken. Vaak staat er willekeurige zooi op.</Par>
			<Head>Tests</Head>
			<BM>x=\frac(-b\pm\sqrt[2](b^2-4ac))(2a).</BM>
			<BM>{eq}</BM>
		</>
	)
}
