import type { ModuleId, ModuleTree } from './types.ts'

export function validateAndProcessPrerequisites(moduleTree: ModuleTree): void {
	for (const module of Object.values(moduleTree)) {
		for (const prerequisiteId of module.prerequisiteIds) {
			const prerequisite = moduleTree[prerequisiteId]
			if (!prerequisite) throw new Error(`Invalid prerequisite module "${prerequisiteId}" given for module "${module.id}".`)
			if (module.type === 'concept' && prerequisite.type === 'skill') throw new Error(`Invalid prerequisite module "${prerequisiteId}" given for concept "${module.id}": concepts cannot depend on skills.`)
		}
	}

	const states = new Map<ModuleId, 'visiting' | 'visited'>()
	const path: ModuleId[] = []
	const visit = (moduleId: ModuleId): void => {
		const state = states.get(moduleId)
		if (state === 'visited') return
		if (state === 'visiting') {
			const cycleStart = path.indexOf(moduleId)
			const cycle = [...path.slice(cycleStart), moduleId]
			throw new Error(`Invalid module prerequisites: detected cycle ${cycle.map(id => `"${id}"`).join(' -> ')}.`)
		}
		states.set(moduleId, 'visiting')
		path.push(moduleId)
		for (const prerequisiteId of moduleTree[moduleId].prerequisiteIds) visit(prerequisiteId)
		path.pop()
		states.set(moduleId, 'visited')
	}
	for (const moduleId of Object.keys(moduleTree)) visit(moduleId)

	for (const module of Object.values(moduleTree)) {
		for (const prerequisiteId of module.prerequisiteIds) moduleTree[prerequisiteId].continuationIds.push(module.id)
	}
}
