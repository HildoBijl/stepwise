import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Term, M, BM } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>Equations often have summations with various <Term>terms</Term>. For instance in <M>x^2 + 2x = 3</M> the left side has terms <M>x^2</M> and <M>2x</M> while the right side has the term <M>3</M>. A common thing we can do with equations is <Term>move terms</Term> to the other side of the equation. We'll first study the idea of how we can do that, and then summarize this idea into a short-cut.</Par>
		</Translation>

		<Translation entry="movingAnAddedTerm">
			<Head>Moving an added term</Head>
			<Par>Suppose we have the equation <M>x^2 + 2x = 3</M> and (for whatever reason) we want to get rid of the term <M>2x</M> on the left. To do so, the first step is to <SkillLink skillId="addTermToBothEquationSides">subtract <M>2x</M> from both sides</SkillLink>. We are allowed to do this because, when we add or subtract the same term from both sides of the equation, the equation still remains valid. In this way we get <BM>x^2 + 2x - 2x = 3 - 2x.</BM> Subsequently, we can see that on the left side adding <M>2x</M> and subsequently subtracting <M>2x</M> has no effect. We can hence <SkillLink skillId="cancelSumTerms">cancel these sum terms</SkillLink> to get <BM>x^2 = 3 - 2x.</BM> Note that, when we compare this to the original equation <M>x^2 + 2x = 3</M>, we have removed the term <M>2x</M> from the left side, while keeping the equation valid. The result is that this term <M>2x</M> has moved to the right side of the equation, and while it used to have a plus sign on the left, now it has a minus sign on the right.</Par>
		</Translation>

		<Translation entry="movingASubtractedTerm">
			<Head>Moving a subtracted term</Head>
			<Par>But what if we started with a different equation, containing a minus sign? Like <M>x^2 - 2x = 3</M>? In this case the procedure would have been nearly the same, but this time we have to add <M>2x</M> to both sides. This gives <BM>x^2 - 2x + 2x = 3 + 2x.</BM> On the left, we can <SkillLink skillId="cancelSumTerms">cancel sum terms</SkillLink> again, to end up at <BM>x^2 = 3 + 2x.</BM> Note that we have once more moved the term <M>2x</M> to the other side of the equation. Where before (on the left) it had a minus sign, it now (on the right) has a plus sign.</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To move a term from one side of an equation to the other, like when moving the term <M>2x</M> in the equation <M>x^2 + 2x = 3</M>, take the following steps.</Par>
			<List items={[
				<>If the term is being added (has a plus sign), <SkillLink skillId="addTermToBothEquationSides">subtract this term from both sides of the equation</SkillLink>. Or alternatively, if the term is being subtracted (has a minus sign), <SkillLink skillId="addTermToBothEquationSides">add this term to both sides of the equation</SkillLink>. For the example, we subtract <M>2x</M> to get <M>x^2 + 2x - 2x = 3 - 2x</M>.</>,
				<><SkillLink skillId="cancelSumTerms">Cancel sum terms</SkillLink> to get rid of the term that has to be moved. For the example, we have <M>+2x-2x</M> disappearing, leaving the equation as <M>x^2 = 3 - 2x</M>.</>,
			]} />
		</Translation>

		<Translation entry="shortCut">
			<Head>The short-cut</Head>
			<Par>Instead of going through all of the above steps, we can also take a short-cut and directly move the equation term.</Par>
			<List items={[
				<>If the term was added (had a plus sign) on the original side, then it will be subtracted (have a minus sign) on the other side. So <M>x^2 + 2x = 3</M> directly turns into <M>x^2 = 3 - 2x</M>.</>,
				<>If the term was subtracted (had a minus sign) on the original side, then it will be added (have a plus sign) on the other side. So <M>x^2 - 2x = 3</M> directly turns into <M>x^2 = 3 + 2x</M>.</>
			]} />
		</Translation>
	</>
}
