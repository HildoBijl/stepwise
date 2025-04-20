import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Term, M, BM } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>If we add two number fractions with unequal denominator, such as <M>\frac(1)(2) + \frac(1)(3)</M>, then we know how to do so: ensure the denominators are equal by rewriting the fractions (giving <M>\frac(3)(6) + \frac(2)(6)</M>) and then adding up the fractions to get <M>\frac(3+2)(6)</M>. But how does this work when multiple variables are involved, like when rewriting <M>\frac(1)(4a) + \frac(1)(6b)</M>? The answer is: exactly the same. But there are a few things to pay attention to.</Par>
		</Translation>

		<Translation entry="adding">
			<Head>Adding two fractions</Head>
			<Par>We want to add/subtract two <Term>unlike fractions</Term> (fractions with unequal denominator), such as <BM>\frac(1)(4a) + \frac(1)(6b).</BM> We know how to <SkillLink skillId="addLikeFractionsWithVariables">add two like fractions</SkillLink> (with equal denominators), but this time our fractions do not have equal denominators. To still be able to add these two fractions, we must force them to have the same denominator.</Par>
			<Par>The first step is to find the <Term>smallest common multiple</Term> of the two denominators. Note that one denominator equals <M>2 \cdot 2 \cdot a</M> while the other denominator equals <M>2 \cdot 3 \cdot b</M>. Every factor that appears in one or both of these denominators also appears in the smallest common multiple, which then becomes <M>2 \cdot 2 \cdot 3 \cdot a \cdot b = 12ab</M>.</Par>
			<Par>The second step is to adjust both fractions such that they have <M>12ab</M> as denominator. This gives <BM>\frac(1)(4a) + \frac(1)(6b) = \frac(3b)(12ab) + \frac(2a)(12ab).</BM>	Note that equality holds: we could even <SkillLink skillId="cancelFractionFactors">cancel factors</SkillLink> again to get back to where we started.</Par>
			<Par>Now that we have two fractions with equal denominator, we can <SkillLink skillId="addLikeFractionsWithVariables">add them up</SkillLink> in the usual way. We merge the numerators together to get <BM>\frac(3b)(12ab) + \frac(2a)(12ab) = \frac(3b+2a)(12ab).</BM> We have written the two fractions as a single fraction.</Par>
		</Translation>

		<Translation entry="splitting">
			<Head>Splitting fractions</Head>
			<Par>We could also do the exact opposite of the above. Suppose that we have a fraction like <M>\frac(3b+2a)(12ab)</M> with multiple terms in the numerator. How can we split it up into separate fractions?</Par>
			<Par>The first step is to literally split them up, doing the exact opposite of <SkillLink skillId="addLikeFractionsWithVariables">adding like fractions</SkillLink>: each term from the numerator gets its own fraction, all having the same denominator. This gives <BM>\frac(3b+2a)(12ab) = \frac(3b)(12ab) + \frac(2a)(12ab).</BM> Next, we <SkillLink skillId="simplifyFractionWithVariables">simplify the fractions</SkillLink>, canceling factors as much as possible. This results in <BM>\frac(3b)(12ab) + \frac(2a)(12ab) = \frac(1)(4a) + \frac(1)(6b).</BM> This is what we originally started off with, showing that we have indeed done the exact opposite of merging the fractions together.</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To add/subtract two fractions with multiple variables, like <M>\frac(1)(4a) + \frac(1)(6b)</M>, take the following steps.</Par>
			<List items={[
				<>Find the smallest common multiple of the two fraction denominators. For the example, this is <M>12ab</M>.</>,
				<>Rewrite both fractions, <SkillLink skillId="cancelFractionFactors">adding factors</SkillLink>, to give both fractions this denominator. This turns the example into <M>\frac(3b)(12ab) + \frac(2a)(12ab)</M>.</>,
				<><SkillLink skillId="addLikeFractionsWithVariables">Add the like fractions</SkillLink> together in the usual way. For the example we get the final result <M>\frac(3b+2a)(12ab)</M>.</>,
			]} />
			<Par>For the opposite, when splitting up a fraction like <M>\frac(3b+2a)(12ab)</M>, the steps are similar.</Par>
			<List items={[
				<><SkillLink skillId="addLikeFractionsWithVariables">Split the fraction into like fractions</SkillLink>. This turns the example into <M>\frac(3b)(12ab) + \frac(2a)(12ab)</M>.</>,
				<><SkillLink skillId="simplifyFractionWithVariables">Simplify the fractions</SkillLink> as much as possible. For the example, the final result becomes <M>\frac(1)(4a) + \frac(1)(6b)</M>.</>,
			]} />
		</Translation>
	</>
}
