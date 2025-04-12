import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Term, Emp, M, BM } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>Let's consider a <Term>product equation</Term> (an equation only having multiplications/divisions) with multiple variables, like <M>2a = \frac(3b)(ax)</M>. Often the goal is to solve this equation for one of the variables, for instance <M>x</M>. In this skill we look at how to do that.</Par>
		</Translation>

		<Translation entry="whatIsSolving">
			<Head>Solving a multi-variable product equation</Head>
			<Par>The idea of a multi-variable equation like <M>2a = \frac(3b)(ax)</M> is that, even if we don't know the values of the variables <M>a</M>, <M>b</M> and <M>x</M>, we know that the equality in the equation must hold. There is some restriction on the variables: not just every combination is possible.</Par>
			<Par>We can choose a variable in this equation, like <M>x</M>, and solve the equation for this variable. We call this 'chosen variable' the <Term>target variable</Term>. To solve for the target variable, we must rewrite the equation (obviously in ways that still keep it valid) until it has the form <M>x = \ldots</M>, where the dots do <Emp>not</Emp> contain the target variable <M>x</M>. They may (and will) depend on the other variables.</Par>
		</Translation>

		<Translation entry="idea">
			<Head>Isolating the target variable</Head>
			<Par>The procedure to isolate the target variable <M>x</M> is exactly the same as when we have a <SkillLink skillId="solveProductEquation">product equation with one variable</SkillLink>. First we want to prevent <M>x</M> from being in any denominator of a fraction. We can remove it by <SkillLink skillId="moveEquationFactor">moving <M>x</M> to the other side</SkillLink>. This gives us <BM>2ax=\frac(3b)(a).</BM> Note that <M>x</M> is not in any denominator anymore.</Par>
			<Par>To subsequently isolate <M>x</M>, we move <Emp>all</Emp> factors except for <M>x</M> to the other side. For the example, we move the <M>2a</M> to the right to get <BM>x = \frac(\frac(3b)(a))(2a).</BM> We have isolated <M>x</M>!</Par>
		</Translation>

		<Translation entry="afterwards">
			<Head>After finding the solution</Head>
			<Par>As usual, we do not just want any solution, but we want a solution that's written as simple as possible. <SkillLink skillId="simplifyFractionWithVariables">Simplifying the fraction</SkillLink> will result in <BM>x = \frac(3b)(a \cdot 2a) = \frac(3b)(2a^2).</BM> Note that first we have written the fraction of a fraction as one fraction, and subsequently we wrote the multiplication of <M>a</M> with itself as <M>a^2</M>.</Par>
			<Par>Now that we have a relatively simple solution, we must <SkillLink skillId="checkMultiVariableEquationSolution">check this solution</SkillLink>. To do so, we insert the solution <M>x = \frac(3b)(2a^2)</M> into the <Emp>original</Emp> equation <M>2a = \frac(3b)(ax)</M>. This gives <BM>2a = \frac(3b)(a \frac(3b)(2a^2)).</BM> If we write the fraction of fractions as one fraction, we simplify this equation to <BM>2a = \frac(3b \cdot 2a^2)(a \cdot 3b).</BM> By canceling out factors, the fraction on the right side reduces to <M>2a</M>. The full equation then becomes <BM>2a = 2a.</BM> This equation certainly holds for all possible values of <M>a</M> and <M>b</M>, which means that our solution for <M>x</M> indeed solves the equation for all possible values of <M>a</M> and <M>b</M>. The solution is correct!</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To solve a product equation like <M>2a = \frac(3b)(ax)</M> for a target variable like <M>x</M>, take the following steps.</Par>
			<List items={[
				<>If the target variable is in a denominator, get it out of there by <SkillLink skillId="moveEquationFactor">moving it to the other side of the equation</SkillLink>. For the example, we get <M>2ax = \frac(3b)(a)</M>.</>,
				<><SkillLink skillId="moveEquationFactor">Move all factors</SkillLink> that are on the same side as the target variable to the other side. This turns the example into <M>x = \frac(3b)(a \cdot 2a)</M>.</>,
				<><SkillLink skillId="simplifyFractionWithVariables">Simplify</SkillLink> the result as much as possible. Our example reduces to <M>x = \frac(3b)(2a^2)</M>.</>,
				<><SkillLink skillId="checkMultiVariableEquationSolution">Check your solution</SkillLink> by inserting it into the original equation and verifying that both sides reduce to the same expression. For the example, inserting the solution reduces both sides to <M>2a</M>, which matches.</>,
			]} />
		</Translation>
	</>
}
