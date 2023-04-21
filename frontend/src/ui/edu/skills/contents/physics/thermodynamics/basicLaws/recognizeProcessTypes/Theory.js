import React from 'react'

import { Float } from 'step-wise/inputTypes/Float'

import { SkillLink } from 'ui/routing'
import { Head, Par, List, M, BM } from 'ui/components'

import ProcessTypeDrawing from './ProcessTypeDrawing'

export default function Component() {
	return <>
		<Par>Je kunt gassen op verschillende wijzen verwarmen/koelen, expanderen/comprimeren, enzovoort. Om hierover te kunnen praten, moet je weten wat de namen van de verschillende procestypen zijn en deze soorten processen kunnen herkennen.</Par>

		<Head>Soorten processen</Head>
		<Par>We bekijken vijf verschillende situaties.</Par>
		<List useNumbers={true} items={[
			<>
				<Par>We nemen een gas in een afgesloten vat met een zuiger. De zuiger heeft een vast gewicht, waardoor de druk in het vat constant is. (Denk aan een fietspomp met een baksteen op het handvat.) Als we het gas verwarmen, dan nemen de temperatuur en het volume toe. De zuiger gaat omhoog.</Par>
				<Par>Dit is een voorbeeld van een proces met constante druk. Dit noemen we een <strong>isobaar</strong> proces. Deze naam komt van de Griekse woorden "isos" (gelijk) en "baros" (gewicht).</Par>
			</>,
			<>
				<Par>We nemen een gas in een afgesloten vat. (Denk aan een eenvoudig drukvat.) Omdat het vat vaste afmetingen heeft, is het volume van het gas ook constant. Als we het gas verwarmen, dan nemen de temperatuur en de druk toe.</Par>
				<Par>Dit is een voorbeeld van een proces met constant volume. Dit noemen we een <strong>isochoor</strong> proces. Deze naam komt van de Griekse woorden "isos" (gelijk) en "khora" (ruimte).</Par>
			</>,
			<>
				<Par>We nemen een gas in een afgesloten vat met een zuiger. (Denk aan een fietspomp.) Dit vat plaatsen we in een bak met water. Vervolgens drukken we de zuiger langzaam in. Omdat de temperatuur van het water ongeveer constant is, en het vat gemakkelijk warmte kan uitwisselen met het water en hier ook voldoende tijd voor heeft, is de temperatuur van het vat ook ongeveer constant. Als gevolg van het indrukken van de zuiger neemt de druk toe en het volume af.</Par>
				<Par>Dit is een voorbeeld van een proces met constante temperatuur. Dit noemen we een <strong>isotherm</strong> proces. Deze naam komt van de Griekse woorden "isos" (gelijk) en "therme" (warmte).</Par>
			</>,
			<>
				<Par>We nemen een gas in een afgesloten vat met een zuiger. (Denk aan een fietspomp.) Dit vat isoleren we goed, zodat er geen enkele warmteuitwisseling met de omgeving is. Vervolgens drukken we de zuiger snel in. Vanwege de goede isolatie en het snelle proces is er geen mogelijkheid voor warmteuitwisseling. Als gevolg van dit proces neemt de druk toe, neemt het volume af, en neemt de temperatuur toe.</Par>
				<Par>Dit is een voorbeeld van een proces zonder warmteuitwisseling. Dit noemen we een <strong>adiabatisch</strong> proces. Bij een adiabatisch proces is er mogelijk wel interne warmteontwikkeling, bijvoorbeeld vanwege frictie. Mogelijk schuurt onze zuiger langs het vat en creëert hiermee intern warmte.</Par>
			</>,
			<>
				<Par>We nemen exact dezelfde situatie als hiervoor (het adiabatische proces) maar nu zorgen we ervoor dat er ook geen interne warmteontwikkeling is. Het is, om het eenvoudig te zeggen, een goed geolied proces. Zo'n proces zonder enige warmtestroom en warmteontwikkeling noemen we een <strong>isentroop</strong> proces. Deze naam komt van het feit dat de "entropie" gelijk blijft. (Vermoedelijk leer je pas een stuk later wat entropie exact inhoudt.) Merk op dat een isentroop proces ook adiabatisch is, maar een adiabatisch proces is niet altijd isentroop.</Par>
			</>,
		]} />
		<Par>In de praktijk is het zo dat een proces niet exact één van de bovenstaande procestypen is, maar wel bij één ervan in de buurt komt. Mogelijk heeft het isobare proces toch kleine drukfluctuaties, of is het isotherme proces net niet op constante temperatuur. We benaderen het proces dan alsnog met één van de bovenstaande soorten processen, zodat we ermee kunnen rekenen.</Par>

		<Head>Processen in een <M>p</M>-<M>V</M>-diagram</Head>
		<Par>Je kunt de hierboven beschreven processen intekenen in een <M>p</M>-<M>V</M>-diagram. In dit diagram is de druk de verticale as en het volume de horizontale as. Je ziet zo direct hoe deze waarden veranderen gedurende zo'n proces.</Par>
		<ProcessTypeDrawing />

		<Head>De procescoëfficiënt</Head>
		<Par>We hebben gezien dat er verschillende soorten processen zijn. Het zou een handig overzicht scheppen als we elk proces in één getal samen kunnen vaten, en gelukkig is dit mogelijk. Voor elk van de bovenstaande processen geldt namelijk, voor een bepaald getal <M>n,</M> dat <BM>pV^n = (\rm constant).</BM> Het getal <M>n</M> dat het proces beschrijft heet de <strong>procescoëfficiënt</strong>.</Par>
		<List items={[
			<>Voor een <strong>isobaar</strong> proces geldt <M>n = 0.</M> Immers, dan zegt het bovenstaande dat <M>p = (\rm constant).</M></>,
			<>Voor een <strong>isochoor</strong> proces geldt <M>n = \infty.</M> Om in te zien waarom dit zo is, kunnen we het bovenstaande tot de macht <M>1/n</M> doen. Het is dan te schrijven als <M>p^(1/n)V = (\rm constant).</M> Bij <M>n = \infty</M> staat hier inderdaad dat <M>V = (\rm constant).</M></>,
			<>Voor een <strong>isotherm</strong> proces geldt <M>n = 1.</M> Om in te zien waarom hebben we de gaswet nodig. Deze zegt dat <M>pV = mR_sT.</M> Als de temperatuur constant is, dan is de rechterkant van deze vergelijking constant. De linkerkant (met een macht <M>1</M> boven de <M>V</M>) is dat dan dus ook.</>,
			<>Voor een <strong>isentroop</strong> proces is uit metingen gebleken dat <M>n = k,</M> waar de waarde van <M>k</M> van het gas afhangt. Hier is <M>k</M> de <SkillLink skillId="specificHeatRatio">verhouding van soortelijke warmten</SkillLink>. Dit is een gaseigenschap die je op kan zoeken.</>,
		]} />
		<Par>Je kunt de <M>n</M>-waarde ook zien als een mate van de steilheid van het proces in een <M>p</M>-<M>V</M>-diagram. Hoe hoger de waarde van <M>n,</M> hoe steiler de lijn in het diagram.</Par>
		<Par>Let op: het is een veelgemaakte fout om <M>n</M> en <M>k</M> door elkaar te halen. <M>n</M> is de procescoëfficiënt: hij bepaalt <em>wat we doen</em> met het gas. <M>k</M> is een gaseigenschap: deze is afhankelijk van <em>welk gas</em> we gebruiken. Alleen bij een isentroop proces geldt dat <M>n</M> gelijk is aan <M>k.</M></Par>
		<Par>Naast de bovenstaande vier processen zijn er ook nog tal van andere processen met andere <M>n</M>-waarden. Bijvoorbeeld een proces met (willekeurig gekozen) <M>n = {new Float('1.2')}.</M> Dit proces heeft geen eigen naam, maar elk proces waarbij er een <M>n</M> bestaat zodat <M>pV^n = (\rm constant)</M> noemen we een <strong>polytroop</strong> proces. Een proces met <M>n = {new Float('1.2')}</M> is, gezien de <M>n</M>-waarde, een proces dat ergens tussen een isotherm en een isentroop proces invalt. Denk aan het indrukken van een fietspomp met een klein beetje isolatie: er is wel warmteuitwisseling, maar niet genoeg om de temperatuur constant te houden.</Par>
		<Par>Onthoud: een polytroop proces is een verzamelnaam. Isobare, isochore, isotherme en isentrope processen zijn allemaal vormen van polytrope processen, maar een polytroop proces is niet altijd isobaar of isochoor.</Par>

		<Head>Hoe het werkt</Head>
		<Par>Als je wilt weten wat voor soort proces optreedt, kijk dan goed naar wat er met het gas gebeurt.</Par>
		<List items={[
			<>
				Wordt er actief iets constant gehouden?
				<List items={[
					<>Wordt het gas op constante wijze ingedrukt, bijvoorbeeld via een zuiger? Dan is de druk constant: het proces is <strong>isobaar</strong>.</>,
					<>Vindt het proces in een vat met vaste afmetingen plaats? Dan is het volume constant: het proces is <strong>isochoor</strong>.</>,
					<>Kan het gas makkelijk warmte afstaan aan/opnemen van een stabiele omgeving? Dan is de temperatuur constant: het proces is <strong>isotherm</strong>.</>,
				]} />
			</>,
			<>Is het proces goed geïsoleerd, waardoor er geen warmte-uitwisseling is? In dit geval is het proces in ieder geval <strong>adiabatisch</strong>. Indien interne warmte-ontwikkeling (bijvoorbeeld door frictie) ook verwaarloosd kan worden, dan is het proces daarbovenop ook <strong>isentroop</strong>.</>,
			<>Is het proces matig geïsoleerd? In dat geval zit het ergens tussen isotherm (<M>n = 1</M>) en isentroop (<M>n = k</M>) in. Het is dan slechts een <strong>polytroop</strong> proces. We moeten via bijvoorbeeld metingen de <M>n</M>-waarde nog bepalen.</>,
		]} />
		<Par>Als je het procestype weet, dan weet je daarmee ook de procescoëfficiënt <M>n.</M> Deze is nodig om ermee te kunnen rekenen.</Par>
	</>
}
