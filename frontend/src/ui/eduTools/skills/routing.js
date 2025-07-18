import { useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'

import { skillTree } from 'step-wise/eduTools'

import { useGetTranslation } from 'i18n'
import { usePaths } from 'ui/routingTools'

// useSkillPath returns a pathing function. This pathing function gets a skillId and returns the path to said skill. This is done content-dependent: if we are in a course, then we stay within the course.
export function useSkillPath() {
	const { courseCode } = useParams()
	const paths = usePaths()
	return useCallback((skillId, tab) => {
		if (courseCode) {
			if (tab)
				return paths.courseSkillTab({ courseCode, skillId, tab })
			return paths.courseSkill({ courseCode, skillId })
		}
		if (tab)
			return paths.skillTab({ skillId, tab })
		return paths.skill({ skillId })
	}, [paths, courseCode])
}

// SkillLink is an extension of the Link component that creates a link to a given skill. It does it context-dependent, using the useSkillPath function.
export function SkillLink({ skillId, tab, children, ...props }) {
	// Determine the path for the link.
	const { skillId: currentSkillId, tab: currentTab } = useParams()
	const skillPath = useSkillPath()
	const path = skillPath(skillId || currentSkillId, tab || currentTab)

	// On no children, get the skill title.
	const skill = skillTree[skillId]
	const getTranslation = useGetTranslation('eduContent/skillNames')
	if (!children)
		children = getTranslation(`${skill.path.join('.')}.${skill.id}`)

	// Render the link.
	return <Link to={path} {...props}>{children}</Link>
}
