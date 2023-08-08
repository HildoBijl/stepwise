import { selectRandomly } from 'step-wise/util'

// selectRandomCorrect gives a random correct text.
export function selectRandomCorrect(withWrapper = false) {
	if (withWrapper)
		return { correct: false, text: selectRandomIncorrect() }
	return selectRandomly([
		'Dat is goed!',
		'Indrukwekkend gedaan.',
		'Geweldig, het is je gelukt!',
		'Dat is de juiste oplossing.',
		'Klopt helemaal.',
		'Prachtig! Ga zo door.',
		'Gaat lekker zo.',
		'Correct! Goed gedaan.',
		'Je hebt hem opgelost!',
		'Mooi zo!',
		'Helemaal perfect.',
		'Ziet er goed uit.',
		'Top! Het klopt.',
		'Ja, dat is hem.',
		'Dat is het goede antwoord.',
		'Dat is helemaal correct.',
	])
}

// selectRandomIncorrect gives a random incorrect text.
export function selectRandomIncorrect(withWrapper = false) {
	if (withWrapper)
		return { correct: false, text: selectRandomIncorrect() }
	return selectRandomly([
		'Dat is niet de juiste oplossing.',
		'Helaas, dat klopt niet.',
		'Dat is niet correct.',
		'Nog eens proberen?',
		'Die is mis.',
		'Je zit er helaas naast.',
		'Nee, niet het juiste antwoord.',
		'Tja ... net niet.',
		'Sorry, dat is fout.',
		'Nee, dat is hem niet.',
		'Oops, dat is een verkeerd antwoord.',
	])
}

// selectRandomEmpty gives a random text that a field is empty.
export function selectRandomEmpty() {
	return selectRandomly([
		'Je hebt niets ingevuld.',
		'Dit veld is nog leeg.',
		'Je bent hier iets vergeten in te vullen.',
		'Je moet hier iets invullen.',
		'Hier mist nog wat.',
	])
}

// selectRandomMissingNumber gives a random text that a number is lacking.
export function selectRandomMissingNumber() {
	return selectRandomly([
		'Je hebt geen getal ingevuld.',
		'Het getal ontbreekt.',
		'Vergeet niet een getal in te vullen!',
		'Waar is het getal?',
		'Oops, hier mist een getal.',
	])
}

// selectRandomMissingUnit gives a random text that a unit is lacking.
export function selectRandomMissingUnit() {
	return selectRandomly([
		'Je hebt geen eenheid ingevuld.',
		'De eenheid ontbreekt.',
		'Vergeet niet een eenheid in te vullen!',
		'Waar is de eenheid?',
		'Oops, hier mist een eenheid.',
	])
}

// selectRandomInvalidUnit gives a random text that a unit is faulty.
export function selectRandomInvalidUnit() {
	return selectRandomly([
		'Dit is geen geldige eenheid.',
		'Check je eenheid nog eens.',
		'Deze eenheid ziet er niet correct uit.',
		'Er is iets mis met je eenheid.',
		'Er zitten niet kloppende delen in je eenheid.',
	])
}

// selectRandomIncorrectUnit gives a random text that a unit is incorrect.
export function selectRandomIncorrectUnit() {
	return selectRandomly([
		'Je eenheid klopt niet. Kijk daar eerst eens naar.',
		'Er zit een fout in je eenheid. Verbeter die eerst.',
		'Incorrecte eenheid. Welke eenheid moet je antwoord hebben?',
		'Het gaat fout bij de eenheid. Wat zou dit moeten zijn?',
		'Oops, je eenheid zit ernaast. Check die even.',
	])
}

// selectRandomNegative gives a random text that a number is negative.
export function selectRandomNegative() {
	return selectRandomly([
		'Dit is een negatief getal.',
		'Dit getal is niet positief.',
		'Dat minteken hoort daar niet.',
		'Dit getal hoort positief te zijn.',
		'Wat doet dat minteken daar?',
	])
}

// selectRandomDuplicate gives a random text that an answer has already been provided.
export function selectRandomDuplicate() {
	return selectRandomly([
		'Deze waarde is al gelijk aan een eerder gegeven oplossing.',
		'Nee, deze oplossing had je al gegeven.',
		'Je hebt deze oplossing hierboven al ingevuld.',
		'Dit is geen unieke oplossing.',
		'Oops, je hebt deze al eerder ingevuld.',
	])
}

// selectRandomNonNumeric gives a random text that an answer is not numeric.
export function selectRandomNonNumeric() {
	return selectRandomly([
		'Deze waarde is geen getal.',
		'Er staat nog een variabele in.',
		'Je hebt iets ingevuld dat geen getal is.',
		'Dit is niet iets wat een getal kan worden.',
		'Oops, ik kan hier geen getal van maken..',
	])
}
