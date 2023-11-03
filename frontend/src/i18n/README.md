# Internationalization (i18n)

The internationalization (i18n) package arranges the loading of anything language-specific, which mainly comes down to managing and loading in language files.

## The general workflow

The Step-Wise app is available in multiple languages. So text should be able to be shown in multiple languages too. Doing so is a three-step process.

### Step 1: defining the Translation text

When you put text on a site, define it as a translation. This can for instance be done through

```
function SomePage() {
	return <Par><Translation path="pages/somePage" entry="introduction.firstParagraph">This is the first (and only) paragraph</Translation></Par>
}
```

When you do this, the script will try to store the given text in the language file `public/locales/en/pages/somePage.json`. (English is used here because English is the default language. Developers should always have their app set to English.)

If you do this for the first time, then the above file probably doesn't exist yet. This causes an error to be thrown. To fix this, create the file and give it an empty object `{}` as contents. Then the `i18n` system can start filling up the language file.

### Defining translation locations

Note that every translation has two parameters, a `path` and an `entry`.

- The `path` denotes the translation file. For instance, the path `pages/somePage` refers to the translation file `pages/somePage.json`. Like folders, the subdivision is done using slashes.
- The `entry` denotes to an item within a translation file. This can be nested too. For instance, you could have an entry `introduction.firstParagraph`. Like in Javascript programming, you need dots to indicate the subdivision. 

A translation file could then look like:

```
{
	introduction: {
		title: 'Welcome!',
		firstPagraph: 'This is the first (and only) paragraph',
	},
	button: 'Click on this button',
	notification: 'You clicked on the button'
}
```

### Step 2: translating the language file

After you are done creating your page or pages, you have a filled-up translation file. This needs to be sent to a translator, who then turns it into a language file in another language. For instance Dutch. This language file can then be put in the corresponding folder. For instance, we create `public/locales/nl/pages/somePage.json`.

### Step 3: loading in the language file

This step is done completely automatic by the `i18n` system! If a user has his/her language set to another language (for instance Dutch) then the `Translation` component will load in the corresponding language file (for instance `public/locales/en/pages/somePage.json`) and adjust the contents based on the entries there.


## Multiple ways of defining translations

There are multiple ways to define translations. Some deal with only text and some deal with React components. We will walk through all methods (first text and then React components) and investigate when they are useful and how they are used.

### Translating text

It could happen that you only want to translate a small piece of text. Like a page title or a button text or so. Then there are three ways to define the translation.

#### The useTextTranslator hook

You can define a `translator` for text using the `useTextTranslator` hook.

```
import { useTextTranslator } from 'i18n'
function SomeFancyButton() {
	const translate = useTextTranslator('someOptionalDefaultPath/someFile')
	return <Button>{translate('Click here!', 'buttons.clickHereButton', someOtherPath/someOtherFile')}</Button>
}
```

So you first define a translator, and then you use this to translate a certain text. Note that it is possible to already define the path while creating the translator, and then you don't have to use it anymore while using the `translate` function. If you do provide a path, the default path defined earlier is ignored for that call.

#### The useTextTranslation hook

A not-so-commonly-used short-cut is the `useTextTranslation` hook. This only looks up one entry.

```
import { useTextTranslator } from 'i18n'
function SomeFancyButton() {
	const buttonText = useTextTranslation('Click here!', 'buttons.clickHereButton', somePath/someFile')
	return <Button>{buttonText}</Button>
}
```

The reason why this isn't used so much is because often multiple translations are needed, and then setting up a `translator` is easier.

#### The useGetTranslation hook

Maybe you already have defined a piece of text for one page, and on another page you want to reuse it. In that case the `useGetTranslation` hook is the right one for you.

```
import { useGetTranslation } from 'i18n'
function SomeFancyButton() {
	const getTranslation = useGetTranslation('someOptionalDefaultPath/someFile')
	const buttonText = getTranslation('buttons.clickHereButton', somePath/someFile')
	return <Button>{buttonText}</Button>
}
```

Note that in the above script we do not define any text! We only look up a value defined elsewhere. 

In theory you could also manually write language files and look everything up in the above way. However, the automatic updating of languages files from scripts is very useful, so this is usually not done.


### Translating React components

Most content on Step-Wise is not pure text, but a component of some sorts. When you want to translate something including components, tags and/or variables, then use the methods below.

#### The Translation component

The most common way to define translations is through the `Translation` component.

```
import { Translation } from 'i18n'
function SomePage() {
	const name = 'Step-Wise'
	return <Translation path="pages/somePage" entry="introduction.firstParagraph"><Par>My name is <strong>{name}</strong>.</Par></Translation>
}
```

When you write this, the `Translation` component first takes its contents and turns it into a string. It'll be something like `<a>My name is <b>{c}</b>.</a>` (except format may vary). This string is then saved to the language file. Perhaps this is translated into Dutch as `<a>Mijn naam is <b>{c}</b>.</a>`. (Yes, Dutch is somewhat similar to English.) Upon receiving this string, the `Translation` component splits it up according to the tags and variables and properly incorporates all the text elements in the result.

