import { type ApiLoaders, type LoaderContext, apiModules } from '../modules/index.ts'

export function createLoaders(context: LoaderContext): ApiLoaders {
	let loaders: Partial<ApiLoaders> = {}
	apiModules.forEach(module => {
		if (module.createLoaders) loaders = { ...loaders, ...module.createLoaders(context, loaders) }
	})
	return loaders as ApiLoaders
}
