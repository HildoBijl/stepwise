import React from 'react'

import { Head, SubHead, Par, List, M, BM, BMList, BMPart, Term } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export default function Component() {
	return <>
		<Par>Er zijn twee veel-voorkomende dingen die we met een gas kunnen doen: er arbeid op uitoefen of warmte aan toevoeren. Hier bekijken we hoe we de hoeveelheid arbeid/warmte uit kunnen rekenen.</Par>


		<Head>De hoeveelheid arbeid <M>W</M> berekenen</Head>
		<Par>Stel je de lucht in de zuiger van een benzinemotor voor. Als deze lucht onder hoge druk staat, dan kan de lucht de zuiger wegduwen. Zo verricht de lucht <Term>arbeid</Term>: het duwt iets weg! Immers, arbeid is kracht maal afstand: <M>W = Fs.</M> Maar hoe kunnen we hiermee rekenen?</Par>

		<SubHead>Oppervlakte onder het <M>p</M>-<M>V</M>-diagram</SubHead>
		<Par>De verrichte arbeid is altijd gelijk aan de oppervlakte onder het <M>p</M>-<M>V</M>-diagram. Heb je je proces als lijn in een <M>p</M>-<M>V</M>-diagram getekend? Arceer dan de oppervlakte onder deze lijn. Hoe groter deze is, hoe meer arbeid het gas heeft verricht.</Par>
		<Par>Het is relatief makkelijk om, bij een isobaar proces (met constante druk), deze oppervlakte uit te rekenen. Hier geldt <BM>W = p \, \Delta V.</BM> Bij andere processen is dit echter lastiger. In dit geval moeten we een integraal gebruiken om de oppervlakte te berekenen. Zo vinden we formules, die we vervolgens direct kunnen toepassen.</Par>

		<SubHead>Formules</SubHead>
		<Par>De algemene formule voor arbeid, bij een <Term>polytroop proces</Term>, is <BM>W_(1-2) = -\frac(1)(n-1) \left(p_2V_2 - p_1V_1\right).</BM> Als je een proces weet, en daarmee ook de waarde van <M>n,</M> dan kun je deze formule direct toepassen.</Par>
		<Par>Er is één uitzondering bij het bovenstaande: als <M>n = 1</M> (dus bij een <Term>isotherm proces</Term>) werkt de formule niet. Het gaat mis bij de breuk: we mogen niet door nul delen. Voor isotherme processen is er dus een andere formule, en wel <BM>W_(1-2) = pV \ln\left(\frac(V_2)(V_1)\right).</BM></Par>
		<Par>Via de bovenstaande twee formules kunnen we altijd de arbeid van een proces berekenen. We bepalen eerst <M>n</M> en passen daarmee de betreffende formule toe.</Par>

		<SubHead>Formuleoverzicht</SubHead>
		<Par>We hebben dus twee formules om de arbeid te berekenen, maar beiden zijn ze relatief ingewikkeld. Voor specifieke situaties (bijvoorbeeld voor een bepaald soort proces) kunnen we deze formules wel makkelijker schrijven. En met behulp van de gaswet kunnen we de formule ook nog anders opschrijven. Zo krijgen we een verzameling van formules, elk voor bepaalde soorten processen.</Par>
		<List items={[
			<>Voor <Term>isobare processen</Term> geldt <BMList><BMPart>W_(1-2) = p\left(V_2 - V_1\right),</BMPart><BMPart>W_(1-2) = mR_s\left(T_2 - T_1\right).</BMPart></BMList></>,
			<>Voor <Term>isochore processen</Term> geldt altijd <M>W_(1-2) = 0.</M> Immers, het volume blijft constant, dus er wordt niets weggeduwd. Er wordt dus ook geen arbeid verricht.</>,
			<>Voor <Term>isotherme processen</Term> geldt <BMList><BMPart>W_(1-2) = pV \ln\left(\frac(V_2)(V_1)\right),</BMPart><BMPart>W_(1-2) = mR_sT \ln\left(\frac(V_2)(V_1)\right).</BMPart></BMList></>,
			<>Voor <Term>isentrope processen</Term> geldt <BMList><BMPart>W_(1-2) = -\frac(1)(k-1) \left(p_2V_2 - p_1V_1\right),</BMPart><BMPart>W_(1-2) = -\frac(mR_s)(k-1)\left(T_2 - T_1\right).</BMPart></BMList></>,
			<>Voor <Term>polytrope processen</Term>, met een algemene <M>n,</M> geldt <BMList><BMPart>W_(1-2) = -\frac(1)(n-1) \left(p_2V_2 - p_1V_1\right),</BMPart><BMPart>W_(1-2) = -\frac(mR_s)(n-1)\left(T_2 - T_1\right).</BMPart></BMList></>,
		]} />
		<Par>Bij elk van de processen hierboven staan twee formules. Beide formules zijn net zo geldig, maar afhankelijk van wat je weet is ofwel de eerste ofwel de tweede formule handiger om te gebruiken.</Par>

		<SubHead>Tekenconventie</SubHead>
		<Par>Bij het rekenen met arbeid is het belangrijk om de tekenconventie in gedachten te houden. We nemen (als afspraak) altijd aan dat het gas arbeid verricht op de omgeving. Dit betekent dat het gas expandeert (toeneemt in volume) en dat de pijl in het <M>p</M>-<M>V</M>-diagram dus van links naar rechts gaat. Dit is <Term>positieve arbeid</Term>. Denk aan de lucht in de benzinemotor die de zuiger wegduwt.</Par>
		<Par>In de omgekeerde situatie oefenen wij vanuit de omgeving juist arbeid uit op het gas. Denk aan het indrukken van een fietspomp. In dit geval wordt het gas gecomprimeerd (afname in volume) en gaat de pijl in het <M>p</M>-<M>V</M>-diagram juist van rechts naar links. Dit is <Term>negatieve arbeid</Term>.</Par>
		<Par>Alle bovenstaande formules hebben deze afspraak geïmplementeerd. Als je een arbeid berekent, dan geeft de betreffende formule je automatisch het juiste teken, uiteraard mits goed toegepast.</Par>


		<Head>De hoeveelheid warmte <M>Q</M> berekenen</Head>
		<Par>Na arbeid bekijken we warmte. Stel je de lucht in de zuiger van een benzinemotor voor, zowel vlak voordat het brandstof ontbrand is als vlak nadat het brandstof ontbrand is. Het verschil tussen deze twee situaties is: er is <Term>warmte</Term> toegevoerd, via het ontbranden van brandstof. Maar hoeveel?</Par>

		<SubHead>De soortelijke warmte</SubHead>
		<Par>De <Term>soortelijke warmte</Term> <M>c</M> is, per definitie, de hoeveelheid energie (in Joule) die nodig is om één kilogram van een stof één graad Celsius (of één Kelvin) op te warmen. Voor vaste en vloeibare stoffen is deze waarde ongeveer constant, waardoor <BM>Q = mc \, \Delta T.</BM> Voor gassen is dit echter niet zo: de waarde van <M>c</M> hangt óók af van het soort proces! Laten we dit voor de ons bekende processen (isobaar, isochoor, isotherm, isentroop en (algemeen) polytroop) nader bekijken.</Par>
		<List items={[
			<>Bij een <Term>isobaar proces</Term> is de soortelijke warmte (per definitie) gelijk aan de <Term>soortelijke warmte bij constante druk</Term> <M>c_p.</M> Dit is een gaseigenschap die je op kan zoeken. Er geldt dus <M>c = c_p.</M></>,
			<>Bij een <Term>isochoor proces</Term> is de soortelijke warmte (per definitie) gelijk aan de <Term>soortelijke warmte bij constant volume</Term> <M>c_v.</M> Dit is een gaseigenschap die je op kan zoeken. Er geldt dus <M>c = c_v.</M></>,
			<>Bij een <Term>isotherm proces</Term> neemt de temperatuur nooit toe. Er kan wel warmteuitwisseling zijn, maar dan op zo'n manier dat de temperatuur niet verandert. In dit geval geldt <M>c = \infty.</M></>,
			<>Bij een <Term>isentroop proces</Term> is er nooit warmteuitwisseling. De temperatuur kan wel veranderen. In dit geval geldt <M>c = 0.</M></>,
			<>Bij een <Term>polytroop proces</Term> met procescoëfficiënt <M>n</M> kun je de soortelijke warmte <M>c</M> berekenen. Dit gaat via de formule <BM>c = c_v - \frac(R_s)(n-1).</BM></>,
		]} />
		<Par>Met het bovenstaande overzicht kunnen we dus altijd de soortelijke warmte <M>c</M> horende bij ons proces bepalen. Als we die weten, dan vinden we via <M>Q = mc \, \Delta T</M> ook de toegevoerde warmte.</Par>
		<Par>Er is één uitzondering op het bovenstaande. Bij isotherme processen gaat het mis: we vermenigvuldigen dan nul met oneindig, wat niet gedefinieerd is. In dit geval is er een andere formule, en wel <BM>Q_(1-2) = W_(1-2) = pV \ln\left(\frac(V_2)(V_1)\right).</BM> Merk op dat dit dezelfde formule is als voor de arbeid <M>W_(1-2).</M> Dit is bij isotherme processen altijd zo: de toegevoerde warmte is (vanwege energiebehoud) gelijk aan de geleverde arbeid.</Par>

		<SubHead>Formuleoverzicht</SubHead>
		<Par>Net als bij de arbeid, kunnen we voor de warmte ook de formules toespitsen op het soort proces. In dat geval krijgen we de volgende formules.</Par>
		<List items={[
			<>Voor <Term>isobare processen</Term> geldt <BMList><BMPart>Q_(1-2) = \frac(k)(k-1) p\left(V_2 - V_1\right),</BMPart><BMPart>Q_(1-2) = mc_p \left(T_2 - T_1\right).</BMPart></BMList></>,
			<>Voor <Term>isochore processen</Term> geldt <BMList><BMPart>Q_(1-2) = \frac(1)(k-1) V\left(p_2 - p_1\right),</BMPart><BMPart>Q_(1-2) = mc_v \left(T_2 - T_1\right).</BMPart></BMList></>,
			<>Voor <Term>isotherme processen</Term> geldt <BMList><BMPart>Q_(1-2) = pV \ln\left(\frac(V_2)(V_1)\right),</BMPart><BMPart>Q_(1-2) = mR_sT \ln\left(\frac(V_2)(V_1)\right).</BMPart></BMList></>,
			<>Voor <Term>isentrope processen</Term> geldt altijd <M>Q_(1-2) = 0.</M> Immers, een isentroop proces is per definitie een proces zonder warmteuitwisseling.</>,
			<>Voor <Term>polytrope processen</Term>, met een algemene <M>n,</M> bereken je eerste <M>c = c_v - \frac(R_s)(n-1).</M> Vervolgens geldt <BMList><BMPart>Q_(1-2) = \frac(c)(R_s) \left(p_2V_2 - p_1V_1\right),</BMPart><BMPart>Q_(1-2) = mc \left(T_2 - T_1\right).</BMPart></BMList></>,
		]} />
		<Par>Wederom geldt dat welke van de twee genoemde formules handiger is om te gebruiken afhankelijk is van wat je precies weet. Vaak zijn ze beiden net zo bruikbaar en geven ze dezelfde waarde.</Par>

		<SubHead>Tekenconventie</SubHead>
		<Par>Net als bij arbeid hebben we ook bij warmte een tekenconventie. We nemen altijd aan dat wij zelf van buitenaf warmte toevoeren aan een gas. Als dit het geval is, dan rekenen we de toegevoerde warmte <M>Q</M> als <Term>positieve warmtestroom</Term>. Is het andersom, en is het zo dat het gas warmte afstaat aan de omgeving? Dan rekenen we de toegevoerde warmte <M>Q</M> juist als <Term>negatieve warmtestroom</Term>. Alle formules zijn op deze afspraak ingesteld, dus als je de formules toepast, dan gaat dit (mits correct uitgevoerd) vanzelf goed.</Par>


		<Head>De stappen</Head>
		<Par>Om een hoeveelheid arbeid en/of warmte te berekenen volg je de volgende stappen.</Par>
		<List useNumbers={true} items={[
			<>Bepaal het <SkillLink skillId="recognizeProcessTypes">soort proces</SkillLink>.</>,
			<>Zoek de bijbehorende formule op in het formuleoverzicht en bepaal welke het handigst is om te gebruiken.</>,
			<>Zoek de bijbehorende constanten (de <SkillLink skillId="specificGasConstant">specifieke gasconstante</SkillLink>, de <SkillLink skillId="specificHeatRatio"><M>k</M>-waarde</SkillLink> en/of de <SkillLink skillId="specificHeats">soortelijke warmten</SkillLink>) van het betreffende gas op.</>,
			<>Pas de opgezochte formules toe, gebruik makend van standaard eenheden.</>,
		]} />
	</>
}