#### The useTranslator hook

Another very common method is the `useTranslator` hook. It works identically to `useTextTranslator`, except the resulting `translate` function now always returns a `React` component and not a string.

```
import { useTranslator } from 'i18n'
function SomePage() {
	const translate = useTranslator()
	const name = 'Step-Wise'
	return translate(<Par>My name is <strong>{name}</strong>.</Par>, 'introduction.firstParagraph', 'pages/somePage')
}
```

Note that the `translate` function takes the `entry` as second parameter and the `path` as third parameter.

#### The useTranslation hook

A not-so-commonly-used method is the `useTranslation` hook. It allows you to set up a single translation.

```
import { useTranslator } from 'i18n'
function SomePage() {
	const name = 'Step-Wise'
	const paragraphElement = useTranslation(<Par>My name is <strong>{name}</strong>.</Par>, 'introduction.firstParagraph', 'pages/somePage')
	return paragraphElement
}
```

Just like the `translate` function, the `useTranslation` hook takes the `entry` as second parameter and the `path` as third parameter.


### A note on using string variables

There is one annoying limitation that is fundamental in React. Suppose you want to insert a string variable into another piece of text. Then that will fail in the translation.

```
import { Translation } from 'i18n'
function SomePage() {
	const name = 'Step-Wise'
	return <Translation><Par>My name is <strong>{name}</strong>.</Par></Translation> // This is fine.
	return <Translation><Par>My name is {name}.</Par></Translation> // This will give an error: it puts a string-variable into a React string.
}
```

The reason for the problem is that React cannot distinguish between the hard-coded string and the string-variable, so it does not know what to replace by the translated text. (Note: the variable contents stays the same upon translations. If this is not desired, use `const name = useTextTranslation('Step-Wise', 'someNameEntry')` or similar.)

To solve this problem, we use single-parameter objects.

```
import { Translation } from 'i18n'
function SomePage() {
	const name = 'Step-Wise'
	return <Translation><Par>My name is {{name}}.</Par></Translation> // This works: there is no confusion between the object `{name: Step-Wise}` and the text (strings) around it.
}
```

If the resulting value comes out of a function, you can also set it up according to the code below.

```
import { Translation } from 'i18n'
function SomePage() {
	const getName = () => 'Step-Wise'
	return <Translation><Par>My name is {{name: getName()}}.</Par></Translation> // This works too: there is again no confusion between the object `{name: Step-Wise}` and the text (strings) around it.
}
```

Note: this is only needed when incorporating string variables into translations.


## Defining contexts: TranslationFile and TranslationSection

Whenever you define a translation, you need to define a `path` and an `entry`. This can be rather cumbersome, so there are ways to not do this.

### Automatic paths: the TranslationFile context

Suppose that you are creating a page with various components. All the components should send their translation entries to one file `pages/somePage.json`. In that case you can use the `TranslationFile` component.

```
import { TranslationFile, Translation } from 'i18n'
function SomePage() {
	return <TranslationFile path="pages/somePage">
		<SomeComponent />
		<Translation entry="someEntry">This is text.</Translation>
		<SomeOtherComponent />
	</TranslationFile>
}
```

Anywhere within this context element, you do not need to define the path anymore! The given path is automatically used. Any `hook` is aware of the context and automatically applies it. Of course you can always still define a path, and then that path is used instead.

It is useful to note that `TranslationFile` components can be nested.

```
import { TranslationFile } from 'i18n'
function SomePage() {
	return <TranslationFile path="pages">
		<TranslationFile path="someFirstPage">
			<SomeComponent />
		</TranslationFile>
	</TranslationFile>
}
```

Translation entries made by `SomeComponent` in the above example will then be put in the file `pages/someFirstPage`.

### Automatic entries: the TranslationSection context

Just like paths can be predefined, so can entries. For this you use the `TranslationSection`.

```
import { TranslationFile, TranslationSection, Translation } from 'i18n'
function SomePage() {
	return <TranslationFile path="pages/settings">
		<TranslationSection entry="languageSettings">
			<Translation entry="title">Language settings</Translation>
			<LanguageSettings />
		</TranslationSettings>
		<TranslationSection entry="deleteAccount">
			<DeleteAccount />
		</TranslationSettings>
	</TranslationFile>
}
```

Any translations defined within a section will automatically prepend the given entry. So the "Language settings" string will be in the entry `languageSettings.title`. 

### Breaking out of a Section

What if you're in a `TranslationSection` but you do not want to use it? There are ways around it.

