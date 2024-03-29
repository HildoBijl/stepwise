import React, { useState, useRef, useEffect, useMemo } from 'react'

import { firstToLowerCase } from 'step-wise/util'
import { skillTree } from 'step-wise/eduTools'

import { TranslationFile, useTranslator } from 'i18n'
import { LoadingNote } from 'ui/components'
import { TabPages, tabData } from 'ui/routingTools'

import { ExercisePage } from '../exercises'

import { useSkillId } from './util'

export function SkillPage() {
	const translate = useTranslator()
	const skillId = useSkillId()
	const [loadedForSkillId, setLoadedForSkillId] = useState()
	const Pages = useRef(null)

	// Whenever the skill ID changes, reload the skill pages.
	const reload = () => {
		const { path } = skillTree[skillId]
		setLoadedForSkillId(undefined)
		import(/* webpackChunkName: "skill-pages-6" */ `ui/eduContent/${path.join('/')}/${skillId}`).then(pages => {
			if (pages === null)
				throw new Error(`Invalid skill path: tried to find skill pages at "skills/contents/${path}/${skillId}" but no files were found there. Could not render skill pages.`)
			Pages.current = pages
			setLoadedForSkillId(skillId)
		}).catch((error) => {
			console.error('Skill pages failed to load.')
			console.error(error) // ToDo later: properly process errors.
			throw error
		})
	}
	useEffect(reload, [Pages, setLoadedForSkillId, skillId])

	// When pages have been loaded, assemble them.
	const loadedPages = Pages.current
	const pages = useMemo(() => {
		if (!loadedForSkillId || loadedForSkillId !== skillId)
			return {}
		const pages = { practice: <ExercisePage /> } // Always have a practice page.
		if (loadedPages) {
			Object.keys(loadedPages).filter(key => !!tabData[firstToLowerCase(key)]).forEach(key => {
				const Component = loadedPages[key]
				pages[firstToLowerCase(key)] = <Component />
			})
		}
		return pages
	}, [loadedForSkillId, skillId, loadedPages])

	// Upon loading, show a loading note.
	if (!loadedForSkillId || Object.keys(pages).length === 0)
		return <LoadingNote text={translate('Loading skill pages...', 'loadingNotes.loadingSkillPages', 'eduTools/pages/skillPage')} />

	// Render the pages. Use a key to force a reload on a new skillId.
	return <TranslationFile path={`eduContent/${skillTree[skillId].path.join('/')}/${skillId}`}>
		<TabPages key={skillId} pages={pages} initialPage="practice" />
	</TranslationFile>
}
