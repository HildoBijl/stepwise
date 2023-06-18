import React from 'react'

export default function ErrorNote({ error, info, text }) {
	// ToDo later: log error and info.
	return <>
		<p>Oops ... daar ging iets mis. {text || ''}</p>
		<p>Mogelijk heb je een verouderde versie van de web-app. Probeer een hard refresh (shift+F5) om te kijken of dit het probleem oplost.</p>
		<p>Is de bug er nog steeds? Stuur dan even een mail naar <a href="mailto:info@step-wise.com">info@step-wise.com</a> (Hildo). Dan los ik de bug op, zodat jij en anderen er niet weer tegenaan lopen. Voeg waar mogelijk toe:</p>
		<ul>
			<li>Waar de bug optradt: welke vaardigheid/opgave.</li>
			<li>Wat je deed vlak voordat de bug optradt.</li>
			<li>Eventueel een screenshot van de rode foutmelding in de Developer's Tools console (F12).</li>
		</ul>
	</>
}
// ToDo later: add some kind of image to make this more fun. Maybe a dead leaf?
