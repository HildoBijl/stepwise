import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Term, M, BM } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>If we add two number fractions with unequal denominator, such as <M>\frac(1)(2) + \frac(1)(3)</M>, then we know how to do so: ensure the denominators are equal by rewriting the fractions (giving <M>\frac(3)(6) + \frac(2)(6)</M>) and then adding up the fractions to get <M>\frac(3+2)(6)</M>. But how does this work when variables are involved, like when calculating <M>\frac(x+1)(3x) - \frac(2)(x+7)</M>? The answer is: exactly the same. But there are a few things to pay attention to.</Par>
		</Translation>

		<Translation entry="equalDenominator">
			<Head>Ensuring an equal denominator</Head>
			<Par>We want to add/subtract two <Term>unlike fractions</Term> (fractions with unequal denominator), such as <BM>\frac(x+1)(3x) - \frac(2)(x+7).</BM> We know how to <SkillLink skillId="addLikeFractionsWithVariables">add two like fractions</SkillLink> (with equal denominators), but this time our fractions do not have equal denominators. To still be able to add these two fractions, we first must force them to have the same denominator.</Par>
			<Par>To do so, we take the left fraction and multiply both the numerator and the denominator by <M>\left(x+7\right)</M> (that is, the denominator of the other fraction). This turns <M>\frac(x+1)(3x)</M> into <M>\frac(\left(x+1\right)\left(x+7\right))(3x\left(x+7\right))</M>. Note that this is the same: we could even <SkillLink skillId="cancelFractionFactors">cancel the factor</SkillLink> again to get back to where we started. Identically, we also take the right fraction, and multiply its numerator and denominator by <M>3x</M> (the denominator of the first fraction). This turns <M>\frac(2)(x+7)</M> into <M>\frac(3x \cdot 2)(3x\left(7+x\right))</M>. Altogether, we may hence write <BM>\frac(x+1)(3x) - \frac(2)(x+7) = \frac(\left(x+1\right)\left(x+7\right))(3x\left(x+7\right)) - \frac(3x \cdot 2)(3x\left(7+x\right)).</BM> And now we have two fractions with equal denominator!</Par>
		</Translation>

		<Translation entry="addingFractions">
			<Head>Adding the two fractions</Head>
			<Par>We now have two fractions with equal denominator. Before we add these up, it is wise to first <SkillLink skillId="expandDoubleBrackets">expand all brackets</SkillLink> inside the numerators. That makes the next step a bit easier. Doing so gives <BM>\frac(\left(x+1\right)\left(x+7\right))(3x\left(x+7\right)) - \frac(3x \cdot 2)(3x\left(7+x\right)) = \frac(x^2 + 8x + 7)(3x\left(x+7\right)) - \frac(6x)(3x\left(7+x\right)).</BM> Note that we leave the denominator unchanged: expanding brackets there is of course allowed, but generally does not make things easier.</Par>
			<Par>Now that we have two relatively easy fractions with equal denominator, we can <SkillLink skillId="addLikeFractionsWithVariables">add them up</SkillLink> in the usual way, by pulling the numerators together. We first get <BM>\frac(x^2 + 8x + 7)(3x\left(x+7\right)) - \frac(6x)(3x\left(7+x\right)) = \frac(x^2 + 8x + 7 - 6x)(3x\left(7+x\right)),</BM> which can then immediately be simplified by <SkillLink skillId="mergeSimilarTerms">merging similar terms</SkillLink> into <BM>\frac(x^2 + 8x + 7 - 6x)(3x\left(7+x\right)) = \frac(x^2 + 2x + 7)(3x\left(7+x\right)).</BM> The final result is <BM>\frac(x+1)(3x) - \frac(2)(x+7) = \frac(x^2 + 2x + 7)(3x\left(7+x\right)).</BM></Par>
		</Translation>

		<Translation entry="rule">
			<Head>The rule</Head>
			<Par>The above idea can also be captured into a rule. If we have two general fractions <M>\frac(a)(b)</M> and <M>\frac(c)(d)</M> that we add up, then we can write <BM>\frac(a)(b) + \frac(c)(d) = \frac(ad + bc)(bd).</BM> Or similarly for subtracting we have <BM>\frac(a)(b) - \frac(c)(d) = \frac(ad - bc)(bd).</BM></Par>
			<Par>Using this rule, we can immediately solve the example through <BM>\frac(x+1)(3x) - \frac(2)(x+7) = \frac(\left(x+1\right)\left(x+7\right) - 3x \cdot 2)(3x\left(x+7\right)) = \frac(x^2 + 2x + 7)(3x\left(x+7\right)).</BM> If you have practiced enough to see this short-cut, it can save some time.</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To add/subtract two fractions with variables, like <M>\frac(x+1)(3x) - \frac(2)(x+7)</M>, take the following steps.</Par>
			<List items={[
				<>Rewrite the fractions so they all have the same denominator. For this, <SkillLink skillId="cancelFractionFactors">multiply both sides</SkillLink> of the left fraction by the numerator of the right fraction, and similarly <SkillLink skillId="cancelFractionFactors">multiply both sides</SkillLink> of the right fraction by the numerator of the left fraction. For the example this gives <M>\frac(\left(x+1\right)\left(x+7\right))(3x\left(x+7\right)) - \frac(3x \cdot 2)(3x\left(7+x\right))</M>.</>,
				<><SkillLink skillId="expandDoubleBrackets">Expand all (often double) brackets</SkillLink> in the numerators. For the example we get <M>\frac(x^2 + 8x + 7)(3x\left(x+7\right)) - \frac(6x)(3x\left(7+x\right))</M>.</>,
				<><SkillLink skillId="addLikeFractionsWithVariables">Add the like fractions</SkillLink> and simplify the result as much as possible. For the example the final result is <M>\frac(x^2 + 2x + 7)(3x\left(7+x\right))</M>.</>,
			]} />
		</Translation>
	</>
}
