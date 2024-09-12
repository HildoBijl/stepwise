import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Term, M, BM } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>An equation often consists of multiple terms. The equation <M>2 + \frac(3)(x) = 5x</M> for instance has two terms on the left and one term on the right. When rewriting such an equation, a common thing to do is <Term>multiply all terms</Term> by a factor, or alternatively <Term>divide all terms</Term> by a factor. We take a look at how and why this works, as well as what short-cuts we can take while doing so.</Par>
		</Translation>

		<Translation entry="multiplying">
			<Head>Multiply all terms</Head>
			<Par>When we have an equation like <M>2 + \frac(3)(x) = 5x</M>, one thing we are allowed to do is <SkillLink skillId="multiplyBothEquationSides">multiply both sides of the equation</SkillLink> by a factor. If we multiply by <M>x</M>, then we get <BM>\left(2 + \frac(3)(x)\right)x = 5x \cdot x.</BM> Note that, when multiplying an entire side of the equation, we need to use brackets. Generally we don't want to have those brackets, and we can get rid of them by <SkillLink skillId="expandBrackets">expanding them</SkillLink>. This turns the equation into <BM>2x + \frac(3x)(x) = 5x \cdot x.</BM> Finally we can simplify each individual term. On the left, we can <SkillLink skillId="simplifyFractionWithVariables">simplify the fraction</SkillLink>, while on the right the multiplication can be written more succinctly using a <SkillLink skillId="rewritePower">square</SkillLink>. We end up with <BM>2x + 3 = 5x^2.</BM> Look at how this resulted from the original equation <M>2 + \frac(3)(x) = 5x</M>. Effectively, we have multiplied each term individually by <M>x</M>.</Par>
		</Translation>

		<Translation entry="dividing">
			<Head>Divide all terms</Head>
			<Par>We can do the same in reverse. After all, if we have an equation like <M>2x + 3 = 5x^2</M>, we are also allowed to <SkillLink skillId="multiplyBothEquationSides">divide both sides of the equation</SkillLink> by a factor. Dividing by <M>x</M> gives <BM>\frac(2x+3)(x) = \frac(5x^2)(x).</BM> The fraction on the left can subsequently be <SkillLink skillId="addLikeFractionsWithVariables">split up into separate fractions</SkillLink> through <BM>\frac(2x)(x) + \frac(3)(x) = \frac(5x^2)(x).</BM> Finally we can <SkillLink skillId="simplifyFractionWithVariables">simplify fractions</SkillLink> to get back to <BM>2 + \frac(3)(x) = 5x.</BM> Again look at how this follows from the starting point <M>2x + 3 = 5x^2</M>. Effectively we have divided each term by <M>x</M>.</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To multiply or divide all terms in an equation by a factor, like when multiplying <M>2 + \frac(3)(x) = 5x</M> by <M>x</M>, take the following steps.</Par>
			<List items={[
				<><SkillLink skillId="multiplyBothEquationSides">Apply the multiplication/division</SkillLink> to the full equation. This turns the example into <M>\left(2 + \frac(3)(x)\right)x = 5x \cdot x</M>.</>,
				<>On a multiplication <SkillLink skillId="expanddBrackets">expand the brackets</SkillLink>, or on a division <SkillLink skillId="addLikeFractionWithVariables">split up the fraction</SkillLink>. For the example, we get <M>2x + \frac(3x)(x) = 5x \cdot x</M>.</>,
				<>Simplify the resulting outcome, which usually comes down to <SkillLink skillId="simplifyFractionWithVariables">simplifying various fractions</SkillLink>, canceling terms where needed. This reduces the example to <M>2x+3=5x^2</M>.</>,
			]} />
		</Translation>

		<Translation entry="shortCut">
			<Head>The short-cut</Head>
			<Par>We can summarize the above ideas into a useful short-cut. If we want to multiply or divide an entire equation by a factor, we can directly apply that multiplication/division to each individual term, simplifying these terms as we go. So if we multiply the equation <M>2 + \frac(3)(x) = 5x</M> by the factor <M>x</M>, we can immediately see that this turns into <M>2x+3=5x^2</M>. And if we then divide this by <M>x</M> again, we right away get back to <M>2 + \frac(3)(x) = 5x</M>.</Par>
		</Translation>
	</>
}
