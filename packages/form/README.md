# @step-wise/form

`@step-wise/form` provides headless form state, input-value conversion, validation, and submission infrastructure for React applications. The package is being developed alongside the legacy Step-Wise frontend form before consumers are migrated.


## Value lifecycle

Fields edit an `InputState`. Each field normalizes that editor state into a serializable `InputValue` and hydrates stored input values back into editor state. The form applies its provided `interpretInput` operation to obtain `DomainValue`s for validation and submission.

```text
InputState --normalizeInput--> InputValue --interpretInput--> DomainValue
InputState <--hydrateInput---- InputValue
```

Validation and other derived results are associated with normalized `InputValue`s. Editor-only changes such as moving a cursor therefore preserve cached results when the normalized input value remains equal.


## Package boundary

This package owns form state, field registration contracts, normalization and hydration orchestration, interpretation caching, validation, and submission. Input rendering, focus management, virtual keyboards, grading feedback, and exercise behavior belong to higher-level packages.
