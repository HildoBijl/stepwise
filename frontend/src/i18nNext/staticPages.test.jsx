// @vitest-environment jsdom

import { render, waitFor } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { TranslationCatalog, compareSourceMessages, findCatalogUnit } from '@step-wise/i18n'

import { About } from '../ui/pages/explainers/About'
import { ForStudents } from '../ui/pages/explainers/ForStudents'
import { ForTeachers } from '../ui/pages/explainers/ForTeachers'
import { Home } from '../ui/pages/Home/Home'
import { ApprovePrivacyPolicy } from '../ui/layout/PrivacyPolicy'
import { ActiveGroup } from '../ui/pages/groups/ActiveGroup'
import { GroupCreation } from '../ui/pages/groups/GroupCreation'
import { JoinGroupConditions } from '../ui/pages/groups/JoinGroupConditions'
import { NewGroup } from '../ui/pages/groups/NewGroup'
import { OtherGroups } from '../ui/pages/groups/OtherGroups'
import { loadCatalog } from './loadCatalog.ts'
import { LanguageProvider } from './LanguageProvider.tsx'

vi.mock('api', () => ({
	useAcceptLatestPrivacyPolicy: () => [vi.fn()],
	useActiveGroup: () => undefined,
	useCreateGroup: () => [vi.fn()],
	useDeactivateGroup: () => [vi.fn()],
	useGroupExists: () => ({ exists: false, loading: false }),
	useIsSignedIn: () => false,
	useIsUserLoading: () => true,
	useJoinGroup: () => [vi.fn()],
	useLeaveGroup: () => [vi.fn()],
	useSortedGroupMembers: members => members,
}))
vi.mock('ui/routingTools', () => ({
	usePaths: () => ({
		about: () => '/about',
		courses: () => '/courses',
		forStudents: () => '/for-students',
		forTeachers: () => '/for-teachers',
		group: ({ code }) => `/groups/${code}`,
		groups: () => '/groups',
		home: () => '/',
	})
}))

describe('migrated static page translations', () => {
	it.each([
		['pages/explainers/about', About],
		['pages/explainers/forStudents', ForStudents],
		['pages/explainers/forTeachers', ForTeachers],
	])('keeps the authored sources in sync with %s.xlf', async (catalogPath, Page) => {
		const registrations = []
		render(<MemoryRouter><LanguageProvider registerSource={registration => registrations.push(registration)}>
			<Page />
		</LanguageProvider></MemoryRouter>)
		await waitFor(() => expect(registrations.length).toBeGreaterThan(0))

		const catalog = await loadCatalog('en', catalogPath)
		for (const registration of registrations) {
			if ([...registration.folder, registration.catalog].join('/') !== catalogPath) continue
			const unit = findCatalogUnit(catalog, registration.group, registration.id)
			expect(unit, `${catalogPath}:${registration.group.join('.')}:${registration.id}`).toBeDefined()
			const status = compareSourceMessages(unit.source, registration.source)
			if (status !== 'current') throw new Error(`${catalogPath}:${registration.group.join('.')}:${registration.id} is ${status}.\nStored: ${JSON.stringify(unit.source)}\nAuthored: ${JSON.stringify(registration.source)}`)
		}
	})

	it.each([
		['pages/home', Home],
		['pages/privacyPolicy', ApprovePrivacyPolicy],
	])('keeps the authored sources in sync with %s.xlf', async (catalogPath, Page) => {
		const registrations = []
		render(<HelmetProvider><MemoryRouter><LanguageProvider registerSource={registration => registrations.push(registration)}>
			<Page firstTime />
		</LanguageProvider></MemoryRouter></HelmetProvider>)
		await waitFor(() => expect(registrations.length).toBeGreaterThan(0))

		const catalog = await loadCatalog('en', catalogPath)
		for (const registration of registrations) {
			if ([...registration.folder, registration.catalog].join('/') !== catalogPath) continue
			const unit = findCatalogUnit(catalog, registration.group, registration.id)
			expect(unit, `${catalogPath}:${registration.group.join('.')}:${registration.id}`).toBeDefined()
			const status = compareSourceMessages(unit.source, registration.source)
			if (status !== 'current') throw new Error(`${catalogPath}:${registration.group.join('.')}:${registration.id} is ${status}.`)
		}
	})

	it('keeps the authored group-page sources in sync with pages/groups.xlf', async () => {
		const registrations = []
		const member = { active: true, id: 'member-1', name: 'Alex', userId: 'user-1' }
		const group = { code: 'ABCD', members: [member] }
		render(<MemoryRouter><LanguageProvider registerSource={registration => registrations.push(registration)}>
			<TranslationCatalog folder={['pages']} name="groups">
				<GroupCreation />
				<JoinGroupConditions code="ABCD" />
				<NewGroup />
				<ActiveGroup group={group} />
				<OtherGroups groups={[group]} hasActiveGroup />
			</TranslationCatalog>
		</LanguageProvider></MemoryRouter>)
		await waitFor(() => expect(registrations.length).toBeGreaterThan(0))

		const catalogPath = 'pages/groups'
		const catalog = await loadCatalog('en', catalogPath)
		for (const registration of registrations) {
			if ([...registration.folder, registration.catalog].join('/') !== catalogPath) continue
			const unit = findCatalogUnit(catalog, registration.group, registration.id)
			expect(unit, `${registration.group.join('.')}:${registration.id}`).toBeDefined()
			const status = compareSourceMessages(unit.source, registration.source)
			if (status !== 'current') throw new Error(`${registration.group.join('.')}:${registration.id} is ${status}.`)
		}
	})
})
