import React from 'react'
import { Link } from 'react-router-dom'

import { usePaths } from 'ui/routing'

import { Par, Head } from 'ui/components/containers'

export default function About() {
	const paths = usePaths()

	return (
		<>
			<Par>Step-Wise is een web-app die studenten helpt bij het oefenen van opgaven.</Par>

			<Head>Hoe werkt Step-Wise?</Head>
			<Par>De Step-Wise app ondersteunt je op verschillende manieren bij het oefenen.</Par>
			<Par>
				<ul style={{ margin: 0 }}>
					<li><strong>Feedback op antwoorden:</strong> Als je een antwoord invoert geeft de app je hier feedback op. Is het fout? Dan probeert de app je een beetje de juiste kant op te helpen. Is je eenheid fout? Heb je te veel afrondonnauwkeurigheden? Of ben je mogelijk een minteken vergeten?</li>
					<li><strong>Stapsgewijze opgaven:</strong> Kom je niet uit een opgave? De meeste opgaven kun je op laten splitsen in stappen. Zo begeleidt de app je door de opgave heen en kun je inzoomen op waar je precies moeite mee hebt.</li>
					<li><strong>Heldere uitwerkingen:</strong> Elke opgave heeft een duidelijke opgave, die teruggrijpt op eerder ontwikkelde vaardigheden. Zo weet je dat je het aan het einde altijd begrijpt.</li>
					<li><strong>Gepersonaliseerde opgaven:</strong> De app houdt bij hoe goed je verschillende vaardigheden kunt. Gebaseerd hierop kiest het precies op jouw niveau nieuwe opgaven uit: niet te makkelijk maar ook niet te moeilijk. Zo word je altijd optimaal uitgedaagd.</li>
					<li><strong>Begeleiding bij het leerproces:</strong> De app leert dus hoe goed je bent in verschillende vaardigheden. Aan de hand hiervan geeft hij je ook tips. Heb je moeite met een basisvaardigheid? Dan raadt de app je aan om eerst die vaardigheid los te oefenen. Of beheers je een vaardigheid al ruim voldoende? Dan vertelt de app dat je weer verder moet.</li>
				</ul>
			</Par>
			<Par>Dit alles maakt het oefenen net zo nuttig als wanneer je een persoonlijke tutor voor je zou hebben zitten. En zo kun je Step-Wise ook zien: als je eigen persoonlijke tutor, die je oefenopgaven op maat geeft.</Par>

			<Head>Vaardigheden bijhouden</Head>
			<Par>De basis van de Step-Wise app is dat het bijhoudt hoe goed je bepaalde vaardigheden kunt. Hoe dit in detail werkt kun je in onze <Link to={paths.skillTrackerExplainer()}>explainer over vaardigheden bijhouden</Link> lezen. Samengevat komt er het volgende bij kijken.</Par>
			<Par>
				<ul style={{ margin: 0 }}>
					<li><strong>Leerbomen:</strong> Als eerste zetten we een cursus om in een leerboom. Wat moet een student kunnen op het einde? En welke voorgaande vaardigheden moet hij daarvoor beheersen? Zo doorlopen we de gehele cursus, tot we bij de voorkennis aankomen.</li>
					<li><strong>Opsplitsbare opgaven:</strong> Vervolgens zetten we de oefenopgaven in het systeem. Elke opgave moet opsplitsbaar zijn in stappen, waarbij elke stap gekoppeld is aan een vaardigheid in de leerboom. Vervolgens kan jij, als student, gaan oefenen.</li>
					<li><strong>Toegepaste kansberekening:</strong> Bij het oefenen zul je sommige stappen goed doen en anderen helaas fout. Door hier toegepaste kansberekening op los te laten, weet ons algoritme redelijk nauwkeurig hoe ver je overal mee bent.</li>
				</ul>
			</Par>
			<Par>Deze gegevens gebruiken we vervolgens om jou gepersonaliseerde opgaven aan te kunnen bieden.</Par>

			<Head>Technische details</Head>
			<Par>De Step-Wise app is een zogenaamde <em>Progressive Web App</em>: een website die zich ook voor kan doen als smartphone app. Hij werkt dus het beste op de laptop, maar je kunt hem ook aan je smartphone home screen toevoegen.</Par>
			<Par>Wil je meer weten hoe de app achter de schermen in elkaar zit? Dan hebben we hier wat technische details.</Par>
			<Par>
				<ul style={{ margin: 0 }}>
					<li><strong>Front-end:</strong> De voorkant van de app is gemaakt met React, een toolbox ontwikkeld door Facebook. Zo houden we de website zo interactief mogelijk.</li>
					<li><strong>Ontwerp:</strong> Het uiterlijk van de app is gebaseerd op de Material UI richtlijnen van Google. De styling gaat via JSS.</li>
					<li><strong>Back-end:</strong> Als je een opgave instuurt, dan gaat dit naar onze GraphQL API. Deze draait op Apollo.</li>
					<li><strong>Database:</strong> Al je voortgang wordt opgeslagen in een PostGreSQL database, met Sequelize als tussenlaag.</li>
					<li><strong>Server:</strong> We maken gebruik van de DigitalOcean server in Amsterdam.</li>
					<li><strong>Source code:</strong> Alle source code van de app is publiek toegankelijk via de <a href="https://github.com/HildoBijl/stepwise" target="_blank" rel="noreferrer">GitHub repository</a>.</li>
				</ul>
			</Par>

			<Head>Privacy</Head>
			<Par>Het idee van privacy is goed ingebouwd in elk onderdeel van de Step-Wise app. We maken hierbij gebruik van twee fundamentele ideeën:</Par>
			<Par>
				<ul style={{ margin: 0 }}>
					<li><strong>Need to know:</strong> Je krijgt alleen toegang tot de data die je nodig hebt om te doen wat je wilt doen. Niets meer, niets minder.</li>
					<li><strong>Vragen indien nodig:</strong> Als je een actie uitvoert die anderen toegang tot je data geeft (zoals inloggen of je voor een cursus registreren) dan melden we dit en vragen we je om toestemming. Niet eerder, en zeker niet later.</li>
				</ul>
			</Par>
			<Par>Zo geven we jou een goede ervaring, terwijl je data tegelijkertijd veilig blijft. Wil je meer in detail weten hoe we omgaan met je data? Dan kun je ook onze volledige <a href={`${process.env.PUBLIC_URL}/PrivacyPolicy.pdf`} target="_blank" rel="noreferrer">Privacy Policy</a> lezen. Je wordt hier overigens ook op gewezen als je voor het eerst inlogt.</Par>
		</>
	)
}