```
import { TranslationFile, TranslationSection, useTranslator, Translation } from 'i18n'
function SomePage() {
	return <TranslationFile path="pages/settings">
		<TranslationSection entry="languageSettings">
			<LanguageSettings />
		</TranslationSettings>
	</TranslationFile>
}
function LanguageSettings() {
	const translate = useTranslator()
	return <>
		<Par>{translate('First text', 'firstEntry')}</Par> // Will use the section: text is stored in entry 'languageSettings.firstEntry'.
		<Par>{translate('Second text', 'secondEntry', undefined, false)}</Par> // Will not use the section: the fourth `extendEntry` parameter is set to false. Entries are taken from the translation file root.
		<Par><Translation entry="thirdEntry" extendEntry={false}>Third text</Translation></Par> // Identical to the second entry.
		<Par>{translate('Fourth text', 'fourthEntry', 'someOtherPath')}</Par> // Will use neither the TranslationFile path nor the TranslationSection section: if a path is given the section is ignored since it's probably irrelevant.
	</>
}
```

Just like `TranslationFile` components, also `TranslationSection` components can be nested.

### Extending a translate function

It is possible to extend a `translate` function, just like if it was in a section. 

```
import { TranslationFile, TranslationSection, useTranslator, addSection } from 'i18n'
function SomePage() {
	return <TranslationFile path="pages/settings">
		<TranslationSection entry="languageSettings">
			<LanguageSettings />
		</TranslationSettings>
	</TranslationFile>
}
function LanguageSettings() {
	const useExistingSection = true
	const originalTranslate = useTranslator()
	const translate = addSection(originalTranslate, 'someExtraSection', useExistingSection)
	return translate(<Par>Change your language settings below.</Par>, 'introduction')
}
```

Note that the resulting piece of text will appear under the entry `languageSettings.someExtraSection.introduction`. After all, the sections stack up! Note that if `useExistingSection` was set to `false`, then the text would appear under the entry `someExtraSection.introduction` instead. And if a `path` was given or if the fourth parameter `extendEntry` was set to `false`, then this extra section would be ignored altogether.


## Dynamic content: Checks, Plurals and more

It may happen that the exact text depends on various parameters. In that case there are components that makes life easier for you.

### The Check component

If there is a Boolean check that needs to be performed, you can use the `Check` component.

```
import { Translation, Check } from 'i18n'
function SomePage() {
	const isGenderFemale = true
	return <Translation>The traveler did not catch <Check value={isGenderMale}><Check.True>her</Check.True><Check.False>his</Check.False></Check> flight.</Translation>
}
```

Only the respective component is shown in the final rendering. But in the translation file it appears as `The traveler did not catch <check><on-true>her</on-true><on-false>his</on-false></check> flight.` This allows for situationally accurate translations.

Note that it is also fine to only use either `<Check.True>` or `<Check.False>`. Each of these elements independently decides whether to show itself or not depending on the given check-value.

### The Plurals component

Similar to the `Check` component is a `Plurals` component that takes a non-negative integer number.

```
import { Translation, Plurals } from 'i18n'
function SomePage() {
	const numChildren = 3
	return <Translation>The traveler has <Plurals value={numChildren}><Plurals.One>one child</Plurals.One><Plurals.Zero>no</Plurals.Zero><Plurals.Multiple>{numChildren}</Plurals.Multiple><Plurals.NotOne> children</Plurals.NotOne></Plurals>.</Translation>
}
```

### Checks with custom conditions

You can also define your own conditions upon checks.

```
import { Translation, Check } from 'i18n'
function SomePage() {
	const name = 'Step-Wise'
	return <Translation>Your name is <Check value={name}>
		<Check.Condition check={value => value.length < 2}>too short</Check.Condition>
		<Check.Condition check={value => value.length >= 2 && value.length <= 32>}>valid</Check.Condition>
		<Check.Condition check={value => value.length > 32}>too long</Check.Condition>
	</Check>.</Translation>
}
```

In this way you can set up any dynamically rendered text you may like, allowing for smooth translations to other languages.

### The CountingWord component

Perhaps you have a variable number like `x = 8` in your script, and you want to use a word for that, to make the text look better. In that case you can use the `CountingWord` component.

```
import { CountingWord } from 'i18n'
function NumberOfSheep({ number }) {
	return <div>I have counted <CountingWord>{number}</CountingWord> sheep so far. <CountingWord upperCase={true}>{number}</CountingWord> lovely sheep!</div>
}
```

The `CountingWord` component will replace itself with the right word, in this case `eight`. An optional parameter `upperCase` (default `false`) can be set to true to turn this into `Eight`


## Updating translation files

Suppose you've created a page, but later on the text needs to change. In this case the relevant translation files (in other languages) are outdated!

To keep track of when language files are outdated, there is the `updateLog.json` file. Whenever a language file in the default language (English) is updated, then the update log gains an entry. It tracks the changes made. This can then be used to update the translations.

It is crucial that translations are updated! If the original is `My name is {name}` but this is changed to `My name is <strong>{name}</strong>` then any old translation will fail to be applied. After all, the format cannot be reconciled anymore. To prevent a site with outdated language files to be deployed, the `updateLog.json` file must always be set back to an empty JSON object `{}` before deploying, as a sign that all language updates have been incorporated.

So before deploying an updated version of Step-Wise, always check the update log. If it's not empty, fix the translations and then clear the update log.
