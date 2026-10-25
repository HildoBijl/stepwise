import React from 'react'

import { moduleTree } from '@step-wise/module-tree'
import { hasExercises } from '@step-wise/exercises'
import { Condition, Plural, Translation, TranslationCatalog } from '@step-wise/i18n'
import { CountingWord } from 'i18n'
import { Head, Par, List, Warning } from 'ui/components'

import { SkillLink } from './routing'

export function MetaWrapper({ skillId, empty, children }) {
	return <>
		{children}
		<TranslationCatalog folder={['eduTools', 'pages']} name="meta">
			{empty ? <Warning><Translation id="emptySkillWarning">The contents of this skill have not been created yet.<Condition value={!!children}><Condition.False> The default meta-info is shown below.</Condition.False></Condition> Theory and exercises will likely be added soon.</Translation></Warning> : null}
			{!empty && !hasExercises(skillId) ? <Warning><Translation id="noExerciseWarning">This skill has no exercises yet. It cannot be practiced at this moment. Exercises will likely be added soon.</Translation></Warning> : null}
			<Head><Translation id="title">Links to other skills</Translation></Head>
			<Prerequisites skillId={skillId} />
			<Links skillId={skillId} />
			<Continuations skillId={skillId} />
			<SameGroup skillId={skillId} />
		</TranslationCatalog>
	</>
}

function Prerequisites({ skillId }) {
	const skill = moduleTree[skillId]
	const numPrerequisities = skill.prerequisiteIds.length
	if (numPrerequisities === 0)
		return <Par><Translation id="noPrerequisites">This skill has no <strong>prerequisites</strong>.</Translation></Par>
	return <>
		<Par><Translation id="prerequisites">This skill has <CountingWord>{numPrerequisities}</CountingWord> <strong>prerequisite</strong> <Plural value={numPrerequisities}><Plural.One>skill</Plural.One><Plural.Other>skills</Plural.Other></Plural>.</Translation></Par>
		<SkillList skillIds={skill.prerequisiteIds} />
	</>
}

function Links({ skillId }) {
	const skill = moduleTree[skillId]
	const numLinks = skill.linkedSkillIds.length
	if (numLinks === 0)
		return null
	return <>
		<Par><Translation id="links">It is <strong>similar</strong> (correlated) to <CountingWord>{numLinks}</CountingWord> <Plural value={numLinks}><Plural.One>skill</Plural.One><Plural.Other>skills</Plural.Other></Plural>.</Translation></Par>
		<SkillList skillIds={skill.linkedSkillIds} />
	</>
}

function Continuations({ skillId }) {
	const skill = moduleTree[skillId]
	const numContinuations = skill.continuationIds.length
	if (numContinuations === 0)
		return <Par><Translation id="noContinuations">It is an <strong>end goal</strong>: it is not needed for any other skills.</Translation></Par>
	return <>
		<Par><Translation id="continuations">It is a <strong>requirement</strong> for <CountingWord>{numContinuations}</CountingWord> other <Plural value={numContinuations}><Plural.One>skill</Plural.One><Plural.Other>skills</Plural.Other></Plural>.</Translation></Par>
		<SkillList skillIds={skill.continuationIds} />
	</>
}

function SameGroup({ skillId }) {
	const skill = moduleTree[skillId]
	const groupSkillIds = skill.groupModuleIds.filter(moduleId => moduleTree[moduleId].type === 'skill')
	const numSkillsInGroup = groupSkillIds.length
	if (numSkillsInGroup <= 1)
		return null
	return <>
		<Par><Translation id="sameGroup">It is part of the group <strong>{{ group: skill.groupPath.join('/') }}</strong> consisting of <CountingWord>{numSkillsInGroup}</CountingWord> <Plural value={numSkillsInGroup}><Plural.One>skill</Plural.One><Plural.Other>skills</Plural.Other></Plural> in total.</Translation></Par>
		<SkillList skillIds={groupSkillIds} />
	</>
}

function SkillList({ skillIds }) {
	return <List>
		{skillIds.map(skillId => <List.Item key={skillId}><SkillLink skillId={skillId} /></List.Item>)}
	</List>
}
