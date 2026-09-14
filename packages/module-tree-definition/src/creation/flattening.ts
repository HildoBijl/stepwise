import { SkillSetup } from '@step-wise/skill-setup'
import { deduplicate, isPlainObject } from '@step-wise/js-utils'

import { normalizeSkillLinks } from './linkProcessing.ts'
import { resolveSkillThresholdOptions } from './thresholdOptions.ts'
import type { ModuleDefinition, ModuleId, ModuleTree, ModuleTreeDefinition, SkillDefinition, SkillId } from './types.ts'

// Flatten a module tree definition into a module tree, validating the module definitions and ensuring that module IDs are unique.
export function flattenModuleTreeDefinition(moduleTreeDefinition: ModuleTreeDefinition): ModuleTree {
	const moduleTree = Object.create(null) as ModuleTree
	const registeredModuleIds = new Map<string, { id: ModuleId; path: string }>()

	// Recursively walk through the module tree definition, validating and flattening the module definitions.
	const walk = (group: unknown, path: string[] = []) => {
		if (!isPlainObject(group)) throw new TypeError(`Invalid module tree entry at "${path.join('/') || '<root>'}": expected a module or group object.`)
		const groupModuleIds: ModuleId[] = []

		// Validate each module definition in the group.
		for (const [key, value] of Object.entries(group)) {
			if (isModuleDefinition(value)) {
				// Validate the module ID and definition, ensuring uniqueness and proper structure.
				const modulePath = [...path, key].join('/')
				const moduleId = ensureValidModuleId(key, `module ID at "${modulePath}"`)
				validateModuleDefinition(value, moduleId, modulePath)

				// Check for duplicate module IDs, ignoring case sensitivity.
				const normalizedModuleId = moduleId.toLowerCase()
				const existingModule = registeredModuleIds.get(normalizedModuleId)
				if (existingModule) throw new Error(`Duplicate module ID: "${moduleId}" at "${modulePath}" conflicts with "${existingModule.id}" at "${existingModule.path}". Module IDs must be unique regardless of casing.`)
				registeredModuleIds.set(normalizedModuleId, { id: moduleId, path: modulePath })
				groupModuleIds.push(moduleId)

				// Create a shared module object with common properties for both concepts and skills.
				const sharedModule = { id: moduleId, name: value.name, groupPath: path, groupModuleIds, prerequisiteIds: [...(value.prerequisites ?? [])], continuationIds: [] }

				// On a concept, validate and create the concept.
				if (value.type === 'concept') {
					moduleTree[moduleId] = { ...sharedModule, type: 'concept' }
					continue
				}

				// On a skill, validate and create the skill, processing its setup, links, and thresholds.
				const skillId = moduleId as SkillId
				validateSkillDefinition(value, skillId)
				moduleTree[moduleId] = {
					...sharedModule,
					id: skillId,
					type: 'skill',
					setup: value.setup,
					prerequisiteIds: deduplicate([...(value.prerequisites ?? []), ...(value.setup?.getSkillList() ?? [])]),
					links: normalizeSkillLinks(value.links).map(link => {
						link.skillIds.forEach(linkedSkillId => ensureValidModuleId(linkedSkillId, `linked skill ID for skill "${skillId}"`))
						return link
					}),
					linkedSkillIds: [],
					thresholds: resolveSkillThresholdOptions(value.thresholds),
				}
			} else walk(value, [...path, key])
		}
	}

	walk(moduleTreeDefinition)
	return moduleTree
}

// Check if a value is a valid module definition, either a concept or a skill.
function isModuleDefinition(value: unknown): value is ModuleDefinition {
	return isPlainObject(value) && (value.type === 'concept' || value.type === 'skill') && typeof value.name === 'string'
}

// Ensure that a module ID is a valid non-empty string without leading or trailing whitespace.
function ensureValidModuleId(moduleId: unknown, description: string): ModuleId {
	if (typeof moduleId !== 'string') throw new TypeError(`Invalid ${description}: expected a string, but received type "${typeof moduleId}".`)
	if (moduleId.length === 0) throw new RangeError(`Invalid ${description}: module IDs must not be empty.`)
	if (moduleId.trim() !== moduleId) throw new RangeError(`Invalid ${description} "${moduleId}": module IDs must not start or end with whitespace.`)
	return moduleId
}

// Validate a module definition, ensuring that its properties are appropriate for its type and that its prerequisites are valid. Throw an error if any validation fails.
function validateModuleDefinition(definition: ModuleDefinition, moduleId: ModuleId, modulePath: string): void {
	if (definition.name.trim().length === 0) throw new RangeError(`Invalid module name for "${moduleId}" at "${modulePath}": module names must not be empty or consist only of whitespace.`)
	if (definition.type === 'concept') {
		if ('setup' in definition) throw new TypeError(`Invalid concept "${moduleId}": concepts cannot define a skill setup.`)
		if ('links' in definition) throw new TypeError(`Invalid concept "${moduleId}": concepts cannot define skill links.`)
		if ('thresholds' in definition) throw new TypeError(`Invalid concept "${moduleId}": concepts cannot define skill thresholds.`)
	}
	if (definition.prerequisites === undefined) return
	if (!Array.isArray(definition.prerequisites)) throw new TypeError(`Invalid prerequisites for module "${moduleId}": expected an array of module IDs.`)
	definition.prerequisites.forEach(prerequisiteId => ensureValidModuleId(prerequisiteId, `prerequisite module ID for module "${moduleId}"`))
}

// Validate a skill definition, ensuring that its setup is a valid SkillSetup instance and that any skills referenced in the setup are valid module IDs. Throw an error if any validation fails.
function validateSkillDefinition(definition: SkillDefinition, skillId: SkillId): void {
	if (definition.setup === undefined) return
	if (!(definition.setup instanceof SkillSetup)) throw new TypeError(`Invalid setup for skill "${skillId}": expected a SkillSetup instance.`)
	definition.setup.getSkillList().forEach(setupSkillId => ensureValidModuleId(setupSkillId, `setup skill ID for skill "${skillId}"`))
}
