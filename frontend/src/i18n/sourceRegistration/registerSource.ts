import { type SourceRegistrar, getMessageContentSignature } from '@step-wise/i18n'

// Endpoint on where to send registrations within the Vite bundler.
export const sourceRegistrationEndpoint = '/__step-wise/i18n/source'

const registeredSources = new Map<string, string>()

// Send authored sources to the development server.
export const registerSource: SourceRegistrar | undefined = import.meta.env?.DEV ? registration => {
	// Check if the source is already registered at the server. If so, don't send it again.
	const key = `${registration.folder.join('/')}:${registration.catalog}:${registration.group.join('/')}:${registration.id}`
	const signature = getMessageContentSignature(registration.source)
	if (registeredSources.get(key) === signature) return
	registeredSources.set(key, signature)

	// We haven't registered this source yet. It might be an update. Send it to the server.
	void fetch(sourceRegistrationEndpoint, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(registration),
	}).then(response => {
		if (!response.ok) return response.text().then(message => { throw new Error(message) })
	}).catch(error => {
		registeredSources.delete(key)
		console.error('Failed to register an authored translation source.', error)
	})
} : undefined
