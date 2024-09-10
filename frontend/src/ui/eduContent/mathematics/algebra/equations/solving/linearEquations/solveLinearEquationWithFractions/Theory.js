import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Term, M, BM } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>We may run into equations where the unknown is in the denominator of a fraction. Think of for instance <M>\frac(2)(x+3)=\frac(5)(x+7)</M>. Sometimes these equations are actually <Term>linear equations in disguise</Term>. Here we learn how to check that, and how to subsequently solve such equations.</Par>
		</Translation>

		<Translation entry="cleaning">
			<Head>Cleaning up the equation</Head>
			<Par>As usual with equations, we first clean them up. In the equation <M>\frac(2)(x+3)=\frac(5)(x+7)</M> we see that the unknown <M>x</M> is in the denominator, which is inconvenient. To fix this, we <SkillLink skillId="moveEquationFactor">move the factor <M>x+3</M> to the other side</SkillLink> to get <BM>2 = \frac(5\left(x+3\right))(x+7).</BM> Identically, we move the factor <M>x+7</M> to the other side to get <BM>2\left(x+7\right) = 5\left(x+3\right).</BM> Now <M>x</M> is not in any denominator anymore, and if we study our result, we see that we wound up with a linear equation!</Par>
		</Translation>

		<Translation entry="solving">
			<Head>Solving the linear equation</Head>
			<Par>We can now <SkillLink skillId="solveLinearEquation">solve the linear equation</SkillLink> in the standard way. Expanding brackets gives <BM>2x+14=5x+15.</BM> Bringing all terms with <M>x</M> to the left and all other terms to the right, we wind up with <BM>2x-5x=15-14.</BM> Merging similar terms directly simplifies this to <BM>-3x=1.</BM> Moving the factor <M>-3</M> to the other side gives us the solution <BM>x = -\frac(1)(3).</BM> As a check, we insert this into the original equation and get <BM>\frac(2)(-\frac(1)(3)+3) = \frac(5)(-\frac(1)(3)+7).</BM> With some work, we can see that both sides reduce to <M>\frac(3)(4)</M>, which matches. The solution is correct.</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To solve a linear equation in disguise, like <M>\frac(2)(x+3)=\frac(5)(x+7)</M>, take the following steps.</Par>
			<List items={[
				<>Whenever the unknown is in any fraction denominator, <SkillLink skillId="moveEquationFactor">move this denominator (as factor) to the other side of the equation</SkillLink> to fix this. For the example we do this twice to get <M>2\left(x+7\right) = 5\left(x+3\right)</M>.</>,
				<>If the equation that comes out is a linear equation, then <SkillLink skillId="solveLinearEquation">solve it</SkillLink> in the default way. For the example, we indeed get a linear equation, whose solution can be found as <M>x = -\frac(1)(3)</M>.</>,
			]} />
		</Translation>
	</>
}
