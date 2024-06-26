import React from 'react'

import { skillTree } from 'step-wise/eduTools/skills/skillTree'

import { TranslationFile, Translation, Check, Plurals, CountingWord } from 'i18n'
import { Head, Par, List, Warning } from 'ui/components'

import { SkillLink } from './routing'

export function MetaWrapper({ skillId, empty, children }) {
	const skill = skillTree[skillId]
	const hasExercises = Array.isArray(skill.exercises) && skill.exercises.length > 0
	return <>
		{children}
		<TranslationFile path="eduTools/pages/meta" extend={false}>
			{empty ? <Warning><Translation entry="emptySkillWarning">The contents of this skill have not been created yet.<Check value={!!children}><Check.False> The default meta-info is shown below.</Check.False></Check> Theory and exercises will likely be added soon.</Translation></Warning> : null}
			{!empty && !hasExercises ? <Warning><Translation entry="noExerciseWarning">This skill has no exercises yet. It cannot be practiced at this moment. Exercises will likely be added soon.</Translation></Warning> : null}
			<Head><Translation entry="title">Links to other skills</Translation></Head>
			<Prerequisites skillId={skillId} />
			<Links skillId={skillId} />
			<Continuations skillId={skillId} />
			<SameGroup skillId={skillId} />
		</TranslationFile>
	</>
}

function Prerequisites({ skillId }) {
	const skill = skillTree[skillId]
	const numPrerequisities = skill.prerequisites.length
	if (numPrerequisities === 0)
		return <Par><Translation entry="noPrerequisites">This skill has no <strong>prerequisites</strong>.</Translation></Par>
	return <>
		<Par><Translation entry="prerequisites">This skill has <CountingWord>{numPrerequisities}</CountingWord> <strong>prerequisite</strong> <Plurals value={numPrerequisities}><Plurals.One>skill</Plurals.One><Plurals.NotOne>skills</Plurals.NotOne></Plurals>.</Translation></Par>
		<SkillList skillIds={skill.prerequisites} />
	</>
}

function Links({ skillId }) {
	const skill = skillTree[skillId]
	const numLinks = skill.linkedSkills.length
	if (numLinks === 0)
		return null
	return <>
		<Par><Translation entry="links">It is <strong>similar</strong> (correlated) to <CountingWord>{numLinks}</CountingWord> <Plurals value={numLinks}><Plurals.One>skill</Plurals.One><Plurals.NotOne>skills</Plurals.NotOne></Plurals>.</Translation></Par>
		<SkillList skillIds={skill.linkedSkills} />
	</>
}

function Continuations({ skillId }) {
	const skill = skillTree[skillId]
	const numContinuations = skill.continuations.length
	if (numContinuations === 0)
		return <Par><Translation entry="noContinuations">It is an <strong>end goal</strong>: it is not needed for any other skills.</Translation></Par>
	return <>
		<Par><Translation entry="continuations">It is a <strong>requirement</strong> for <CountingWord>{numContinuations}</CountingWord> other <Plurals value={numContinuations}><Plurals.One>skill</Plurals.One><Plurals.NotOne>skills</Plurals.NotOne></Plurals>.</Translation></Par>
		<SkillList skillIds={skill.continuations} />
	</>
}

function SameGroup({ skillId }) {
	const skill = skillTree[skillId]
	const numSkillsInGroup = skill.skillsInGroup.length
	if (numSkillsInGroup <= 1)
		return null
	return <>
		<Par><Translation entry="sameGroup">It is part of the group <strong>{{ group: skill.path.join('/') }}</strong> consisting of <CountingWord>{numSkillsInGroup}</CountingWord> <Plurals value={numSkillsInGroup}><Plurals.One>skill</Plurals.One><Plurals.NotOne>skills</Plurals.NotOne></Plurals> in total.</Translation></Par>
		<SkillList skillIds={skill.skillsInGroup} />
	</>
}

function SkillList({ skillIds }) {
	return <List items={skillIds.map(skillId => <SkillLink skillId={skillId} />)} />
}
