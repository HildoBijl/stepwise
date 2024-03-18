import { useParams } from 'react-router-dom'

import { processOptions } from 'step-wise/util'

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

// useAdjustedPath takes the current URL and adjusts the parameters in it according to the provided object. It gives a "to" string that can be used in links through <Link to={adjustedPath}>Text</Link>.
export function useAdjustedPath(adjustedParams) {
	const route = useRoute()
	const currParams = useParams()
	const newParams = processOptions(adjustedParams, currParams)
	return insertParametersIntoPath(newParams, route.path)
}
