import React from 'react'

import { skillTree } from '@step-wise/skill-tree'
import { hasExercises } from '@step-wise/exercises'

import { TranslationFile, Translation, Check, Plurals, CountingWord } from 'i18n'
import { Head, Par, List, Warning } from 'ui/components'

import { SkillLink } from './routing'

export function MetaWrapper({ skillId, empty, children }) {
	return <>
		{children}
		<TranslationFile path="eduTools/pages/meta" extend={false}>
			{empty ? <Warning><Translation entry="emptySkillWarning">The contents of this skill have not been created yet.<Check value={!!children}><Check.False> The default meta-info is shown below.</Check.False></Check> Theory and exercises will likely be added soon.</Translation></Warning> : null}
			{!empty && !hasExercises(skillId) ? <Warning><Translation entry="noExerciseWarning">This skill has no exercises yet. It cannot be practiced at this moment. Exercises will likely be added soon.</Translation></Warning> : null}
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
	const numPrerequisities = skill.prerequisiteIds.length
	if (numPrerequisities === 0)
		return <Par><Translation entry="noPrerequisites">This skill has no <strong>prerequisites</strong>.</Translation></Par>
	return <>
		<Par><Translation entry="prerequisites">This skill has <CountingWord>{numPrerequisities}</CountingWord> <strong>prerequisite</strong> <Plurals value={numPrerequisities}><Plurals.One>skill</Plurals.One><Plurals.NotOne>skills</Plurals.NotOne></Plurals>.</Translation></Par>
		<SkillList skillIds={skill.prerequisiteIds} />
	</>
}

function Links({ skillId }) {
	const skill = skillTree[skillId]
	const numLinks = skill.linkedSkillIds.length
	if (numLinks === 0)
		return null
	return <>
		<Par><Translation entry="links">It is <strong>similar</strong> (correlated) to <CountingWord>{numLinks}</CountingWord> <Plurals value={numLinks}><Plurals.One>skill</Plurals.One><Plurals.NotOne>skills</Plurals.NotOne></Plurals>.</Translation></Par>
		<SkillList skillIds={skill.linkedSkillIds} />
	</>
}

function Continuations({ skillId }) {
	const skill = skillTree[skillId]
	const numContinuations = skill.continuationIds.length
	if (numContinuations === 0)
		return <Par><Translation entry="noContinuations">It is an <strong>end goal</strong>: it is not needed for any other skills.</Translation></Par>
	return <>
		<Par><Translation entry="continuations">It is a <strong>requirement</strong> for <CountingWord>{numContinuations}</CountingWord> other <Plurals value={numContinuations}><Plurals.One>skill</Plurals.One><Plurals.NotOne>skills</Plurals.NotOne></Plurals>.</Translation></Par>
		<SkillList skillIds={skill.continuationIds} />
	</>
}

function SameGroup({ skillId }) {
	const skill = skillTree[skillId]
	const numSkillsInGroup = skill.groupSkillIds.length
	if (numSkillsInGroup <= 1)
		return null
	return <>
		<Par><Translation entry="sameGroup">It is part of the group <strong>{{ group: skill.path.join('/') }}</strong> consisting of <CountingWord>{numSkillsInGroup}</CountingWord> <Plurals value={numSkillsInGroup}><Plurals.One>skill</Plurals.One><Plurals.NotOne>skills</Plurals.NotOne></Plurals> in total.</Translation></Par>
		<SkillList skillIds={skill.groupSkillIds} />
	</>
}

function SkillList({ skillIds }) {
	return <List items={skillIds.map(skillId => <SkillLink skillId={skillId} />)} />
}
