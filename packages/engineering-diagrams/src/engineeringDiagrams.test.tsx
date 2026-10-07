// @vitest-environment jsdom

import type { ReactNode } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { Drawing } from '@step-wise/drawing'
import { ForceType, MomentType } from '@step-wise/engineering-mechanics'

import { defaultEngineeringDiagramColors } from './colors.ts'
import { Force, LoadLabel, Moment } from './loads/index.ts'
import { renderEngineeringDiagram } from './rendering/index.ts'
import { Beam } from './structures/index.ts'
import { FixedSupport, RollerHingeSupport } from './supports/index.ts'

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
})

describe('engineering diagram components', () => {
	test('renders structural and support symbols in fixed drawing pixels', () => {
		const { container } = renderDrawing(<>
			<Beam data-testid="beam" positions={[[10, 20], [50, 20], [90, 40]]} />
			<FixedSupport data-testid="fixed" position={[10, 20]} />
			<FixedSupport angle={0} data-testid="rotated-fixed" position={[50, 50]} />
			<RollerHingeSupport data-testid="roller-hinge" position={[90, 40]} />
		</>)
		expect(screen.getByTestId('beam').querySelector('.beamLine')?.getAttribute('stroke-width')).toBe('6')
		expect(screen.getByTestId('beam').querySelectorAll('.beamStrut')).toHaveLength(1)
		expect(screen.getByTestId('fixed').getAttribute('transform')).toContain('translate(10 80)')
		expect(screen.getByTestId('rotated-fixed').getAttribute('transform')).toContain('rotate(-90)')
		expect(screen.getByTestId('roller-hinge').querySelectorAll('circle').length).toBeGreaterThan(1)
		expect(container.querySelector('svg')?.contains(screen.getByTestId('fixed'))).toBe(true)
	})

	test('renders force and moment arrows with reusable drawing primitives', () => {
		const { container } = renderDrawing(<>
			<Force angle={0} color="red" data-testid="force" length={{ pixelDistance: 40 }} position={[50, 50]} />
			<Force angle={Math.PI / 2} data-testid="vertical-force" length={{ pixelDistance: 40 }} position={[50, 50]} />
			<Moment clockwise color="blue" data-testid="moment" position={[25, 25]} radius={{ pixelDistance: 15 }} />
			<Moment clockwise data-testid="half-moment" position={[50, 50]} radius={{ pixelDistance: 15 }} spread={Math.PI} />
		</>)
		expect(screen.getByTestId('force').getAttribute('stroke')).toBe('red')
		expect(screen.getByTestId('force').getAttribute('d')).toBe('M10 50 L35 50')
		expect(screen.getByTestId('vertical-force').getAttribute('d')).toBe('M50 10 L50 35')
		expect(screen.getByTestId('moment').getAttribute('stroke')).toBe('blue')
		expect(screen.getByTestId('half-moment').getAttribute('d')).toMatch(/^M50 65/)
		expect(container.querySelectorAll('polygon')).toHaveLength(4)
	})

	test('keeps load labels independent from a math-rendering library', () => {
		renderDrawing(<LoadLabel load={{ type: ForceType, position: [50, 50], angle: 0 }}><strong>F_A</strong></LoadLabel>)
		expect(screen.getByText('F_A').tagName).toBe('STRONG')
	})

	test('provides a temporary data renderer with semantic source colors', () => {
		const { container } = renderDrawing(renderEngineeringDiagram([{ type: ForceType, position: [50, 50], angle: 0, source: 'reaction' }]))
		expect(document.querySelector('.force')?.getAttribute('stroke')).toBe(defaultEngineeringDiagramColors.reaction)
		expect(container.querySelector('svg > g')?.getAttribute('transform')).toBe('translate(0 0) rotate(0) scale(1)')
		expect(() => renderEngineeringDiagram({ type: 'Unknown' })).toThrow('unknown type')
		expect(() => renderEngineeringDiagram({ type: MomentType, position: [0, 0], clockwise: false, source: 'external' })).not.toThrow()
	})
})

function renderDrawing(children: ReactNode) {
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 100 } as DOMRect)
	return render(<Drawing view={{ type: 'identity', width: 100, height: 100, yDirection: 'up' }}>{children}</Drawing>)
}
