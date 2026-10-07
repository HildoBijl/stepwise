import type { SVGProps } from 'react'

import { type PositionedSvgSymbolProps, PositionedSvgSymbol } from '../PositionedSvgSymbol.tsx'
import { GroundShape, type GroundShapeProps, SupportBlockShape, type SupportBlockShapeProps, SupportTriangleShape, type SupportTriangleShapeProps, WheelsShape, type WheelsShapeProps } from './parts/shapes/index.ts'

export interface SupportProps extends PositionedSvgSymbolProps {
	thickness?: number
	width?: number
	height?: number
	groundProps?: GroundShapeProps
}

export interface FixedSupportProps extends SupportProps {
	positionFactor?: number
	blockProps?: SupportBlockShapeProps
}

export function FixedSupport(props: FixedSupportProps) {
	const { angle = Math.PI / 2, blockProps, groundProps, height = 6, positionFactor = 1 / 6, ref, thickness = 2, width = 36, ...symbolProps } = props
	return <PositionedSvgSymbol {...symbolProps} angle={angle - Math.PI / 2} className={symbolProps.className ?? 'fixedSupport'} ref={ref}>
		<g transform={`translate(0 ${height * positionFactor})`}><SupportBlockShape {...blockProps} height={height} width={width} /></g>
		<g transform={`translate(0 ${height * (positionFactor + 1 / 2)})`}><GroundShape {...groundProps} thickness={thickness} width={groundProps?.width ?? width + 14} /></g>
	</PositionedSvgSymbol>
}

export function AdjacentFixedSupport(props: FixedSupportProps) {
	return <FixedSupport positionFactor={1} {...props} />
}

export interface HingeSupportProps extends SupportProps {
	hingeProps?: SVGProps<SVGCircleElement>
	triangleProps?: SupportTriangleShapeProps
}

export function HingeSupport(props: HingeSupportProps) {
	const { angle = Math.PI / 2, groundProps, height = 20, hingeProps, ref, thickness = 2, triangleProps, width = 32, ...symbolProps } = props
	return <PositionedSvgSymbol {...symbolProps} angle={angle - Math.PI / 2} className={symbolProps.className ?? 'hingeSupport'} ref={ref}>
		<SupportTriangleShape {...triangleProps} height={height} thickness={thickness} width={width} />
		<g transform={`translate(0 ${height})`}><GroundShape {...groundProps} thickness={thickness} /></g>
		<circle {...hingeProps} cx={0} cy={0} fill={hingeProps?.fill ?? 'white'} r={6} stroke={hingeProps?.stroke ?? 'currentColor'} strokeWidth={hingeProps?.strokeWidth ?? thickness} />
	</PositionedSvgSymbol>
}

export interface HalfHingeSupportProps extends Omit<HingeSupportProps, 'hingeProps'> {
	hingeProps?: SVGProps<SVGPathElement>
}

export function HalfHingeSupport(props: HalfHingeSupportProps) {
	const { angle = Math.PI / 2, groundProps, height = 20, hingeProps, ref, thickness = 2, triangleProps, width = 32, ...symbolProps } = props
	const shift = 3
	return <PositionedSvgSymbol {...symbolProps} angle={angle - Math.PI / 2} className={symbolProps.className ?? 'halfHingeSupport'} ref={ref}>
		<g transform={`translate(0 ${shift})`}><SupportTriangleShape {...triangleProps} height={height} thickness={thickness} width={width} /></g>
		<g transform={`translate(0 ${height + shift})`}><GroundShape {...groundProps} thickness={thickness} /></g>
		<g transform={`translate(0 ${shift})`}><path {...hingeProps} d="M-6 0 A6 6 0 0 0 6 0 L-6 0" fill={hingeProps?.fill ?? 'white'} stroke={hingeProps?.stroke ?? 'currentColor'} strokeWidth={hingeProps?.strokeWidth ?? thickness} /></g>
	</PositionedSvgSymbol>
}

export interface RollerSupportProps extends FixedSupportProps {
	wheelRadius?: number
	wheelsProps?: WheelsShapeProps
}

