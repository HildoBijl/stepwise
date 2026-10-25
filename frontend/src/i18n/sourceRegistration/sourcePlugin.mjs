import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve, sep } from 'node:path'

import { getMessageContentSignature, assertValidMessage } from '../../../../packages/i18n/src/message/index.ts'
import { parseXliff, serializeXliff } from '../../../../packages/i18n/src/xliff/index.ts'

import { sourceRegistrationEndpoint } from './registerSource.ts'

const writeDelay = 50 // After this time of waiting (and possibly collecting more updates) we apply all updates to the Catalog file.
const generatedWriteLifetime = 5000 // When a Catalog file gets updated, we exclude it from HMR for this amount of time. This prevents Catalog writes from activating HMR.

/*
 * General Vite plug-in.
 */

// Add a development-only server endpoint to Vite which batches authored sources into canonical XLIFF files.
export function i18nSourcePlugin({ catalogRoot, sourceLocale }) {
	const resolvedRoot = resolve(catalogRoot)
	const pendingCatalogs = new Map()
	const generatedWrites = new Map()
	return {
		name: 'step-wise-i18n-sources',
		apply: 'serve',

		// Set up a server that can be called with Catalog Registration updates.
		configureServer(server) {
			server.middlewares.use(sourceRegistrationEndpoint, async (request, response) => {
				// Only allow POST messages to update language catalogs.
				if (request.method !== 'POST') {
					response.statusCode = 405
					response.end('Method not allowed')
					return
				}

				// Read the submitted Catalog registration object, validate it, and queue it for updating.
				try {
					const registration = validateRegistration(await readJsonBody(request))
					queueRegistration(resolvedRoot, sourceLocale, registration, pendingCatalogs, generatedWrites)
					response.statusCode = 202
					response.end()
				} catch (error) {
					response.statusCode = 400
					response.end(error instanceof Error ? error.message : 'Invalid source registration')
				}
			})
		},

		// If a XLIFF file that we recently wrote gets updated, ignore its Hot Module Reload.
		async hotUpdate({ file, read }) {
			const generatedContents = generatedWrites.get(resolve(file))?.contents
			if (generatedContents !== undefined && generatedContents === await read()) return []
		},
	}
}

async function readJsonBody(request) {
	const chunks = []
	let size = 0
	for await (const chunk of request) {
		size += chunk.length
		if (size > 1024 * 1024) throw new Error('Source registration exceeds the 1 MB limit.')
		chunks.push(chunk)
	}
	return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

/*
 * Validation.
 */

// Check if a received registration is valid.
function validateRegistration(value) {
	if (!value || typeof value !== 'object') throw new Error('A source registration must be an object.')
	if (!Array.isArray(value.folder) || !value.folder.every(isPathSegment)) throw new Error('Invalid translation folder path.')
	if (!isPathSegment(value.catalog)) throw new Error('Invalid translation catalog name.')
	if (!Array.isArray(value.group) || !value.group.every(isPathSegment)) throw new Error('Invalid translation group path.')
	if (!isPathSegment(value.id)) throw new Error('Invalid translation unit ID.')
	if (!Array.isArray(value.source)) throw new Error('A translation source must be a message array.')
	assertValidMessage(value.source)
	return value
}

function isPathSegment(value) {
	return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value)
}

/*
 * Source registration.
 */

