import { type ComponentProps, type ComponentType, type ElementType, type JSXElementConstructor, createElement } from 'react'

/*
 * Types.
 */

// The options that can be passed when setting up a Translation Component.
export type TranslationComponentOptions<Props extends object> = {
	tag?: string // The name of the tag to use.
	translatedProps?: readonly Extract<keyof Props, string>[] // The props to expose as translatable message slots.
	canCopy?: boolean // Whether this element can be copied within translations.
	canDelete?: boolean // Whether this element may be removed from translations.
}

// The definition that's created, filling in default options.
export type TranslationComponentDefinition = {
	tag: string
	translatedProps: readonly string[]
	canCopy: boolean
	canDelete: boolean
}

// The type of the wrapped Translation Component.
const translationComponent = Symbol('translationComponent')
type TranslationComponent = string | JSXElementConstructor<any>
type RegisteredTranslationComponent = TranslationComponent & {
	[translationComponent]?: TranslationComponentDefinition
}

/*
 * Component wrapper.
 */

// Wrap a React component and describe how it participates in translated messages.
export function withTranslation<Component extends ElementType>(Component: Component, options: TranslationComponentOptions<ComponentProps<Component>> = {}): ComponentType<ComponentProps<Component>> {
	// Turn the options into a definition object by adding default values for options.
	const definition: TranslationComponentDefinition = {
		tag: options.tag ?? getDefaultComponentTag(Component),
		translatedProps: options.translatedProps ?? ['children'],
		canCopy: options.canCopy ?? true,
		canDelete: options.canDelete ?? true,
	}

	// Set up a wrapped component with its translation properties added to it.
	function TranslatableComponent(props: ComponentProps<Component>) {
		return createElement(Component, props)
	}
	TranslatableComponent.displayName = `withTranslation(${definition.tag})`
	Object.defineProperty(TranslatableComponent, translationComponent, { value: definition })
	return TranslatableComponent
}

// Return the registered translation definition or derive the default definition for an ordinary component.
export function getTranslationComponentDefinition(component: TranslationComponent): TranslationComponentDefinition {
	return (component as RegisteredTranslationComponent)[translationComponent] ?? getDefaultTranslationComponentDefinition(component)
}

// Set up the default translation definition for a component.
function getDefaultTranslationComponentDefinition(component: TranslationComponent): TranslationComponentDefinition {
	return {
		tag: getDefaultComponentTag(component),
		translatedProps: ['children'],
		canCopy: true,
		canDelete: true,
	}
}

// Derive a kebab-case translation tag from a React component's name or displayName property (whichever is present).
function getDefaultComponentTag(component: TranslationComponent): string {
	if (typeof component === 'string') return component
	const namedComponent = component as { displayName?: string, name?: string }
	const name = namedComponent.name ?? namedComponent.displayName
	if (!name) throw new Error('Cannot derive a translation tag from an anonymous component. Provide an explicit tag instead.')
	return name.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}
