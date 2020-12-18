# Step-Wise API

The Step-Wise API is a [GraphQL API](https://graphql.org/) based on the [Apollo platform](https://www.apollographql.com/). It uses [Sequelize](https://sequelize.org/) to connect to a [PostgreSQL database](https://www.postgresql.org/).


## Experimenting with the API

Have you got Step-Wise running locally? Once you have started up the API, you can go to <http://localhost:4000/graphql> for an interactive GraphQL tool.


## Development commands for the database

For interacting with the database, there are a few scripts you can use in the command line.

- `npm run db:clear` erases the entire database schema (content and structure) and sets up a fresh one.
- `npm run db:seed` fills sample data into the database.
- `npm run db:migrate` checks whether there are pending migrations.
	- `npm run db:migrate -- up` applies all pending migrations.
	- `npm run db:migrate -- down` reverts the last migration.

See the `script` section in the respective `package.json` files for the calls, and the `scripts` folder for the actual definitions.


## Database structure, API structure and migrations

The current database structure is defined in the `database` folder. This contains various Sequelize models defining tables.

The GraphQL server is defined in the `graphql` folder. First there are various `schemas` that determine what kind of calls the API accepts. Once such a call takes place, the `resolvers` deal with it, gathering data from the database in the appropriate way.

When the database structure changes, the `models` need to change. In addition, in the `migrations` folder, an `up` and `down` migration function needs to be defined which adjusts the database accordingly. Upon deploying the database is automatically migrated up to the latest version.


## Server and authentication

The server, including authentication, is defined in the `server` folder. For authentication we use [SURFconext](src/server/surfConext/).

For authentication on localhost, mock user data is used. When logging in, you can choose from a list of sample users, which is convenient for testing. These sample users are defined in the `surfConextMockData.json` file. When the local server restarts (for instance after a file change) it tries to remember which user was last logged in. This prevents you from having to log in all the time. This is done by storing the `lastSessionId` in a separate file.