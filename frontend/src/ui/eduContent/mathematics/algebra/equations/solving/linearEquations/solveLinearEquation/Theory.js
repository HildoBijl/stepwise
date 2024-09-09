import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Term, M, BM } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>A <Term>linear equation</Term> is an equation like <M>2x + 3 = 7</M>, containing only terms with a number or a number times <M>x</M>. Sometimes there are also numbers multiplied by brackets, like in <M>5\left(x-2\right) = 3x+4</M>, but there are no squares <M>x^2</M> or more complicated terms. This skill is about solving such an equation to find which value of <M>x</M> satisfies it.</Par>
		</Translation>

		<Translation entry="cleaning">
			<Head>Cleaning up the equation</Head>
			<Par>The first thing we always do when solving an equation like <M>5\left(x-2\right) = 3x+4</M> is clean it up. That starts with <SkillLink skillId="expandBrackets">expanding brackets</SkillLink>: if there are any containing <M>x</M>, get rid of them. Doing so for the example gives <BM>5x-10=3x+4.</BM> Next, we want to sort out the terms: we <SkillLink skillId="moveEquationTerm">move the terms</SkillLink> with <M>x</M> to one side (for instance the left) and the terms without <M>x</M> to the other side (the right). For our example this turns it into <BM>5x-3x=10+4.</BM> Finally we <SkillLink skillId="mergeSimilarTerms">merge terms together</SkillLink> on both sides. The example then reduces to <BM>2x=14.</BM> We have rewritten the equation to a form that is a lot simpler! In fact, you may recognize that it's now a <SkillLink skillId="solveProductEquation">product equation</SkillLink>.</Par>
		</Translation>

		<Translation entry="solving">
			<Head>Solving the cleaned equation</Head>
			<Par>To solve the cleaned equation, we use the default approach for <SkillLink skillId="solveProductEquation">solving product equations</SkillLink>. We <SkillLink skillId="moveEquationTerm">move the factor</SkillLink> before the <M>x</M> to the other side and <SkillLink skillId="simplifyFraction">simplify</SkillLink> the result. This gives <BM>x = \frac(14)(2) = 7.</BM> Finally we insert this solution into the original equation to <SkillLink skillId="checkEquationSolution">check</SkillLink> it. Doing so gives <BM>5 \left(7-2\right) = 3\cdot 7 + 4.</BM> Both sides reduce to <M>25</M>, which is the same. The solution is correct!</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To solve a linear equation like <M>5\left(x-2\right) = 3x+4</M>, take the following steps.</Par>
			<List items={[
				<>If there are any brackets containing the unknown, <SkillLink skillId="expandBrackets">expand them</SkillLink>. This turns the example into <M>5x-10=3x+4</M>.</>,
				<><SkillLink skillId="moveEquationTerms">Move all terms</SkillLink> with the unknown to one side and all terms without the unknown to the other side. For the example, if we move everything with <M>x</M> to the left and the rest to the right, we get <M>5x-3x=10+4</M>.</>,
				<><SkillLink skillId="mergeSimilarTerms">Merge similar terms together</SkillLink> on both sides. Doing so for the example reduces it to <M>2x=14</M>.</>,
				<><SkillLink skillId="solveProductEquation">Solve the resulting product equation</SkillLink> in the usual way, including simplifying the outcome and checking it. For the example we end up with <M>x = 7</M> which indeed balances the original equation.</>
			]} />
		</Translation>
	</>
}
