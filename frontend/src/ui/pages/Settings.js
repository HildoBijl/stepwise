import React from 'react'
import { Link } from 'react-router-dom'

import { usePaths } from 'ui/routing'

import { Par, Head } from 'ui/components/containers'

export default function About() {
	const paths = usePaths()

	return (
		<>
			<Par>Er zijn nog geen app-brede instellingen. Zijn er dingen die je in wilt stellen? Laat het weten via <a href="mailto:hildo.bijl@hu.nl">hildo.bijl@hu.nl</a> en we kijken of we het toe kunnen voegen.</Par>

			<Head>Account verwijderen</Head>
			<Par>Als je je account verwijdert, dan worden <strong>alle</strong> gegevens van je op Step-Wise gewist. Dit kan niet ongedaan gemaakt worden. Natuurlijk kun je hierna altijd wel weer inloggen om een nieuwe account aan te maken.</Par>
			<Par>Deze functionaliteit wordt nog toegevoegd.</Par>
		</>
	)
}