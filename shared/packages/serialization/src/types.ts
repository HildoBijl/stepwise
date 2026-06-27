export type SerializableObject = {
	type: string
}

export type SerializedObject<Type extends string = string, SerializedValue = unknown> = {
	type: Type
	value: SerializedValue
}

export type SerializerEntry<DomainValue extends SerializableObject, Serialized extends SerializedObject> = {
	serialize: (value: DomainValue) => Serialized
	deserialize: (serialized: Serialized) => DomainValue
}
