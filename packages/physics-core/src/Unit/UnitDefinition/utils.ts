import { type UnitDefinition } from './UnitDefinition'
import { unitDefinitions, unitDefinitionList } from './unitDefinitions'

export function findUnitDefinition(str: string): UnitDefinition | undefined {
	return unitDefinitions[str] ?? unitDefinitionList.find(unit => unit.equalsString(str))
}
