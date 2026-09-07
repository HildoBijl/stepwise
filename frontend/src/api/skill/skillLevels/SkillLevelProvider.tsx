import { type PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react'

import { fromKeys, fromKeysAndValues } from '@step-wise/js-utils'
import type { SkillId } from '@step-wise/skill-definition'
import { SkillLevelSet, getInitialSkillLevel } from '@step-wise/skill-tracking'
import { expandSkillIdsWithDirectPrerequisitesAndLinks, skillTree } from '@step-wise/skill-tree'

import { useConstant } from 'util/index'

import { useUser } from '../../user'

import { type SkillLevelContextValue, SkillLevelContext } from './context.ts'
import { useSkillLevelRecordsQuery } from './query.ts'

export function SkillLevelProvider({ children }: PropsWithChildren) {
	const [registrations, setRegistrations] = useState<ReadonlyMap<symbol, readonly SkillId[]>>(() => new Map())
	const skillLevelSet = useConstant(() => new SkillLevelSet(skillTree)) as SkillLevelSet

	const registerSkillLevels = useCallback((skillIds: readonly SkillId[]) => {
		const registrationId = Symbol()
		setRegistrations(registrations => new Map(registrations).set(registrationId, skillIds))
		return () => {
			setRegistrations(registrations => {
				const updatedRegistrations = new Map(registrations)
				updatedRegistrations.delete(registrationId)
				return updatedRegistrations
			})
		}
	}, [])

	const requestedSkillIds = useMemo(() => [...new Set([...registrations.values()].flat())], [registrations])
	const expandedSkillIds = useMemo(() => expandSkillIdsWithDirectPrerequisitesAndLinks(requestedSkillIds), [requestedSkillIds])
	const { data, loading, error } = useSkillLevelRecordsQuery(expandedSkillIds)

	const user = useUser()
	useEffect(() => {
		if (expandedSkillIds.length === 0 || !user || loading || error) return
		const skills = data?.skills ?? []
		const skillsById = fromKeysAndValues(skills.map(skill => skill.skillId), skills)
		const storedSkillLevels = fromKeys(expandedSkillIds, skillId => skillsById[skillId] ?? getInitialSkillLevel(new Date(0)))
		skillLevelSet.applyUpdates(storedSkillLevels)
	}, [data, error, expandedSkillIds, loading, skillLevelSet, user])

	useEffect(() => { skillLevelSet.clear() }, [skillLevelSet, user?.id])

	const contextValue: SkillLevelContextValue = useMemo(() => ({ skillLevelSet, registerSkillLevels }), [registerSkillLevels, skillLevelSet])
	return <SkillLevelContext.Provider value={contextValue}>{children}</SkillLevelContext.Provider>
}
