import React from 'react'

import { Par, M } from 'ui/components'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'
import { InputSpace } from 'ui/form'

import SimpleExercise from '../types/SimpleExercise'
import { getMCFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

const questions = [
	<Par>We brengen in een snelkookpan een klein beetje water aan de kook. Op deze snelkookpan zit een overdrukventiel: als de druk groter dan zo'n <M>2\ (\rm bar)</M> wordt, dan gaat dit ventiel open om wat lucht te laten ontsnappen. Wat voor soort proces speelt zich binnen de pan af?</Par>,
	<Par>In een cilinder van een viertaktmotor van een auto bevindt de zuiger zich in de hoogste stand: het volume van de ingesloten lucht is erg klein. Precies op dit moment geeft de bougie een vonkje waardoor de aanwezige brandstof ontbrandt. Dit zorgt voor een snelle toevoer van warmte. Het gaat zo snel dat de zuiger nog geen tijd heeft gehad om te bewegen. Wat voor soort proces is dit?</Par>,
	<Par>Een luie wielrenner duwt heel langzaam de hendel van zijn fietspomp naar beneden. Dit zorgt ervoor dat de lucht in de pomp gecomprimeerd wordt. Omdat dit zo langzaam gaat wordt de lucht nauwelijkse warmer: de warmte stroomt via de pompbehuizing gelijk weg. Wat voor soort proces is dit, bij benadering?</Par>,
	<Par>In een viertaktmotor van een auto bevindt bevindt zich een cilinder waarin zojuist het brandstof is ontbrand. Hierdoor staat de lucht onder erg hoge druk. Deze druk duwt de zuiger van de cilinder erg snel omlaag. De brandstof is (bij benadering) al ontbrand: er wordt geen extra warmte meer toegevoegd. Wel is er mogelijk een beetje frictie aanwezig in de cilinder. Wat voor soort proces is dit?</Par>,
	<Par>In een vliegtuigmotor gaat de lucht, na verhitting via brandstof, door de turbine. Deze turbine wekt de energie (arbeid) op om de grote propellor aan te drijven. De turbine is zo optimaal mogelijk gemaakt: er is praktisch geen frictie en de behuizing is goed geïsoleerd waardoor er geen warmte-uitwisseling met de omgeving is. Wat voor soort proces is dit? Wees bij je antwoord zo specifiek mogelijk.</Par>,
]

const names = ['Isobaar', 'Isochoor', 'Isotherm', 'Adiabatisch', 'Isentroop']
const choices = names.map(name => <span>Dit is een {name.toLowerCase()} proces.</span>)

function Problem({ type }) {
	return <>
		{questions[type]}
		<InputSpace>
			<MultipleChoice id="ans" choices={choices} pick={4} include={type} randomOrder={true} />
		</InputSpace>
	</>
}

function Solution({ type }) {
	return [
		<Par>Het overdrukventiel houdt de druk binnen de pan constant. Een proces met constante druk is een <strong>isobaar</strong> proces.</Par>,
		<Par>Omdat de zuiger geen tijd heeft om te bewegen, blijft het volume van de lucht in de cilinder constant. Een proces met constant volume is een <strong>isochoor</strong> proces.</Par>,
		<Par>De lucht binnen de fietspomp houdt ongeveer een constante temperatuur. Normaal wordt lucht bij compressie warmer: de temperatuur stijgt. Omdat dit proces zo langzaam gaat geldt echter: zodra de temperatuur iets stijgt stroomt de warmte weg (daar is genoeg tijd voor) waardoor de temperatuur weer daalt. Zo blijft de temperatuur ongeveer gelijk aan de omgevingstemperatuur. Een proces met constante temperatuur is een <strong>isotherm</strong> proces.</Par>,
		<Par>Bij dit proces wordt geen extra warmte toegevoegd: er is geen warmte-uitwisseling met de buitenwereld. Een proces zonder warmte-uitwisseling met de omgeving is een <strong>adiabatisch</strong> proces. Het is overigens geen isentropisch proces, omdat er frictie aanwezig is die intern voor warmte-ontwikkeling zorgt. Dit betekent dat het proces niet omkeerbaar is.</Par>,
		<Par>Er is bij dit proces geen warmte-uitwisseling met de omgeving. De turbine is immers goed geïsoleerd. Dit betekent in ieder geval dat het een adiabatisch proces is. We kunnen echter specifieker zijn. Het is bekend dat er praktisch geen frictie is, waardoor er ook intern geen warmte-ontwikkeling plaatsvindt. Dit betekent dat het proces omkeerbaar is, wat het een <strong>isentropisch</strong> proces maakt. Omdat "isentropisch proces" specifieker is dan "adiabatisch proces" is dit het enige juiste antwoord.</Par>,
	][type]
}

function getFeedback(exerciseData) {
	const { state: { type } } = exerciseData
	const correct = type

	const text = [
		[
			'Zeker! De druk binnen de pan blijft constant.',
			'Een isochoor proces is een proces waarbij de lucht een constant volume houdt. Omdat een deel van de lucht wegstroomt via het overdrukventiel is dit echter niet het geval. De lucht neemt hiermee meer volume in.',
			'Een isotherm proces is een proces waarbij de temperatuur constant blijft. De pan wordt echter verwarmd (aan de kook gebracht) waardoor de temperatuur toeneemt.',
			'Een adiabatisch proces is een zonder warmte-uitwisseling met de omgeving. Bij het koken van een pan wordt echter zeker wel warmte toegevoerd.',
			'Een isentroop proces is een proces zonder warmte-uitwisseling met de omgeving en zonder interne warmte-ontwikkeling. Bij het koken van een pan wordt echter zeker wel warmte toegevoerd.',
		],
		[
			'Een isobaar proces is een proces met constante druk. Maar hier geldt: door de verwarming van de lucht in de cilinder stijgt de druk sterk.',
			'Ja! Het volume blijft immers constant.',
			'Een isotherm proces is een proces waarbij de temperatuur constant blijft. De lucht in de cilinder wordt echter sterk verwarmd, waardoor de temperatuur stijgt.',
			'Een adiabatisch proces is een zonder warmte-uitwisseling. Door de verbranding van het brandstof wordt echter zeker wel warmte toegevoerd.',
			'Een isentroop proces is een proces zonder warmte-uitwisseling met de omgeving en zonder interne warmte-ontwikkeling. Door de verbranding van het brandstof wordt echter zeker wel warmte toegevoerd.',
		],
		[
			'Een isobaar proces is een proces met constante druk. Maar hier geldt: bij het indrukken van de hendel wordt de lucht gecomprimeerd, waardoor de druk stijgt.',
			'Een isochoor proces is een proces met constant volume. De lucht in de fietspomp wordt echter gecomprimeerd: het volume neemt af.',
			'Dat klopt! De temperatuur van de lucht binnen de fietspomp blijft ongeveer constant.',
			'Een adiabatisch proces is een zonder warmte-uitwisseling met de omgeving. Omdat de fietspomp heel langzaam ingedrukt wordt, stroomt er echter continu wel een beetje warmte naar buiten.',
			'Een isentroop proces is een proces zonder warmte-uitwisseling met de omgeving en zonder interne warmte-ontwikkeling. Omdat de fietspomp heel langzaam ingedrukt wordt, stroomt er echter continu wel een beetje warmte naar buiten.',
		],
		[
			'Een isobaar proces is een proces met constante druk. Maar hier geldt: omdat de zuiger omlaag gaat neemt het volume toe (de lucht expandeert) waardoor de druk afneemt.',
			'Een isochoor proces is een proces met constant volume. Het volume van de lucht in de cilinder neemt echter toe, omdat de zuiger omlaag gaat.',
			'Een isotherm proces is een proces waarbij de temperatuur constant blijft. De lucht in de cilinder is echter aan het expanderen (uitzetten), en lucht die expandeert koelt over het algemeen af. Dit is dus geen isotherm proces.',
			'Correct! Er is immers geen warmte-uitwisseling met de omgeving.',
			'Een isentroop proces is een proces zonder warmte-uitwisseling met de omgeving en zonder interne warmte-ontwikkeling. Er is echter wel frictie binnen de cilinder, wat zorgt voor een interne warmte-ontwikkeling. Dit maakt het proces niet omkeerbaar.',
		],
		[
			'Een isobaar proces is een proces met constante druk. Maar hier geldt: als de hoge-druk lucht door de turbine stroomt, dan daalt de druk. Het is immers het drukverschil waardoor de lucht door de turbine stroomt.',
			'Een isochoor proces is een proces met constant volume. Als lucht door een turbine stroomt, dan zet het echter uit: het volume neemt toe. Deze expansie is hoe de lucht arbeid levert.',
			'Een isotherm proces is een proces waarbij de temperatuur constant blijft. Als lucht door een turbine stroomt, dan verricht het arbeid. Deze arbeid zorgt over het algemeen voor een daling van energie - en dus ook een daling van temperatuur - van de lucht.',
			'Een adiabatisch proces is een zonder warmte-uitwisseling met de omgeving. Dat is hier wel het geval, maar je kunt nog specifieker zijn met je antwoord. Wat geldt namelijk nog meer?',
			'Perfect! Dit is inderdaad een proces zonder warmte-uitwisseling met de omgeving en zonder interne warmte-ontwikkeling.',
		],
	][type]

	return getMCFeedback('ans', exerciseData, { correct, text })
}