export function RollerSupport(props: RollerSupportProps) {
	const { angle = Math.PI / 2, blockProps, groundProps, height = 6, positionFactor = 1 / 6, ref, thickness = 2, wheelRadius = 4, wheelsProps, width = 36, ...symbolProps } = props
	const base = height * (positionFactor + 1 / 2)
	return <PositionedSvgSymbol {...symbolProps} angle={angle - Math.PI / 2} className={symbolProps.className ?? 'rollerSupport'} ref={ref}>
		<g transform={`translate(0 ${height * positionFactor})`}><SupportBlockShape {...blockProps} height={height} width={width} /></g>
		<g transform={`translate(0 ${base + wheelRadius})`}><WheelsShape {...wheelsProps} radius={wheelRadius} /></g>
		<g transform={`translate(0 ${base + 2 * wheelRadius + thickness / 2})`}><GroundShape {...groundProps} thickness={thickness} width={groundProps?.width ?? width + 14} /></g>
	</PositionedSvgSymbol>
}

export function AdjacentRollerSupport(props: RollerSupportProps) {
	return <RollerSupport positionFactor={1} {...props} />
}

export interface RollerHingeSupportProps extends HingeSupportProps {
	wheelRadius?: number
	wheelsProps?: WheelsShapeProps
}

export function RollerHingeSupport(props: RollerHingeSupportProps) {
	const { angle = Math.PI / 2, groundProps, height = 20, hingeProps, ref, thickness = 2, triangleProps, wheelRadius = 4, wheelsProps, width = 32, ...symbolProps } = props
	return <PositionedSvgSymbol {...symbolProps} angle={angle - Math.PI / 2} className={symbolProps.className ?? 'rollerHingeSupport'} ref={ref}>
		<SupportTriangleShape {...triangleProps} height={height} thickness={thickness} width={width} />
		<g transform={`translate(0 ${height + wheelRadius + thickness / 2})`}><WheelsShape {...wheelsProps} radius={wheelRadius} /></g>
		<g transform={`translate(0 ${height + 2 * wheelRadius + thickness})`}><GroundShape {...groundProps} thickness={thickness} /></g>
		<circle {...hingeProps} cx={0} cy={0} fill={hingeProps?.fill ?? 'white'} r={6} stroke={hingeProps?.stroke ?? 'currentColor'} strokeWidth={hingeProps?.strokeWidth ?? thickness} />
	</PositionedSvgSymbol>
}

export interface RollerHalfHingeSupportProps extends Omit<RollerHingeSupportProps, 'hingeProps'> {
	hingeProps?: SVGProps<SVGPathElement>
}

export function RollerHalfHingeSupport(props: RollerHalfHingeSupportProps) {
	const { angle = Math.PI / 2, groundProps, height = 20, hingeProps, ref, thickness = 2, triangleProps, wheelRadius = 4, wheelsProps, width = 32, ...symbolProps } = props
	const shift = 3
	return <PositionedSvgSymbol {...symbolProps} angle={angle - Math.PI / 2} className={symbolProps.className ?? 'rollerHalfHingeSupport'} ref={ref}>
		<g transform={`translate(0 ${shift})`}><SupportTriangleShape {...triangleProps} height={height} thickness={thickness} width={width} /></g>
		<g transform={`translate(0 ${height + shift + wheelRadius + thickness / 2})`}><WheelsShape {...wheelsProps} radius={wheelRadius} /></g>
		<g transform={`translate(0 ${height + shift + 2 * wheelRadius + thickness})`}><GroundShape {...groundProps} thickness={thickness} /></g>
		<g transform={`translate(0 ${shift})`}><path {...hingeProps} d="M-6 0 A6 6 0 0 0 6 0 L-6 0" fill={hingeProps?.fill ?? 'white'} stroke={hingeProps?.stroke ?? 'currentColor'} strokeWidth={hingeProps?.strokeWidth ?? thickness} /></g>
	</PositionedSvgSymbol>
}
