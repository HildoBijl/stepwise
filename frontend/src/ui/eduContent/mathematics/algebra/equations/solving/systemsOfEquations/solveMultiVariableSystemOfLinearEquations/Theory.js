import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Emp, M, BM, BMList, BMPart } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>Suppose that we have two equations, like <M>ax + 3y = b</M> and <M>cx - ay = 8</M>. We could define two target variables (like <M>x</M> and <M>y</M>) that we want to solve for, treating all other variables as constants. How would we find the solutions for <M>x</M> and <M>y</M>?</Par>
		</Translation>

		<Translation entry="solving">
			<Head>Solving the system of equations</Head>
			<Par>The procedure of solving a system of linear equations with multiple variables is actually identical to <SkillLink skillId="solveSystemOfLinearEquations">solving a system of linear equations</SkillLink> where there are only two variables. (So without any non-target variables.) First we pick one equation and <SkillLink skillId="solveMultiVariableLinearEquation">solve it</SkillLink> for one target variable. Solving the first equation for <M>x</M> would for instance give <BM>x = \frac(b - 3y)(a).</BM> This solution is then <SkillLink skillId="substituteAnExpression">inserted</SkillLink> into the <Emp>other</Emp> equation. This results in <BM>c\left(\frac(b - 3y)(a)\right) - ay = 8.</BM> This is a linear equation which can be <SkillLink skillId="solveMultiVariableLinearEquation">solved</SkillLink> for <M>y</M>. Multiplying all terms by <M>a</M> and expanding brackets gives us <BM>bc - 3cy - a^2y = 8a.</BM> The solution for <M>y</M> follows as <BM>y = \frac(bc - 8a)(a^2 + 3c).</BM> Now that <M>y</M> is solved, we can <SkillLink skillId="substituteAnExpression">insert</SkillLink> this into the solution we found earlier for <M>x</M>. This gives us <BM>x = \frac(b - 3\frac(bc - 8a)(a^2 + 3c))(a).</BM> This is a valid solution, but it contains a fraction within a fraction which is undesirable and should be <SkillLink skillId="simplifyFractionOfFractionSumsWithMultipleVariables">simplified</SkillLink>. Taking the respective steps, we end up with <BM>x = \frac(\frac(b\left(a^2 + 3c\right))(a^2 + 3c) - \frac(3\left(bc - 8a\right))(a^2 + 3c))(a) = \frac(\frac(a^2b + 3bc - 3bc + 24a)(a^2 + 3c))(a) = \frac(ab + 24)(a^2 + 3c).</BM> This is as simple as we can write the solution. Now that we have solutions for <M>x</M> and <M>y</M>, we have solved the system of equations.</Par>
		</Translation>

		<Translation entry="checking">
			<Head>Checking the solution</Head>
			<Par>After solving a system of equations, it's always worth while to check your solution, just to make sure you haven't made an error along the way. To do so, we <SkillLink skillId="substituteAnExpression">insert</SkillLink> both solutions into both equations. This gives us <BMList>
				<BMPart>a\frac(ab + 24)(a^2 + 3c) + 3\frac(bc - 8a)(a^2 + 3c) = b,</BMPart>
				<BMPart>c\frac(ab + 24)(a^2 + 3c) - a\frac(bc - 8a)(a^2 + 3c) = 8.</BMPart>
			</BMList> The solution is correct if both equations always hold. To see if this is the case, we must simplify the equations. Note that all fractions have the same denominator, so we can merge the fractions together, giving <BMList>
					<BMPart>\frac(a\left(ab + 24\right) + 3\left(bc - 8a\right))(a^2 + 3c) = b,</BMPart>
					<BMPart>\frac(c\left(ab + 24\right) - a\left(bc - 8a\right))(a^2 + 3c) = 8.</BMPart>
				</BMList> Expanding brackets and canceling sum terms turns the above into <BMList>
					<BMPart>\frac(a^2b + 3bc)(a^2 + 3c) = b,</BMPart>
					<BMPart>\frac(24c + 8a^2)(a^2 + 3c) = 8.</BMPart>
				</BMList> We finally note that, in each of the fractions, we can pull a factor out of the brackets. This gives us <BMList>
					<BMPart>b\frac(a^2 + 3c)(a^2 + 3c) = b,</BMPart>
					<BMPart>8\frac(a^2 + 3c)(a^2 + 3c) = 8.</BMPart>
				</BMList> Both these equations obviously hold for all values of <M>a</M>, <M>b</M> and <M>c</M>, since the fractions can be removed as they equal <M>1</M>. As a result, we conclude that the solution we found is correct.</Par>
			<Par>You may note that checking the solution is just as much work, or possibly even more, than finding the solution. As a result, as you gain more experience with this skill and learn to work thoroughly, you don't always check your results anymore. But in case of doubt, it is still a useful trick to have.</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To solve a system of linear equation like <M>ax + 3y = b</M> and <M>cx - ay = 8</M> for target variables <M>x</M> and <M>y</M>, take the following steps.</Par>
			<List items={[
				<><SkillLink skillId="solveMultiVariableLinearEquation">Solve one equation for one variable</SkillLink>. For the example, we can solve the first equation for <M>x</M> to find <M>x = \frac(b - 3y)(a)</M>.</>,
				<><SkillLink skillId="substituteAnExpression">Substitute this solution</SkillLink> into the <Emp>other</Emp> equation. For the example, we get <M>c\left((b - 3y)(a)\right) - ay = 8</M>.</>,
				<><SkillLink skillId="solveMultiVariableLinearEquation">Solve the resulting equation</SkillLink> for the remaining target variable. In our example we end up with <M>y = \frac(bc - 8a)(a^2 + 3c)</M>.</>,
				<><SkillLink skillId="substituteAnExpression">Insert the found value</SkillLink> into the solution you found in the second step and subsequently <SkillLink skillId="simplifyFractionOfFractionSumsWithMultipleVariables">simplify it</SkillLink>. In the example, we insert the solution for <M>y</M> into the earlier result for <M>x</M> and simplify the result to find <M>x = \frac(ab + 24)(a^2 + 3c)</M>.</>,
				<>Check your solution by <SkillLink skillId="substituteAnExpression">inserting both results</SkillLink> into the original equations. In the example, we find that both <M>a\frac(ab + 24)(a^2 + 3c) + 3\frac(bc - 8a)(a^2 + 3c) = b</M> and <M>c\frac(ab + 24)(a^2 + 3c) - a\frac(bc - 8a)(a^2 + 3c) = 8</M> indeed hold true.</>,
			]} />
		</Translation>
	</>
}
