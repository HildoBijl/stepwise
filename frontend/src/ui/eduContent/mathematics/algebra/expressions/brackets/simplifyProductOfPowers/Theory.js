import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Term, Emp, M, BM, Warning } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>In practice we often encounter multiplications (products) of powers. These could simply be products of powers like <M>x^2 \cdot x^3</M>, these could be powers of products like <M>\left(2x\right)^3</M>, or these could even be powers of powers, like <M>\left(x^2\right)^3</M>. How can we simplify such expressions?</Par>
		</Translation>

		<Translation entry="productOfPowers">
			<Head>Product of powers</Head>
			<Par>Consider a <Term>product of powers</Term> like <M>x^2 \cdot x^3</M>. To simplify this, the key is to realize that a power is just a <SkillLink skillId="rewritePower">repeated multiplication</SkillLink>. So <M>x^2 = x \cdot x</M> and <M>x^3 = x \cdot x \cdot x</M>. As a result, we have <BM>x^2 \cdot x^3 = x \cdot x \cdot x \cdot x \cdot x = x^5.</BM> Once we see that a power is just a repeated multiplication, such an expression can be simplified right away.</Par>
			<Par>We can turn the above idea into a general rule. Note that the exponent in the outcome (the <M>5</M>) is the sum of the two original exponents (the <M>2</M> and the <M>3</M>). More generally, we may write that, for any <M>x</M>, <M>a</M> and <M>b</M>, we have <BM>x^a \cdot x^b = x^(a+b).</BM> So as long as the two powers have the same base, we may merge them together by adding up their exponents.</Par>
		</Translation>

		<Translation entry="powersOfProducts">
			<Head>Powers of products</Head>
			<Par>Consider a <Term>power of a product</Term> like <M>\left(2x\right)^3</M>. To simplify this, we can again use the idea that a power is a repeated multiplication. So we may write <BM>\left(2x\right)^3 = \left(2x\right) \cdot \left(2x\right) \cdot \left(2x\right).</BM> Note that on the right-hand side the brackets are not needed. After all, when multiplying numbers, the order of multiplication doesn't matter. So we have <BM>\left(2x\right)^3 = 2 \cdot x \cdot 2 \cdot x \cdot 2 \cdot x.</BM> Next, we can <SkillLink skillId="simplifyNumberProduct">simplify the numbers</SkillLink> by pulling these together, turning <M>2 \cdot 2 \cdot 2</M> into <M>2^3</M> which also equals <M>8</M>. Similarly we can pull <M>x \cdot x \cdot x</M> together into <M>x^3</M>. The outcome then becomes <BM>\left(2x\right)^3 = 8x^3.</BM></Par>
			<Par>Once more, we can turn the above idea into a general rule. Note that we have effectively rewritten <M>\left(2x\right)^3</M> into <M>2^3x^3</M>. More generally, we can say that, for any <M>a</M>, <M>b</M> and <M>n</M>, we have <BM>\left(ab\right)^n = a^nb^n.</BM> So if we have a power of a product, we may pull the power inside of the brackets by applying it to <Emp>every</Emp> factor.</Par>
		</Translation>

		<Translation entry="powersOfPowers">
			<Head>Powers of powers</Head>
			<Par>Consider a <Term>power of a power</Term> like <M>\left(x^2\right)^3</M>. To simplify this, we can once more expand the power as <BM>\left(x^2\right)^3 = x^2 \cdot x^2 \cdot x^2.</BM> Using the first rule from before (simplifying products of powers) we can write this as <BM>\left(x^2\right)^3 = x^(2+2+2) = x^6.</BM> This is as simple as it can get.</Par>
			<Par>The general rule here says that, for any <M>x</M>, <M>a</M> and <M>b</M>, we have <BM>\left(x^a\right)^b = x^(ab).</BM> So a power outside of brackets may be pulled inside the brackets, where it becomes a multiplication of the exponent.</Par>
			<Warning>Note that the brackets in the above rule are very important. After all, <M>\left(x^a\right)^b</M> is very different from <M>x^(\left(a^b\right))</M>. (The latter is often written without brackets as simply <M>x^(a^b)</M>, which per definition equals <M>x^(\left(a^b\right))</M>.) To see why, compare for instance <M>\left(x^2\right)^3 = x^6</M> with <M>x^(\left(2^3\right)) = x^8</M>.</Warning>
		</Translation>

		<Translation entry="inPractice">
			<Head>Applying the rules in practice</Head>
			<Par>In practice, you generally don't write out powers fully, but will directly apply the respective rule. Sometimes combinations of these rules are necessary. When this is the case, keep in mind that powers are calculated before products, so always start simplifying any potential powers.</Par>
			<Par>For instance, consider <M>3x^3\left(2x\right)^2</M>. There are products and powers. We start by simplifying the power turning <M>\left(2x\right)^2</M> into <M>2^2x^2</M>. So we have <BM>3x^3\left(2x\right)^2 = 3x^2 \cdot 2^2 x^2.</BM> Merging number factors together simplifies this to <BM>3x^3\left(2x\right)^2 = 12x^3 \cdot x^2.</BM> Finally the two powers can be merged together into <BM>3x^3\left(2x\right)^2 = 12x^5.</BM> Work step by step, write down intermediate results, and always keep it clear for yourself which exact rule you're applying.</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To simplify a combination of products of powers, like for instance <M>3x^3\left(2x\right)^2</M>, take the following steps.</Par>
			<List items={[
				<>Apply any of the rules to simplify a part of your expression. Rules involving powers (rules 2 and 3) usually go before rules using products (rule 1). In the example, we apply the second rule to get <M>3x^3 \cdot 2^2x^2</M>.</>,
				<><SkillLink skillId="simplifyNumberProduct">Simplify any number products</SkillLink>. In the example, we can reduce <M>3 \cdot 2^2</M> to <M>12</M>.</>,
				<>If necessary, apply more rules to simplify things further. In the example, we rewrite the product of powers (rule 1) to get <M>12x^5</M>.</>,
			]} />
			<Par>If you cannot remember the exact rules, keep in mind that a power is just a <SkillLink skillId="rewritePower">repeated multiplication</SkillLink> and things will sort itself out.</Par>
		</Translation>
	</>
}
