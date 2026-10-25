import { type ReactNode } from 'react'

import { useTranslation } from '@step-wise/i18n'
import { moduleTree } from '@step-wise/module-tree'

import { moduleCatalog } from 'ui/eduContent/moduleCatalog'

export function useSkillName(skillId: string | undefined): ReactNode {
	const skill = skillId && moduleTree[skillId]
	const module = skillId && Object.hasOwn(moduleCatalog, skillId) ? moduleCatalog[skillId as keyof typeof moduleCatalog] : undefined
	return useTranslation(skill && module ? {
		folder: ['eduContent'], catalog: 'skillNames', group: skill.groupPath, id: skill.id, children: module.name,
	} : {
		folder: ['eduContent'], catalog: 'skillNames', group: ['miscellaneous'], id: 'unknownSkill', children: 'Unknown skill',
	})
}

export function TranslatedSkillName({ skillId }: { skillId: string | undefined }) {
	return <>{useSkillName(skillId)}</>
}
