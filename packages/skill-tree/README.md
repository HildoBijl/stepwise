# Step-Wise Skill Tree

This package contains the definition of the Skill Tree used within Step-Wise. Its code consists of three parts.

## Defining the raw Skill Tree

This is done in the [rawSkillTree](./src/rawSkillTree), separately for each subject. To adjust the Skill Tree, go here. For notation conventions, see the [skill-definition](../skillDefinition/) package.

## Processing the raw Skill Tree

This is done in the [processing](./src/processing.ts) file.

## Utility functions

The utility functions from the [skill-definition](../skillDefinition/) all require the Skill Tree as argument. To short-cut this, we set up the same functions but then with the Skill Tree already implicit in them, so it doesn't have to be passed as argument.
