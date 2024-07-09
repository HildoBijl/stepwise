import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Term, M, BM } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>If we add two number fractions with equal denominator, such as <M>\frac(1)(6) + \frac(2)(6)</M>, then we know how to do so: add up the numerators to get <M>\frac(1+2)(6)</M>. But how does this work when variables are involved, like when calculating <M>\frac(4x+3)(5x) - \frac(x-2)(5x)</M>? The answer is: exactly the same. But there are a few things to pay attention to.</Par>
		</Translation>

		<Translation entry="rule">
			<Head>Applying the rule</Head>
			<Par>We want to add/subtract two fractions with variables, like <BM>\frac(4x+3)(5x) - \frac(x-2)(5x).</BM> Note that these two fractions have an equal denominator. As a result, they're called <Term>like fractions</Term>. (When the two fractions are not like fractions, they are harder to add up. This will be discussed in a <SkillLink skillId="addFractionsWithVariables">follow-up skill</SkillLink>. This current skill only deals with like fractions.)</Par>
			<Par>To add/subtract two like fractions, the rule says to directly add/subtract the numerators, while keeping the denominator as it is. In general, it says that <BM>\frac(a)(c) \pm \frac(b)(c) = \frac(a \pm b)(c).</BM> When applying this rule, and especially when subtracting, brackets are crucial. After all, the two fractions from the example can also be written as <BM>\frac(4x+3)(5x) - \frac(x-2)(5x) = \left(\frac(4x+3)(5x)\right) - \left(\frac(x-2)(5x)\right).</BM> If we subsequently subtract the numerators, while keeping the same denominator, we get <BM>\left(\frac(4x+3)(5x)\right) - \left(\frac(x-2)(5x)\right) = \frac(\left(4x+3\right) - \left(x-2\right))(5x).</BM> According to the rule, this is what the two subtracted fractions are equal to. Note: the left set of brackets is not needed, but the brackets on the right are crucial. Without them the outcome would be something different.</Par>
		</Translation>

		<Translation entry="simplifying">
			<Head>Simplifying the outcome</Head>
			<Par>The above result is still unnecessarily long and can be simplified. The first step is to <SkillLink skillId="expandBrackets">expand all brackets</SkillLink> in the numerator. For the example, this results in <BM>\frac(\left(4x+3\right) - \left(x-2\right))(5x) = \frac(4x+3-x+2)(5x).</BM> Note that minus times minus becomes plus.</Par>
			<Par>Subsequently, it is often possible to <SkillLink skillId="mergeSimilarTerms">merge similar terms</SkillLink> together. Note that <M>3+2</M> can be turned into <M>5</M> and similarly <M>4x-x</M> can be turned into <M>3x</M>. So we can write <BM>\frac(4x+3-x+2)(5x) = \frac(3x+5)(5x).</BM> This cannot be simplified further, so we are done. Altogether, the final result can be written as <BM>\frac(4x+3)(5x) - \frac(x-2)(5x) = \frac(3x+5)(5x)</BM> In some cases there are further simplifications that can be done, like <SkillLink skillId="cancelFractionFactors">canceling fraction factors</SkillLink>. For instance, if we for example would have gotten something like <M>\frac(5x-5)(5x)</M> in the end, then a factor <M>5</M> could have been canceled as well. However, for this skill these further simplifications are not required.</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To add/subtract two like fractions with variables, like <M>\frac(4x+3)(5x) - \frac(x-2)(5x)</M>, take the following steps.</Par>
			<List items={[
				<>Directly add/subtract the numerators, keeping the denominator as it is. Use brackets where necessary. For the example this gives <M>\frac(\left(4x+3\right) - \left(x-2\right))(5x).</M></>,
				<><SkillLink skillId="expandBrackets">Expand all brackets</SkillLink> in the numerator. For the example we get <M>\frac(4x+3-x+2)(5x)</M>.</>,
				<><SkillLink skillId="mergeSimilarTerms">Merge similar terms</SkillLink> in the numerator together to simplify it as much as possible. This turns the example into <M>\frac(3x+5)(5x)</M>.</>,
			]} />
		</Translation>
	</>
}