// Add a received registration to the update queue.
function queueRegistration(root, sourceLocale, registration, pendingCatalogs, generatedWrites) {
	// Assemble and check the catalog's file path.
	const filePath = resolve(root, sourceLocale, ...registration.folder, `${registration.catalog}.xlf`)
	const localeRoot = resolve(root, sourceLocale) + sep
	if (!filePath.startsWith(localeRoot)) throw new Error('The catalog path must stay within the source-locale directory.')

	// Set up a loader-object for the given Catalog, unless one already exists.
	const pending = pendingCatalogs.get(filePath) ?? { registrations: new Map(), timer: undefined }
	pendingCatalogs.set(filePath, pending)

	// Register an update for the given unit, potentially overriding an earlier update.
	const key = `${registration.group.join('/')}\0${registration.id}`
	pending.registrations.set(key, registration)

	// Schedule (or reschedule) an update for the given Catalog.
	if (pending.timer) clearTimeout(pending.timer)
	pending.timer = setTimeout(() => {
		pendingCatalogs.delete(filePath)
		try {
			writeRegistrations(filePath, sourceLocale, pending.registrations.values(), generatedWrites)
		} catch (error) {
			console.error(`Failed to update translation sources in ${filePath}.`, error)
		}
	}, writeDelay)
}

// Write a set of Catalog registrations to the respective file. (But only when its contents changed.) Create the file if it doesn't exist.
function writeRegistrations(filePath, sourceLocale, registrations, generatedWrites) {
	// Apply the registrations to the Catalog.
	const catalog = existsSync(filePath) ? parseXliff(readFileSync(filePath, 'utf8')) : { sourceLocale, entries: [] }
	const result = applySourceRegistrations(catalog, registrations)
	if (!result.changed) return

	// When the Catalog changed, save it to its file.
	const contents = serializeXliff(result.catalog)
	trackGeneratedWrite(filePath, contents, generatedWrites)
	mkdirSync(dirname(filePath), { recursive: true })
	writeFileSync(filePath, contents, 'utf8')
}

// Briefly remember generated contents so Vite can distinguish our writes from manual catalog edits.
function trackGeneratedWrite(filePath, contents, generatedWrites) {
	const resolvedPath = resolve(filePath)
	const previousWrite = generatedWrites.get(resolvedPath)
	if (previousWrite) clearTimeout(previousWrite.expirationTimer)
	const expirationTimer = setTimeout(() => generatedWrites.delete(resolvedPath), generatedWriteLifetime)
	expirationTimer.unref?.()
	generatedWrites.set(resolvedPath, { contents, expirationTimer })
}

// Apply a set of Catalog registrations to an existing Catalog file.
export function applySourceRegistrations(catalog, registrations) {
	let updatedCatalog = catalog
	let changed = false
	for (const registration of registrations) {
		const result = upsertSource(updatedCatalog.entries, registration.group, registration.id, registration.source)
		updatedCatalog = { ...updatedCatalog, entries: result.entries }
		changed ||= result.changed
	}
	return { catalog: updatedCatalog, changed }
}

// Apply a single Catalog registraton to an existing set of Catalog entries.
function upsertSource(entries, groupPath, id, source) {
	// If we're in the right group, find the unit in the entries list and update it.
	if (groupPath.length === 0) {
		// Find the respective unit, or create it if it doesn't exist.
		const index = entries.findIndex(entry => entry.type === 'unit' && entry.id === id)
		if (index === -1) return { entries: [...entries, { type: 'unit', id, source }], changed: true }
		const unit = entries[index]

		// If the signature matches, don't update. Otherwise overwrite it and flag the update.
		if (getMessageContentSignature(unit.source) === getMessageContentSignature(source)) return { entries, changed: false }
		const updatedEntries = [...entries]
		updatedEntries[index] = { ...unit, source }
		return { entries: updatedEntries, changed: true }
	}

	// If the requested group doesn't exist, create it and add the respective entry.
	const [groupId, ...remainingPath] = groupPath
	const index = entries.findIndex(entry => entry.type === 'group' && entry.id === groupId)
	if (index === -1) {
		const result = upsertSource([], remainingPath, id, source)
		return { entries: [...entries, { type: 'group', id: groupId, entries: result.entries }], changed: true }
	}

	// The group exists. Apply the respective entry to it.
	const group = entries[index]
	const result = upsertSource(group.entries, remainingPath, id, source)
	if (!result.changed) return { entries, changed: false }
	const updatedEntries = [...entries]
	updatedEntries[index] = { ...group, entries: result.entries }
	return { entries: updatedEntries, changed: true }
}
