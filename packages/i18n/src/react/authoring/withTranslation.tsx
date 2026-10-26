import { type ComponentProps, type ComponentType, type ElementType, type JSXElementConstructor, createElement } from 'react'

/*
 * Types.
 */

// The options that can be passed when setting up a Translation Component.
export type TranslationComponentOptions<Props extends object> = {
	tag?: string // The name of the tag to use.
	translatedProps?: readonly TranslatedProp<Props>[] // The props to expose as translatable message slots.
	canCopy?: boolean // Whether this element can be copied within translations.
	canDelete?: boolean // Whether this element may be removed from translations.
}

export type TranslatedProp<Props extends object> = Extract<keyof Props, string> | TranslatedArrayProp<Props>

export type TranslatedArrayProp<Props extends object> = {
	name: Extract<keyof Props, string>
	itemName: string
}

// The definition that's created, filling in default options.
export type TranslatedArrayPropDefinition = {
	name: string
	itemName: string
}

export type TranslationComponentDefinition = {
	tag: string
	translatedProps: readonly (string | TranslatedArrayPropDefinition)[]
	canCopy: boolean
	canDelete: boolean
}

// The type of the wrapped Translation Component.
const translationComponent = Symbol('translationComponent')
type TranslationComponent = string | JSXElementConstructor<any>
type RegisteredTranslationComponentDefinition = Omit<TranslationComponentDefinition, 'tag'> & { tag?: string }
type RegisteredTranslationComponent = TranslationComponent & {
	[translationComponent]?: RegisteredTranslationComponentDefinition
}

/*
 * Component wrapper.
 */

// Wrap a React component and describe how it participates in translated messages.
export function withTranslation<Component extends ElementType>(Component: Component, options: TranslationComponentOptions<ComponentProps<Component>> = {}): ComponentType<ComponentProps<Component>> {
	// Turn the options into a definition object by adding default values for options.
	const definition: RegisteredTranslationComponentDefinition = {
		tag: options.tag,
		translatedProps: options.translatedProps ?? ['children'],
		canCopy: options.canCopy ?? true,
		canDelete: options.canDelete ?? true,
	}

	// Set up a wrapped component with its translation properties added to it.
	function TranslatableComponent(props: ComponentProps<Component>) {
		return createElement(Component, props)
	}
	TranslatableComponent.displayName = `withTranslation(${options.tag ?? getComponentDisplayName(Component)})`
	Object.defineProperty(TranslatableComponent, translationComponent, { value: definition })
	return TranslatableComponent
}

// Return the registered translation definition, using a caller-provided stable tag when none was registered.
export function getTranslationComponentDefinition(component: TranslationComponent, getFallbackTag: () => string): TranslationComponentDefinition {
	const registeredDefinition = (component as RegisteredTranslationComponent)[translationComponent]
	return {
		tag: typeof component === 'string' ? component : registeredDefinition?.tag ?? getFallbackTag(),
		translatedProps: registeredDefinition?.translatedProps ?? ['children'],
		canCopy: registeredDefinition?.canCopy ?? true,
		canDelete: registeredDefinition?.canDelete ?? true,
	}
}

// Obtain a human-readable component name for React debugging only. Translation identities never depend on it.
function getComponentDisplayName(component: TranslationComponent): string {
	if (typeof component === 'string') return component
	const namedComponent = component as { displayName?: string, name?: string }
	return namedComponent.displayName ?? namedComponent.name ?? 'Component'
}
