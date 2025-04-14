import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Term, M, BM } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>Consider an equation like <M>ax + 3 = b</M>. This equation is a <Term>linear equation</Term> with respect to <M>x</M>: if we consider all other variables (<M>a</M> and <M>b</M>) as numbers, then all terms are either a number or a number times <M>x</M>. A linear equation may also contain numbers multiplied by brackets, like in <M>a\left(x + 2\right) = bx + c</M>, but there are no squares <M>x^2</M> or more complicated terms. This skill is about solving such an equation to find which value of <M>x</M> satisfies it. This is very similar to solving a <SkillLink skillId="solveLinearEquation">solving a linear equation with one variable</SkillLink>, but there are a few small differences.</Par>
		</Translation>

		<Translation entry="solving">
			<Head>Solving the equation</Head>
			<Par>The first thing we always do when solving an equation like <M>a\left(x + 2\right) = bx + c</M> is clean it up. That starts with <SkillLink skillId="expandBrackets">expanding brackets</SkillLink>: if there are any containing <M>x</M>, get rid of them. Doing so for the example gives <BM>ax + 2a = bx + c.</BM> Next, we want to sort out the terms: we <SkillLink skillId="moveEquationTerm">move the terms</SkillLink> with <M>x</M> to one side (for instance the left) and the terms without <M>x</M> to the other side (the right). For our example this turns it into <BM>ax - bx = c - 2a.</BM> Finally we <SkillLink skillId="pullFactorOutOfBrackets">pull <M>x</M> out of brackets</SkillLink>. The example then reduces to <BM>(a - b)x = c - 2a.</BM> We have rewritten the equation to a form that is a lot simpler! In fact, you may recognize that it's now a <SkillLink skillId="solveMultiVariableProductEquation">product equation with multiple variables</SkillLink>. We can solve it in the default way: we <SkillLink skillId="moveEquationTerm">move the factor</SkillLink> before the <M>x</M> to the other side. This gives <BM>x = \frac(c-2a)(a-b).</BM> This is the solution to the equation.</Par>
		</Translation>

		<Translation entry="checking">
			<Head>Checking the solution</Head>
			<Par>As usual, we still want to insert this solution into the original equation to <SkillLink skillId="checkMultiVariableEquationSolution">check</SkillLink> it. Doing so gives <BM>a\left(\frac(c-2a)(a-b) + 2\right) = b\frac(c-2a)(a-b) + c.</BM> We should now check if both sides reduce to the same expression. This is a bit more complicated, but the first step we can do is turn the constants <M>2</M> and <M>c</M> into a fraction that also have <M>\left(a-b\right)</M> in the denominator. This gives <BM>a\left(\frac(c-2a)(a-b) + \frac(2\left(a-b\right))(a-b)\right) = \frac(b\left(c-2a\right))(a-b) + \frac(c\left(a-b\right))(a-b).</BM> If we <SkillLink skillId="expandBrackets">expand brackets</SkillLink> in the numerators, we get <BM>a\left(\frac(c-2a)(a-b) + \frac(2a-2b)(a-b)\right) = \frac(bc-2ab)(a-b) + \frac(ac - bc)(a-b).</BM> <SkillLink skillId="addLikeFractionsWithVariables">Merging fractions together</SkillLink> then turns this into <BM>a\left(\frac(c-2b)(a-b)\right) = \frac(ac-2ab)(a-b).</BM> <SkillLink skillId="expandBrackets">Expanding the brackets</SkillLink> on the left side finally turns this into <BM>\frac(ac-2ab)(a-b) = \frac(ac-2ab)(a-b).</BM> Indeed, both sides reduce to the same, which shows that the solution we have found is correct.</Par>
			<Par>You may notice that checking the equation solution is in fact more work than solving the equation itself. As a result, you'll find that as you become more proficient with this skill, you don't always check your equation solution anymore. It is however recommended to still do so the first few times, to obtain this proficiency.</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To solve a linear equation like <M>a\left(x + 2\right) = bx + c</M> for the target variable <M>x</M>, take the following steps.</Par>
			<List items={[
				<>If there are any brackets containing the target variable, <SkillLink skillId="expandBrackets">expand them</SkillLink>. This turns the example into <M>ax + 2a = bx + c</M>.</>,
				<><SkillLink skillId="moveEquationTerms">Move all terms</SkillLink> with the target variable to one side and all terms without the target variable to the other side. For the example, if we move everything with <M>x</M> to the left and the rest to the right, we get <M>ax - bx = c - 2a</M>.</>,
				<><SkillLink skillId="pullFactorOutOfBrackets">Pull the target variable out of the brackets</SkillLink>. Pulling <M>x</M> out will turn the example into <M>\left(a-b\right)x = c-2a</M>.</>,
				<><SkillLink skillId="solveMultiVariableProductEquation">Solve the resulting product equation</SkillLink> by moving the factor between brackets to the other side. Also simplify the result where possible and check it. For the example we end up with <M>x = \frac(c-2a)(a-b)</M>, which can be shown to balance the equation.</>,
			]} />
		</Translation>
	</>
}
