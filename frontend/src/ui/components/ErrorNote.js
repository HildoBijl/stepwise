import React from 'react'

export default function ErrorNote({ error, info, text }) {
	// ToDo later: log error and info.
	return <>
		<p>Oops ... daar ging iets mis. {text || ''}</p>
		<p>Probeer de pagina te vernieuwen. Mocht dat het probleem niet oplossen, neem dan contact met ons op. Het helpt als je ons exact vertelt wat je aan het doen was, zodat wij de fout kunnen herproduceren en vervolgens voor jou en toekomstige gebruikers op kunnen lossen.</p>
	</>
}
// ToDo: add a link to the contact page.
// ToDo later: add some kind of image to make this more fun. Maybe a dead leaf?