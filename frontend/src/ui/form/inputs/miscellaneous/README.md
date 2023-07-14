# Miscellaneous input fields

The input fields here are all input fields that don't fit nicely into one of the other categories. Currently we have the following input fields available.


## Multiple Choice

The `MultipleChoice` input field is your typical radiobox/checkbox list of options.

### Return type

The multiple choice input type gives the following value.

- If multiple choices are allowed: an array of integers. This array could be empty, when no options have been chosen.
- If multiple choices are *not* allowed: an integer, or undefined if no option has been chosen.

The given integers correspond to the chosen option, where counting starts from `0`. The first option is hence option `0`, and if the student selects the first and third option, the result is `[0, 2]`.

### Options

The following options are specific for this input field.

- `choices` (default `[]`): the options to display, in an array. These are strings or React elements.
- `multiple` (default `false`): are multiple choices allowed? If set to `true`, checkboxes are used instead of radio buttons.
- `pick` (default `undefined`): choose a subset of the choices given. If there are six choices and pick is set to four, then only four of the six choices are shown. If left undefined, all choices are included.
- `include` (default `[]`): only used when pick is defined. The given options are then definitely included in the pick. If you set `include` to `[0,3]`, then choices `0` and `3` are definitely picked, along with a few other random ones. This is useful to make sure you include the correct answer in the random selection of answers. If only a single option has to be included, no array is needed: entering a number would suffice too.
- `randomOrder` (default `false`): should we show the choices in a random order? Behind the scenes the original order is still used: this only relates to how it is shown to the user.

### Validation functions

- `any`: Any submission (also with zero answers) is fine.
- `nonEmpty`: (Default) Checks whether at least one value has been chosen.
