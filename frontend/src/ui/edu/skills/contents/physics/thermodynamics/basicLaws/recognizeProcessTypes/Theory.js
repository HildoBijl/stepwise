import React from 'react'

import { Float } from 'step-wise/inputTypes/Float'

import { SkillLink } from 'ui/routing'
import { Head, Par, List, M, BM, Term, Emp, Warning } from 'ui/components'

import ProcessTypeDrawing from './ProcessTypeDrawing'

export default function Component() {
	return <>
		<Par>Je kunt gassen op verschillende wijzen verwarmen/koelen, expanderen/comprimeren, enzovoort. Om hierover te kunnen praten, moet je weten wat de namen van de verschillende procestypen zijn en deze soorten processen kunnen herkennen.</Par>

		<Head>Soorten processen</Head>
		<Par>We bekijken vijf verschillende soorten processen: isobaar, isochoor, isotherm, adiabatisch en isentroop, allen met een voorbeeldsituatie.</Par>
		<List useNumbers={true} items={[
			<>
				<Par>Bij een <Term>isobaar</Term> proces blijft de druk constant. Deze naam komt van de Griekse woorden "isos" (gelijk) en "baros" (gewicht).</Par>
				<Par>Een voorbeeld van een isobaar proces is een drukvat met een zuiger, waarbij de kracht op de zuiger constant wordt gehouden. (Denk aan een fietspomp met een baksteen op het handvat.) De constante kracht zorgt ook voor een constante druk. Als we het gas verwarmen, dan nemen de temperatuur en het volume toe. De zuiger gaat omhoog.</Par>
			</>,
			<>
				<Par>Bij een <Term>isochoor</Term> proces blijft het volume constant. Deze naam komt van de Griekse woorden "isos" (gelijk) en "khora" (ruimte).</Par>
				<Par>Een voorbeeld van een isobaar proces is een afgesloten drukvat. Omdat het vat vaste afmetingen heeft, is het volume van het gas ook constant. Als we het gas verwarmen, dan nemen de temperatuur en de druk toe.</Par>
			</>,
			<>
				<Par>Bij een <Term>isotherm</Term> proces blijft de temperatuur constant. Deze naam komt van de Griekse woorden "isos" (gelijk) en "therme" (warmte).</Par>
				<Par>Een voorbeeld van een isotherm proces is een drukvat met zuiger waarbij de temperatuur constant gehouden wordt. Dit kan bijvoorbeeld door het proces zo slecht mogelijk te isoleren, en/of door het zo langzaam mogelijk te laten verlopen, zodat er voldoende warmteuitwisseling is. (Denk aan een fietspomp in een bak water waarvan de hendel langzaam ingedrukt wordt.) Als de zuiger ingedrukt wordt, neemt de druk toe en het volume af.</Par>
			</>,
			<>
				<Par>Bij een <Term>adiabatisch</Term> proces is er geen warmteuitwisseling met de omgeving. Deze naam komt van het Griekse woord "diabaínein" (doorlaatbaar) en het voorvoegsel "a" (niet) om aan te geven dat de grens geen warmte doorlaat.</Par>
				<Par>Een voorbeeld van een adiabatisch proces is een drukvat met zuiger waarbij het proces zo goed geïsoleerd en/of zo snel uitgevoerd is dat er geen warmteuitwisseling is. (Denk aan een fietspomp waarvan de hendel erg snel ingedrukt wordt.) Als de zuiger ingedrukt wordt, dan neemt de druk toe, neemt het volume af, en neemt de temperatuur toe.</Par>
				<Par>Merk op: bij een adiabatisch proces is er mogelijk wel interne warmteontwikkeling, bijvoorbeeld vanwege frictie. Mogelijk schuurt onze zuiger langs het vat en creëert hiermee intern warmte. Dit is echter geen warmtestroom van/naar de omgeving.</Par>
			</>,
			<>
				<Par>Een <Term>isentroop</Term> proces is een adiabatisch proces (geen warmteuitwisseling) waarbij er <Emp>ook</Emp> geen interne warmteontwikkeling is. Deze naam komt van het feit dat de "entropie" gelijk blijft. (Vermoedelijk leer je pas een stuk later wat entropie exact inhoudt.)</Par>
				<Par>Een voorbeeld van een isentroop proces is een goed geïsoleerd drukvat met zuiger zonder frictie. (Denk aan een goed geoliede fietspomp.) Als we de zuiger indrukken, dan neemt de druk toe, neemt het volume af, en neemt de temperatuur toe.</Par>
				<Par>Merk op dat een isentroop proces ook adiabatisch is, maar een adiabatisch proces is niet altijd isentroop. Vanwege de onbekende frictie is het moeilijk om met adiabatische processen te rekenen, en dus rekenen we veel meer met isentrope processen.</Par>
			</>,
		]} />
		<Par>In de praktijk is het zo dat een proces niet exact één van de bovenstaande procestypen is, maar wel bij één ervan in de buurt komt. Mogelijk heeft het isobare proces toch kleine drukfluctuaties, of is het isotherme proces net niet op constante temperatuur. We benaderen het proces dan alsnog met één van de bovenstaande soorten processen, zodat we ermee kunnen rekenen.</Par>

		<Head>Processen in een <M>p</M>-<M>V</M>-diagram</Head>
		<Par>Je kunt de hierboven beschreven processen intekenen in een <M>p</M>-<M>V</M>-diagram. In dit diagram is de druk de verticale as en het volume de horizontale as. Je ziet zo direct hoe deze waarden veranderen gedurende zo'n proces.</Par>
		<ProcessTypeDrawing />

		<Head>De procescoëfficiënt</Head>
		<Par>We hebben gezien dat er verschillende soorten processen zijn. Het zou een handig overzicht scheppen als we elk proces in één getal samen kunnen vaten, en gelukkig is dit mogelijk. Voor elk van de bovenstaande processen geldt namelijk, voor een bepaald getal <M>n,</M> dat <BM>pV^n = (\rm constant).</BM> Het getal <M>n</M> dat het proces beschrijft heet de <Term>procescoëfficiënt</Term>.</Par>
		<List items={[
			<>Voor een <Term>isobaar</Term> proces geldt <M>n = 0.</M> Immers, dan zegt het bovenstaande dat <M>p = (\rm constant).</M></>,
			<>Voor een <Term>isochoor</Term> proces geldt <M>n = \infty.</M> Om in te zien waarom dit zo is, kunnen we het bovenstaande tot de macht <M>1/n</M> doen. Het is dan te schrijven als <M>p^(1/n)V = (\rm constant).</M> Bij <M>n = \infty</M> staat hier inderdaad dat <M>V = (\rm constant).</M></>,
			<>Voor een <Term>isotherm</Term> proces geldt <M>n = 1.</M> Om in te zien waarom hebben we de gaswet nodig. Deze zegt dat <M>pV = mR_sT.</M> Als de temperatuur constant is, dan is de rechterkant van deze vergelijking constant. De linkerkant (met een macht <M>1</M> boven de <M>V</M>) is dat dan dus ook.</>,
			<>Voor een <Term>isentroop</Term> proces is uit metingen gebleken dat <M>n = k,</M> waar de waarde van <M>k</M> van het gas afhangt. Hier is <M>k</M> de <SkillLink skillId="specificHeatRatio">verhouding van soortelijke warmten</SkillLink>. Dit is een gaseigenschap die je op kan zoeken.</>,
		]} />
		<Par>Je kunt de <M>n</M>-waarde ook zien als een mate van de steilheid van het proces in een <M>p</M>-<M>V</M>-diagram. Hoe hoger de waarde van <M>n,</M> hoe steiler de lijn in het diagram.</Par>
		<Warning>Let op: het is een veelgemaakte fout om <M>n</M> en <M>k</M> door elkaar te halen. <M>n</M> is de <Emp>procescoëfficiënt</Emp>: hij bepaalt <Emp>wat we doen</Emp> met het gas. <M>k</M> is een <Emp>gaseigenschap</Emp>: deze is afhankelijk van <Emp>welk gas</Emp> we gebruiken. Alleen bij een isentroop proces geldt dat <M>n</M> gelijk is aan <M>k.</M></Warning>
		<Par>Naast de bovenstaande vier processen zijn er ook nog tal van andere processen met andere <M>n</M>-waarden. Bijvoorbeeld een proces met (willekeurig gekozen) <M>n = {new Float('1.2')}.</M> Dit proces heeft geen eigen naam, maar elk proces waarbij er een <M>n</M> bestaat zodat <M>pV^n = (\rm constant)</M> noemen we een <Term>polytroop</Term> proces. Een proces met <M>n = {new Float('1.2')}</M> is, gezien de <M>n</M>-waarde, een proces dat ergens tussen een isotherm en een isentroop proces invalt. Denk aan het indrukken van een fietspomp met een klein beetje isolatie: er is wel warmteuitwisseling, maar niet genoeg om de temperatuur constant te houden.</Par>
		<Par>Onthoud: een polytroop proces is een verzamelnaam. Isobare, isochore, isotherme en isentrope processen zijn allemaal vormen van polytrope processen, maar een polytroop proces is niet altijd isobaar of isochoor.</Par>

		<Head>Hoe het werkt</Head>
		<Par>Als je wilt weten wat voor soort proces optreedt, kijk dan goed naar wat er met het gas gebeurt.</Par>
		<List items={[
			<>
				Wordt er actief iets constant gehouden?
				<List items={[
					<>Wordt het gas op constante wijze ingedrukt, bijvoorbeeld via een zuiger? Dan is de druk constant: het proces is <Term>isobaar</Term>.</>,
					<>Vindt het proces in een vat met vaste afmetingen plaats? Dan is het volume constant: het proces is <Term>isochoor</Term>.</>,
					<>Kan het gas makkelijk warmte afstaan aan/opnemen van een stabiele omgeving? Dan is de temperatuur constant: het proces is <Term>isotherm</Term>.</>,
				]} />
			</>,
			<>Is het proces goed geïsoleerd, waardoor er geen warmte-uitwisseling is? In dit geval is het proces in ieder geval <Term>adiabatisch</Term>. Indien interne warmte-ontwikkeling (bijvoorbeeld door frictie) ook verwaarloosd kan worden, dan is het proces daarbovenop ook <Term>isentroop</Term>.</>,
			<>Is het proces matig geïsoleerd? In dat geval zit het ergens tussen isotherm (<M>n = 1</M>) en isentroop (<M>n = k</M>) in. Het is dan slechts een <Term>polytroop</Term> proces. We moeten via bijvoorbeeld metingen de <M>n</M>-waarde nog bepalen.</>,
		]} />
		<Par>Als je het procestype weet, dan weet je daarmee ook de procescoëfficiënt <M>n.</M> Deze is nodig om ermee te kunnen rekenen.</Par>
	</>
}
