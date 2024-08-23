import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Term, M, BM } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>We know how to expand brackets, rewriting <M>4x\left(2x - 3\right)</M> as <M>8x^2 - 12x</M>. But can we also do the opposite? How do we <Term>pull a factor out of brackets</Term>? There is a slightly long procedure that always works, but afterwards we also look at a short-cut you can take.</Par>
		</Translation>

		<Translation entry="idea">
			<Head>The idea</Head>
			<Par>Suppose that we have an expression like <M>8x^2 - 12x</M> and we want to pull a <Term>factor</Term> <M>4x</M> out of the brackets. The first step is to write it as <BM>\rm(Original\ expression) = \rm(Factor) \cdot \left(\frac(\rm(Original\ expression))(\rm(Factor))\right).</BM> For our example, this means that we initially write <BM>8x^2 - 12x = 4x \left(\frac(8x^2 - 12x)(4x)\right).</BM> Note that dividing the original expression by <M>4x</M> and subsequently multiplying by it leaves it unchanged, so both sides of the equation must be the same.</Par>
			<Par>The fraction within the brackets can be simplified. First we can use the rules of <SkillLink skillId="addLikeFractionsWithVariables">merging/splitting like fractions</SkillLink> to split up the fraction, getting <BM>4x \left(\frac(8x^2 - 12x)(4x)\right) = 4x \left(\frac(8x^2)(4x) - \frac(12x)(4x)\right).</BM> Next, we can <SkillLink skillId="simplifyFractionWithVariables">simplify each of the resulting fractions</SkillLink> by canceling fraction factors, giving <BM>4x \left(\frac(8x^2)(4x) - \frac(12x)(4x)\right) = 4x \left(2x - 3\right).</BM> All together, the final outcome is <BM>8x^2 - 12x = 4x\left(2x - 3\right).</BM> At the end we can check if we have done everything correctly by <SkillLink skillId="expandBrackets">expanding the brackets</SkillLink>. When we do, we should wind up with the original expression, which is indeed the case for our example. That means we did not make a mistake.</Par>
		</Translation>

		<Translation entry="shortCut">
			<Head>The short-cut</Head>
			<Par>The above procedure with a fraction always works, but often it is a bit elaborate. In practice, it can be done faster. The idea is that we know we will wind up with an expression of the form <BM>8x^2 - 12x = 4x\left(\ldots - \ldots\right).</BM> We only have to figure out what comes on the place of the dots. The first set of dots should be something that, when multiplied by <M>4x</M>, becomes <M>8x^2</M>. With some experience we directly see that this is <M>\frac(8x^2)(4x) = 2x</M>. Similarly, the second set of dots should be something that, when multiplied by <M>4x</M>, becomes <M>12x</M>. We can once more realize that this is <M>\frac(12x)(4x) = 3</M>. In this way, we directly wind up with <BM>8x^2 - 12x = 4x\left(2x - 3\right).</BM> If you have enough experience to apply this short-cut, you are of course welcome to do so.</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To pull a factor out of brackets, like when pulling <M>4x</M> out of <M>8x^2 - 12x</M>, take the following steps.</Par>
			<List items={[
				<>Start by writing down <M>\rm(Original\ expression) = \rm(Factor) \cdot \left(\frac(\rm(Original\ expression))(\rm(Factor))\right)</M>. For our example we hence write <M>8x^2 - 12x = 4x\left(\frac(8x^2 - 12x)(4x)\right)</M>.</>,
				<>Split the fraction inside the brackets up into multiple fractions using the default rules for <SkillLink skillId="addLikeFractionsWithVariables">merging/splitting fractions</SkillLink>. For the example we hence get <M>4x\left(\frac(8x^2)(4x) - \frac(12x)(4x)\right)</M>.</>,
				<><SkillLink skillId="simplifyFractionWithVariables">Simplify all fractions</SkillLink> within the brackets, canceling factors where possible. This turns our example into <M>4x \left(2x - 3\right)</M>.</>,
				<>Check your result by <SkillLink skillId="expandBrackets">expanding the brackets</SkillLink> in your final result. You should wind up with exactly what you started with. And indeed, if we expand the brackets for <M>4x\left(2x - 3\right)</M> then we get <M>8x^2 - 12x</M>.</>
			]} />
			<Par>Note that there are short-cuts that directly get you the required result, if you have the insights to use them properly.</Par>
		</Translation>
	</>
}
