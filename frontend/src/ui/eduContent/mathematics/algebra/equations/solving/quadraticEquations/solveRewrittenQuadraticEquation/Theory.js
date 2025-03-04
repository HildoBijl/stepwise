import React from 'react'

import { range } from 'step-wise/util'

import { Translation } from 'i18n'
import { Head, Par, List, Term, M, BM } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>Quadratic equations don't always appear in their standard form. Sometimes they can be thoroughly <Term>rewritten</Term>, not making it immediately clear that we are dealing with a quadratic equation. Let's study the plan for dealing with this.</Par>
		</Translation>

		<Translation entry="firstClean">
			<Head>Always start with cleaning</Head>
			<Par>Consider an equation like <BM>\frac(2)(x-4) + 2 = \frac(3)(x+1).</BM> When you encounter an equation like this, the first thing you'll always do (no matter the type of equation) is tidy it up. If possible, <SkillLink skillId="bringEquationToStandardForm">bring it to the standard form</SkillLink>. For the above example equation, we can multiply by the denominators of both fractions to write it as <BM>2\left(x+1\right) + 2\left(x-4\right)\left(x+1\right) = 3\left(x-4\right).</BM> Subsequently, we can expand all the brackets and bring all the terms to the right to wind up with <BM>2x^2 - 7x + 6 = 0.</BM> We have simplified the equation as much as we can, bringing it to standard form. (Optionally we can still normalize it.)</Par>
		</Translation>
		
		<Translation entry="recognizeAndSolve">
			<Head>Recognizing the equation and solve it</Head>
			<Par>After cleaning up the equation, we can see if we recognize the type of equation. In this case, we only have powers of <M>x</M>, and the highest power is a square. This means we are dealing with a <Term>quadratic equation</Term>. We can use the standard plan of <SkillLink skillId="solveQuadraticEquation">solving quadratic equations</SkillLink> to find the solutions. We apply the quadratic formula to find <BM>x = \frac(7 \pm \sqrt(7^2 - 4 \cdot 2 \cdot 6))(2\cdot 2) = \frac(7 \pm 1)(4).</BM> The solutions hence appear as <M>x = \frac(3)(2)</M> and <M>x = 2</M>.</Par>
		</Translation>
		
		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To solve a rewritten quadratic equation, like <M>\frac(2)(x-4) + 2 = \frac(3)(x+1)</M>, take the following steps.</Par>
			<List items={[
				<>First (regardless of the equation type) <SkillLink skillId="bringEquationToStandardForm">bring it to the standard form</SkillLink>. For our example the equation is tidied up as <M>2x^2 - 7x + 6 = 0</M>.</>,
				<>Based on the form of the equation, determine how to solve it. If we are dealing with a quadratic equation, then apply the standard plan for <SkillLink skillId="solveQuadraticEquation">solving a quadratic equation</SkillLink>. For our example this results in <M>x = \frac(7 \pm 1)(4)</M> which can be written as <M>x = \frac(3)(2)</M> and <M>x = 2</M>.</>,
			]} />
		</Translation>
	</>
}
