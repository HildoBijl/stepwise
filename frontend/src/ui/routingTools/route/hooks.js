import { useParams } from 'react-router-dom'

import { insertParametersIntoPath } from '../util'
import { useRoute } from './provider'

// useParentPath takes the current route and finds the path towards the parent.
export function useParentPath() {
	const route = useRoute()
	const params = useParams()
	if (!route.parent)
		return '/'
	return insertParametersIntoPath(params, route.parent.path)
}
