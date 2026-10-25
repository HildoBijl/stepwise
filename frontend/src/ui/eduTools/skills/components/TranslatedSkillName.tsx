import { useTextTranslation } from '@step-wise/i18n'
import { moduleTree } from '@step-wise/module-tree'

import { modulePresentation } from 'ui/eduContent/modulePresentation'

export function useSkillName(skillId: string | undefined): string {
	const module = skillId && moduleTree[skillId]
	const presentation = skillId && Object.hasOwn(modulePresentation, skillId) ? modulePresentation[skillId as keyof typeof modulePresentation] : undefined
	return useTextTranslation(module && presentation
		? { folder: ['eduContent'], catalog: 'skillNames', group: module.groupPath, id: module.id, source: presentation.name }
		: { folder: ['eduContent'], catalog: 'skillNames', group: ['miscellaneous'], id: 'unknownSkill', source: 'Unknown skill' })
}

export function TranslatedSkillName({ skillId }: { skillId: string | undefined }) {
	return <>{useSkillName(skillId)}</>
}
