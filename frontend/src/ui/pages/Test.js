import React from 'react'

import { Par, Head } from 'ui/components/containers'
import { BM } from 'ui/components/equations'

import CAS, { Variable, Integer, Fraction } from 'step-wise/CAS'

console.log(CAS)

const a = new Variable('x')
console.log(a)
const b = new Integer(3)
const c = new Integer(5)
console.log(a.applyMinus().add(b).toPower(c).str)
console.log(new Fraction(a.add(c.applyMinus()), b).str)

// import Integer from 'step-wise/inputTypes/Expression/Integer'
// import Float from 'step-wise/inputTypes/Expression/Float'
// import Variable from 'step-wise/inputTypes/Expression/Variable'
// import Product from 'step-wise/inputTypes/Expression/Product'
// import Sum from 'step-wise/inputTypes/Expression/Sum'
// import Fraction from 'step-wise/inputTypes/Expression/functions/Fraction'
// import Power from 'step-wise/inputTypes/Expression/functions/Power'
// import { Expression } from 'step-wise/inputTypes/Expression'
// import { Equation } from 'step-wise/inputTypes/Equation'
// import { asExpression } from 'step-wise/inputTypes/Expression/interpreter/fromString'

// const a = asExpression('mgh+5mv^2+E')
// console.log(a.str)
// const b = a.pullOutsideBrackets('m')
// console.log(b)
// console.log(b.str)

// const a = new Fraction(new Variable('a'), new Variable('d'))
// const b = new Fraction(new Variable('c'), new Variable('d'))
// const c = a.add(b)
// console.log(c.str)
// console.log(c.simplify(Expression.simplifyOptions.forAnalysis).str)

export default function Test() {
	return (
		<>
			<Par>Dit is een testpagina. Hij wordt gebruikt om simpele dingen te testen en te kijken hoe ze werken. Vaak staat er willekeurige zooi op.</Par>
			<Head>Tests</Head>
			<BM>x=\frac(-b\pm\sqrt[2](b^2-4ac))(2a).</BM>
		</>
	)
}
