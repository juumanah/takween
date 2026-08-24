# Roadmap

Takween v1 ships as a focused MVP on purpose. These are the features that were intentionally left out of v1, roughly ordered by expected impact:

## Near-term
- **In-app notifications** — email or in-app alert when a listing owner receives a new join request, or when an applicant's request is accepted/rejected.
- **Image uploads for avatars** — currently avatar is a pasted URL; add direct upload via Supabase Storage.
- **Edit listing** — currently a listing can be closed/reopened/deleted but not edited after creation.
- **Skill autocomplete** — suggest existing skills while typing instead of free-text + comma separation.

## Mid-term
- **In-app chat** — once two sides are matched, let them message inside Takween instead of relying on the external contact method.
- **Saved / bookmarked listings** — let users bookmark opportunities to revisit later.
- **Better discovery** — pagination or infinite scroll on `/explore`, plus sorting (soonest deadline, most recent).

## Long-term / exploratory
- **Lightweight matching suggestions** — surface listings whose required skills overlap with a user's profile skills (not full AI matching — a simple relational query first).
- **Team pages** — once a listing is fully staffed, generate a shared team page linking all accepted members.
- **Public API** — read-only endpoints for listings, for university club integrations.
