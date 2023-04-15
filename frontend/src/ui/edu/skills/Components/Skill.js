import React, { useState, useRef, useEffect, useMemo } from 'react'

import { firstToLowerCase } from 'step-wise/util/strings'
import { skillTree } from 'step-wise/edu/skills'

import LoadingNote from 'ui/components/flow/LoadingNote'
import { TabPages, tabData } from 'ui/layout/tabs'

import { useSkillId } from '../util'

import { ExercisePage } from './ExercisePage'

export default function Skill() {
	const skillId = useSkillId()
	const [loadedForSkillId, setLoadedForSkillId] = useState()
	const Pages = useRef(null)

	// Whenever the skill ID changes, reload the skill pages.
	const reload = () => {
		// When no path is given, there are no files to load.
		const { path } = skillTree[skillId]
		if (!path) {
			Pages.current = null
			setLoadedForSkillId(skillId)
			return // Nothing to load.
		}

		// When a path is given, load the relevant files.
		setLoadedForSkillId(undefined)
		import(/* webpackChunkName: "skill-pages-6" */ `../contents/${path}/${skillId}`).then(pages => {
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
	if (!loadedForSkillId)
		return <LoadingNote text="Loading skill pages" />

	// Render the pages. Use a key to force a reload on a new skillId.
	return <TabPages key={skillId} pages={pages} initialPage="practice" />
}
