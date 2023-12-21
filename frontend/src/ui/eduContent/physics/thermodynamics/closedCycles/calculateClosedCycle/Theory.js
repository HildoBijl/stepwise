import React from 'react'

import { Head, Par, List, M, Term, Info } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export default function Component() {
	return <>
		<Par>Een <Term>kringproces</Term> is een proces waarbij een medium zoals een gas meerdere (vaak 3-4) thermodynamische processen ondergaat, en ten slotte in de begintoestand terugkeert. Kringprocessen worden in de praktijk erg veel gebruikt. We kijken naar welke soorten processen er zijn en hoe we ze door kunnen rekenen.</Par>

		<Head>Soorten kringprocessen</Head>
		<Par>Er zijn oneindig veel verschillende soorten kringprocessen te bedenken, maar er zijn enkelen die in de praktijk veel gebruikt worden. Deze hebben daarom hun eigen naam. De belangrijkste zijn de volgende.</Par>
		<List items={[
			<>De <Term>Carnot-cyclus</Term>: isotherme compressie, isentrope compressie, isotherme expansie, isentrope expansie. Deze cyclus is (gegeven een bepaalde minimum en maximum temperatuur) de meest efficiënt mogelijke cyclus die bestaat. Daarom wordt hij in de praktijk erg veel toegepast. Je vindt hem (in aangepaste vorm) in elektriciteitscentrales, koelmachines, warmtepompen en talloze andere plekken.</>,
			<>De <Term>Brayton-cyclus</Term>: isentrope compressie, isobare verhitting, isentrope expansie, isobare koeling. Een voorbeeld hiervan is de gasturbine, zoals je deze vindt in vliegtuigmotoren en ook in bepaalde elektriciteitscentrales (vaak als onderdeel van een STEG-installatie).</>,
			<>De <Term>Otto-cyclus</Term>: isentrope compressie, isochore verhitting, isentrope expansie, isochore koeling. Een voorbeeld hiervan is de benzinemotor van auto's.</>,
			<>De <Term>Stirling-cyclus</Term>: isochore verhitting, isotherme compressie, isochore koeling, isotherme expansie. Deze cyclus wordt weinig gebruikt, maar omdat het een van de weinige cycli is zonder kleine explosie is hij erg stil, en wordt hij dus bijvoorbeeld nog in sommige onderzeeërs toegepast.</>,
			<>De <Term>Ericsson-cyclus</Term>: isotherme compressie, isobare verhitting, isotherme expansie, isobare koeling. Deze cyclus wordt zelden in de praktijk gebruikt.</>,
			<>De <Term>Diesel-cyclus</Term>: isentrope compressie, isobare verhitting, isentrope expansie, isochore koeling. Deze cyclus wordt gebruikt in Diesel-motoren.</>,
		]} />
		<Par>In de praktijk zijn de cycli niet exact de bovenstaande stappen. De ontbranding in een benzinemotor vindt bijvoorbeeld niet helemaal exact bij constant volume plaats: de zuiger beweegt in deze korte tijd een klein beetje. Maar door het te benaderen via deze vier losse stappen kunnen we de processen doorrekenen, wat uiteraard ons doel is.</Par>

		<Head>Kringprocessen doorrekenen: de stappen</Head>
		<Par>Met een "kringproces doorrekenen" bedoelen we het maken van een overzicht van de toestand van ons medium voor/na elk proces. In andere woorden: we maken een <Term>toestandstabel</Term>, ook wel bekend als het <Term><M>p</M>-<M>V</M>-<M>T</M>-tabel</Term>. Een <M>p</M>-<M>V</M>-<M>T</M>-tabel invullen is net als het oplossen van een sudoku: er zijn bepaalde regels om te volgen, en als je die maar toe blijft passen, dan is aan het einde je gehele tabel gevuld.</Par>
		<List useNumbers={true} items={[
			<>Zet aan het begin alle gaseigenschappen op een rij: zoek <M>R_s</M>, <M>k</M>, <M>c_v</M> en <M>c_p</M> van het betreffende gas op, en noteer ook de massa <M>m.</M> (Indien <M>m</M> niet gegeven is kun je deze vaak via de gaswet vinden.)</>,
			<>Zet een leeg <M>p</M>-<M>V</M>-<M>T</M>-tabel op, met een rij voor elk punt, en vul alle gegeven waarden in.</>,
			<>Maak ook een overzicht van alle processen: bijvoorbeeld 1-2, 2-3, 3-4 en 4-1. Noteer de naam van het proces en de bijbehorende procescoëfficiënt <M>n.</M></>,
			<>Herhaal de volgende stappen tot je gehele tabel ingevuld is.
				<List items={[
					<>Heb je ergens bij een toestandspunt (in een rij) twee van de drie eigenschappen? Vind via de <SkillLink skillId="gasLaw">gaswet</SkillLink> dan de derde waarde.</>,
					<>Kun je bij een proces (twee opeenvolgende rijen) een rechthoek maken, waarbij je drie van de vier waarden weet? Gebruik dan je kennis van het soort proces om de vierde waarde te vinden. Bij isobare/isochore/isotherme processen is dit makkelijk: de druk/het volume/de temperatuur blijft constant, en dus kun je de waarde direct overnemen. Bij andere processen pas je <SkillLink skillId="poissonsLaw">Poisson's wet</SkillLink> toe.</>,
				]} />
			</>,
		]} />
		<Par>Als je de bovenstaande regels blijft toepassen, dan heb je uiteindelijk je gehele <M>p</M>-<M>V</M>-<M>T</M>-tabel ingevuld, wat het doel was.</Par>
		<Info>Bij het invullen van de tabel zijn er enkele richtlijnen die handig zijn om te weten.
			<List items={[
				<>Je past altijd voor elk punt de gaswet toe. Bij een kringproces met 4 stappen doe je dit dus 4 keer en vind je 4 waarden via de gaswet. Dit is handig om te weten: als je ergens nog niet de gaswet toegepast hebt, dan weet je dat dit dus nog moet gebeuren!</>,
				<>Je past elke processtap (je kennis over wat voor soort proces het is) ook altijd één keer toe. Twee maal dezelfde processtap doorrekenen geeft nooit zinnige resultaten. Bij een kringproces met 4 stappen doe je dit ook weer 4 keer en vind je dus zo ook 4 waarden. Let op: ook het laatste proces (van eind terug naar begin) is een proces en moet toegepast worden! Vaak werk je zo ook van achteren naar voren terug.</>,
			]} />
		</Info>
	</>
}
