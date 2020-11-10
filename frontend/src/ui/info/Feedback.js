import React from 'react'
import { Typography } from '@material-ui/core'

export default function Feedback() {
	return (
		<>
			<Typography variant='body1'>Feedback op deze app is meer dan welkom! De app is immers nog experimenteel, dus suggesties voor verbetering kunnen gelijk verwerkt worden. Dus...</Typography>
			<ul>
				<li>Heb je een bug gevonden? Iets wat net niet helemaal goed werkt?</li>
				<li>Heb je een idee voor een uitbreiding? Iets wat je graag zou zien?</li>
				<li>Heb je een mening over welke bestaande functies nuttig zijn en welke minder?</li>
			</ul>
			<Typography variant='body1'>Laat het vooral weten! Mail naar <a href="mailto:hildo.bijl@hu.nl">hildo.bijl@hu.nl</a> en ik kom zo snel mogelijk bij je terug.</Typography>
		</>
	)
}
