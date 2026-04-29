drop extension if exists "pg_net";

alter table "public"."pending_users" drop column "created_at";

alter table "public"."pending_users" alter column "expires_at" set data type timestamp with time zone using "expires_at"::timestamp with time zone;

alter table "public"."pending_users" add constraint "check_code_length" CHECK ((char_length((code)::text) = 5)) not valid;

alter table "public"."pending_users" validate constraint "check_code_length";


