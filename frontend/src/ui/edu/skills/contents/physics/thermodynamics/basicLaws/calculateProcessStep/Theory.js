import React from 'react'

import { SkillLink } from 'ui/routing'
import { Head, Par, List } from 'ui/components/containers'
import { M } from 'ui/components/equations'

export default function Component() {
	return <>
		<Par>Een <strong>thermodynamisch proces</strong> is een proces waarbij een gas bij aanvang (punt 1) bepaalde eigenschappen heeft, en na afloop (punt 2) andere eigenschappen. We bekijken hoe we op overzichtelijke wijze zo'n proces door kunnen rekenen.</Par>

		<Head>Overzicht scheppen: het <M>p</M>-<M>V</M>-<M>T</M>-tabel</Head>
		<Par>Belangrijke waarden bij thermodynamische processen zijn de toestandseigenschappen druk <M>p,</M> volume <M>V</M> en temperatuur <M>T.</M> We willen weten wat deze bij aanvang en na afloop zijn. Om hierin overzicht te scheppen maken we een <M>p</M>-<M>V</M>-<M>T</M>-tabel.</Par>
		<Par>Een <M>p</M>-<M>V</M>-<M>T</M>-tabel heeft als rijen de verschillende punten. (Hier is dat punt 1 "begin" en punt 2 "einde" maar het kunnen er ook meer zijn.) De kolommen zijn de verschillende toestandswaarden, <M>p,</M> <M>V</M> en <M>T.</M> Als de tabel helemaal ingevuld is, dan is het thermodynamische proces doorgerekend.</Par>

		<Head>De stappen</Head>
		<Par>Om een thermodynamisch proces door te rekenen, en het <M>p</M>-<M>V</M>-<M>T</M>-tabel te vullen, voer je de volgende stappen uit.</Par>
		<List useNumbers={true} items={[
			<Par>Zet alle constante gaseigenschappen op een rijtje. Dit zijn de opgezochte eigenschappen <M>R_s,</M> <M>k,</M> <M>c_v</M> en <M>c_p,</M> en (indien bekend) ook de massa <M>m.</M></Par>,
			<Par>Maak een <M>p</M>-<M>V</M>-<M>T</M>-tabel en vul de gegeven toestandseigenschappen hier al in.</Par>,
			<Par>In de beginsituatie zijn meestal twee van de drie toestandseigenschappen bekend. Via de <SkillLink skillId="gasLaw">gaswet</SkillLink> kunnen we de derde waarde vinden. (Of soms: als alle drie de waarden gegeven zijn, maar de massa <M>m</M> nog niet bekend is, gebruik dan de <SkillLink skillId="gasLaw">gaswet</SkillLink> om de massa te berekenen.)</Par>,
			<Par>In de eindsituatie is vaak één waarde gegeven: hoe ver het proces doorgezet wordt. Gebruik <SkillLink skillId="poissonsLaw">Poisson's wet</SkillLink> om de tweede waarde te vinden. (Soms is het niet nodig om Poisson's wet te gebruiken: als een waarde (bijvoorbeeld de druk) constant blijft, dan kun je deze waarde ook direct overnemen uit de vorige rij.)</Par>,
			<Par>Gebruik wederom de <SkillLink skillId="gasLaw">gaswet</SkillLink>, maar nu in de eindsituatie. Hiermee vind je de laatste waarde uit je tabel.</Par>,
		]} />
		<Par>Het eindresultaat is een volledig ingevuld <M>p</M>-<M>V</M>-<M>T</M>-tabel.</Par>
	</>
}
