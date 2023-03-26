import React from 'react'

import { Par, Head } from 'ui/components/containers'

export default function Feedback() {
	return (
		<>
			<Par>Step-Wise is nog experimenteel en wordt continu verder ontwikkeld. Feedback is dus altijd welkom!</Par>

			<Head>Bug gevonden?</Head>
			<Par>Stuur bij een bug (maakt niet uit hoe klein) gelijk een mail naar <a href="mailto:info@step-wise.com">info@step-wise.com</a> (Hildo). Dan los ik hem op, zodat jij en anderen er niet weer tegenaan lopen. Voeg waar mogelijk toe:</Par>
			<ul>
				<li>Waar de bug optradt: welke vaardigheid/opgave.</li>
				<li>Wat je deed vlak voordat de bug optradt.</li>
				<li>Eventueel een screenshot van de rode foutmelding in de Developer's Tools console (F12).</li>
			</ul>

			<Head>Idee voor verbetering?</Head>
			<Par>Wil je graag een verandering of uitbreiding zien? Laat het weten, en als het niet te veel werk is regelen we het zo snel mogelijk! Mail wederom naar <a href="mailto:info@step-wise.com">info@step-wise.com</a> en vertel ons al je ideeën.</Par>

			<Head>Bestaande plannen</Head>
			<Par>De komende maanden wordt er aan het volgende gewerkt.</Par>
			<ul>
				<li><strong>Theoriepagina's:</strong> elke vaardigheid krijgt een korte samenvatting met theorie over het onderwerp, inclusief stappen om opgaven op te lossen.</li>
				<li><strong>Bijlagen:</strong> voor het opzoeken van natuurkundige constanten komen er bijlage-pagina's. Wel zo handig, omdat het internet niet altijd dezelfde waarden gebruikt.</li>
				<li><strong>Vertaling:</strong> Step-Wise gaat omgezet worden in het Engels en Duits!</li>
				<li><strong>Extra onderwerpen:</strong> op het gebied van basis-wiskunde en mechanica gaan nog verschillende vaardigheden toegevoegd worden.</li>
			</ul>
			<Par>In welke richting de ontwikkelingen daarna gaan zal alleen de tijd uitwijzen.</Par>
		</>
	)
}
