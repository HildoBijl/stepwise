import React from 'react'

import { Par, Head } from 'ui/components/containers'
import { BM } from 'ui/components/equations'

import CAS from 'step-wise/CAS'

window.CAS = CAS

// const a = CAS.asExpression('2/x+3/x')
// console.log(a.str)
// console.log(a.simplify(CAS.simplifyOptions.forAnalysis).str)

// const b = CAS.asExpression('1+4x+4x^2')
// console.log(b.str)
// console.log(b.isPolynomial())
// console.log(b.isRational())
// console.log(a.isPolynomial())
// console.log(a.isRational())

// const c = CAS.asExpression('a*(b+c*(d+e))^2')
// console.log(c.str)
// console.log(c.simplify(CAS.simplifyOptions.forAnalysis).str)
// console.log(c.isPolynomial())

// const a = CAS.asExpression('2(x+1)*(y+3)')
// const b = CAS.asExpression('3(x+1)*(y+x)')
// console.log(a.str + ' = ' + a.simplify(CAS.simplifyOptions.forAnalysis).str)
// console.log(b.str + ' = ' + b.simplify(CAS.simplifyOptions.forAnalysis).str)

// const a = CAS.asExpression('a/(b+c/(d+e/f))')
// console.log(a.str)
// console.log(a.simplify(CAS.simplifyOptions.forAnalysis).str)
// console.log(a.isPolynomial())
// console.log(a.isRational())

// const a = CAS.asExpression('3xa^2+4x^2a^2-7+5x^3a-2xa^4+ay+axy+3x-4y+8xy')
// console.log(a.str)
// console.log(a.simplify(CAS.simplifyOptions.forAnalysis).str)

// const a = CAS.asExpression('1/x+2/x')
// const b = CAS.asExpression('3/x')
// console.log(a.str)
// console.log(b.str)
// console.log(a.equals(b))
// const c = a.subtract(b)
// console.log(c.str)
// console.log(c.simplify(CAS.simplifyOptions.forAnalysis).str)

export default function Test() {
	return (
		<>
			<Par>Dit is een testpagina. Hij wordt gebruikt om simpele dingen te testen en te kijken hoe ze werken. Vaak staat er willekeurige zooi op.</Par>
			<Head>Tests</Head>
			<BM>x=\frac(-b\pm\sqrt[2](b^2-4ac))(2a).</BM>
		</>
	)
}
