import React, { useState, useRef, useEffect, useMemo } from 'react'

import { firstToLowerCase } from 'step-wise/util'
import { skillTree } from 'step-wise/eduTools'

import { TranslationFile, useTranslator } from 'i18n'
import { LoadingNote } from 'ui/components'
import { TabPages, tabData } from 'ui/routingTools'

import { ExercisePage, ExamplePage } from '../exercises'

import { useSkillId } from './util'
import { MetaWrapper } from './MetaWrapper'

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
		}).catch((error) => { // Probably an empty skill that simply couldn't be loaded.
			console.warn(`Could not find contents for skill "${skillId}". This skill appears to have not been developed yet.`)
			Pages.current = {}
			setLoadedForSkillId(skillId)
		})
	}
	useEffect(reload, [Pages, setLoadedForSkillId, skillId])

	// When pages have been loaded, assemble them.
	const loadedPages = Pages.current
	const pages = useMemo(() => {
		// On a non-loaded skill, show the meta page. (Probably not needed, since this case is already caught below.)
		if (!loadedForSkillId || loadedForSkillId !== skillId)
			return { meta: <MetaWrapper skillId={skillId} empty={true} /> }

		// Assemble the pages, starting with the examples and exercises if present.
		const skill = skillTree[skillId]
		const pages = {}
		const hasExamples = Array.isArray(skill.examples) && skill.examples.length > 0
		const hasExercises = Array.isArray(skill.exercises) && skill.exercises.length > 0
		if (hasExamples)
			pages.example = <ExamplePage />
		if (hasExercises)
			pages.practice = <ExercisePage />
		let numPages = (hasExamples ? 1 : 0) + (hasExercises ? 1 : 0)

		// Add in other pages that may have loaded.
		if (loadedPages) {
			Object.keys(loadedPages).filter(key => !!tabData[firstToLowerCase(key)]).forEach(key => {
				const Component = loadedPages[key]
				pages[firstToLowerCase(key)] = <Component />
				numPages++
			})
		}

		// Add in a wrapper for the Meta page, which adds in useful warning/info blocks when needed.
		if (numPages === 0) // No pages at all: show a Meta page.
			pages.meta = <MetaWrapper skillId={skillId} empty={true} />
		else if (numPages === 1 && pages.meta) // Only the Meta page.
			pages.meta = <MetaWrapper skillId={skillId} empty={true}>{pages.meta}</MetaWrapper>
		else  // Has a page, probably either Theory or Exercises.
			pages.meta = <MetaWrapper skillId={skillId}>{pages.meta}</MetaWrapper>
		return pages
	}, [loadedForSkillId, skillId, loadedPages])

	// Upon loading, show a loading note.
	if (!loadedForSkillId)
		return <LoadingNote text={translate('Loading skill pages...', 'loadingNotes.loadingSkillPages', 'eduTools/pages/skillPage')} />

	// Render the pages. Use a key to force a reload on a new skillId.
	return <TranslationFile path={`eduContent/${skillTree[skillId].path.join('/')}/${skillId}`}>
		<TabPages key={skillId} pages={pages} initialPage="practice" />
	</TranslationFile>
}
