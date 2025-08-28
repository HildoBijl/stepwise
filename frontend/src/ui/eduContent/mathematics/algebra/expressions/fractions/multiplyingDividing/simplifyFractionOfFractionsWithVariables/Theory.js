import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Term, M, BM } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>We sometimes may find expressions where there are fractions inside of fractions. For instance we could encounter <M>\frac(6\left(x+2\right)^2)(10\left(x+2\right)^5/x^4)</M>. How can we simplify something like this?</Par>
		</Translation>

		<Translation entry="singleFraction">
			<Head>Turn the fraction of fractions into a single fraction</Head>
			<Par>The hard part of our current situation is that we have a <Term>fraction inside of a fraction</Term>. We know how to <SkillLink skillId="multiplyDivideFractions">multiply and divide fractions with numbers</SkillLink>, and how the factors are reordered to end up with a single fraction. When using variables, it works the same way! After all, <M>\left(x+2\right)</M> is just as much a number as (for instance) the number <M>7</M>.</Par>
			<Par>Using the default rules of rewriting fractions, we may adjust our example expression to <BM>\frac(6\left(x+2\right)^2)(10\frac(\left(x+2\right)^5)(x^4)) = \frac(6\left(x+2\right)^2x^4)(10\left(x+2\right)^5).</BM> Note that the denominator of the denominator (here <M>x^4</M>) has found its way into the numerator.</Par>
		</Translation>

		<Translation entry="simplifying">
			<Head>Simplify the fraction</Head>
			<Par>Once we have done the above, we are left with a <Term>single fraction</Term>. We are already familiar with <SkillLink skillId="simplifyFractionWithVariables">simplifying a fraction</SkillLink> like this. We cross out factors, both for the numbers (a factor <M>2</M>) and for the variables (two factors <M>\left(x+2\right)</M>) to wind up with <BM>\frac(6\left(x+2\right)^2x^4)(10\left(x+2\right)^5) = \frac(3x^4)(5\left(x+2\right)^3).</BM> This is as simple as it can possibly be written.</Par>
		</Translation>

		<Translation entry="negativePowers">
			<Head>Deal with negative powers</Head>
			<Par>It may happen that we encounter negative powers like <M>x^(-4)</M> in our original fraction. For instance we may start with <M>\frac(6\left(x+2\right)^2)(10\left(x+2\right)^5 x^(-4))</M>. The key to dealing with that is to, before doing anything else, write any negative powers as a fraction. Afterwards everything happens in exactly the same way. So in this case we would have <BM>\frac(6\left(x+2\right)^2)(10\left(x+2\right)^5 x^(-4)) = \frac(6\left(x+2\right)^2)(10\left(x+2\right)^5\frac(1)(x^4)) = \frac(6\left(x+2\right)^2x^4)(10\left(x+2\right)^5) = \frac(3x^4)(5\left(x+2\right)^3).</BM></Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To simplify a fraction where the numerator and/or the denominator contain fractions and/or negative powers, like for instance with <M>\frac(6\left(x+2\right)^2)(10\left(x+2\right)^5x^(-4))</M>, take the following steps.</Par>
			<List items={[
				<><SkillLink skillId="rewriteNegativePower">Rewrite any negative powers as fractions</SkillLink>. This turns the example into <M>\frac(6\left(x+2\right)^2)(10\left(x+2\right)^5/x^4)</M>.</>,
				<>Use the default rules of <SkillLink skillId="multiplyDivideFractions">multiplying and dividing fractions</SkillLink> to turn everything into a single fraction. For the example we move the denominator of the denominator (here <M>x^4</M>) into the numerator to get <M>\frac(6\left(x+2\right)^2x^4)(10\left(x+2\right)^5)</M>.</>,
				<><SkillLink skillId="simplifyFractionWithVariables">Simplify the resulting fraction</SkillLink>, canceling as many factors as possible, both numeric and with variables. For the example, we end up with <M>\frac(3x^4)(5\left(x+2\right)^3)</M>.</>,
			]} />
		</Translation>
	</>
}
