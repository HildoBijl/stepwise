import React from 'react'

import { SkillLink } from 'ui/routing'
import { Head, Par, List } from 'ui/components/containers'
import { M, BM, BMList, BMPart } from 'ui/components/equations'

export default function Component() {
	return <>
		<Par>Als we iets met een gas doen, dan veranderen de drie toestandseigenschappen druk, volume en temperatuur. Hoe dit gebeurt wordt beschreven door Poisson's wet.</Par>

		<Head>Poisson's wetten</Head>
		<Par>We hebben bij het <SkillLink skillId="recognizeProcessTypes">herkennen van processen</SkillLink> geleerd dat elk proces een procescoëfficiënt <M>n</M> heeft. Dit is het getal zodat <BM>pV^n = (\rm constant).</BM> De bovenstaande vergelijking heet de <strong>wet van Poisson</strong>, vernoemd naar de Franse wiskundige/natuurkundige Siméon Denis Poisson (1781-1840).</Par>
		<Par>Met behulp van de gaswet kunnen we Poisson's wet ook herschrijven in twee andere vormen. Zo vinden we <BMList><BMPart>TV^(n-1) = (\rm constant),</BMPart><BMPart>\frac(T^n)(p^(n-1)) = (\rm constant).</BMPart></BMList> Vaak hangt het af van de situatie - wat we al weten en wat we nog willen weten - welke van de drie vormen van Poisson's wetten het handigst is om te gebruiken.</Par>
		<Par>Extra: bij de gaswet moet je altijd standaard eenheden gebruiken. Bij Poisson's wet is dit niet altijd zo. Omdat je hier werkt met verhoudingen (bijvoorbeeld de drukverhouding <M>p_1/p_2</M>) is het in orde om de druk in bar te laten staan, of het volume in liters. Zolang je de twee waarden in de <em>zelfde</em> eenheid hebt staan, gaat het goed. De uitzondering is temperatuur: die moet <em>altijd</em> in Kelvin, en niet in graden Celsius.</Par>

		<Head>De stappen</Head>
		<Par>Bij het toepassen van Poisson's wet pas je de volgende stappen toe.</Par>
		<List useNumbers={true} items={[
			<Par>Kies het begin (punt 1) en het eindpunt (punt 2) van het proces. Zet alle gegeven waarden in eenheden waarmee je mag rekenen.</Par>,
			<Par>Bepaal het soort proces, en hiermee ook de procescoëfficiënt <M>n.</M> Indien het een isentropisch proces is, waarbij <M>n = k,</M> zoek dan ook de <M>k</M>-waarde van het gas op.</Par>,
			<Par>Kies de vorm van Poisson's wet die het handigst is om te gebruiken. Kijk hiervoor naar wat je al weet en wat je nog wilt weten. Schrijf deze wet op voor punten 1 en 2. Als je bijvoorbeeld met druk en volume gaat rekenen, dan schrijf je <BM>p_1V_1^n = p_2V_2^n.</BM></Par>,
			<Par>Los met wiskunde de vergelijking op voor de onbekende waarde.</Par>,
			<Par>Vul getallen in om de onbekende waarde uit te rekenen.</Par>,
		]} />
	</>
}
