// An Engineering Diagram allows for the easy creation of structural drawings. It can easily draw forces, moments, beams, hinges, supports and more.

import { drawingComponents } from 'ui/components/figures/Drawing'
import * as engineeringComponents from './components'
import EngineeringDiagram from './EngineeringDiagram'

// Export all components from the Drawing and from the Engineering set, both separately and as components object.
export * from 'ui/components/figures/Drawing/SvgComponents'
export * from './components'
export const components = {
	...drawingComponents,
	...engineeringComponents,
}

// Reexport all HtmlComponents.
export * from 'ui/components/figures/Drawing/HtmlComponents'

// Export all from rendering.
export * from './rendering'

// Export everything (including the default export) from EngineeringDiagram.
export default EngineeringDiagram
export * from './EngineeringDiagram'
