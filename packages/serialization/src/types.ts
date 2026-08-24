export type SerializableDomainObject = {
	type: string
}

export type SerializedDomainObject<Type extends string = string, SerializedValue = unknown> = {
	type: Type
	value: SerializedValue
}

export type SerializationAdapter<TDomainValue extends SerializableDomainObject, TSerialized extends SerializedDomainObject> = {
	serialize: (domainValue: TDomainValue) => TSerialized
	deserialize: (serializedValue: TSerialized) => TDomainValue
}
