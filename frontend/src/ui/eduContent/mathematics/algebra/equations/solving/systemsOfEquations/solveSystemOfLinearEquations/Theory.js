import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Term, Emp, M, BM, BMList, BMPart } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>Sometimes we have multiple equations with multiple variables. How does that work? And how can we solve all equations together?</Par>
		</Translation>

		<Translation entry="systemsOfEquations">
			<Head>Systems of equations</Head>
			<Par>Suppose that we go to the market to buy fruit. First we get eight apples and six bananas for nine euros. Later on, realizing we actually need more, we go back and get another two apples and five bananas, this time paying four euros. Based on this info, can we determine how much individual apples and bananas cost?</Par>
			<Par>The story above can be translated into equations. Let's call the price of an apple <M>a</M> and the price of a banana <M>b</M>. The first time we visited the fruit stall, we learned that <BM>8a + 6b = 9.</BM> What this means is that the variables <M>a</M> and <M>b</M> have values, and even if we don't know them, we know that they must satisfy this equation. Similarly, we can turn our second fruit stall visit into an equation too, giving <BM>2a + 5b = 4.</BM> Our goal now is to find a combination of values for <M>a</M> and <M>b</M> that satisfies <Emp>all</Emp> of the given equations. We call such a set of equations a <Term>system of equations</Term> and the combination of values for the variables that matches all equations is known as the <Term>solution</Term> of the system. Finding it is known as <Term>solving</Term> the system of equations.</Par>
		</Translation>

		<Translation entry="solving">
			<Head>Solving the system of equations</Head>
			<Par>There are various ways to solve a system of equations. We will use one of the most generally applicable methods. We first pick one equation (usually the easiest) and <SkillLink skillId="solveMultiVariableLinearEquation">solve it</SkillLink> for one variable. If we for instance solve the second equation for <M>a</M> we find <BM>a = 2 - \frac(5)(2)b.</BM> With this solution, if we know the value of <M>b</M>, we can instantly find the value of <M>a</M>. However, we don't know <M>b</M> yet, so we must continue.</Par>
			<Par>As next step, we <SkillLink skillId="substituteAnExpression">insert</SkillLink> the solution for <M>a</M> into the <Emp>other</Emp> equation. Doing so results in <BM>8\left(2 - \frac(5)(2)\right)b + 6b = 9.</BM> Now we have a linear equation with only one variable, so we can <SkillLink skillId="solveLinearEquation">solve it</SkillLink> in the usual way. We can expand brackets to find <BM>16 - 20b + 6b = 9.</BM> Solving for <M>b</M> then gives <BM>b = \frac(1)(2).</BM> So we have found <M>b</M> and, in doing so, learned that a banana costs fifty cents.</Par>
			<Par>Now that we know the value of <M>b</M>, we can use this to find the value of <M>a</M>. After all, we already saw that, if we know <M>b</M>, we can immediately find <M>a</M>. <SkillLink skillId="substituteANumber">Inserting</SkillLink> the value that we found for <M>b</M> into the earlier solution gives us <BM>a = 2 - \frac(5)(2) \cdot \frac(1)(2) = \frac(3)(4).</BM> So an apple is 75 cents! With this, we have found the values of both <M>a</M> and <M>b</M>, and hence solved the system of equations.</Par>
		</Translation>

		<Translation entry="checking">
			<Head>Checking the solution</Head>
			<Par>After solving a system of equations, it's always worth while to check your solution, just to make sure you haven't made an error along the way. To do so, we <SkillLink skillId="substituteANumber">insert</SkillLink> both solutions into both equations. This gives us <BMList>
				<BMPart>8\cdot \frac(3)(4) + 6 \cdot \frac(1)(2) = 9,</BMPart>
				<BMPart>2 \cdot \frac(3)(4) + 5 \cdot \frac(1)(2) = 4.</BMPart>
			</BMList> Note that both equations indeed hold up, which means that the solution we found is correct.</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To solve a system of linear equations like <M>8a + 6b = 9</M> and <M>2a + 5b = 4</M>, take the following steps.</Par>
			<List items={[
				<><SkillLink skillId="solveMultiVariableLinearEquation">Solve one equation for one variable</SkillLink>. For the example, we can solve the second equation for <M>a</M> to find <M>a = 2 - \frac(5)(2)b</M>.</>,
				<><SkillLink skillId="substituteAnExpression">Substitute this solution</SkillLink> into the <Emp>other</Emp> equation. For the example, we get <M>8\left(2 - \frac(5)(2)b\right) + 6b = 9</M>.</>,
				<><SkillLink skillId="solveLinearEquation">Solve the resulting equation</SkillLink> for the remaining variable. In our example we end up with <M>b = \frac(1)(2)</M>.</>,
				<><SkillLink skillId="substituteANumber">Insert the found value</SkillLink> into the solution you found in the second step. In the example, we insert <M>b = \frac(1)(2)</M> into the earlier result to find <M>a = \frac(3)(4)</M>.</>,
				<>Check your solution by <SkillLink skillId="substituteANumber">inserting both results</SkillLink> into the original equations. In the example, we find that both <M>8\cdot \frac(3)(4) + 6 \cdot \frac(1)(2) = 9</M> and <M>2 \cdot \frac(3)(4) + 5 \cdot \frac(1)(2) = 4</M> indeed hold true.</>,
			]} />
		</Translation>
	</>
}
