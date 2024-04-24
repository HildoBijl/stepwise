import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>After having learned how to <SkillLink skillId="multiplication">multiply numbers</SkillLink> and how to <SkillLink skillId="summation">add numbers</SkillLink>, we now combine these skills. Our goal is to calculate <Term>composite expressions</Term>, like for instance <M>16 + 3 \cdot 5</M>.</Par>
		</Translation>

		<Translation entry="calculationSteps">
			<Head>The steps</Head>
			<Par>To calculate an expression like <M>16 + 3 \cdot 5</M>, you take the following <Term>steps</Term>.</Par>
			<List items={[
				<>Determine the <Term>order</Term> in which operations should be applied. Multiplications is always done before summation, so <M>3 \cdot 5</M> should be calculated before anything is added up.</>,
				<>Calculate the <Term>multiplication(s)</Term>. We turn <M>3 \cdot 5</M> into <M>15</M>.</>,
				<>Calculate the <Term>addition</Term>. This then turns <M>16 + 15</M> into <M>31</M> which is the final result.</>,
			]} />
		</Translation>

		<Translation entry="stepWiseExercises">
			<Head>Step-Wise exercises</Head>
			<Par>In Step-Wise, when practicing composite skills, it is always possible to <Term>split exercises into steps</Term>. These steps are then connected to earlier skills, which you have shown mastery of before. This always allows you to complete the more complicated exercises too: it's just a combination of things you already know!</Par>
			<Par>Behind the scenes, our skill tracking algorithm will <Term>take every action into account</Term>. If you fail at a specific step (for instance at addition) then your rating for that step will decrease. If it drops too much, you will be suggested to practice this skill separately a bit more. In this way the Step-Wise app coaches you to always practice the skill most relevant to you. It's there to support you!</Par>
		</Translation>
	</>
}
