import { type PropsWithChildren, useState, useCallback, useMemo, useEffect, createContext, useContext, useSyncExternalStore } from 'react'

import { fromKeysAndValues, fromKeys } from '@step-wise/js-utils'
import type { SkillId } from '@step-wise/skill-definition'
import { SkillLevelSet, getInitialSkillLevel, ensureSkillLevel } from '@step-wise/skill-tracking'
import { expandSkillIdsWithDirectPrerequisitesAndLinks, skillTree } from '@step-wise/skill-tree'

import { useConsistentValue, useConstant } from 'util/index' // Unit test import issue: use 'util/index' because the test runner otherwise resolves Node's built-in util package.

import { useUser } from '../user'

import { useSkillsQuery } from './queries'
import { useSkillsSubscription } from './subscriptions'

interface SkillCacherContextValue {
	skillLevelSet: SkillLevelSet
	addSkillsToLoad: (skillIds: readonly SkillId[]) => void
	removeSkillsToLoad: (skillIds: readonly SkillId[]) => void
}

const SkillCacherContext = createContext<SkillCacherContextValue | undefined>(undefined)

export function SkillCacher({ children }: PropsWithChildren) {
	const [skillsToLoad, setSkillsToLoad] = useState<readonly (readonly SkillId[])[]>([])
	const skillLevelSet = useConstant(() => new SkillLevelSet(skillTree)) as SkillLevelSet

	// Set up handlers to track which skills to load.
	const addSkillsToLoad = useCallback((additionSkillIds: readonly SkillId[]) => {
		setSkillsToLoad(skillsToLoad => [...skillsToLoad, additionSkillIds])
	}, [setSkillsToLoad])
	const removeSkillsToLoad = useCallback((removalSkillIds: readonly SkillId[]) => {
		setSkillsToLoad(skillsToLoad => skillsToLoad.filter(skillsToLoadElement => skillsToLoadElement !== removalSkillIds))
	}, [setSkillsToLoad])
	const allSkillsToLoad = useConsistentValue(useMemo(() => [...new Set(skillsToLoad.flat())], [skillsToLoad])) as SkillId[]

	// Load in all the skills from the database. Also listen to updates.
	const skillsWithPrerequisitesAndLinks = useMemo(() => expandSkillIdsWithDirectPrerequisitesAndLinks(allSkillsToLoad), [allSkillsToLoad])
	const { data, loading, error, subscribeToMore } = useSkillsQuery(skillsWithPrerequisitesAndLinks)
	useSkillsSubscription(subscribeToMore, allSkillsToLoad.length > 0)
	const skills = data?.skills ?? []

	// Implement any loaded data into the cache.
	const user = useUser()
	useEffect(() => {
		// Check if we should add anything.
		if (skillsWithPrerequisitesAndLinks.length === 0) return // Nothing to add.
		if (!user) return // No user to add anything for.
		if (loading) return // Still loading.
		if (error) return // Oops ... something went wrong. ToDo later: properly handle this error.

		// Fill up the loaded skills with default skills when missing (that is, not in the database yet), process them, and incorporate them into the data set.
		const skillsAsObject = fromKeysAndValues(skills.map(skill => skill.skillId), skills.map(skill => ensureSkillLevel(skill)))
		const storedSkillLevelSet = fromKeys(skillsWithPrerequisitesAndLinks, skillId => skillsAsObject[skillId] ?? getInitialSkillLevel(new Date(0)))
		skillLevelSet.applyUpdates(storedSkillLevelSet)
	}, [skillsWithPrerequisitesAndLinks, user, loading, error, skills, skillLevelSet])

	// When the user changes, clear the cache.
	useEffect(() => { skillLevelSet.clear() }, [skillLevelSet, user?.id])

	// Gather data for the context.
	const contextData = {
		skillLevelSet,
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
	const context = useContext(SkillCacherContext)
	if (!context) throw new Error('Skill cacher hooks must be used within a SkillCacher.')
	return context
}

export function useSkillLevelSet() {
	return useSkillCacherContext().skillLevelSet
}

// useSkillLoading takes a list of skillIds and ensures that they are being loaded by the cacher.
function useSkillLoading(skillIds: readonly SkillId[]): void {
	skillIds = useConsistentValue(skillIds) as readonly SkillId[]
	const { addSkillsToLoad, removeSkillsToLoad } = useSkillCacherContext()
	useEffect(() => {
		addSkillsToLoad(skillIds)
		return () => removeSkillsToLoad(skillIds)
	}, [skillIds, addSkillsToLoad, removeSkillsToLoad])
}

// useSkillLevels is the main function used by child components to load in data on skills. It ensures that the cacher loads in data on the requested skillIds. The skillLevelSet object is returned.
export function useSkillLevels(skillIds: readonly SkillId[]): SkillLevelSet {
	// Ensure the requested skills are being loaded.
	skillIds = useConsistentValue(skillIds) as readonly SkillId[]
	useSkillLoading(skillIds)

	// Subscribe this consumer to updates in the skill level set.
	const skillLevelSet = useSkillLevelSet()
	useSyncExternalStore(listener => skillLevelSet.subscribe(listener), () => skillLevelSet.getSnapshot())
	return skillLevelSet
}

// useSkillLevel takes a single skill ID and ensures it's loaded from the database. It returns the skillLevelSet object.
export function useSkillLevel(skillId?: SkillId): SkillLevelSet {
	return useSkillLevels(skillId === undefined ? [] : [skillId])
}
