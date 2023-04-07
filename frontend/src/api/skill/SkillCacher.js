import React, { useState, useCallback, useMemo, useEffect, createContext, useContext } from 'react'

import { arraysToObject, keysToObject, applyToEachParameter } from 'step-wise/util/objects'
import { updateSkillDataSet } from 'step-wise/skillTracking'
import { skillTree, includePrerequisitesAndLinks, processSkill, getDefaultSkillData } from 'step-wise/edu/skills'

import { useConsistentValue } from 'util/react'
import { useUser } from 'api/user'

import { useSkillsQuery } from './queries'
import { useSkillsSubscription } from './subscriptions'

const SkillCacherContext = createContext()

export default function SkillCacher({ children }) {
	const [cache, setCache] = useState({})
	const [skillsToLoad, setSkillsToLoad] = useState([])

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
		const skillsAsObject = arraysToObject(skills.map(skill => skill.skillId), skills)
		const rawSkillDataSetUnprocessed = keysToObject(skillsWithPrerequisitesAndLinks, skillId => skillsAsObject[skillId] || getDefaultSkillData(skillId))
		const rawSkillDataSet = applyToEachParameter(rawSkillDataSetUnprocessed, skill => processSkill(skill))
		setCache(skillDataSet => updateSkillDataSet(skillDataSet, rawSkillDataSet, skillTree))
	}, [skillsWithPrerequisitesAndLinks, user, loading, error, skills, setCache])

	// When the user changes, clear the cache.
	useEffect(() => { setCache({}) }, [user])

	// Gather data for the context.
	const contextData = {
		cache,
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

// useSkillLoading takes a list of skillIds and ensures that they are being loaded by the cacher.
function useSkillLoading(skillIds) {
	skillIds = useConsistentValue(skillIds)
	const { addSkillsToLoad, removeSkillsToLoad } = useSkillCacherContext()
	useEffect(() => {
		addSkillsToLoad(skillIds)
		return () => removeSkillsToLoad(skillIds)
	}, [skillIds, addSkillsToLoad, removeSkillsToLoad])
}

// useSkillsData is the main function used by child components to load in data on skills. It ensures that the cacher loads in data on the requested skillIds, and when this data arrives it is processed and returned as SkillData objects.
export function useSkillsData(skillIds) {
	// Ensure the requested skills are being loaded.
	skillIds = useConsistentValue(skillIds)
	useSkillLoading(skillIds)

	// Process the skill data, inserting null when data is not fully available yet.
	const { cache } = useSkillCacherContext()
	const skillsData = useMemo(() => keysToObject(skillIds, skillId => {
		// On missing prerequisites/links, return null.
		const prerequisitesAndLinks = includePrerequisitesAndLinks([skillId])
		if (prerequisitesAndLinks.some(skillId => !cache[skillId]))
			return null
		return cache[skillId]
	}), [skillIds, cache])
	return useConsistentValue(skillsData)
}

// useSkillData takes a single skill ID and returns a SkillsData for it from the cache, loading it if necessary.
export function useSkillData(skillId) {
	const data = useSkillsData(skillId === undefined ? [] : [skillId])
	return data[skillId]
}
