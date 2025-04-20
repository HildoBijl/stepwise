import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, M, BM } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>Previously we looked into <SkillLink skillId="addFractionsWithMultipleVariables">adding fractions</SkillLink> (writing a sum of fractions as a single fraction) as well as <SkillLink skillId="simplifyFractionOfFractionsWithVariables">dividing fractions</SkillLink> (writing a fraction of fractions as a single fraction). This time we study a harder case. If we have a fraction that contains sums of fractions, like <M>\left(\frac(a)(2) + \frac(b)(3)\right) / \left(\frac(5)(4c)\right)</M>, how do we turn this into a single fraction?</Par>
		</Translation>

		<Translation entry="adding">
			<Head>Adding fractions</Head>
			<Par>The first step is to add fractions where possible. In this case there is only one sum of fractions. To add them together, we first make sure they have equal denominator. This turns the original expression into <BM>\frac(\frac(a)(2) + \frac(b)(3))(\frac(5)(4c)) = \frac(\frac(3a)(6) + \frac(2b)(6))(\frac(5)(4c)).</BM> Adding the fractions together then gives <BM>\frac(\frac(3a)(6) + \frac(2b)(6))(\frac(5)(4c)) = \frac(\frac(3a + 2b)(6))(\frac(5)(4c)).</BM> Now there are no additions/subtractions of fractions anymore.</Par>
		</Translation>

		<Translation entry="simplifying">
			<Head>Simplifying fraction divisions</Head>
			<Par>The second and final step is to simplify the division of fractions. First we use the default rules for dividing fractions to write it as a single fraction, <BM>\frac(\frac(3a + 2b)(6))(\frac(5)(4c)) = \frac(\left(3a + 2b\right) \cdot 4c)(6 \cdot 5).</BM> The numbers in this fraction can still be simplified further. Specifically, we can divide both the numerator and the denominator by <M>2</M> to get <BM>\frac(\left(3a + 2b\right) \cdot 4c)(6 \cdot 5) = \frac(2c\left(3a + 2b\right))(15).</BM> This is as simple as it gets. Of course the brackets could still be expanded, but it is a matter of preference whether that is actually "simpler" so this is optional here.</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To simplify a fraction of fraction sums, like <M>\left(\frac(a)(2) + \frac(b)(3)\right) / \left(\frac(5)(4c)\right)</M>, take the following steps.</Par>
			<List items={[
				<><SkillLink skillId="addFractionsWithMultipleVariables">Write all additions/subtractions of fractions as single fractions</SkillLink>. This turns the example into <M>\left(\frac(3a + 2b)(6)\right) / \left(\frac(5)(4c)\right)</M>.</>,
				<><SkillLink skillId="simplifyFractionOfFractionsWithVariables">Simplify the fraction of fractions</SkillLink>, writing it as a single fraction and canceling factors where possible. For the example we get the final result <M>\frac(2c\left(3a + 2b\right))(15)</M>.</>,
			]} />
		</Translation>
	</>
}
