import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Term, M, BM } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>We know how to cancel factors in a fraction like <M>\frac(2x)(3x)</M>. We just cross out the <M>x</M> on both sides. But how can we simplify a fraction if we have powers in there, like in <M>\frac(x^5)(x^3)</M>? And what if there are also numbers and other factors involved, like in <M>\frac(6 \cdot 7x^5)(14 x^3 \left(x+1\right))</M>? The key is to still cancel factors, but do so for numbers and variable factors separately.</Par>
		</Translation>

		<Translation entry="idea">
			<Head>The idea</Head>
			<Par>First let's consider a fraction with powers, like <M>\frac(x^5)(x^3)</M>. To simplify this, the key is to see that a power <M>x^3</M> can be <SkillLink skillId="rewritePower">rewritten as a multiplication</SkillLink> <M>x \cdot x \cdot x</M> and similarly for <M>x^5</M>. This turns the whole fraction into <BM>\frac(x^5)(x^3) = \frac(x \cdot x \cdot x \cdot x \cdot x)(x \cdot x \cdot x).</BM> Once we have written it like this, we can <SkillLink skillId="cancelFractionFactors">cancel fraction factors</SkillLink>. We can remove three <M>x</M>'es both above, in the numerator, and below, in the denominator. Above we are left with <M>x \cdot x</M>, while below we remain with no factors of <M>x</M>, which comes down to <M>1</M>. So we have <BM>\frac(x^5)(x^3) = \frac(x \cdot x \cdot x \cdot x \cdot x)(x \cdot x \cdot x) = \frac(x \cdot x)(1) = x^2.</BM> Note that at the end we have merged multiplications of repeated factors back into powers, turning <M>x \cdot x</M> into <M>x^2</M>. This is as simple as we can write it.</Par>
		</Translation>

		<Translation entry="rule">
			<Head>The rule</Head>
			<Par>The whole process above can be done more quickly if we turn it into a rule. Effectively, we are canceling factors in the numerator and the denominator, reducing their exponents, until one of them disappears. From this idea, we can find the <Term>general rule</Term> <BM>\frac(x^a)(x^b) = x^(a-b) = \frac(1)(x^(b-a)).</BM> Here <M>a</M> and <M>b</M> can be any numbers. The first outcome (middle) is used if <M>a &gt; b</M>, while the second (right) is useful if <M>b &gt; a</M>. (Of course, if <M>a = b</M> and we have a fraction like <M>\frac(x^a)(x^a)</M>, then this directly reduces to <M>x^0 = 1</M>.)</Par>
		</Translation>

		<Translation entry="twoParts">
			<Head>Two parts</Head>
			<Par>Now consider a more complex fraction like <M>\frac(6 \cdot 7x^5)(14 x^3 \left(x+1\right))</M>. This time there are also numbers and other factors. The first thing we can do is focus on all the <Term>numeric factors</Term>. Since the order of multiplication does not matter, we can pull these factors to the front and write it as <BM>\frac(6 \cdot 7)(14) \cdot \frac(x^5)(x^3\left(x+1\right)).</BM> We can then <SkillLink skillId="simplifyFraction">simplify this numeric fraction</SkillLink> to <M>\frac(6 \cdot 7)(14) = \frac(42)(14) = \frac(3)(1) = 3.</M> This turns the full fraction into <BM>\frac(6 \cdot 7)(14) \cdot \frac(x^5)(x^3\left(x+1\right)) = \frac(3x^5)(x^3\left(x+1\right)).</BM> The numeric parts cannot be simplified further.</Par>
			<Par>The second part is to focus on the <Term>variable factors</Term>. There are powers of <M>x</M> in both the numerator and the denominator. We could take the long way of <SkillLink skillId="rewritePower">rewriting powers</SkillLink> and <SkillLink skillId="cancelFractionFactors">canceling fraction factors</SkillLink> to write <BM>\frac(3x^5)(x^3\left(x+1\right)) = \frac(3x \cdot x \cdot x \cdot x \cdot x)(x \cdot x \cdot x \cdot \left(x + 1\right)) = \frac(3x \cdot x)(x + 1) = \frac(3x^2)(x+1).</BM> Or alternatively we can use our newfound rule and directly remove three factors of <M>x</M> from the numerator and the denominator. (The factor <M>\left(x+1\right)</M> simply stays as it is.) This immediately results in <BM>\frac(3x^5)(x^3\left(x+1\right)) = \frac(3x^2)(x+1).</BM> Having reduced the variable factors too, this is as simple as it can be written.</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To simplify a fraction with various multiplications and powers, like <M>\frac(6 \cdot 7x^5)(14 x^3 \left(x+1\right))</M>, take the following steps.</Par>
			<List items={[
				<>Pull all numeric factors to the front and <SkillLink skillId="simplifyFraction">simplify the numeric fraction</SkillLink>. For the example we turn <M>\frac(6 \cdot 7)(14)</M> into <M>3</M>.</>,
				<>Find equal factors in the numerator and the denominator, and use the rule <M>\frac(x^a)(x^b) = x^(a-b) = \frac(1)(x^(b-a))</M> to remove as many as possible. So in <M>\frac(3x^5)(x^3 \left(x+1\right))</M> both the numerator and the denominator have three factors of <M>x</M> which can be removed, leaving us with <M>\frac(3x^2)(x+1)</M>.</>,
			]} />
		</Translation>
	</>
}
