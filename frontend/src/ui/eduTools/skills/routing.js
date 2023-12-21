import { useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'

import { usePaths } from 'ui/routingTools'

// useSkillPath returns a pathing function. This pathing function gets a skillId and returns the path to said skill. This is done content-dependent: if we are in a course, then we stay within the course.
export function useSkillPath() {
	const { courseId } = useParams()
	const paths = usePaths()
	return useCallback((skillId, tab) => {
		if (courseId) {
			if (tab)
				return paths.courseSkillTab({ courseId, skillId, tab })
			return paths.courseSkill({ courseId, skillId })
		}
		if (tab)
			return paths.skillTab({ skillId, tab })
		return paths.skill({ skillId })
	}, [paths, courseId])
}

// SkillLink is an extension of the Link component that creates a link to a given skill. It does it context-dependent, using the useSkillPath function.
export function SkillLink({ skillId, tab, children, ...props }) {
	const { skillId: currentSkillId } = useParams()
	const skillPath = useSkillPath()
	return <Link to={skillPath(skillId || currentSkillId, tab)} {...props}>{children}</Link>
}
