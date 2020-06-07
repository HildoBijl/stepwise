import React, { createContext, useContext } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Link } from 'react-router-dom'
import { usePaths } from '../routing'

export default function Courses() {
	const contents = useContents()

	return (
		<>
			<h1>Courses</h1>
			{contents}
		</>
	)
}

function useContents() {
	const courses = useCourses()
	const paths = usePaths()

	if (!courses) return <p>Loading...</p>

	return (
		<ul>
			{courses.map(course => <li key={course.id}><Link to={paths.course({ courseId: course.id })}>{course.name}</Link></li>)}
		</ul>
	)
}

// The context is used to spread the data to child elements.
const CoursesContext = createContext(null)
function CoursesProvider({ children }) {
	return <CoursesContext.Provider value={useCoursesQuery()}>{children}</CoursesContext.Provider>
}

// useCoursesQuery is used to extract data and put it in the context.
const COURSES = gql`{mySkills{name,id}}` // ToDo: turn this into a somewhat sensible page.
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
