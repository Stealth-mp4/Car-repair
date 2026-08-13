/* ---------------------------------------------------------------------------
 * 0010_message_phone.sql — messages need a phone number.
 *
 * The table was written for email enquiries: `email` is NOT NULL and there is
 * nowhere to put a number. The site's forms are the other way round — every
 * lead must give a phone, email is optional — because this is a shop people
 * ring, not a SaaS signup.
 *
 * Without this column a lead's number can only survive as prose inside
 * `preview`, which means the console can't offer "call them back" without
 * regex-ing a phone number out of a sentence.
 *
 * Nullable: rows created by hand in the console may genuinely have no number,
 * and existing seeded rows have none.
 * ------------------------------------------------------------------------- */

alter table messages add column if not exists phone text;

-- `email` stays NOT NULL rather than being relaxed: an empty string is already
-- how "no email given" is represented elsewhere in this schema, and changing
-- the constraint would be a wider change than this needs.
