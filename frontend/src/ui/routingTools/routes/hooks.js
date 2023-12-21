import { useMemo } from 'react'

import { useRoutes } from './provider'

// usePaths gives all the paths to named pages. These paths are functions. For instance, the courseDeadlines page may have a path ({courseId}) => `/courses/${courseId}/deadlines`.
export function usePaths() {
	const { paths } = useRoutes()
	return paths
}

// useRouteById takes an ID and gives the corresponding route.
export function useRouteById(routeId) {
	const { routes } = useRoutes()
	return useMemo(() => Object.values(routes).find(route => route.id === routeId), [routes, routeId])
}
