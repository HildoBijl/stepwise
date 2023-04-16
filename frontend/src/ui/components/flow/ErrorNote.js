import React from 'react'

export default function ErrorNote({ error, info, text }) {
	// ToDo later: log error and info.
	return <>
		<p>Oops ... daar ging iets mis. {text || ''}</p>
		<p>Probeer eventueel de pagina te vernieuwen. Mocht dat het probleem niet oplossen, stuur dan even een mail naar <a href="mailto:info@step-wise.com">info@step-wise.com</a> (Hildo). Dan los ik de bug op, zodat jij en anderen er niet weer tegenaan lopen. Voeg waar mogelijk toe:</p>
		<ul>
			<li>Waar de bug optradt: welke vaardigheid/opgave.</li>
			<li>Wat je deed vlak voordat de bug optradt.</li>
			<li>Eventueel een screenshot van de rode foutmelding in de Developer's Tools console (F12).</li>
		</ul>
	</>
}
// ToDo later: add some kind of image to make this more fun. Maybe a dead leaf?
