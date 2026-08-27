import { type ApiLoaders, type LoaderContext, apiModules, defineRegistryKeys, ensureCompleteRegistry } from '../modules/index.ts'

const loaderNames = defineRegistryKeys<ApiLoaders>()(
	'courseTeachers',
	'courseStudents',
	'coursesWithStudent',
	'permittedSkillsForStudent',
	'allSkillsForUser',
	'skillForUser',
	'exercisesForSkill',
)

export function createLoaders(context: LoaderContext): ApiLoaders {
	let loaders: Partial<ApiLoaders> = {}
	apiModules.forEach(module => {
		if (!module.createLoaders) return
		const contributedLoaders = module.createLoaders(context, loaders)
		Object.keys(contributedLoaders).forEach(name => {
			if (Object.hasOwn(loaders, name)) throw new Error(`Duplicate loader registration for "${name}".`)
		})
		loaders = { ...loaders, ...contributedLoaders }
	})
	ensureCompleteRegistry(loaders, loaderNames, 'loader')
	return loaders
}
