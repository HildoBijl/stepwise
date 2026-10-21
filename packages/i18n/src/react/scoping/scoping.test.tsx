// @vitest-environment jsdom

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useTranslationScope } from './hooks.ts'
import { TranslationCatalog } from './TranslationCatalog.tsx'
import { TranslationFolder } from './TranslationFolder.tsx'
import { TranslationSection } from './TranslationSection.tsx'
import { type TranslationScope } from './types.ts'

describe('translation scoping', () => {
	it('extends and replaces folder paths', () => {
		let scope: TranslationScope | undefined
		const CaptureScope = () => {
			scope = useTranslationScope()
			return null
		}

		render(<TranslationFolder path={['ignored']}>
			<TranslationFolder path={['eduTools']} extend={false}>
				<TranslationFolder path={['exercises']}><CaptureScope /></TranslationFolder>
			</TranslationFolder>
		</TranslationFolder>)

		expect(scope).toEqual({ folder: ['eduTools', 'exercises'], section: [] })
	})

	it('selects a catalog and extends or replaces its section path', () => {
		let extendedScope: TranslationScope | undefined
		let replacedScope: TranslationScope | undefined

		function CaptureScopes() {
			extendedScope = useTranslationScope()
			return <TranslationSection id="buttons" extend={false}><ReplacedScope /></TranslationSection>
		}
		function ReplacedScope() {
			replacedScope = useTranslationScope()
			return null
		}

		render(<TranslationFolder path={['eduTools']}>
			<TranslationCatalog name="exerciseManager">
				<TranslationSection id="controls"><CaptureScopes /></TranslationSection>
			</TranslationCatalog>
		</TranslationFolder>)

		expect(extendedScope).toEqual({ folder: ['eduTools'], catalog: 'exerciseManager', section: ['controls'] })
		expect(replacedScope).toEqual({ folder: ['eduTools'], catalog: 'exerciseManager', section: ['buttons'] })
	})

	it('lets a catalog replace the contextual folder', () => {
		let scope: TranslationScope | undefined
		const CaptureScope = () => {
			scope = useTranslationScope()
			return null
		}

		render(<TranslationFolder path={['ignored']}>
			<TranslationCatalog folder={['pages']} name="home"><CaptureScope /></TranslationCatalog>
		</TranslationFolder>)

		expect(scope).toEqual({ folder: ['pages'], catalog: 'home', section: [] })
	})

	it('lets a nested catalog replace the catalog and reset the section for its subtree', () => {
		const scopes: TranslationScope[] = []
		const CaptureScope = () => {
			scopes.push(useTranslationScope())
			return null
		}

		render(<TranslationFolder path={['eduTools']}>
			<TranslationCatalog name="outer">
				<TranslationSection id="controls">
					<CaptureScope />
					<TranslationCatalog name="inner"><CaptureScope /></TranslationCatalog>
					<CaptureScope />
				</TranslationSection>
			</TranslationCatalog>
		</TranslationFolder>)

		expect(scopes).toEqual([
			{ folder: ['eduTools'], catalog: 'outer', section: ['controls'] },
			{ folder: ['eduTools'], catalog: 'inner', section: [] },
			{ folder: ['eduTools'], catalog: 'outer', section: ['controls'] },
		])
	})

	it('rejects invalid scope nesting', () => {
		expect(() => render(<TranslationSection id="orphan"><span /></TranslationSection>)).toThrow('must be used inside a TranslationCatalog')
		expect(() => render(<TranslationCatalog name="outer"><TranslationFolder path={['inner']}><span /></TranslationFolder></TranslationCatalog>)).toThrow('cannot be used inside a TranslationCatalog')
	})
})
