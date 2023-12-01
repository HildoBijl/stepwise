// An Engineering Diagram allows for the easy creation of structural drawings. It can easily draw forces, moments, beams, hinges, supports and more.

import { components as drawingComponents } from 'ui/figures'
import * as engineeringComponents from './components'

// Export all components from the Drawing and from the Engineering set, both separately and as components object.
export * from 'ui/figures/Drawing/components'
export * from './components'
export const components = {
	...drawingComponents,
	...engineeringComponents,
}

// Export all from rendering.
export * from './rendering'
