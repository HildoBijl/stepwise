import React, { useState, useRef, useEffect } from 'react'

import { firstToLowerCase } from 'step-wise/util/strings'
import { skillTree } from 'step-wise/edu/skills'

import LoadingNote from 'ui/components/flow/LoadingNote'
import { TabPages, tabData } from 'ui/layout/tabs'

import { useSkillId } from '../util'

import { ExercisePage } from './ExercisePage'

export default function Skill() {
	const skillId = useSkillId()
	const [loading, setLoading] = useState(true)
	const Pages = useRef(null)

	// Whenever the skill ID changes, reload the skill pages.
	const reload = () => {
		// When no path is given, there are no files to load.
		const { path } = skillTree[skillId]
		if (!path) {
			Pages.current = null
			setLoading(false)
			return // Nothing to load.
		}

		// When a path is given, load the relevant files.
		setLoading(true)
		import(/* webpackChunkName: "skill-pages-6" */ `../contents/${path}/${skillId}`).then(pages => {
			if (pages === null)
				throw new Error(`Invalid skill path: tried to find skill pages at "skills/contents/${path}/${skillId}" but no files were found there. Could not render skill pages.`)
			Pages.current = pages
			setLoading(false)
		}).catch((error) => {
			console.error('Skill pages failed to load.')
			console.error(error) // ToDo later: properly process errors.
			throw error
		})
	}
	useEffect(reload, [Pages, setLoading, skillId])

	// Upon loading, show a loading note.
	if (loading)
		return <LoadingNote text="Loading skill pages" />

	// When pages have been loaded, render them.
	const pages = { practice: <ExercisePage /> } // Always have a practice page.
	const loadedPages = Pages.current
	if (loadedPages) {
		Object.keys(loadedPages).filter(key => !!tabData[firstToLowerCase(key)]).forEach(key => {
			const Component = loadedPages[key]
			pages[firstToLowerCase(key)] = <Component />
		})
	}

	return <TabPages pages={pages} initialPage="practice" />
}
