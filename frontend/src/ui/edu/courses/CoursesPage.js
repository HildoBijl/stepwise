import React, { createContext, useContext } from 'react'
import { useQuery, gql } from '@apollo/client'
import { Link } from 'react-router-dom'

import skills from 'step-wise/edu/skills'

import { usePaths } from 'ui/routing'

export default function CoursesPage() {
	// const contents = useContents()
	const paths = usePaths()

	return (
		<>
			<h1>Courses</h1>
			<p>Currently the courses have not been implemented. But you can practice individual skills.</p>
			<h1>Skills</h1>
			<p>Click on the skills below to practice them.</p>
			<ul>
			{Object.values(skills).map(skill => <li key={skill.id}><Link to={paths.skill({ skillId: skill.id })}>{skill.name}</Link></li>)}
			</ul>
		</>
	)
}

// function useContents() {
// 	const courses = useCourses()
// 	const paths = usePaths()

// 	if (!courses) return <p>Loading...</p>

// 	return (
// 		<ul>
// 			{courses.map(course => <li key={course.id}><Link to={paths.course({ courseId: course.id })}>{course.name}</Link></li>)}
// 		</ul>
// 	)
// }

// The context is used to spread the data to child elements.
const CoursesContext = createContext(null)
function CoursesProvider({ children }) {
	return <CoursesContext.Provider value={useCoursesQuery()}>{children}</CoursesContext.Provider>
}

// useCoursesQuery is used to extract data and put it in the context.
const COURSES = gql`{skills{id}}` // ToDo: turn this into a somewhat sensible page.
function useCoursesQuery() {
	return useQuery(COURSES)
}

// useCoursesResults is used to extract the full query results, including data on loading or errors.
function useCoursesResults() {
	return useContext(CoursesContext)
}

// useCourses is used to extract the courses data, or null when not loaded yet or on failure.
function useCourses() {
	const res = useCoursesResults()
	return (res && res.data && res.data.mySkills) || null
}

export { CoursesContext, CoursesProvider, useCoursesQuery, useCoursesResults, useCourses }
