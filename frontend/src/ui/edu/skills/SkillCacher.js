import React, { useState, useCallback, useEffect, createContext, useContext } from 'react'

import SkillData from 'step-wise/edu/skills/SkillData'
import { includePrerequisites, processSkill, getDefaultSkillData } from 'step-wise/edu/skills/util'

import { useUser } from 'api/user'
import { useSkillsQuery } from 'api/skill'

const SkillCacherContext = createContext()

export default function SkillCacher({ children }) {
	const [cache, setCache] = useState({})

	// updateCache adds an array of skills to the cache, overwriting older ones if present.
	const updateCache = useCallback((skills) => {
		setCache(cache => {
			const newCache = { ...cache }
			skills.forEach(skill => {
				newCache[skill.skillId] = processSkill(skill)
			})
			return newCache
		})
	}, [setCache])
	
	// When the user changes, clear the cache.
	const user = useUser()
	useEffect(() => {
		setCache({})
	}, [user])

	// Gather data for the context.
	const data = {
		cache,
		updateCache,
	}

	// Render the context.
	return (
		<SkillCacherContext.Provider value={data}>
			{children}
		</SkillCacherContext.Provider>
	)
}

export function useSkillsData(skillIds) {
	if (!skillIds || !Array.isArray(skillIds))
		throw new Error(`Invalid skillIds given: expected an array but received "${skillIds}".`)
	const { cache, updateCache } = useSkillCacherContext()

	// Figure out which skills need to be known and if any still need loading.
	const skillIdsWithPrerequisites = includePrerequisites(skillIds)
	const knownSkills = [], unknownSkills = []
	skillIdsWithPrerequisites.forEach(skillId => {
		(cache[skillId] ? knownSkills : unknownSkills).push(skillId)
	})
	const res = useSkillsQuery(unknownSkills)

	// Implement any loaded data into the cache.
	useEffect(() => {
		// Check if we should add anything.
		if (unknownSkills.length === 0)
			return // Nothing to add.
		if (!res || res.loading)
			return // Still loading.
		if (res.error)
			return // Oops ... something went wrong. ToDo later: properly handle this error.
		
		// Add the loaded skills, or use default skills if skills are missing (that is, not in the database yet).
		const loadedSkills = res && res.data && [...res.data.skills]
		const present = {}
		loadedSkills.forEach(skill => {
			present[skill.skillId] = true
		})
		unknownSkills.forEach(skillId => {
			if (!present[skillId])
				loadedSkills.push(getDefaultSkillData(skillId))
		})
		updateCache(loadedSkills)
	})

	// Turn the cache into SkillData objects for the requested skillIds.
	const result = {}
	skillIds.forEach(skillId => {
		result[skillId] = getSkillDataFromCache(skillId, cache)
	})
	return result
}

export function useSkillData(skillId) {
	const data = useSkillsData(skillId === undefined ? [] : [skillId])
	return data[skillId]
}

export function useSkillCacherContext() {
	return useContext(SkillCacherContext)
}

// getSkillDataFromCache creates a skillData object for the given skill, based on the data in the cache. If the data is not all there yet, null is returned.
function getSkillDataFromCache(skillId, cache) {
	// If not all data is present, return null.
	const prerequisites = includePrerequisites([skillId])
	if (prerequisites.some(skillId => !cache[skillId]))
		return null

	// Set up an object with only the required data and use that to set up the SkillData object.
	const data = {}
	prerequisites.forEach(skillId => {
		data[skillId] = cache[skillId]
	})
	return new SkillData(skillId, data)
}