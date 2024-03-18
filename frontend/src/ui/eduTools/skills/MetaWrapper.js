import React from 'react'
import { Link } from 'react-router-dom'

import { skillTree } from 'step-wise/eduTools/skills/skillTree'

import { Plurals, CountingWord } from 'i18n'
import { useAdjustedPath } from 'ui/routingTools'
import { Head, Par, List, Warning } from 'ui/components'

export function MetaWrapper({ children, skillId }) {
	const skill = skillTree[skillId]
	return <>
		{children}
		{skill.exercises.length === 0 ? <Warning>This skill has no exercises yet. It cannot be practiced at this moment. Exercises will likely be added in the future.</Warning> : null}
		<Head>Links to other skills</Head>
		<Prerequisites skillId={skillId} />
		<Links skillId={skillId} />
		<Continuations skillId={skillId} />
		<SameGroup skillId={skillId} />
	</>
}

function Prerequisites({ skillId }) {
	const skill = skillTree[skillId]
	const numPrerequisities = skill.prerequisites.length
	if (numPrerequisities === 0)
		return <Par>This skill has no <strong>prerequisites</strong>.</Par>
	return <>
		<Par>This skill has <CountingWord>{numPrerequisities}</CountingWord> <strong>prerequisite</strong> <Plurals value={numPrerequisities}><Plurals.One>skill</Plurals.One><Plurals.NotOne>skills</Plurals.NotOne></Plurals>.</Par>
		<SkillList skillIds={skill.prerequisites} />
	</>
}

function Links({ skillId }) {
	const skill = skillTree[skillId]
	const numLinks = skill.linkedSkills.length
	if (numLinks === 0)
		return null
	return <>
		<Par>It is <strong>similar</strong> (correlated) to <CountingWord>{numLinks}</CountingWord> <Plurals value={numLinks}><Plurals.One>skill</Plurals.One><Plurals.NotOne>skills</Plurals.NotOne></Plurals>.</Par>
		<SkillList skillIds={skill.linkedSkills} />
	</>
}

function Continuations({ skillId }) {
	const skill = skillTree[skillId]
	const numContinuations = skill.continuations.length
	if (numContinuations === 0)
		return <Par>It is an <strong>end goal</strong>: it is not needed for any other skills.</Par>
	return <>
		<Par>It is a <strong>requirement</strong> for <CountingWord>{numContinuations}</CountingWord> other <Plurals value={numContinuations}><Plurals.One>skill</Plurals.One><Plurals.NotOne>skills</Plurals.NotOne></Plurals>.</Par>
		<SkillList skillIds={skill.continuations} />
	</>
}

function SameGroup({ skillId }) {
	const skill = skillTree[skillId]
	const numSkillsInGroup = skill.skillsInGroup.length
	if (numSkillsInGroup <= 1)
		return null
	return <>
		<Par>It is part of the group <strong>{skill.path.join('/')}</strong> consisting of <CountingWord>{numSkillsInGroup}</CountingWord> <Plurals value={numSkillsInGroup}><Plurals.One>skill</Plurals.One><Plurals.NotOne>skills</Plurals.NotOne></Plurals> in total.</Par>
		<SkillList skillIds={skill.skillsInGroup} />
	</>
}

function SkillList({ skillIds }) {
	return <List items={skillIds.map(skillId => <SkillLink skillId={skillId} />)} />
}

function SkillLink({ skillId }) {
	const skill = skillTree[skillId]
	const path = useAdjustedPath({ skillId })
	return <Link to={path}>{skill.name}</Link>
}
