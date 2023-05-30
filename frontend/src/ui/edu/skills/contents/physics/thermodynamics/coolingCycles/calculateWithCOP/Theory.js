import React from 'react'

import { Head, Par, List, M, BM, BMList, BMPart } from 'ui/components'
import { SkillLink } from 'ui/routing'

export default function Component() {
	return <>
		<Par>Als we willen weten hoe efficiënt een koelkast of warmtepomp werkt, dan gebruiken we de koudefactor en/of de warmtefactor. Hier zien we hoe dat werkt.</Par>

		<Head>Een verschillend doel: warmte opnemen of afstaan</Head>
		<Par>De <em>koudefactor</em> <M>\varepsilon</M> en de <em>warmtefactor</em> <M>\varepsilon_w</M> zijn, net als het <SkillLink skillId="calculateWithEfficiency">rendement</SkillLink>, zogenaamde "prestatiefactoren". Deze bereken je altijd met de formule <BM>\varepsilon = \frac(\rm nuttig)(\rm invoer).</BM> De grote vraag is echter: wat is nuttig en wat is invoer?</Par>
		<Par>Als eerste bekijken we een koelkast.
			<List items={[
				<>Het doel van de koelkast is warmte <em>onttrekken</em> uit een te koelen ruimte. De "nuttige" energiestroom is dus de opgenomen warmte <M>Q_(opg).</M></>,
				<>Onze koelkast krijgt energie uit elektriciteit. Deze elektriciteit wordt gebruikt in de compressor, om het koudemiddel te comprimeren. De compressorarbeid <M>W_(comp)</M> is hierbij dus de "invoer" voor het systeem.</>,
			]} />
			Hiermee komen we uit op de formule voor de koudefactor <BM>\varepsilon = \frac(Q_(opg))(W_(comp)).</BM></Par>
		<Par>Bij een warmtepomp werkt dit anders.
			<List items={[
				<>Het doel van de warmtepomp is warmte <em>leveren</em> aan een op te warmen ruimte. De "nuttige" energiestroom is dus de geleverde warmte <M>Q_(gelev).</M></>,
				<>Net als bij de koelkast geldt de compressorarbeid <M>W_(comp)</M> als "invoer".</>,
			]} />
			Zo vinden we de formule voor de warmtefactor <BM>\varepsilon_w = \frac(Q_(gelev))(W_(comp)).</BM> De warmtefactor wordt in de wandelgangen ook wel de <em>Coefficient Of Performance (COP)</em> genoemd. Dit betekent exact hetzelfde: de COP is de warmtefactor.</Par>

		<Head>Tips bij rekenen met koudefactoren/warmtefactoren</Head>
		<Par>Net als bij het <SkillLink skillId="calculateWithEfficiency">rendement</SkillLink>, kun je bij de koudefactor en de warmtefactor rekenen met welke eenheid je maar wilt, zolang de eenheden van "nuttig" en "invoer" gelijk zijn. Vaak werk je met warmtestromen en geleverde arbeid (in Joule) maar je kunt ook met vermogens (in Watt) werken. Er geldt dan</Par>
		<BMList>
			<BMPart>\varepsilon = \frac(P_(opg))(P_(comp)),</BMPart>
			<BMPart>\varepsilon_w = \frac(P_(gelev))(P_(comp)).</BMPart>
		</BMList>
		<Par>In tegenstelling tot het <SkillLink skillId="calculateWithEfficiency">rendement</SkillLink> geldt dat de koudefactor/warmtefactor wèl groter dan <M>1</M> kan worden. Een typische waarde voor de koudefactor is <M>2</M> a <M>4</M>, waar de warmtefactor vaak tussen de <M>3</M> en de <M>5</M> ligt. In theorie kan ook het dubbele of zelfs driedubbele behaald worden, maar omdat compressoren geen perfecte compressie kunnen leveren is dat in de praktijk niet mogelijk.</Par>
		<Par>Verder is het handig om in gedachten te houden dat behoud van energie geldt: de ingaande energie is gelijk aan de uitgaande energie volgens <BM>Q_(opg) + W_(comp) = Q_(gelev).</BM> Als gevolg van dit energiebehoud geldt een handig feitje: de warmtefactor is altijd precies één meer dan de koudefactor. Immers, de compressorarbeid krijg je er bij het leveren van energie "gratis" bij. Of wiskundiger kunnen we zeggen dat <BM>\varepsilon_w = \frac(Q_(gelev))(W_(comp)) = \frac(Q_(opg) + W_(comp))(W_(comp)) = \frac(Q_(opg))(W_(comp)) + 1 = \varepsilon + 1.</BM> Oftewel, als je de ene factor weet, dan weet je altijd direct ook de andere factor.</Par>

		<Head>Met koudefactoren/warmtefactoren rekenen: de stappen</Head>
		<Par>Het uitrekenen van de koudefactor/warmtefactor is erg soortgelijk aan het uitrekenen van het <SkillLink skillId="calculateWithEfficiency">rendement</SkillLink>.</Par>
		<List useNumbers={true} items={[
			<>Bepaal de invoer van het systeem: wat gaat erin? Vaak is dit de compressorarbeid of soortgelijk.</>,
			<>Bepaal de nuttige uitvoer van het systeem: wat is ons doel? Hierbij moet je goed kijken naar wat voor apparaat we precies hebben. Bij een koelkast is de opgenomen warmte <M>Q_(opg)</M> nuttig, maar bij de warmtepomp is dit juist de geleverde warmte <M>Q_(gelev).</M></>,
			<>Gebruik de formules <M>\varepsilon = \frac(Q_(opg))(W_(comp))</M> en/of <M>\varepsilon_w = \frac(Q_(gelev))(W_(comp)),</M> of identiek met vermogen, om de relevante factor(en) te berekenen.</>,
		]} />
		<Par>Indien de betreffende factor al bekend is en je juist een energiestroom of vermogen uit moet rekenen, dan moet je de formule vòòr het invullen nog herschrijven.</Par>
	</>
}
