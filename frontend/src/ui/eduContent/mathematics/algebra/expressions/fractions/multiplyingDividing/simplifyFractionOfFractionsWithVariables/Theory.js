import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Term, M, BM } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>We sometimes may find expressions where there are fractions inside of fractions. For instance we could encounter <M>\frac(6\left(x+2\right)^2)(10\left(x+2\right)^5/x^4)</M>. How can we simplify something like this?</Par>
		</Translation>

		<Translation entry="idea">
			<Head>The idea</Head>
			<Par>The hard part of our current situation is that we have a <Term>fraction inside of a fraction</Term>. We know how to <SkillLink skillId="multiplyDivideFractions">multiply and divide fractions with numbers</SkillLink>, and how the factors are reordered to end up with a single fraction. When using variables, it works the same way! After all, <M>\left(x+2\right)</M> is just as much a number as (for instance) the number <M>7</M>.</Par>
			<Par>Using the default rules of rewriting fractions, we may adjust our example expression to <BM>\frac(6\left(x+2\right)^2)(10\frac(\left(x+2\right)^5)(x^4)) = \frac(6\left(x+2\right)^2x^4)(10\left(x+2\right)^5).</BM> Note that the denominator of the denominator (here <M>x^4</M>) has found its way into the numerator.</Par>
			<Par>Once we have done this, we are left with a <Term>single fraction</Term>. We are already familiar with <SkillLink skillId="simplifyFractionWithVariables">simplifying a fraction</SkillLink> like this. We cross out factors, both for the number (a factor <M>2</M>) and for the variables (two factors <M>\left(x+2\right)</M>) to wind up with <BM>\frac(6\left(x+2\right)^2x^4)(10\left(x+2\right)^5) = \frac(3x^4)(5\left(x+2\right)^3).</BM> This is as simple as it can possibly be written.</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To simplify a fraction where the numerator and/or the denominator are also a fraction, like for instance with <M>\frac(6\left(x+2\right)^2)(10\left(x+2\right)^5/x^4)</M>, take the following steps.</Par>
			<List items={[
				<>First use the default rules of <SkillLink skillId="multiplyDivideFractions">multiplying and dividing fractions</SkillLink> to turn everything into a single fraction. For the example we move the denominator of the denominator (here <M>x^4</M>) into the numerator to get <M>\frac(6\left(x+2\right)^2x^4)(10\left(x+2\right)^5)</M>.</>,
				<><SkillLink skillId="simplifyFractionWithVariables">Simplify the resulting fraction</SkillLink>, canceling as many factors (both numeric and with variables) as possible. For the example, we would wind up with <M>\frac(3x^4)(5\left(x+2\right)^3)</M>.</>,
			]} />
		</Translation>
	</>
}
