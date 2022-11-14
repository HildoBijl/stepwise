import React, { useState, useRef, useCallback, useMemo, useEffect, createContext, useContext } from 'react'

import { keysToObject } from 'step-wise/util/objects'
import SkillData from 'step-wise/edu/skills/SkillData'
import { includePrerequisites, processSkill, getDefaultSkillData } from 'step-wise/edu/skills/util'

import { useConsistentValue } from 'util/react'
import { useUser } from 'api/user'
import { useSkillsQuery, useSkillsSubscription } from 'api/skill'

const SkillCacherContext = createContext()

export default function SkillCacher({ children }) {
	const [cache, setCache] = useState({})
	const [skillsToLoad, setSkillsToLoad] = useState([])
	const skillsDataRef = useRef({})

	// Set up handlers to track which skills to load.
	const addSkillsToLoad = useCallback(skillIds => {
		setSkillsToLoad(skillsToLoad => [...skillsToLoad, skillIds])
	}, [setSkillsToLoad])
	const removeSkillsToLoad = useCallback(skillIds => {
		setSkillsToLoad(skillsToLoad => skillsToLoad.filter(skillsToLoadElement => skillsToLoadElement !== skillIds))
	}, [setSkillsToLoad])
	const allSkillsToLoad = useConsistentValue(useMemo(() => [...new Set(skillsToLoad.flat())], [skillsToLoad]))

	// updateCache adds an array of skills to the cache, overwriting older ones if present. It only does this when it finds a difference between the cached version and the new version; if there is no difference, it overwrites nothing.
	const updateCache = useCallback((skills) => {
		setCache(cache => {
			const newCache = { ...cache }
			let hasUpdates
			skills.forEach(skill => {
				skill = processSkill(skill)
				const cachedSkill = cache[skill.skillId]
				if (!cachedSkill || cachedSkill.coefficientsOn.getTime() !== skill.coefficientsOn.getTime() || cachedSkill.coefficients.length !== skill.coefficients.length || cachedSkill.numPracticed !== skill.numPracticed) {
					newCache[skill.skillId] = skill
					hasUpdates = true
				}
			})
			return hasUpdates ? newCache : cache
		})
	}, [setCache])

	// Load in all the skills from the database. Also listen to updates.
	const { data, loading, error, subscribeToMore } = useSkillsQuery(allSkillsToLoad)
	useSkillsSubscription(subscribeToMore, allSkillsToLoad.length > 0)
	const skills = data?.skills

	// Implement any loaded data into the cache.
	useEffect(() => {
		// Check if we should add anything.
		if (allSkillsToLoad.length === 0)
			return // Nothing to add.
		if (loading)
			return // Still loading.
		if (error)
			return // Oops ... something went wrong. ToDo later: properly handle this error.

		// Add the loaded skills, or use default skills if skills are missing (that is, not in the database yet).
		const loadedSkills = [...skills]
		const present = {}
		loadedSkills.forEach(skill => {
			present[skill.skillId] = true
		})
		allSkillsToLoad.forEach(skillId => {
			if (!present[skillId])
				loadedSkills.push(getDefaultSkillData(skillId))
		})
		updateCache(loadedSkills)
	}, [allSkillsToLoad, loading, error, skills, updateCache])

	// When the user changes, clear the cache.
	const user = useUser()
	useEffect(() => {
		setCache({})
	}, [user])

	// Gather data for the context.
	const contextData = {
		cache,
		updateCache,
		skillsDataRef,
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
	// Ensure that the skills are being loaded by the cacher.
	const { addSkillsToLoad, removeSkillsToLoad } = useSkillCacherContext()
	skillIds = useConsistentValue(skillIds)
	const skillsWithPrerequisites = useMemo(() => includePrerequisites(skillIds), [skillIds])
	useEffect(() => {
		addSkillsToLoad(skillsWithPrerequisites)
		return () => removeSkillsToLoad(skillsWithPrerequisites)
	}, [skillsWithPrerequisites, addSkillsToLoad, removeSkillsToLoad])
}

// useSkillsData is the main function used by child components to load in data on skills. It ensures that the cacher loads in data on the requested skillIds, and when this data arrives it is processed and returned as SkillData objects.
export function useSkillsData(skillIds) {
	// Check the given skills and ensure they are being loaded.
	if (!skillIds || !Array.isArray(skillIds))
		throw new Error(`Invalid skillIds given: expected an array but received "${skillIds}".`)
	useSkillLoading(skillIds)

	// Based on the cache, update processed skill data where needed.
	const { cache, skillsDataRef } = useSkillCacherContext()
	const skillsData = skillsDataRef.current
	skillIds.forEach(skillId => {
		// If not all data is present, use null.
		const prerequisites = includePrerequisites([skillId])
		if (prerequisites.some(skillId => !cache[skillId]))
			return skillsData[skillId] = null

		// If none of the data has changed, update nothing.
		if (prerequisites.every(skillId => skillsData[skillId] && skillsData[skillId].rawData[skillId] === cache[skillId]))
			return // Do nothing.

		// Update the given skills data object.
		const rawData = {}
		prerequisites.forEach(skillId => {
			rawData[skillId] = cache[skillId]
		})
		skillsData[skillId] = new SkillData(skillId, rawData)
	})

	// Extract all the skill data from the processed skills data object.
	return keysToObject(skillIds, skillId => skillsData[skillId])
}

// useSkillData takes a single skill ID and returns a SkillsData for it from the cache, loading it if necessary.
export function useSkillData(skillId) {
	const data = useSkillsData(skillId === undefined ? [] : [skillId])
	return data[skillId]
}
