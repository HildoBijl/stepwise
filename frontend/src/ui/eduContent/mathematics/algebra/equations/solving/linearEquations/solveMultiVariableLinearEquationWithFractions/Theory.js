import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Term, M, BM } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>Consider an equation like <M>\frac(a)(b+1/x) = \frac(c)(3)</M> where the target variable <M>x</M> is in the denominator of some fraction. Sometimes such an equation is a <Term>linear equation in disguise</Term>. Here we learn how to check that, and how to subsequently solve such equations.</Par>
		</Translation>

		<Translation entry="cleaning">
			<Head>Cleaning up the equation</Head>
			<Par>The first thing that we always do is clean up the equation. If there are any fractions inside of fractions, we first want to solve that, <SkillLink skillId="simplifyFractionOfFractionSumsWithMultipleVariables">reducing it to a single fraction</SkillLink>. For the example, we can multiply the numerator and denominator of the fraction on the left by <M>x</M> to get <BM>\frac(ax)(bx+1) = \frac(c)(3).</BM> After this, we note that the target variable <M>x</M> is still in the denominator. We can solve this by <SkillLink skillId="multiplyAllEquationTerms">multiplying all terms</SkillLink> by <M>bx+1</M>. Optionally, we can also multiply all terms by <M>3</M> to get rid of the fraction on the right. This results in <BM>3ax = c\left(bx+1\right).</BM> We have ensured that there are no fractions anymore with <M>x</M> in the denominator, so we have sufficiently cleaned up the equation. Now we see that the equation is in fact linear in <M>x</M>. That is, there are no powers of <M>x</M> or similar. Only multiplications by constants and non-target variables (which can also be seen as constants).</Par>
		</Translation>

		<Translation entry="solving">
			<Head>Solving the linear equation</Head>
			<Par>We can now <SkillLink skillId="solveMultiVariableLinearEquation">solve the linear equation</SkillLink> in the standard way. Expanding brackets gives <BM>3ax = bcx + c.</BM> Bringing all terms with <M>x</M> to the left and all other terms to the right, we wind up with <BM>3ax - bcx = c.</BM> Pulling <M>x</M> out of brackets then reduces this to <BM>\left(3a-bc\right)x = c.</BM> The final solution follows by dividing by the term between brackets, giving <BM>x = \frac(c)(3a - bc).</BM> This is the solution of the equation.</Par>
		</Translation>

		<Translation entry="checking">
			<Head>Checking the solution</Head>
			<Par>It is still wise to check the solution. To do so, we insert the solution into the original equation. Doing so gets us <BM>\frac(a)(b + \frac(1)(\frac(c)(3a - bc))) = \frac(c)(3).</BM> Simplifying the innermost fraction turns this into <BM>\frac(a)(b + \frac(3a - bc)(c)) = \frac(c)(3).</BM> Multiplying both sides of the outer fraction by <M>c</M> further reduces this to <BM>\frac(ac)(bc + \left(3a - bc\right)) = \frac(c)(3).</BM> Finally getting rid of the brackets, canceling the <M>bc</M> term and subsequently the <M>a</M> factor will reduce this to <BM>\frac(c)(3) = \frac(c)(3).</BM> This equation obviously holds, which means that the solution we found is correct.</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To solve a linear equation in disguise, like <M>\frac(a)(b+1/x) = \frac(c)(3)</M>, for a target variable <M>x</M>, take the following steps.</Par>
			<List items={[
				<>If there are any fractions within fractions, <SkillLink skillId="simplifyFractionOfFractionSumsWithMultipleVariables">reduce these to single fractions</SkillLink>. This turns the example into <M>\frac(ax)(bx+1) = \frac(c)(3)</M>.</>,
				<>If the target variable is in any denominator, <SkillLink skillId="multiplyAllEquationTerms">multiply all terms by this denominator</SkillLink> to fix this. Optionally, you can get rid of all fractions; also those without the target variable in the denominator. For the example, we rewrite the equation to <M>3ax = c\left(bx+1\right)</M>.</>,
				<>If the equation indeed is linear, then <SkillLink skillId="solveMultiVariableLinearEquation">solve the linear equation</SkillLink> in the standard way. In the example, if we expand brackets, move terms around, pull <M>x</M> out of brackets and divide by this factor, we end up with <M>x = \frac(c)(3a - bc)</M>.</>,
			]} />
		</Translation>
	</>
}
