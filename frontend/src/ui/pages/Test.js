import React from 'react'

import { Par, Head } from 'ui/components/containers'
import { BM } from 'ui/components/equations'

// import Integer from 'step-wise/inputTypes/Expression/Integer'
// import Float from 'step-wise/inputTypes/Expression/Float'
import Variable from 'step-wise/inputTypes/Expression/Variable'
import Product from 'step-wise/inputTypes/Expression/Product'
import Sum from 'step-wise/inputTypes/Expression/Sum'
import { Expression } from 'step-wise/inputTypes/Expression'
import { Equation } from 'step-wise/inputTypes/Equation'

// console.log(Integer.zero.str)
// const a = new Integer({ value: 2 })
// const b = 
// console.log(a.str)
// const b = new Float({ value: -2.6 })
// console.log(b.str)
// const x1 = new Variable('x_1')
// const pi = Variable.pi
// console.log(x1.str)
// console.log(pi.str)

// const p = new Product([
// 	Integer.minusOne,
// 	new Variable('y'),
// 	new Integer(3),
// 	Integer.minusOne,
// 	new Sum([
// 		new Variable('x'),
// 		new Integer(5),
// 	]),
// 	new Sum([
// 		new Variable('y'),
// 		new Variable('x'),
// 		new Integer(3),
// 	]),
// 	new Integer(2),
// ])
// console.log(p.str)
// console.log(p.simplify(simplifyOptions.basic).str)
// console.log(p.simplify(simplifyOptions.forAnalysis).str)
// const e = new Equation({
// 	left: new Variable('x'),
// 	right: p.simplify(simplifyOptions.basic),
// }).multiplyBy(3, true)
// console.log(e.simplify(simplifyOptions.basic).str)

// const a = new Product(['y', 'x']).multiplyBy(2, false)
// console.log(a.str)
// const b = new Product(['x', 'y']).multiplyBy(2, true)
// console.log(b.str)
// console.log(a.equals(b, 0))

const a = new Product([14, 'x'])
const b = new Product([9, 'y'])
const c = new Product(['y', 9])
// const c = new Equation({ left: a, right: a })
// console.log(c.str)
// console.log(c.subtract(b).str)
// console.log(a.str)
// console.log(a)
// console.log(b.applyMinus().str)
// console.log(c.applyMinus().str)
// console.log(b.applyMinus().equals(c.applyMinus(), Expression.equalityLevels.onlyOrderChanges))
const d = a.add(b, true).subtract(c, false)
console.log(d.str)
console.log(d.simplify(Expression.simplifyOptions.basicClean).str)

export default function Test() {
	return (
		<>
			<Par>Dit is een testpagina. Hij wordt gebruikt om simpele dingen te testen en te kijken hoe ze werken. Vaak staat er willekeurige zooi op.</Par>
			<Head>Tests</Head>
			<BM>x=\frac(-b\pm\sqrt[2](b^2-4ac))(2a).</BM>
		</>
	)
}
