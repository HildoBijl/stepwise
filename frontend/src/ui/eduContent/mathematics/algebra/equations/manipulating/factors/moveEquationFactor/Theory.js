import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Term, M, BM } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>A <Term>product equation</Term> is an equation like <M>2x = \frac(5)(3)</M> where both sides of the equation only have multiplications/divisions; no additions or subtractions. When we have such an equation, it is helpful to be able to <Term>move factors</Term> around in the equation. That's what this skill is about. We look at how we do this, and what short-cuts we can take.</Par>
		</Translation>

		<Translation entry="removingMultiplications">
			<Head>Getting rid of a multiplication</Head>
			<Par>One thing that we can do with the equation <M>2x = \frac(5)(3)</M> is to get rid of the <Term>multiplication factor</Term> <M>2</M> on the left. To do so, we can first <SkillLink skillId="multiplyBothEquationSides">divide both sides of the equation</SkillLink> by <M>2</M>. This gives <BM>\frac(2x)(2) = \frac(\frac(5)(3))(2).</BM> Both sides of the equation can be simplified. On the left we can <SkillLink skillId="cancelFractionFactors">cancel fraction factors</SkillLink> to get rid of the <M>2</M> on both sides of the fraction, leaving us with just <M>x</M>. We see that the <M>2</M> indeed disappears from the left side of the equation, as was our goal. On the right, we can <SkillLink skillId="multiplyDivideFractions">simplify the fraction division</SkillLink> to get <M>\frac(5)(2 \cdot 3)</M> (or alternatively <M>\frac(5)(6)</M>). The final result is <BM>x = \frac(5)(2 \cdot 3).</BM> Note that we have moved the multiplication factor <M>2</M> from the left to the right, and when we did, it turned into a division factor.</Par>
		</Translation>

		<Translation entry="removingDivisions">
			<Head>Getting rid of a division</Head>
			<Par>We could've also done something different with the equation <M>2x = \frac(5)(3)</M>, which is to get rid of the <Term>division factor</Term> <M>3</M> on the right. To do so, we can <SkillLink skillId="multiplyBothEquationSides">multiply both sides of the equation</SkillLink> by <M>3</M>. This turns it into <BM>2x \cdot 3 = \frac(5)(3) \cdot 3.</BM> On the right, the division by <M>3</M> and the multiplication by <M>3</M> <SkillLink skillId="cancelFractionFactors">cancel out</SkillLink>, so this side reduces to just <M>5</M>. The result can be rewritten as <BM>2 \cdot 3x = 5.</BM> Note that we have moved the division factor <M>3</M> from the right to the left, where it turned into a multiplication factor.</Par>
		</Translation>

		<Translation entry="shortCut">
			<Head>The short-cut</Head>
			<Par>We can summarize the above ideas into a useful short-cut. If we move a factor (multiplication or division) from one side of the equation to the other, we should do the following.</Par>
			<List items={[
				<>If the factor is a multiplication factor (it's in the numerator of a fraction, or just in a multiplication) then on the other side it will appear as a division factor (in the denominator of a fraction). So <M>2x = \frac(5)(3)</M> turns into <M>x = \frac(5)(2 \cdot 3)</M>.</>,
				<>If the factor is a division factor (in the denominator of a fraction) then on the other side it will appear as a multiplication factor (in the numerator of a fraction, or just in a multiplication). So <M>2x = \frac(5)(3)</M> turns into <M>2 \cdot 3x = 5</M>.</>
			]} />
			<Par>Using this idea, we can also directly move factors around, without applying the in-between steps.</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To move a factor from one side of a product equation to the other, like when moving the factor <M>2</M> in the equation <M>2x = \frac(5)(3)</M>, take the following steps.</Par>
			<List items={[
				<>If the factor is in a multiplication, <SkillLink skillId="multiplyBothEquationSides">divide both sides of the equation</SkillLink> by the factor. Or alternatively, if the factor is being divided by, <SkillLink skillId="multiplyBothEquationSides">multiply both sides of the equation</SkillLink> by the factor. For the example, we divide by <M>2</M> to get <M>\frac(2x)(2) = \frac(5/3)(2)</M>.</>,
				<><SkillLink skillId="cancelFractionFactors">Cancel fraction factors</SkillLink> to get rid of the factor that has to be moved. For the example, we turn <M>\frac(2x)(2)</M> into <M>x</M>.</>,
				<>Depending on the situation, it may also be needed to <SkillLink skillId="multiplyDivideFractions">simplify a fraction inside a fraction</SkillLink> into a single fraction. For the example, we turn <M>\frac(5/3)(2)</M> into <M>\frac(5)(2 \cdot 3)</M>, which optionally can still be written as <M>\frac(5)(6)</M>.</>,
			]} />
			<Par>Note that you can also use a short-cut: if a factor is originally multiplied on one side, it will be divided by on the other side, and vice versa.</Par>
		</Translation>
	</>
}
