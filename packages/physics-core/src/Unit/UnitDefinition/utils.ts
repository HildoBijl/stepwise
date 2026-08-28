import { type UnitDefinition } from './UnitDefinition.ts'
import { unitDefinitions, unitDefinitionList } from './unitDefinitions.ts'

export function findUnitDefinition(str: string): UnitDefinition | undefined {
	return unitDefinitions[str] ?? unitDefinitionList.find(unit => unit.equalsString(str))
}
