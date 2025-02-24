import React from 'react'

import { range } from 'step-wise/util'

import { Translation } from 'i18n'
import { Head, Par, List, Term, Emp, M, BM } from 'ui/components'
import { SkillLink } from 'ui/eduTools'
import { Drawing, usePlotTransformationSettings, Axes, Group, Curve } from 'ui/figures'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>A <Term>quadratic equation</Term> is an equation of the form <M>2x^2 - 8x + 6 = 0</M>: it is a summation of a term with <M>x^2</M>, a term with <M>x</M> and a constant, without the presence of any higher powers of <M>x</M> or any roots or similar. This type of equation can be solved by following a few fixed steps. Even if you don't understand why these steps work, following the procedure will get you to the right solutions.</Par>
		</Translation>

		<Translation entry="theTwoSolutions">
			<Head>The two solutions</Head>
			<Par>To make the quadratic equation more intuitive, it helps to draw a graph of the expression on the left-hand side of the equation. If we for instance plot <M>2x^2 - 8x + 6</M> we get the following graph.</Par>
			<QuadraticPlot a={2} b={-8} c={6} minX={-1} maxX={5} minY={-2} maxY={10} />
			<Par>To solve the equation <M>2x^2 - 8x + 6 = 0</M> we need to find the values of <M>x</M> where the plotted line has height <M>0</M> and hence crosses the horizontal axis. We see that this occurs at <M>x = 1</M> but also at <M>x = 3</M>. In other words, there are two values of <M>x</M> that satisfy the equation. The equation has two solutions!</Par>
		</Translation>

		<Translation entry="findingTheTwoSolutions">
			<Head>Finding the two solutions</Head>
			<Par>Finding solutions with a graph is easy, but usually we don't take the effort to make a graph. To still find the right values, we use the general solution of the quadratic equation.</Par>
			<Par>Before we can use this solution, we write the equation as
				<BM>ax^2 + bx + c = 0.</BM>
				That is, <M>a</M> is the number before <M>x^2</M>, <M>b</M> is the number before <M>x</M> and <M>c</M> is the constant term in the sum. So for our example, we have <M>a = 2</M>, <M>b = -8</M> and <M>c = 6</M>. Note that, due to the minus sign, <M>b</M> is negative!</Par>
			<Par>Once we have <M>a</M>, <M>b</M> and <M>c</M>, we can insert them into the general solution for quadratic equations. This solution (an equation you should memorize since you'll use it so often) is
				<BM>x = \frac(-b \pm \sqrt(b^2 - 4ac))(2a).</BM>
				This important equation is known as the <Term>quadratic formula</Term> or colloquially also as the <Term>abc-formula</Term>. You don't need to understand why this is the solution, but you do need to be able to apply it. To use it, we insert the values of <M>a</M>, <M>b</M> and <M>c</M> into this solution. For our example we get
				<BM>x = \frac(-\left(-8\right) \pm \sqrt(\left(-8\right)^2 - 4 \cdot 2 \cdot 6))(2\cdot 2).</BM>
				This looks rather complicated, but we can simplify it. If we simplify the number multiplications, we reduce this to
				<BM>x = \frac(8 \pm \sqrt(64 - 48))(4).</BM>
				The square root becomes <M>\sqrt(16)</M> which is <M>4</M>, so the final result then becomes
				<BM>x = \frac(8 \pm 4)(4) = 2 \pm 1.</BM>
				Note that the solution has a plus/minus sign. We can insert either a plus or a minus in the place of this symbol, and each case gives us a different solution. With a minus sign we get <M>x = 2 - 1 = 1</M> while with a plus we get <M>x = 2 + 1 = 3</M>. So thanks to the plus/minus sign we have the two solutions we were looking for! The general solution works.
			</Par>
		</Translation>

		<Translation entry="zeroSolutions">
			<Head>Zero solutions</Head>
			<Par>A quadratic equation doesn't always have two solutions though. Let's for instance study the equation <M>2x^2 - 8x + 10 = 0</M>. If we plot this, we get the following graph.</Par>
			<QuadraticPlot a={2} b={-8} c={10} minX={-1} maxX={5} minY={0} maxY={14} />
			<Par>Note that this is the same parabola, except it's been shifted upwards by <M>4</M>. Now it doesn't intersect with the <M>x</M>-axis anymore! There are hence no solutions. There isn't a single number <M>x</M> that exists for which <M>2x^2 - 8x + 10 = 0</M>.</Par>
			<Par>We can see numerically why this is the case. Note that <M>2x^2</M> is always a positive number. After all, the square of a number is always positive. Similarly, <M>10</M> is always positive. The only term in <M>2x^2 - 8x + 10</M> that may be negative is <M>-8x</M>. However, this term will never match up to <M>2x^2 + 10</M>. As a result, the expression <M>2x^2 - 8x + 10</M> can never be zero.</Par>
			<Par>So what happens if we still try to apply our general solution? In this case we have <M>a = 2</M>, <M>b = -8</M> and <M>c = 10</M>. Inserting this gives
				<BM>x = \frac(-\left(-8\right) \pm \sqrt(\left(-8\right)^2 - 4 \cdot 2 \cdot 10))(2\cdot 2).</BM>
				Simplifying this turns it into
				<BM>x = \frac(8 \pm \sqrt(-16))(4).</BM>
				Note that we now have a square root of a negative number. This is a mathematical impossibility: we cannot take square roots of negative numbers. Because our general solution gives a mathematical impossibility, there are no solutions possible to our equation.
			</Par>
			<Par>In short: if the square root of the solution contains a negative number (so <M>b^2 - 4ac &lt; 0</M>) then the quadratic equation has no solutions. </Par>
		</Translation>

		<Translation entry="oneSolution">
			<Head>One solution</Head>
			<Par>There is an edge case where the quadratic equation has one solution. Let's consider for instance the equation <M>2x^2 - 8x + 8 = 0</M>. The corresponding graph is as follows.</Par>
			<QuadraticPlot a={2} b={-8} c={8} minX={-1} maxX={5} minY={0} maxY={12} />
			<Par>Note that the graph now exactly <Emp>touches</Emp> the <M>x</M>-axis. When this is the case, the quadratic equation has one solution.</Par>
			<Par>This also follows from our general solution. This time we have <M>a = 2</M>, <M>b = -8</M> and <M>c = 8</M>. If we insert this into our general solution, we get
				<BM>x = \frac(-\left(-8\right) \pm \sqrt(\left(-8\right)^2 - 4 \cdot 2 \cdot 8))(2\cdot 2).</BM>
				Simplifying this turns it into
				<BM>x = \frac(8 \pm \sqrt(0))(4).</BM>
				Note that the square root reduces to zero, which turns this into <M>x = 2 \pm 0</M>. The latter part "<M>\pm 0</M>" is pointless and can be removed, leaving us with only the single solution <M>x = 2</M>.
			</Par>
			<Par>In short: if the square root of the solution becomes zero (which is the case when <M>b^2 - 4ac = 0</M>) then the quadratic solution has exactly one solution.</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To solve a quadratic equation, like <M>2x^2 - 8x + 6 = 0</M>, take the following steps.</Par>
			<List items={[
				<>Compare the equation to the standard form <M>ax^2 + bx + c = 0</M> to determine <M>a</M>, <M>b</M> and <M>c</M>. If there is a minus sign, the corresponding number should be negative. For our example we have <M>a = 2</M>, <M>b = -8</M> and <M>c = 6</M>.</>,
				<><SkillLink skillId="substituteANumber">Substitute</SkillLink> <M>a</M>, <M>b</M> and <M>c</M> into the general solution <M>x = \frac(-b \pm \sqrt(b^2 - 4ac))(2a)</M>. For our example we get <M>x = \frac(8 \pm \sqrt(8^2 - 4 \cdot 2 \cdot 6))(2 \cdot 2)</M>.</>,
				<><SkillLink skillId="simplifyRoot">Simplify the root</SkillLink> and use this to determine the number of solutions.
					<List items={[
						<>If the number in the root is <Emp>positive</Emp> then there are <Emp>two solutions</Emp>.</>,
						<>If the number in the root is <Emp>negative</Emp> then there are <Emp>no solutions</Emp>.</>,
						<>If the number in the root is <Emp>zero</Emp> then there is exactly <Emp>one solution</Emp>.</>,
					]} />
					For our example we get <M>\sqrt(16)</M> so there are two solutions.</>,
				<><SkillLink skillId="simplifyFractionSum">Simplify the resulting fraction</SkillLink>, canceling fraction factors where possible. For our example <M>x = \frac(8 \pm 4)(4)</M> reduces to <M>x = 2 \pm 1</M>.</>,
				<>Finally write the two solutions (if they exist) side by side. For our example we get <M>x = 1</M> and <M>x = 3</M>.</>,
			]} />
		</Translation>

		<Translation entry="derivation">
			<Head>Background: derivation of the quadratic formula</Head>
			<Par>Though not needed for this skill, we can look at where the quadratic equation comes from. To be precise, we can derive it ourselves! It's fun to see this derivation some time, if only so you know why it's set up the way it is.</Par>
			<Par>Our starting point is the quadratic equation
				<BM>ax^2 + bx + c = 0.</BM>
				For reasons which will become clear later, we multiple all terms in this equation by <M>4a</M> to get
				<BM>4a^2x^2 + 4abx + 4ac = 0.</BM>
				We also add and subtract <M>b^2</M> to the equation to find
				<BM>4a^2x^2 + 4abx + b^2 - b^2 + 4ac = 0.</BM>
				The reason why we did this, is because now we can pull the first three terms into a big square, like
				<BM>\left(2ax + b\right)^2 - b^2 + 4ac = 0.</BM>
				Note that, if you expand the brackets, we come back to what we started with, so the equation is still valid. The next step is to bring the other terms to the right-hand side,
				<BM>\left(2ax + b\right)^2 = b^2 - 4ac.</BM>
				Now we can cancel the square by taking the square root of both sides of the equation. When doing so, the rule says that we must also add a plus/minus symbol prior to the square root. So we get
				<BM>2ax + b = \pm \sqrt(b^2 - 4ac).</BM>
				Subtracting <M>b</M> and subsequently dividing by <M>2a</M> turns this into
				<BM>x = \frac(-b \pm \sqrt(b^2 - 4ac))(2a).</BM>
				We have derived the quadratic formula, proving its correctness! Of course you could take the above steps every time you try to solve a quadratic equation, but simply inserting some numbers into the quadratic formula is a much easier way of solving quadratic equations.
			</Par>
		</Translation>
	</>
}

