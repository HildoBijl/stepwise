# Database migrations

## Setup a new migration

1. Create a new .js-file prefixed with the next consecutive number, e.g. `014_my-next-migration.js`.
2. Export a `up` and a `down` function from that module.
   These functions are async and receive a [`queryInterface`](https://sequelize.org/master/class/lib/dialects/abstract/query-interface.js~QueryInterface.html) as parameter.
   `up` is the procedure for applying the migration, `down` is for reverting it.
3. Adjust the [database models](../src/database/models) and all dependent code to reflect the structural changes.
   Keep in mind that the models are an independent representation of the database structure, they don’t adjust automatically.

## Testing

Run and thoroughly test the migration locally.

For verifying that the `down` migration correctly restores the previous state, you can compare the database structure before and after:

```
pg_dump --schema-only stepwise --file before.sql
npm run db:migrate up
npm run db:migrate down
pg_dump --schema-only stepwise --file after.sql
diff before.sql after.sql
```

(You also need to pass your database credentials to `pg_dump`.)

When the `diff` command produces empty output, it means that the structure is exactly the same as before.

## Applying in production

Once the migration is in master, the release script will check for pending migrations and run them automatically when releasing.

Note that you cannot run `down` migrations in production.
In order to “undo” a migration there, copy the migration you want to revert and flip the `up` and `down` procedures.
Also, remember to revert all other related code changes (either manually or by reverse committing).

Database migration in production are always a somewhat delicate undertaking.
For non-trivial migrations it’s best to reduce risks by splitting them up into multiple smaller steps.
