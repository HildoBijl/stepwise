import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Term, Emp, M, BM } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>Suppose that we encounter an expression like <M>\left(2x\right)^3</M>. Is there a way to write this in a simpler fashion? One thing that we can do is <Term>expand the brackets</Term>.</Par>
		</Translation>

		<Translation entry="idea">
			<Head>The round-about method</Head>
			<Par>First we will examine the long method to expanding the brackets. For this method, it's important to remember that a power is simply a repeated multiplication. So <M>\left(2x\right)^3</M> effectively comes down to <BM>\left(2x\right)^3 = \left(2x\right) \cdot \left(2x\right) \cdot \left(2x\right).</BM> Looking at the part on the right-hand side, we see that the brackets aren't really necessary. After all, when multiplying factors, the order of multiplication doesn't matter. So we can write it as <BM>\left(2x\right) \cdot \left(2x\right) \cdot \left(2x\right) = 2 \cdot x \cdot 2 \cdot x \cdot 2 \cdot x.</BM> As next simplification, we can <SkillLink skillId="simplifyNumberProduct">merge all the numeric multiplications into a single factor</SkillLink>. Since <M>2 \cdot 2 \cdot 2</M> equals <M>8</M> this reduces to <BM>2 \cdot x \cdot 2 \cdot x \cdot 2 \cdot x = 8 \cdot x \cdot x \cdot x.</BM> Similarly, <M>x \cdot x \cdot x</M> can be <SkillLink skillId="rewritePower">written as a power</SkillLink>, being <M>x^3</M>. All together, this gives us the final result <BM>\left(2x\right)^3 = 8x^3.</BM> This is as simple as we can possibly write it.</Par>
		</Translation>

		<Translation entry="shortcut">
			<Head>The short-cut</Head>
			<Par>We can shorten the above method significantly. If we look at the final result, we see that it actually equals <M>\left(2x\right)^3 = 2^3x^3</M>. More generally, the official rule says that <BM>\left(ab\right)^n = a^nb^n</BM> for <Emp>any</Emp> values of <M>a</M>, <M>b</M> and <M>n</M>. Using this rule, we can immediately write <M>\left(2x\right)^3</M> as <M>2^3x^3</M> which subsequently reduces to <M>8x^3</M>.</Par>
		</Translation>

		<Translation entry="negativePowers">
			<Head>Negative exponent</Head>
			<Par>Sometimes we encounter a negative exponent. For instance, how can we write <M>\left(2x\right)^(-3)</M> in a simpler way?</Par>
			<Par>The key here is to first <SkillLink skillId="rewriteNegativePower">rewrite the negative power</SkillLink> as a positive one. The rule here directly says that we may write <BM>\left(2x\right)^(-3) = \frac(1)(\left(2x\right)^3).</BM> In this way we turn any negative power into a positive one.</Par>
			<Par>Afterwards, the steps are the same as before, but then everything happens below the division bar. We can hence write <BM>\left(2x\right)^(-3) = \frac(1)(\left(2x\right)^3) = \frac(1)(2^3x^3) = \frac(1)(8x^3).</BM> So in short, if we encounter a negative exponent, we first turn it into a division and then we do everything in the same way as usual.</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To expand brackets for a power of a product in the long way, like for instance with <M>\left(2x\right)^(-3)</M>, take the following steps.</Par>
			<List items={[
				<>If the exponent is a negative number, first <SkillLink skillId="rewriteNegativePower">rewrite the negative power</SkillLink> as a division. For the example, we turn <M>\left(2x\right)^(-3)</M> into <M>1/\left(2x\right)^3</M>.</>,
				<><SkillLink skillId="rewritePower">Write the power</SkillLink> as a multiplication. For the example, we may write <M>1/\left(2x\right)^3</M> as <M>1/\left(2x2x2x\right)</M>.</>,
				<><SkillLink skillId="simplifyNumberProduct">Merge all numeric factors into a single numeric factor</SkillLink>. We could write <M>2 \cdot 2 \cdot 2</M> as <M>8</M> to get <M>1/\left(8xxx\right)</M>.</>,
				<><SkillLink skillId="rewritePower">Merge all variables into a power</SkillLink>. We may write <M>xxx</M> as <M>x^3</M> which turns the final result into <M>1/\left(8x^3\right)</M>.</>,
			]} />
			<Par>Alternatively, you can shorten the above steps through the rule <M>\left(ab\right)^n = a^nb^n</M>. Then take the following steps.</Par>
			<List items={[
				<>(Identical to above:) If the power is a negative number, first <SkillLink skillId="rewriteNegativePower">rewrite the negative power</SkillLink> as a division. For the example, we turn <M>\left(2x\right)^(-3)</M> into <M>1/\left(2x\right)^3</M>.</>,
				<>Apply the rule <M>\left(ab\right)^n = a^nb^n</M> to bring the power inside the brackets. The example now turns into <M>1/\left(2^3x^3\right)</M>.</>,
				<><SkillLink skillId="simplifyNumberProduct">Expand any power of a number</SkillLink> to simplify the final expression. In the example we can turn <M>2^3</M> into <M>8</M> to get <M>1/\left(8x^3\right)</M>.</>,
			]} />
			<Par>In practice, given enough practice, you will eventually always end up applying the second method since it's much faster.</Par>
		</Translation>
	</>
}
