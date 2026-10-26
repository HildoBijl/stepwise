import { useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'

import { withTranslation } from '@step-wise/i18n'

import { usePaths } from 'ui/routingTools'

import { TranslatedSkillName } from './components/TranslatedSkillName'

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
function SkillLinkBase({ skillId, tab, children, ...props }) {
	// Determine the path for the link.
	const { skillId: currentSkillId, tab: currentTab } = useParams()
	const skillPath = useSkillPath()
	const path = skillPath(skillId || currentSkillId, tab || currentTab)

	// On no children, get the skill title.
	if (!children)
		children = <TranslatedSkillName skillId={skillId} />

	// Render the link.
	return <Link to={path} {...props}>{children}</Link>
}
export const SkillLink = withTranslation(SkillLinkBase, { tag: 'skill-link' })