function QuadraticPlot({ a = 1, b = 0, c = 0, minX = -3, maxX = 3, minY = 2, maxY = 8 }) {
	// Calculate points.
	const f = x => a * x ** 2 + b * x + c
	const [curveMinX, curveMinY] = [(-b - Math.sqrt(b ** 2 - 4 * a * (c - maxY))) / (2 * a), (-b + Math.sqrt(b ** 2 - 4 * a * (c - maxY))) / (2 * a)]
	const points = range(curveMinX, curveMinY, 100).map(x => ({ x, y: f(x) }))

	// Set up plot.
	const transformationSettings = usePlotTransformationSettings([[minX, minY], [maxX, maxY]], { maxHeight: 200, maxWidth: 400, extendBoundsToTicks: true, margin: [20, 4] })
	return <Drawing transformationSettings={transformationSettings}>
		<Axes xLabel={<M>x</M>} yLabel={<M>{a === 1 ? '' : a}x^2 {b > 0 ? `+${b}` : b}x {c > 0 ? `+${c}` : c}</M>} xLabelShift={-4} yLabelShift={-4} />
		{/* <MouseLines pointToLabel={pointToRelativeHumidity} /> */}
		<Group overflow={false}>
			<Curve points={points} style={{ strokeWidth: 2 }} />
		</Group>
	</Drawing>
}
