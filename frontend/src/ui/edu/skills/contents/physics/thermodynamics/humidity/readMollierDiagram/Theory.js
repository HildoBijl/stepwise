import React from 'react'

import { Unit } from 'step-wise/inputTypes/Unit'
import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'
import { maximumHumidity } from 'step-wise/data/moistureProperties'

import { Head, Par, List, M, BM } from 'ui/components'
import { Drawing, usePlotTransformationSettings, Axes, MouseLines, Curve, Group } from 'ui/figures'

import MollierDiagram from 'ui/edu/content/diagrams/MollierDiagram'

const T25dC = new FloatUnit('25 dC')
const AV15gpkg = new FloatUnit('15 g/kg')
const AV20gpkg = new FloatUnit('20 g/kg')
const RV = AV15gpkg.divide(AV20gpkg).setUnit('%')
const gpkg = AV20gpkg.unit
const gpm3 = new Unit('g/m^3')

export default function Component() {
	return <>
		<Par>Bij het werken met luchtvochtigheid is het belangrijk om het onderscheid tussen absolute en relatieve luchtvochtigheid te weten. Deze komen allebei samen in het Mollier diagram. Hier kijken we hoe het allemaal werkt.</Par>

		<Head>De absolute luchtvochtigheid</Head>
		<Par>Als men het over luchtvochtigheid heeft, dan heeft men het over hoeveel water er in de lucht zit. Om dit te meten nemen we een kilogram lucht en kijken hoeveel gram water er in deze lucht opgelost (verdampt) is. De eenheid van luchtvochtigheid is dan ook <M>{gpkg}.</M> Oké, in sommige boeken bekijkt men niet één kilogram lucht maar één kubieke meter lucht, en zo krijgt men dan de eenheid <M>{gpm3}.</M> De rest werkt verder helemaal hetzelfde. Wij gebruiken hier <M>{gpkg}.</M></Par>
		<Par>Belangrijk bij luchtvochtigheid is dat er een maximum aan zit. De lucht kan slechts een bepaalde hoeveelheid vocht opnemen. Daarna is de lucht <em>verzadigd</em>. Deze maximale luchtvochtigheid hangt af van de temperatuur, volgens het volgende diagram.</Par>
		<MaximumHumidityPlot />
		<Par>De maximale luchtvochtigheid bij een temperatuur van <M>{T25dC}</M> is bijvoorbeeld <M>{AV20gpkg}.</M> Je ziet ook: hoe warmer het is, hoe hoger de maximale luchtvochtigheid is. Dit is ook wat overeenkomt met onze ervaring: als het warm is neemt de lucht makkelijker water op.</Par>

		<Head>De relatieve luchtvochtigheid</Head>
		<Par>De hierboven genoemde luchtvochtigheid wordt ook wel de <em>absolute luchtvochtigheid</em> <M>AV</M> genoemd. Dat komt omdat er ook een <em>relatieve luchtvochtigheid</em> <M>RV</M> is. Deze luchtvochtigheid meet hoe ver we (bij de gegeven temperatuur) in de buurt van het maximum zitten. Specifiek geldt de formule <BM>RV = \frac(AV)(AV_(max)).</BM> Oftewel, om de relatieve luchtvochtigheid te vinden, delen we de aanwezige luchtvochtigheid door de maximale luchtvochtigheid. Vaak wordt de relatieve luchtvochtigheid uitgedrukt in een percentage. Als we bij <M>T = {T25dC}</M> bijvoorbeeld een absolute luchtvochtigheid van <M>{AV15gpkg}</M> hebben, dan is de relatieve luchtvochtigheid op dat moment <BM>RV = \frac({AV15gpkg.number})({AV20gpkg.number}) = {RV}.</BM></Par>

		<Head>De opzet van het Mollier diagram</Head>
		<Par>Als je werkt met luchtvochtigheid, dan is het cruciaal om een Mollier diagram bij de hand te hebben. Dit diagram ziet er als volgt uit.</Par>
		<MollierDiagram />
		<Par>Je ziet: we hebben nu de absolute luchtvochtigheid horizontaal en de temperatuur verticaal. In het diagram is de maximale luchtvochtigheid (de dikke lijn) al ingetekend, en ook de lijnen met constante relatieve luchtvochtigheid (de andere lijnen). Zo kun je voor een absolute luchtvochtigheid direct de relatieve luchtvochtigheid aflezen, zonder nog verder te hoeven rekenen. We kunnen bijvoorbeeld direct bij <M>T = {T25dC}</M> en <M>AV = {AV15gpkg}</M> zien dat <M>RV = {RV}.</M></Par>

		<Head>Het Mollier diagram aflezen: de stappen</Head>
		<Par>Wil je in het Mollier diagram voor een gegeven temperatuur en absolute luchtvochtigheid de relatieve luchtvochtigheid bepalen? Dat gaat als volgt.</Par>
		<List useNumbers={true} items={[
			<>Zoek voor de gegeven <M>T</M> en <M>AV</M> het snijpunt op.</>,
			<>Volg de gebogen lijnen om te kijken welke relatieve luchtvochtigheid (welk percentage) erbij hoort.</>,
		]} />
		<Par>Of wil je juist voor een gegeven relatieve luchtvochtigheid bepalen wat de absolute luchtvochtigheid is? Dat gaat volgens de volgende stappen.</Par>
		<List useNumbers={true} items={[
			<>Volg de gebogen lijn voor de gegeven <M>RV</M> tot je bij de gegeven <M>T</M> komt.</>,
			<>Lees voor dit punt op de horizontale as af welke <M>AV</M> erbij hoort.</>,
		]} />
		<Par>Als je dit bepalen kan, dan kun je punten uit het Mollier diagram aflezen.</Par>
	</>
}

const points = maximumHumidity.headers[0].map((temperature, index) => [temperature.number, maximumHumidity.grid[index].number])
function MaximumHumidityPlot() {
	const transformationSettings = usePlotTransformationSettings([[-10, 0], [35, 35]], { maxHeight: 300, maxWidth: 400, margin: [0, [0, 20]] })
	return <Drawing transformationSettings={transformationSettings}>
		<Axes xLabel="Temperatuur [°C]" yLabel="Maximale luchtvochtigheid [g/kg]" />
		<MouseLines />
		<Group overflow={false}>
			<Curve points={points} style={{ strokeWidth: 2 }} />
		</Group>
	</Drawing>
}
