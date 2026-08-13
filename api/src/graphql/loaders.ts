import { type ApiContext, type ApiLoaders, apiModules } from '../modules'

export const createLoaders = (context: ApiContext): ApiLoaders => {
	let loaders: ApiLoaders = {}
	apiModules.forEach(module => {
		if (module.createLoaders) loaders = { ...loaders, ...module.createLoaders(context, loaders) }
	})
	return loaders
}
