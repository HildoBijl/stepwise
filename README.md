# Stepwise

## Operational tasks

- **Release**: `ssh -t step-wise.com release`
- **View latest server logs**: `ssh -t step-wise.com logs`
- **Change configuration**: `ssh -t step-wise.com configure`
- **Perform health check**: `ssh -t step-wise.com health`
- **Issue HTTPS certificates**: `ssh -t step-wise.com issue-certificates`

See the [`ops/`](ops/) folder for background information.

## Development commands

See the `script` section in the respective `package.json` files.

For interacting with the database:

- `npm run db:clear` Erase the entire database schema (content and structure) and sets up a fresh one
- `npm run db:seed` Fills sample data into the DB
- `npm run db:migrate` Checks whether there are pending migrations
	- `npm run db:migrate -- up` Applies all pending migrations
	- `npm run db:migrate -- down` Reverts the last migration
