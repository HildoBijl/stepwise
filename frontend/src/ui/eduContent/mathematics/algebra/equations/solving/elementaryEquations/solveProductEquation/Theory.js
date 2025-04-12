import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Term, Emp, M, BM } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>A <Term>product equation</Term> is an equation with only multiplications and divisions, like <M>6 = \frac(9)(2x)</M>. When given such an equation, the usual goal is to solve it. This skill teaches you exactly how to do that.</Par>
		</Translation>

		<Translation entry="whatIsSolving">
			<Head>Solving an equation</Head>
			<Par>Every equation has an unknown, like for instance <M>x</M>. <Term>Solving</Term> an equation means we rewrite the equation (obviously in ways that still keep it valid) until it has the form <M>x = \ldots</M>, where the dots do <Emp>not</Emp> contain the unknown <M>x</M>. That is, we <Term>isolate</Term> the unknown variable. How to do so depends on the type of equation, but for product equations this can be done in a few fixed steps.</Par>
		</Translation>

		<Translation entry="idea">
			<Head>The idea</Head>
			<Par>We want to isolate <M>x</M> for an equation like <M>6 = \frac(9)(2x)</M>. A first problem here is that <M>x</M> is currently in the denominator of a fraction, which makes it hard to isolate. To fix this, we can <SkillLink skillId="moveEquationFactor">move <M>x</M> to the other side</SkillLink>, which gets us <BM>6x = \frac(9)(2).</BM> Now <M>x</M> is not in the denominator anymore, which makes the process easier.</Par>
			<Par>If <M>x</M> is not in any denominator, we can start isolating it. To do so, we move <Emp>all</Emp> factors except for <M>x</M> to the other side. For the example, we move the <M>6</M> to the right to get <BM>x = \frac(\frac(9)(2))(6).</BM> We have isolated <M>x</M>!</Par>
		</Translation>

		<Translation entry="afterwards">
			<Head>After finding the solution</Head>
			<Par>Technically the above solution is a valid solution for the equation. However, we are not done. Often the most simple solution is required, so we should still simplify this outcome. <SkillLink skillId="simplifyFraction">Simplifying the fraction</SkillLink> will result in <BM>x = \frac(9)(2 \cdot 6) = \frac(9)(12) = \frac(3)(4).</BM> This is as simple as gets.</Par>
			<Par>Once we have a simplified solution, a valuable last step is to <SkillLink skillId="checkEquationSolution">check it</SkillLink>: does it really solve the original equation? It's very easy to make a small error, and this allows you to detect whether or not you did. To check the solution <M>x = \frac(3)(4)</M>, we insert it into the <Emp>original</Emp> equation <M>6 = \frac(9)(2x)</M> and look at whether the equation is balanced. We get <BM>6 = \frac(9)(2 \cdot \frac(3)(4)).</BM> If we simplify the fraction on the right, we see that it reduces to <M>6</M>, which is also the left side of the equation. The two sides match, so the solution is correct!</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To solve a product equation, like <M>6 = \frac(9)(2x)</M>, take the following steps.</Par>
			<List items={[
				<>If the unknown is in a denominator, get it out of there by <SkillLink skillId="moveEquationFactor">moving it to the other side of the equation</SkillLink>. For the example, we get <M>6x = \frac(9)(2)</M>.</>,
				<><SkillLink skillId="moveEquationFactor">Move all factors</SkillLink> that are on the same side as the unknown to the other side. This turns the example into <M>x = \frac(9/2)(6)</M>.</>,
				<><SkillLink skillId="simplifyFraction">Simplify</SkillLink> the result as much as possible. Our example reduces to <M>x = \frac(3)(4)</M>.</>,
				<><SkillLink skillId="checkEquationSolution">Check your solution</SkillLink> by inserting it into the original equation and verifying that both sides reduce to the same number. For the example, inserting the solution reduces both sides to <M>6</M>, which matches.</>,
			]} />
		</Translation>
	</>
}
