-- Setting up permissions for api connection
-- Run with:
--
-- psql $DATABASE $USER \
-- 	-v db=migrations \
-- 	-v user=api \
-- 	-v schema=public \
-- 	-f setup-api-user.sql

revoke all on database :db from :user;
alter role :user with login;
grant connect on database :db to :user;
grant select, insert, update, delete on all tables in schema :schema to :user;
alter default privileges in schema :schema grant select, insert, update, delete on tables to :user;
