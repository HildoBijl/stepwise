import { demoModulePresentation } from './demo.js'
import { mathematicsModulePresentation } from './mathematics.js'
import { mechanicsModulePresentation } from './mechanics.js'
import { physicsModulePresentation } from './physics.js'

export const modulePresentation = {
	...demoModulePresentation,
	...mathematicsModulePresentation,
	...mechanicsModulePresentation,
	...physicsModulePresentation,
}
