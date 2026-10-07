import { type ComponentType, type ReactElement, type ReactNode, type Ref, Fragment, createElement, isValidElement } from 'react'

import { Arc, BoundedLine, Circle, CornerLabel, Curve, DistanceMarker, HtmlElement, Label, Line, LineLabel, Polygon, Rectangle, RightAngle, Square, SvgGroup, SvgText } from '@step-wise/drawing'
import { isPlainObject } from '@step-wise/js-utils'

import { defaultEngineeringDiagramColors, type EngineeringLoadSource } from '../colors.ts'
import { Force, LoadLabel, Moment } from '../loads/index.ts'
import { Beam, HalfHinge, Hinge } from '../structural/index.ts'
import { AdjacentFixedSupport, AdjacentRollerSupport, FixedSupport, Ground, HalfHingeSupport, HingeSupport, RollerHalfHingeSupport, RollerHingeSupport, RollerSupport, SupportBlock, SupportTriangle, Wheels } from '../supports/index.ts'

export type EngineeringDiagramObjectData = {
	type: string
	source?: EngineeringLoadSource
	[key: string]: unknown
}

export type EngineeringDiagramData = ReactElement | readonly EngineeringDiagramData[] | EngineeringDiagramObjectData

export type EngineeringDiagramComponentRegistry = Record<string, ComponentType<any>>

export interface EngineeringDiagramRenderOptions {
	colors?: Partial<Record<EngineeringLoadSource, string>>
	components?: EngineeringDiagramComponentRegistry
}

export const engineeringDiagramComponents: EngineeringDiagramComponentRegistry = {
	AdjacentFixedSupport,
	AdjacentRollerSupport,
	Arc,
	Beam,
	BoundedLine,
	Circle,
	CornerLabel,
	Curve,
	Distance: DistanceMarker,
	DistanceMarker,
	Element: HtmlElement,
	FixedSupport,
	Force,
	Ground,
	Group: SvgGroup,
	HalfHinge,
	HalfHingeSupport,
	Hinge,
	HingeSupport,
	HtmlElement,
	Label,
	Line,
	LineLabel,
	LoadLabel,
	Moment,
	Polygon,
	Rectangle,
	RightAngle,
	RollerHalfHingeSupport,
	RollerHingeSupport,
	RollerSupport,
	Square,
	SupportBlock,
	SupportTriangle,
	Text: SvgText,
	Wheels,
}

export function renderEngineeringDiagram(data: EngineeringDiagramData, options: EngineeringDiagramRenderOptions = {}, ref?: React.Ref<unknown>): ReactNode {
	if (Array.isArray(data)) return <SvgGroup ref={ref as React.Ref<SVGGElement>}>
		{data.map((element, index) => <Fragment key={index}>{renderEngineeringDiagram(element, options)}</Fragment>)}
	</SvgGroup>
	if (isValidElement(data)) return data
	if (!isPlainObject(data)) throw new Error(`Invalid Engineering Diagram data: expected an object or array, but received an input of type "${typeof data}".`)

	const type = data.type
	if (typeof type !== 'string') throw new Error('Invalid Engineering Diagram data: expected a string type property.')
	const Component = options.components?.[type] ?? engineeringDiagramComponents[type]
	if (!Component) throw new Error(`Invalid Engineering Diagram data: received an unknown type "${type}".`)

	const { source, type: _type, ...componentProps } = data
	if (source !== undefined) {
		if (!['input', 'external', 'reaction', 'section'].includes(source)) throw new Error(`Invalid Engineering Diagram source: received "${String(source)}".`)
		componentProps.color = options.colors?.[source] ?? defaultEngineeringDiagramColors[source]
	}
	return createElement(Component, { ...componentProps, ref })
}

/** @deprecated Prefer explicit components. This adapter only supports the legacy data-object renderer during migration. */
export function render(data: EngineeringDiagramData, ref?: React.Ref<unknown>, options?: EngineeringDiagramRenderOptions): ReactNode {
	return renderEngineeringDiagram(data, options, ref)
}

/** @deprecated Prefer explicit components. */
export function EngineeringDiagramElement(props: EngineeringDiagramObjectData & { ref?: Ref<unknown> }) {
	const { ref, ...data } = props
	return renderEngineeringDiagram(data as EngineeringDiagramData, {}, ref)
}
