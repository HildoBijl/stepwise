import React, { useState, useCallback, useMemo, useEffect, createContext, useContext, useSyncExternalStore } from 'react'

import { fromEntries, fromKeys, mapValues } from '@step-wise/utils'
import { SkillDataSet } from '@step-wise/skillTracking'
import { skillTree } from 'step-wise/eduTools'
import { includePrerequisitesAndLinks, processSkill, getDefaultSkillData } from 'step-wise/eduTools'

import { useConsistentValue, useConstant } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests due to Jest using the Node util package instead.
import { useUser } from 'api'

import { useSkillsQuery } from './queries'
import { useSkillsSubscription } from './subscriptions'

const SkillCacherContext = createContext()

export default function SkillCacher({ children }) {
	const [skillsToLoad, setSkillsToLoad] = useState([])
	const skillDataSet = useConstant(() => new SkillDataSet(skillTree))
	useSyncExternalStore(listener => skillDataSet.subscribe(listener), () => skillDataSet.getSnapshot())

	// Set up handlers to track which skills to load.
	const addSkillsToLoad = useCallback(additionSkillIds => {
		setSkillsToLoad(skillsToLoad => [...skillsToLoad, additionSkillIds])
	}, [setSkillsToLoad])
	const removeSkillsToLoad = useCallback(removalSkillIds => {
		setSkillsToLoad(skillsToLoad => skillsToLoad.filter(skillsToLoadElement => removalSkillIds.indexOf(skillsToLoadElement) !== 1))
	}, [setSkillsToLoad])
	const allSkillsToLoad = useConsistentValue(useMemo(() => [...new Set(skillsToLoad.flat())], [skillsToLoad]))

	// Load in all the skills from the database. Also listen to updates.
	const skillsWithPrerequisitesAndLinks = useMemo(() => includePrerequisitesAndLinks(allSkillsToLoad), [allSkillsToLoad])
	const { data, loading, error, subscribeToMore } = useSkillsQuery(skillsWithPrerequisitesAndLinks)
	useSkillsSubscription(subscribeToMore, allSkillsToLoad.length > 0)
	const skills = data?.skills

	// Implement any loaded data into the cache.
	const user = useUser()
	useEffect(() => {
		// Check if we should add anything.
		if (skillsWithPrerequisitesAndLinks.length === 0)
			return // Nothing to add.
		if (!user)
			return // No user to add anything for.
		if (loading)
			return // Still loading.
		if (error)
			return // Oops ... something went wrong. ToDo later: properly handle this error.

		// Fill up the loaded skills with default skills when missing (that is, not in the database yet), process them, and incorporate them into the data set.
		const skillsAsObject = fromEntries(skills.map(skill => skill.skillId), skills)
		const rawSkillDataSetUnprocessed = fromKeys(skillsWithPrerequisitesAndLinks, skillId => skillsAsObject[skillId] || getDefaultSkillData(skillId))
		const rawSkillDataSet = mapValues(rawSkillDataSetUnprocessed, skill => processSkill(skill))
		skillDataSet.update(rawSkillDataSet)
	}, [skillsWithPrerequisitesAndLinks, user, loading, error, skills, skillDataSet])

	// When the user changes, clear the cache.
	useEffect(() => { skillDataSet.clear() }, [skillDataSet, user?.id])

	// Gather data for the context.
	const contextData = {
		skillDataSet,
		addSkillsToLoad,
		removeSkillsToLoad,
	}

	// Render the context.
	return (
		<SkillCacherContext.Provider value={contextData}>
			{children}
		</SkillCacherContext.Provider>
	)
}

export function useSkillCacherContext() {
	return useContext(SkillCacherContext)
}

export function useSkillDataSet() {
	return useSkillCacherContext().skillDataSet
}

// useSkillLoading takes a list of skillIds and ensures that they are being loaded by the cacher.
function useSkillLoading(skillIds) {
	skillIds = useConsistentValue(skillIds)
	const { addSkillsToLoad, removeSkillsToLoad } = useSkillCacherContext()
	useEffect(() => {
		addSkillsToLoad(skillIds)
		return () => removeSkillsToLoad(skillIds)
	}, [skillIds, addSkillsToLoad, removeSkillsToLoad])
}

// useSkillsData is the main function used by child components to load in data on skills. It ensures that the cacher loads in data on the requested skillIds. The skillDataSet object is returned.
export function useSkillsData(skillIds) {
	// Ensure the requested skills are being loaded.
	skillIds = useConsistentValue(skillIds)
	useSkillLoading(skillIds)
	return useSkillDataSet()
}

// useSkillData takes a single skill ID and ensures it's loaded from the database. It returns the skillDataSet object.
export function useSkillData(skillId) {
	return useSkillsData(skillId === undefined ? [] : [skillId])
}
