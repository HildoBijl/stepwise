import React from 'react'

import { Head, Par, List, M, BM, BMList, BMPart, Term, Emp, Warning } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export default function Component() {
	return <>
		<Par>Als we een kringproces hebben, dan willen we weten hoe efficiënt deze werkt. We willen iets van een prestatiefactor berekenen. Hier kijken we hoe dat werkt.</Par>

		<Head>Het voorwerk: de toestandstabel en de procestabel</Head>
		<Par>Het eerste wat we doen is het hele kringproces doorrekenen.</Par>
		<List items={[
			<>We vullen de <Term>toestandstabel</Term> (de <M>p</M>-<M>V</M>-<M>T</M>-tabel) in, zodat we bij elk punt de toestand van het gas weten.</>,
			<>Via deze tabel vullen we ook de <Term>procestabel</Term> (<M>W</M>-<M>Q</M>-tabel) in, zodat we bij elk proces weten hoeveel warmte er is toegevoerd (of afgevoerd) en hoeveel arbeid er is geleverd.</>,
		]} />
		<Par>Het bovenstaande is erg veel werk, maar als we dat eenmaal hebben is de rest een stuk minder werk.</Par>

		<Head>De netto arbeid en het soort kringproces</Head>
		<Par>Uit de <M>W</M>-<M>Q</M>-tabel kunnen we de <Term>netto arbeid</Term> van het kringproces berekenen. We tellen simpelweg alle arbeiden van alle processen op via <BM>W_(netto) = W_(1-2) + W_(2-3) + \ldots.</BM> Het teken (plus of min) van deze netto arbeid is belangrijk.</Par>
		<List items={[
			<>Als de netto arbeid positief is (<M>W_(netto) &gt; 0</M>) dan hebben we een <Term>positief kringproces</Term> dat netto arbeid oplevert. Het is een generator, elektriciteitscentrale of soortgelijk proces dat warmte gebruikt om arbeid te leveren. Als we willen weten hoe efficiënt dit apparaat werkt, dan berekenen we het <SkillLink skillId="calculateWithEfficiency">rendement</SkillLink>.</>,
			<>Als de netto arbeid negatief is (<M>W_(netto) &lt; 0</M>) dan hebben we een <Term>negatief kringproces</Term> dat netto arbeid kost. Het is een koelkast, warmtepomp of soortgelijk proces dat arbeid gebruikt om een warmtestroom te veroorzaken. Als we willen weten hoe efficiënt dit apparaat werkt, dan berekenen we de <SkillLink skillId="calculateWithCOP">koudefactor en/of warmtefactor</SkillLink>.</>,
		]} />
		<Warning>Bij een positief kringproces heeft een koudefactor/warmtefactor geen enkele betekenis. Reken deze dus ook niet uit: het getuigt van onbegrip. Identiek geldt dat bij een negatief kringproces het rendement betekenisloos is: alleen de koudefactor en/of warmtefactor zijn hier van betekenis.</Warning>

		<Head>Toegevoerde warmte en afgevoerde warmte</Head>
		<Par>Om de betreffende factor(en) te berekenen moeten we weten hoeveel warmte er in totaal aan ons proces toegevoerd en afgevoerd wordt.</Par>
		<List items={[
			<>Om de <Term>totaal toegevoerde warmte</Term> <M>Q_(toe)</M> te berekenen, kijken we eerst naar welke processen de warmtestroom <M>Q</M> <Emp>positief</Emp> is. Bij deze processen wordt warmte toegevoerd. We tellen al deze <Emp>positieve</Emp> waarden op.</>,
			<>Om de <Term>totaal afgevoerde warmte</Term> <M>Q_(af)</M> te berekenen, kijken we juist naar welke processen een negatieve warmtestroom <M>Q</M> hebben. Bij deze processen wordt immers warmte afgestaan. We tellen al deze <Emp>negatieve</Emp> waarden op.</>
		]} />
		<Par>We hebben inmiddels drie energiestromen uitgerekend: <M>W_(netto),</M> <M>Q_(toe)</M> en <M>Q_(af).</M> Als we met deze energiestromen gaan rekenen, dan rekenen we vanaf dit punt altijd met <Emp>positieve</Emp> getallen. We weten vanuit het soort kringproces (positief of negatief) immers al wat het tekenen van <M>W_(netto)</M> is. Verder geeft de naam van <M>Q_(af)</M> al aan dat het afgevoerde warmte is. Mintekens zijn vanaf dit punt dus niet meer nodig.</Par>
		<Par>Met de drie waarden kunnen we de betreffende factoren uitrekenen.</Par>
		<List items={[
			<>Bij een <Term>positief kringproces</Term> is het rendement gelijk aan <BM>\eta = \frac(\rm nuttig)(\rm invoer) = \frac(W_(netto))(Q_(toe)).</BM> Immers, het doel is arbeid opwerken, en hiervoor voeren we warmte (vaak in de vorm van brandstof) toe. Verder geldt bij positieve kringprocessen vanwege behoud van energie ook dat <BM>Q_(toe) = W_(netto) + Q_(af).</BM> Hiermee kunnen we eventueel de formule voor rendement nog herschrijven, indien gewenst.</>,
			<>Bij een <Term>negatief kringproces</Term> zijn de koudefactor en de warmtefactor gelijk aan
				<BMList>
					<BMPart>\varepsilon = \frac(\rm nuttig)(\rm invoer) = \frac(Q_(toe))(W_(netto)),</BMPart>
					<BMPart>\varepsilon_w = \frac(\rm nuttig)(\rm invoer) = \frac(Q_(af))(W_(netto)).</BMPart>
				</BMList>
				Immers, het doel is ofwel warmte opnemen uit een koelruimte (en toevoeren aan ons koudemiddel) ofwel warmte afleveren aan een op te warmen ruimte. Om dit voor elkaar te krijgen, stoppen we arbeid in het systeem. Verder geldt bij negatieve kringprocessen vanwege behoud van energie ook dat <BM>Q_(toe) + W_(netto) = Q_(af).</BM> Hiermee kunnen we eventueel de bovenstaande formules ook weer herschrijven, indien gewenst.</>
		]} />
		<Par>Zo kun je voor elk kringproces de betreffende factor(en) uitrekenen.</Par>

		<Head>Hoogst mogelijke factoren</Head>
		<Par>Mogelijk weet je nog dat het <Term>Carnot-proces</Term> het meest efficiënte proces is, gegeven een bepaalde minimum en maximum temperatuur. Voor het Carnot-proces is er een handige short-cut om het rendement te berekenen. Maar let op: deze geldt alleen voor het Carnot-proces! Voor een positief Carnot-proces geldt dat het rendement gevonden kan worden via
			<BM>\eta_C = 1 - \frac(T_(min))(T_(max)).</BM>
			Hier is <M>T_(min)</M> de laagste temperatuur in de cyclus en <M>T_(max)</M> de hoogste temperatuur.</Par>
		<Par>Voor een negatief Carnot-proces werkt alles identiek. Hier zijn de koudefactor en de warmtefactor te vinden via
			<BMList>
				<BMPart>\varepsilon_C = \frac(T_(min))(T_(max) - T_(min)),</BMPart>
				<BMPart>\varepsilon_(wC) = \frac(T_(max))(T_(max) - T_(min)).</BMPart>
			</BMList>
		</Par>
		<Par>Soms wordt gevraagd naar het "hoogst haalbare rendement" of de "hoogst haalbare koudefactor/warmtefactor". In dit geval is het handig om te weten dat het Carnot-proces het meest efficiënte proces mogelijk is. In dat geval bereken je via de bovenstaande formules dus het rendement voor het Carnot-proces, en dat is de beste prestatiefactor die we kunnen behalen.</Par>

		<Head>Kringprocessen analyseren: de stappen</Head>
		<Par>Met een "kringproces analyseren" bedoelen we het berekenen van de betreffende prestatiefactor(en). Dit gaat via de volgende stappen.</Par>
		<List useNumbers={true} items={[
			<>Vul het toestandstabel (de <M>p</M>-<M>V</M>-<M>T</M>-tabel) in.</>,
			<>Vul het procestabel (de <M>W</M>-<M>Q</M>-tabel) in.</>,
			<>Bereken <M>W_(netto)</M> door alle arbeiden op te tellen, <M>Q_(toe)</M> door alle positieve warmtestromen op te tellen, en <M>Q_(af)</M> door alle negatieve warmtestromen op te tellen. Maak deze drie waarden positief.</>,
			<>Bij een positief kringproces (<M>W_(netto) &gt; 0</M>): bereken het rendement via <M>\eta = \frac(W_(netto))(Q_(toe)).</M><br />Bij een negatief kringproces (<M>W_(netto) &lt; 0</M>): bereken de koudefactor <M>\varepsilon = \frac(Q_(toe))(W_(netto))</M> en/of de warmtefactor <M>\varepsilon_w = \frac(Q_(af))(W_(netto)).</M></>,
		]} />
		<Par>Zo vind je de prestatiefactor die je vertelt hoe efficiënt je kringproces werkt.</Par>
	</>
}
