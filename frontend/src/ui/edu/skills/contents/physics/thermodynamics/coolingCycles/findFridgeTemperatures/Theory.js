import React from 'react'

import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'

import { Head, Par, List, M, Term, Emp, Info } from 'ui/components'

const Tm5dC = new FloatUnit('-5 dC')
const T5dC = new FloatUnit('5 dC')
const T20dC = new FloatUnit('20 dC')
const T30dC = new FloatUnit('30 dC')
const T35dC = new FloatUnit('35 dC')

export default function Component() {
	return <>
		<Par>Een koelmachine bestaat uit verschillende onderdelen. Als je een koelmachine ontwerpt, is de eerste stap het bepalen van welke temperatuur in welk onderdeel aanwezig moet zijn. Hier bespreken we hoe dat werkt.</Par>

		<Head>De koelkast en de warmtepomp</Head>
		<Par>Een koelkast en een warmtepomp zijn twee verschillende apparaten.</Par>
		<List items={[
			<>Een koelkast onttrekt warmte uit een koude ruimte (de koelruimte, rond de <M>{T5dC}</M>) en staat deze warmte af aan een warme ruimte (de keuken, rond de <M>{T20dC}</M>).</>,
			<>Een warmtepomp onttrekt warmte uit een koude ruimte (de buitenlucht, rond de <M>{T5dC}</M>) en staat deze warmte af aan een warme ruimte (de woonkamer, rond de <M>{T20dC}</M>).</>,
		]} />
		<Par>Je merkt: een koelkast en een warmtepomp doen eigenlijk exact hetzelfde. Beiden vallen ze in de categorie "koelmachine". We kunnen ze dus gelijktijdig analyseren.</Par>

		<Head>De vier stappen van de koelcyclus</Head>
		<Par>In een standaard koelmachine ondergaat een koudemiddel een cyclus van vier stappen. We beginnen met een gasvormig koudemiddel op lage druk en lage temperatuur.</Par>
		<List useNumbers={true} items={[
			<>In de <Term>compressor</Term> wordt het koudemiddel tot een hoge druk gecomprimeerd. Hierbij stijgt ook de temperatuur.</>,
			<>In de <Term>condensor</Term> stroomt warmte uit het koudemiddel naar de omgeving (de keuken/woonkamer). Omdat het koudemiddel warmte afstaat condenseert het: het wordt vloeibaar. De druk en temperatuur blijven hoog.</>,
			<>In het <Term>expansieventiel</Term>/de <Term>smoorklep</Term> expandeert het koudemiddel tot een lage druk. Hierbij daalt ook de temperatuur.</>,
			<>In de <Term>verdamper</Term> stroomt warmte uit de omgeving (de koelruimte/buitenlucht) het koudemiddel in. Omdat het koudemiddel warmte opneemt verdampt het: het wordt gasvormig. De druk en de temperatuur blijven laag.</>,
		]} />
		<Par>En vanaf hier wordt de cyclus herhaald.</Par>

		<Head>De temperaturen in de condensor en de verdamper</Head>
		<Par>Het is belangrijk dat het koudemiddel in de condensor en de verdamper de juiste temperaturen heeft.</Par>
		<List items={[
			<>In de condensor wordt warmte afgestaan aan de op te warmen ruimte. Dit is alleen mogelijk als het koudemiddel in de condensor <Emp>warmer</Emp> is dan deze ruimte. Vaak is de op te warmen ruimte zo'n <M>{T20dC}.</M> In dit geval is het koudemiddel in de condensor dus zo'n <M>{T30dC}</M> a <M>{T35dC}.</M></>,
			<>In de verdamper wordt warmte opgenomen uit de te koelen ruimte. Dit is alleen mogelijk als het koudemiddel in de verdamper <Emp>kouder</Emp> is dan deze ruimte. Vaak is de te koelen ruimte zo'n <M>{T5dC}.</M> In dit geval is het koudemiddel in de verdamper dus zo'n <M>{Tm5dC}.</M></>,
		]} />
		<Info>Mogelijk heb je wel eens gemerkt dat producten bovenin/achterin de koelkast bevroren zijn. Dat komt omdat de verdamper bovenin de koelkast zit. (Immers, koude lucht daalt.) Op die plek daalt de temperatuur dus wel eens net onder het vriespunt.</Info>

		<Head>De temperaturen bepalen: de stappen</Head>
		<Par>Wil je een koelkast of warmtepomp ontwerpen? Dan bepaal je altijd als eerste de temperaturen in de condensor en de verdamper. Dit gaat als volgt.</Par>
		<List useNumbers={true} items={[
			<>Bepaal de temperaturen in de te koelen ruimte en de op te warmen ruimte. Dit is afhankelijk van je toepassing.</>,
			<>Bepaal de temperatuursverschillen die je kan hebben bij je condensor/verdamper. Dit wordt vaak bepaald door de grootte van de warmtewisselaar. Bij oefenopgaven is dit dikwijls al gegeven.</>,
			<>De condensor is altijd <Emp>warmer</Emp> dan de op te warmen ruimte. De verdamper is altijd <Emp>kouder</Emp> dan de af te koelen ruimte. Hiermee kun je de temperaturen in de condensor en de verdamper bepalen.</>,
		]} />
		<Par>De temperaturen in de condensor en de verdamper zijn het beginpunt van het ontwerpen van je koelmachine. Deze zijn cruciaal bij de volgende stappen. Denk aan het kiezen van je koudemiddel en het bepalen van de druk in de condensor en verdamper.</Par>
	</>
}
