-- Setting up permissions for api connection
-- Run the following command on the server, providing
-- the $ENV variables from the configuration
--
-- psql $POSTGRES_DB $POSTGRES_ADMIN_USER \
-- 	-h $POSTGRES_HOST \
-- 	-p $POSTGRES_PORT \
-- 	-v db=$POSTGRES_DB \
-- 	-v user=api \
-- 	-v schema=public \
-- 	-f /app/ops/db/setup-api-user.sql

revoke all on database :db from :user;
alter role :user with login;
grant connect on database :db to :user;
grant select, insert, update, delete on all tables in schema :schema to :user;
alter default privileges in schema :schema grant select, insert, update, delete on tables to :user;
