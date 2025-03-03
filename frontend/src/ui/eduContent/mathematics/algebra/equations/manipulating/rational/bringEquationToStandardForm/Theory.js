import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Term, M, BM } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>Solving an equation is often done in two steps: first you clean up the equation, and then you solve this cleaned-up equation according to a fixed plan. The "cleaning up" part is what we practice in this skill. To be precise, our goal is to reduce every equation (where possible) to a certain <Term>standard form</Term>.</Par>
		</Translation>

		<Translation entry="standardForm">
			<Head>The standard form: a polynomial</Head>
			<Par>Consider an equation like <BM>\frac(2)(x-4) + 2 = \frac(3)(x+1).</BM> This is a so-called <Term>rational equation</Term>: it only has numbers, fractions and powers of <M>x</M>. There are no roots or other types of functions. Such an equation can always be rewritten into a <Term>standard form</Term>. For the above equation (as we will see in a bit) this would be <BM>2x^2 - 7x + 6 = 0.</BM> Note that the right-hand side of the equation is zero, and the left-hand side is a so-called <Term>polynomial</Term>. Here "polynomial" means: there are no fractions with <M>x</M>, and there are no unexpanded brackets. There are only powers of <M>x</M> with numbers in front of them. On top of that, the powers of <M>x</M> are sorted, with the highest power at the start. When this is the case for our equation - the right-hand side is zero and the left-hand side is a polynomial - then the equation is in a standard form.</Par>
		</Translation>

		<Translation entry="bringingToStandardForm">
			<Head>Bring an equation into standard form</Head>
			<Par>So how do we get a complicated equation like the example above into such a standard form? First we want to get <M>x</M> out of any fraction denominator. So we <SkillLink skillId="multiplyAllEquationTerms">multiply all terms</SkillLink> by both <M>x-4</M> and by <M>x+1</M>. This results in <BM>2\left(x+1\right) + 2\left(x-4\right)\left(x+1\right) = 3\left(x-4\right).</BM> Next, we also want to get rid of the brackets. <SkillLink skillId="expandDoubleBrackets">Expanding all brackets</SkillLink> turns this into <BM>2x + 2 + 2x^2 + 2x - 8x - 8 = 3x - 12.</BM> <SkillLink skillId="mergeSimilarTerms">Merging similar terms</SkillLink> subsequently results in <BM>2x^2 - 4x - 6 = 3x - 12.</BM> <SkillLink skillId="moveEquationTerm">Bringing all terms to the left</SkillLink> turns this into the final result <BM>2x^2 - 7x + 6 = 0.</BM> We have brought the equation into its standard form.</Par>
		</Translation>

		<Translation entry="normalization">
			<Head>To normalize or not to normalize</Head>
			<Par>Note that our equation satisfies the conditions we set. However, we can still divide it by <M>2</M> to get <BM>x^2 - \frac(7)(2)x + 3 = 0.</BM> That is, we ensure that the highest power of <M>x</M> has no number (well, technically the number <M>1</M>) in front of it. When we do this, we <Term>normalize</Term> the equation.</Par>
			<Par>But which form is cleaner? Mathematicians have different opinions here. Some argue that the first form is cleaner, since it has no fraction at all, even for the numbers. Others argue that the second normalized version is cleaner. After all, there are infinitely many versions of the equation that meet our requirements (we can multiply it by any number) but there is only one version where the highest power of <M>x</M> has no number in front of it. It is unique!</Par>
			<Par>In practice, it really depends on the situation what is more convenient. Sometimes you want to normalize the equation, and sometimes it is easier to get rid of any potential fractions. So at exercises, we will clearly indicate what needs to be done.</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To bring a rational equation like <M>\frac(2)(x-4) + 2 = \frac(3)(x+1)</M> into standard form, take the following steps.</Par>
			<List items={[
				<>If <M>x</M> is in some fraction denominator, <SkillLink skillId="multiplyAllEquationTerms">multiply all equation terms</SkillLink> by this denominator to get it out. For our example we do this twice to get <M>2\left(x+1\right) + 2\left(x-4\right)\left(x+1\right) = 3\left(x-4\right)</M>.</>,
				<><SkillLink skillId="expandDoubleBrackets">Expand all brackets</SkillLink> in the equation. This turns our example into <M>2x + 2 + 2x^2 + 2x - 8x - 8 = 3x - 12</M>.</>,
				<><SkillLink skillId="moveEquationTerm">Move all terms to the left</SkillLink> and <SkillLink skillId="mergeSimilarTerms">merge similar terms</SkillLink>, sorting them by the power of <M>x</M>, with the highest power first. For our example we end up with <M>2x^2 - 7x + 6 = 0</M>.</>,
				<>Depending on the exact requirements, you may need to normalize the equation or get rid of potential number fractions. <SkillLink skillId="multiplyAllEquationTerms">Multiply/divide</SkillLink> by the right number to make this happen. For our example, if we need to normalize the equation, we divide by <M>2</M> to get <M>x^2 - \frac(7)(2)x + 3 = 0</M>.</>,
			]} />
		</Translation>
	</>
}
