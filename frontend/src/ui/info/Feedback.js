import React from 'react'

import { Par, Head } from 'ui/components/containers'

export default function Feedback() {
	return (
		<>
			<Par>Feedback op deze app is meer dan welkom! De app is immers nog experimenteel, dus suggesties voor verbetering kunnen gelijk verwerkt worden. Dus...</Par>
			<ul>
				<li>Heb je een bug gevonden? Iets wat net niet helemaal goed werkt?</li>
				<li>Heb je een idee voor een uitbreiding? Iets wat je graag zou zien?</li>
				<li>Heb je een mening over welke bestaande functies nuttig zijn en welke minder?</li>
			</ul>
			<Par>Laat het vooral weten! Mail naar <a href="mailto:hildo.bijl@hu.nl">hildo.bijl@hu.nl</a> en ik kom zo snel mogelijk bij je terug.</Par>
			<Head>Bestaande ideeën</Head>
			<Par>Onderstaande punten zijn ideeën die ik al heb. Ik twijfel alleen nog welke ik het eerst uit ga voeren. Heb je een mening? Laat het ook weten!</Par>
			<ul>
				<li><strong>Meer oefenopgaven:</strong> Met meer inhoud kun je ook meer verschillende soorten onderwerpen oefenen in de app.</li>
				<li><strong>De vrij-oefenen-modus:</strong> Als je alle vaardigheden van een cursus beheerst, dan zou het handig zijn als je in een vrij-oefenen-modus komt, waarin je willekeurig opgaven krijgt uit alle onderwerpen van de cursus. Deze modus kan gemaakt worden.</li>
				<li><strong>Eerder gemaakte oefeningen zien:</strong> Al je werk wat op het moment opgeslagen in de database, maar je kan het nog niet terug zien. Wil je eerder gemaakte oefenopgaven ook terug kunnen zien? Het is mogelijk om dit te maken.</li>
				<li><strong>Sandbox modus:</strong> Nadat je een oefenopgave afgerond hebt kan ik me voorstellen dat je nog wilt experimenteren, "Was dit antwoord ook goed geweest?" Een sandbox modus is precies dat: je kunt na afronding van een opgave nieuwe antwoorden invoeren en er feedback op krijgen zonder dat het enige gevolgen heeft voor je ratings.</li>
				<li><strong>Docent-modus:</strong> Ik kan een extra pagina voor docenten maken, waarmee ze kunnen zien waar studenten mee bezig zijn. Zo kan een docent een student beter helpen als er vragen zijn omtrent een opgave.</li>
				<li><strong>Betere smartphone-ondersteuning:</strong> De app is deels ontworpen om ook op smartphones te werken. Helaas werken de invoervelden niet optimaal op smartphones. Dit moet nog verbeterd worden.</li>
				<li><strong>Zelf je eigen cursus samenstellen:</strong> Nu staan alle cursussen vast gedefinieerd. Maar mogelijk wil je je eigen leerdoelen stellen, en zo je eigen cursus maken. Deze optie zou toegevoegd kunnen worden.</li>
				<li><strong>Verbeterde machine learning:</strong> Er zijn ook plannen om het Machine Learning algoritme iets beter af te stemmen, zodat we nog betere voorspellingen kunnen geven. Vind je de voorspellingen soms wat vreemd? Dan kan dit mogelijk helpen.</li>
				<li><strong>Iets anders:</strong> Heb je zelf nog suggesties? Laat het ook weten!</li>
			</ul>
			<Par>Stuur me vooral een mail met wat jij als eerste toegevoegd wilt zien.</Par>
		</>
	)
}
