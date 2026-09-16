import { demoModuleCatalog } from './demo.js'
import { mathematicsModuleCatalog } from './mathematics.js'
import { mechanicsModuleCatalog } from './mechanics.js'
import { physicsModuleCatalog } from './physics.js'

export const moduleCatalog = {
	...demoModuleCatalog,
	...mathematicsModuleCatalog,
	...mechanicsModuleCatalog,
	...physicsModuleCatalog,
}
