// An Engineering Diagram allows for the easy creation of structural drawings. It can easily draw forces, moments, beams, hinges, supports and more.

import { drawingComponents } from 'ui/components/figures/Drawing'
import * as engineeringComponents from './components'

// Export all components from the Drawing and from the Engineering set, both separately and as components object.
export * from 'ui/components/figures/Drawing/drawingComponents/SvgComponents'
export * from './components'
export const components = {
	...drawingComponents,
	...engineeringComponents,
}

// Reexport all HtmlComponents.
export * from 'ui/components/figures/Drawing/drawingComponents/HtmlComponents'

// Export all from rendering.
export * from './rendering'
