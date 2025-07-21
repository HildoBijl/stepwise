import { Link } from 'react-router-dom'
import { Alert, AlertTitle } from '@material-ui/lab'

import { useAllCoursesQuery } from 'api'
import { Translation } from 'i18n'
import { Par, List } from 'ui/components'
import { usePaths } from 'ui/routingTools'

const translationPath = 'eduTools/pages/addCoursePage'

export function AddCoursePage() {
	const allCoursesResult = useAllCoursesQuery()

	// When we don't have the data, show a relevant indication of what's going on.
	if (allCoursesResult.loading)
		return <Translation path={translationPath} entry="loadingCourses">
			<Alert severity="info">
				<AlertTitle>Loading courses...</AlertTitle>
				We are loading all available courses from the database. This shouldn't take long.
			</Alert>
		</Translation>
	if (allCoursesResult.error)
		return <Translation path={translationPath} entry="failedLoadingCourses">
			<Alert severity="error">
				<AlertTitle>Loading courses failed</AlertTitle>
				Oops ... something went wrong loading all courses. Maybe it's your connection? Maybe our server is down? We're not sure! Either way, try refreshing the page, and otherwise try again later.
			</Alert>
		</Translation>

	// When we have the data, render it accordingly.
	const allCourses = allCoursesResult.data.allCourses
	return <AddCoursePageForCourses courses={allCourses} />
}

function AddCoursePageForCourses({ courses }) {
	const paths = usePaths()
	return <>
		<Par>Choose a new course from the below list of available courses.</Par>
		<List items={courses.map(course => <Link to={paths.course({ courseCode: course.code })}><div key={course.id}>{course.name}</div></Link>)} />
	</>
}
