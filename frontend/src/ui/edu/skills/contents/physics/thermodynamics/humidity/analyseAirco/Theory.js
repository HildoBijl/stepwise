import React from 'react'

import { tableInterpolate, inverseTableInterpolate } from 'step-wise/util'
import { FloatUnit } from 'step-wise/inputTypes'
import { maximumHumidity } from 'step-wise/data/moistureProperties'

import { useColor } from 'ui/theme'
import { SkillLink } from 'ui/routing'
import { Head, Par, List, M, Term, Emp } from 'ui/components'
import { Curve, Line, Circle } from 'ui/figures'

import MollierDiagram from 'ui/edu/content/diagrams/MollierDiagram'

const p45 = new FloatUnit('45%')
const p60 = new FloatUnit('60%')

const T1 = new FloatUnit('30 dC')
const T3 = new FloatUnit('8 dC').setDecimals(0)
const T4 = new FloatUnit('20 dC')
const startRH = new FloatUnit('80%')

const startAHmax = tableInterpolate(T1, maximumHumidity).setSignificantDigits(2)
const startAH = startRH.setUnit('').multiply(startAHmax)
const endAH = tableInterpolate(T3, maximumHumidity).setSignificantDigits(2)
const endAHmax = tableInterpolate(T4, maximumHumidity).setSignificantDigits(2)
const endRH = endAH.divide(endAHmax).setUnit('%')
const T2 = inverseTableInterpolate(startAH, maximumHumidity).setDecimals(0)

export default function Component() {
	return <>
		<Par>Bij een airco is het belangrijk dat de uitgaande lucht de juiste temperatuur <Emp>en</Emp> de juiste luchtvochtigheid heeft. Hier bekijken we hoe een airco dat voor elkaar krijgt.</Par>

		<Head>Een comfortabele luchtvochtigheid</Head>
		<Par>We kennen allemaal wel situaties waarin de lucht te droog is. Denk aan een woestijn of een erg koude winterdag. Je krijgt dan last van een droge keel, wat verre van prettig is. Maar we kennen ook situaties waarin de lucht juist erg vochtig is. Denk aan een regenwoud of een vochtige badkamer. Het is in deze situaties vaak erg benauwd: je zweet verdampt niet waardoor je lichaam de warmte niet kwijt kan.</Par>
		<Par>Je merkt: als we een <Term>comfortabele omgeving</Term> willen creëren, dan is het belangrijk om de luchtvochtigheid goed af te stellen. In de praktijk is gebleken dat mensen een luchtvochtigheid van zo'n <M>{p45}</M> tot <M>{p60}</M> comfortabel vinden. Ietsje lager of hoger is nog niet zo'n probleem, maar je wilt niet te ver van dit gebied af zitten.</Par>

		<Head>Eerst koelen, dan verwarmen</Head>
		<Par>Stel, we krijgen warme lucht met hoge luchtvochtigheid binnen; bijvoorbeeld bij <M>T_(in) = {T1}</M> en <M>RV_(in) = {startRH}.</M> We willen uiteindelijk lucht met een lagere temperatuur en luchtvochtigheid afleveren; bijvoorbeeld <M>T_(uit) = {T4}</M> en <M>RV_(uit) = {endRH}.</M> Hoe kunnen we dat voor elkaar krijgen?</Par>
		<Par>Het afkoelen van de lucht kan met een koelmachine. Het lastige deel is het verlagen van de luchtvochtigheid. De truc is om de lucht eerst "te ver" af te koelen. Omdat we hierbij de maximale luchtvochtigheid voorbij gaan, zal een groot deel van het water in de lucht condenseren. Dit water (dan in vloeibare vorm) kan via een afvoerpijpje afgevoerd worden. Als er voldoende water gecondenseerd en afgevoerd is, warmen we de lucht weer op (bijvoorbeeld via een warmtewisselaar om energie te besparen) tot de gewenste temperatuur.</Par>
		<AircoProcess />
		<Par>Het bovenstaande proces kunnen we ook in een Mollier diagram weergeven. Dat ziet er uit zoals hierboven. We gaan vanaf het beginpunt (rechtsboven) verticaal naar beneden tot we de maximale luchtvochtigheid bereiken. Deze lijn volgen we, tot we uiteindelijk besluiten dat er voldoende water gecondenseerd is. Bij het verwarmen gaat de lijn weer recht omhoog.</Par>

		<Head>Een aircoproces doorrekenen: de stappen</Head>
		<Par>Als je een aircoproces door wilt rekenen, teken het proces dan altijd in een Mollier diagram. Afhankelijk van wat gegeven en gevraagd is volg je de volgende stappen.</Par>
		<List useNumbers={true} items={[
			<>Teken het beginpunt in. Je kunt deze <SkillLink skillId="readMollierDiagram">opzoeken</SkillLink> via de aanvangstemperatuur en de aanvangsluchtvochtigheid.</>,
			<>Teken het eindpunt in. Je kunt deze <SkillLink skillId="readMollierDiagram">opzoeken</SkillLink> via de eindtemperatuur en de eindluchtvochtigheid.</>,
			<>Teken het tussenpunt in, na afloop van het koelproces. Deze ligt altijd verticaal onder het eindpunt (dus op dezelfde absolute luchtvochtigheid), en wel op de dikke lijn van maximale luchtvochtigheid.</>,
		]} />
		<Par>Als je dit hebt ingetekend, dan kun je hiermee ook verschillende andere waarden berekenen.</Par>
		<List items={[
			<>De horizontale afstand tussen het beginpunt en het eindpunt zegt iets over de hoeveelheid water die gecondenseerd is. Zo zie je hoeveel water afgevoerd moet worden.</>,
			<>De verticale afstanden tussen de punten zegt iets over de temperatuursveranderingen die optreden. Zo kun je bepalen hoeveel koelvermogen of verwarmingsvermogen nodig is.</>,
		]} />
		<Par>Hiermee kun je alle relevante eigenschappen van je airco bepalen.</Par>
	</>
}

function AircoProcess() {
	const color = useColor('primary')

	const point1 = [startAH.number, T1.number]
	const point2 = [startAH.number, T2.number]
	const point3 = [endAH.number, T3.number]
	const point4 = [endAH.number, T4.number]

	const linePoints = maximumHumidity.headers[0].map((T, index) => [maximumHumidity.grid[index].number, T.number])
	const points = [point2, ...linePoints.filter(point => point[1] < T2.number && point[1] > T3.number).reverse(), point3]

	return <MollierDiagram maxWidth="500">
		<Line points={[point1, point2]} style={{ stroke: color, strokeWidth: 2 }} />
		<Curve points={points} style={{ stroke: color, strokeWidth: 2 }} />
		<Line points={[point3, point4]} style={{ stroke: color, strokeWidth: 2 }} />
		<Line points={[[point1[0], 0], point1, [0, point1[1]]]} style={{ stroke: color, strokeDasharray: '4 2' }} />
		<Line points={[[point4[0], 0], point4, [0, point4[1]]]} style={{ stroke: color, strokeDasharray: '4 2' }} />
		<Circle center={point1} graphicalRadius={3} style={{ fill: color }} />
		<Circle center={point2} graphicalRadius={3} style={{ fill: color }} />
		<Circle center={point3} graphicalRadius={3} style={{ fill: color }} />
		<Circle center={point4} graphicalRadius={3} style={{ fill: color }} />
	</MollierDiagram>
}
