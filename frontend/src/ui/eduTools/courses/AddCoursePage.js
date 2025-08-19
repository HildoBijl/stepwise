import { useState, useMemo } from 'react'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { alpha } from '@material-ui/core/styles/colorManipulator'
import { Alert, AlertTitle } from '@material-ui/lab'
import { HowToReg as SubscribeIcon } from '@material-ui/icons'
import Tooltip from '@material-ui/core/Tooltip'

import { getCourseOverview } from 'step-wise/eduTools'

import { useAllCoursesForStudentQuery } from 'api'
import { TranslationFile, Translation } from 'i18n'
import { Head } from 'ui/components'
import { usePaths } from 'ui/routingTools'

import { organizations } from '../organizations'

const translationPath = 'eduTools/pages/addCoursePage'

export function AddCoursePage() {
	const allCoursesResult = useAllCoursesForStudentQuery()

	// When we don't have the data, show a relevant indication of what's going on.
	if (allCoursesResult.loading)
		return <Translation path={translationPath} entry="loading.loading">
			<Alert severity="info">
				<AlertTitle>Loading courses...</AlertTitle>
				We are loading all available courses from the database. This shouldn't take long.
			</Alert>
		</Translation>
	if (allCoursesResult.error)
		return <Translation path={translationPath} entry="loading.failed">
			<Alert severity="error">
				<AlertTitle>Loading courses failed</AlertTitle>
				Oops ... something went wrong loading all courses. Maybe it's your connection? Maybe our server is down? We're not sure! Either way, try refreshing the page, and otherwise try again later.
			</Alert>
		</Translation>

	// When we have the data, render it accordingly.
	return <AddCoursePageForCourses courses={allCoursesResult.data.allCoursesForStudent} />
}

function AddCoursePageForCourses({ courses }) {
	// Split all courses up by organization.
	const coursesPerOrganization = useMemo(() => {
		const result = {}
		courses.forEach(course => {
			result[course.organization] = result[course.organization] || []
			result[course.organization].push(course)
		})
		return result
	}, [courses])

	// Render the courses per organization.
	return <TranslationFile path={translationPath}>
		{Object.values(organizations).map(organization => <CoursesPerOrganization key={organization.id} organization={organization} courses={coursesPerOrganization[organization.id] || []} />)}
	</TranslationFile>
}

const useCoursesStyles = makeStyles((theme) => ({
	courses: {
		display: 'grid',
		gap: '0.3em',
		gridTemplateColumns: 'minmax(10rem, 6fr) minmax(5rem, 1fr) minmax(5rem, 1fr) 40px',
		width: '100%',

		'& .header, & .cell': {
			borderRadius: '0.4rem',
			padding: '0.4rem',
		},
		'& .header': {
			fontWeight: 600,
		},
		'& .cell': {
			background: alpha(theme.palette.primary.main, 0.05),
			cursor: 'pointer',
			fontWeight: 420,
			opacity: 0.8,
		},
		'& .cell.hover': {
			background: alpha(theme.palette.primary.main, 0.1),
		},
		'& .numSkills, & .numBlocks, & .subscribed': {
			display: 'flex',
			justifyContent: 'center', // Center text. (This also works in case of overflow, unlike textAlign: 'center'.)
		},
		'& .subscribed': {
			paddingBottom: '0rem',
			paddingTop: '0.25rem',
		},
	},
}))

function CoursesPerOrganization({ organization, courses }) {
	const classes = useCoursesStyles()

	// Sort the courses by creation date.
	const coursesSorted = useMemo(() => courses.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)), [courses])

	// On no courses, don't show the organization.
	if (courses.length === 0)
		return null

	// Render the list.
	return <>
		<Head style={{ margin: '1.5rem 0 0.5rem 0.4rem' }}>
			<span style={{ display: 'inline-block', width: '2em' }}>
				<img src={organization.logo} alt={`Logo ${organization.name}`} style={{ display: 'inline-block', maxHeight: '0.9em', maxWidth: '2em', marginRight: '0.5em', transform: 'translateY(1pt)' }} />
			</span>
			{organization.name}
		</Head>
		<div className={classes.courses}>
			<CourseHeader />
			{coursesSorted.map(course => <CourseEntry key={course.id} course={course} />)}
		</div>
	</>
}

function CourseHeader() {
	return <>
		<div className="header name"><Translation entry="table.courseName">Course name</Translation></div>
		<div className="header numBlocks"><Translation entry="table.blocks">Blocks</Translation></div>
		<div className="header numSkills"><Translation entry="table.skills">Skills</Translation></div>
		<div className="header subscribed"><SubscribeIcon /></div>
	</>
}

function CourseEntry({ course }) {
	const paths = usePaths()
	const navigate = useNavigate()

	// Analyze the course to see what's in it.
	const overview = useMemo(() => getCourseOverview(course), [course])

	// Set up handlers for events.
	const [hover, setHover] = useState(false)
	const handlers = {
		onClick: () => navigate(paths.addCourseCourse({ courseCode: course.code })),
		onMouseOver: () => setHover(true),
		onMouseOut: () => setHover(false),
	}

	// Render the row for the course.
	return <>
		<Tooltip open={hover} arrow title={<Translation path="eduContent/courseInfo" entry={`${course.organization}.${course.code}.description`}>{course.description}</Translation>}>
			<div className={clsx('cell', 'name', { hover })} {...handlers}><Translation path="eduContent/courseInfo" entry={`${course.organization}.${course.code}.name`}>{course.name}</Translation></div>
		</Tooltip>
		<div className={clsx('cell', 'numBlocks', { hover })} {...handlers}>{overview.blocks.length}</div>
		<div className={clsx('cell', 'numSkills', { hover })} {...handlers}>{overview.contents.length}</div>
		<div className={clsx('cell', 'subscribed', { hover })} {...handlers}><SubscribeIcon style={{ opacity: course.role ? 1 : 0.05 }} /></div>
	</>
}
