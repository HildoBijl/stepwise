import React from 'react'

import { Head, Par, List, M, BM, Term, Emp, Warning } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export default function Component() {
	return <>
		<Par>Elk voorwerp heeft een <Term>inwendige energie</Term> <M>U.</M> Bij gassen voldoet deze inwendige energie aan bepaalde regels/formules. We bekijken hoe we de toename <M>\Delta U</M> in inwendige energie exact kunnen berekenen.</Par>

		<Head>De eerste hoofdwet</Head>
		<Par>De <Term>eerste hoofdwet van de thermodynamica</Term> zegt: "Energie blijft altijd behouden." Als formule geldt dus <BM>U_1 + Q = U_2 + W.</BM> Oftewel, de energie <M>U_1</M> bij aanvang, plus energie die we toevoeren via warmte <M>Q,</M> is gelijk aan de energie <M>U_2</M> aan het einde, plus energie die het gas via het leveren van arbeid <M>W</M> nog afgestaan heeft.</Par>
		<Par>Het bovenstaande wordt vaak anders geschreven. Vaak praat men over de <Term>toename van inwendige energie</Term> <M>\Delta U = U_2 - U_1</M> en schrijft men <BM>\Delta U = Q - W.</BM> Oftewel, de toename van inwendige energie is gelijk aan de energie die we aan warmte toegevoerd hebben minus de energie die het gas via arbeid afgestaan heeft. Uiteraard geldt dat, als één of beiden van deze waarden negatief zijn, dat de formule dan nog exact hetzelfde werkt, maar dan met negatieve waarden.</Par>
		<Par>Samengevat geldt: als we weten hoeveel warmte we toevoeren en hoeveel arbeid het gas levert, dan weten we ook de toename <M>\Delta U</M> in inwendige energie.</Par>

		<Head>De link met temperatuur</Head>
		<Par>Het bovenstaande verhaal geldt altijd, in elke situatie. Immers, energiebehoud is een natuurwet en daar kom je niet omheen. Voor <Term>ideale gassen</Term> geldt echter nog een tweede vergelijking. Er geldt dan ook <BM>\Delta U = mc_v \, \Delta T.</BM> Oftewel, als de inwendige energie van een gas toeneemt, dan stijgt de temperatuur proportioneel mee!</Par>
		<Warning>De bovenstaande formule gebruikt <Emp>altijd</Emp> de waarde <M>c_v.</M> Dit is onafhankelijk van het soort proces, en is dus ook zo bij bijvoorbeeld isobare of isentrope processen.</Warning>

		<Head>De stappen</Head>
		<Par>Bij het rekenen met inwendige energie moeten we goed kijken naar welke formule we kunnen gebruiken.
			<List items={[
				<>Weten we de temperaturen <M>T_1</M> en <M>T_2</M> aan het begin en aan het einde? Of kunnen we die berekenen, bijvoorbeeld via de <SkillLink skillId="gasLaw">gaswet</SkillLink> of <SkillLink skillId="poissonsLaw">Poisson's wet</SkillLink>? Dan gebruiken we <M>\Delta U = mc_v \, \Delta T.</M></>,
				<>Weten we de temperaturen niet, maar kunnen we wel de warmte <M>Q</M> en de arbeid <M>W</M> van het proces berekenen? (Eventueel wederom na het gebruik van de <SkillLink skillId="gasLaw">gaswet</SkillLink> of <SkillLink skillId="poissonsLaw">Poisson's wet</SkillLink>.) Dan berekenen we die waarden en passen we vervolgens <M>\Delta U = Q - W</M> toe.</>,
			]} />
			Zo kunnen we altijd de toename <M>\Delta U</M> in inwendige energie berekenen.
		</Par>
	</>
}
