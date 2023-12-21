import React from 'react'

import { Head, Par, List, M, Term } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export default function Component() {
	return <>
		<Par>Naast de toestandstabel (de <M>p</M>-<M>V</M>-<M>T</M>-tabel) is er nog een ander belangrijk tabel om te maken: de <Term>procestabel</Term>, ook wel bekend als de <Term><M>W</M>-<M>Q</M>-tabel</Term>. Deze tabel geeft ons een overzicht van de arbeid en warmte die bij elk <Term>proces</Term> geleverd/toegevoerd wordt.</Par>

		<Head>De kolommen van de procestabel</Head>
		<Par>Het procestabel heeft verschillende kolommen.</Par>
		<List items={[
			<>Het <Term>procesnummer</Term>: dit zijn 1-2, 2-3, 3-4 of 4-1 bij een kringproces met 4 stappen.</>,
			<>Het <Term>procestype</Term>: bijvoorbeeld "isobaar", "isochoor", etcetera.</>,
			<>De <Term>procescoëfficiënt</Term> <M>n</M> van elk proces.</>,
			<>De <Term>arbeid</Term> <M>W</M> die het medium gedurende het proces geleverd heeft.</>,
			<>De <Term>warmte</Term> <M>Q</M> die gedurende het proces aan het medium toegevoerd is.</>,
		]} />
		<Par>De eerste drie kolommen kun je altijd al direct invullen, bij het lezen van de opgave. De laatste twee kolommen (<M>W</M> en <M>Q</M>) bereken je pas na het invullen van je <M>p</M>-<M>V</M>-<M>T</M>-tabel. Je hebt de toestandswaarden immers nodig om de warmte en arbeid te berekenen.</Par>

		<Head>Het procestabel invullen: de stappen</Head>
		<Par>Het procestabel invullen is niet ingewikkeld, maar wel veel werk. Als voorbereiding zet je in elke rij het soort proces en de procescoëfficiënt <M>n.</M> Na het <SkillLink skillId="calculateClosedCycle">invullen van je toestandstabel</SkillLink> voer je, voor elke rij, de volgende stappen uit.</Par>
		<List useNumbers={true} items={[
			<>Zoek voor het soort proces (wat je al genoteerd hebt in je procestabel) de formules voor <M>W</M> en <M>Q</M> op, in de betreffende formulekaart. Indien er meerde formules gegeven zijn: kies je favoriete. Omdat we alle drie de toestandswaarden weten (<M>p,</M> <M>V</M> en <M>T</M>) zijn alle formules toepasbaar.</>,
			<>Bereken via de formules de geleverde arbeid <M>W</M> en de toegevoerde warmte <M>Q.</M> Pas overal standaard eenheden toe. Je berekende waarden zijn dan ook in standaard eenheden: Joule.</>,
			<>Belangrijk: controleer het teken van je berekende waarden. Gebruik je kennis van het soort proces om te beredeneren of <M>W</M> en <M>Q</M> positief of negatief moeten zijn. Komt dit overeen met wat je berekend hebt? Zo niet, dan heb je mogelijk de twee punten in de formule omgedraaid.</>,
		]} />
		<Par>Aan het einde is de gehele tabel zo ingevuld, hopelijk zonder fouten. Maar ook hier kunnen we nog een controle uitvoeren: geldt energiebehoud? Om dit te zien berekenen we het volgende.</Par>
		<List items={[
			<>De totaal (netto) geleverde arbeid <M>W_(netto) = W_(1-2) + W_(2-3) + \ldots.</M></>,
			<>De totaal (netto) toegevoerde warmte <M>Q_(netto) = Q_(1-2) + Q_(2-3) + \ldots.</M></>,
		]} />
		<Par>Vanwege energiebehoud moeten, na afloop van het kringproces, deze twee waarden gelijk zijn aan elkaar: de netto geleverde arbeid is gelijk aan de netto toegevoerde warmte. Kleine afrondonnauwkeurigheden kunnen voorkomen, maar indien de twee waarden ver van elkaar af liggen, dan hebben we ergens in ons tabel een fout gemaakt. Dan is het dus de moeite waard om alle berekeningen nog eens goed langs te gaan. Zo verkrijgen we uiteindelijk een foutloos <M>W</M>-<M>Q</M>-tabel.</Par>
	</>
}
