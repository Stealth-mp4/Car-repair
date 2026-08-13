/* ---------------------------------------------------------------------------
 * 0006_opening_hours.sql — a fourth settings group.
 *
 * `hours` is display text ("Mon-Sat" / "12PM-8PM"). This is the structured
 * version search engines read: weekday names and 24-hour times, in the shape
 * schema.org's OpeningHoursSpecification wants.
 *
 * They stay separate rather than one being derived from the other. Display
 * hours can legitimately say "Closed", "By appointment" or "Holiday hours",
 * and a parser turning that into weekday arrays is a parser that will quietly
 * publish wrong hours to Google.
 * ------------------------------------------------------------------------- */

alter table settings drop constraint settings_key_check;

alter table settings add constraint settings_key_check
  check (key in ('business', 'hours', 'social', 'openingHours'));
