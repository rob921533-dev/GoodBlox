# GoodBlox

GoodBlox is an **original** browser-based gaming/social platform inspired by the general
concept of game discovery and user-created games. It is **not** affiliated with, endorsed
by, or derived from Roblox Corporation. No Roblox source code, assets, or branding is used.

This is a **real full-stack application**:

- Frontend: static HTML + vanilla JS (no build step, deployable to any static host)
- Backend: **Supabase** (Postgres + Auth + Row Level Security + Realtime)
- Authentication is **real Supabase Auth** — not localStorage, not simulated.

---

## 1. Requirements

- Node.js 18+ (only needed if you want to run the local static server)
- A free [Supabase](https://supabase.com) account
- Any modern browser

---

## 2. Create a Supabase project

1. Go to <https://supabase.com> → **Start your project**.
2. Create a new project. Pick a region close to you.
3. Wait for provisioning to complete (about 1 minute).

---

## 3. Find your Supabase URL and Anon key

In the Supabase dashboard:

1. Open your project.
2. Left sidebar → **Project Settings** (gear icon) → **API**.
3. Copy:
   - **Project URL** — looks like `https://abcdefghijkl.supabase.co`
   - **anon public** key — a long JWT starting with `eyJ...`

> ⚠️ **NEVER** copy the `service_role` key into frontend code.
> The anon key is safe in the browser **because Row Level Security is enabled**.
> The service_role key bypasses RLS and would give anyone full control of your database.

---

## 4. Configure `config.js`

Open `config.js` and paste your values:

```js
window.GOODBLOX_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOi...", // the anon / public key
  ...
};
```

Do not commit real keys to a public repository. For deployment, either:

- Inject the config via a small server-side template, or
- Keep config.js out of version control and provide config.example.js.

---

## 5. Run the project locally

Any static server works. The simplest:

```bash
npx serve .
# or
python3 -m http.server 5173
```

Then open http://localhost:5173/.

You must serve over http://localhost or https:// — opening index.html as a
file:// URL will break Supabase redirect URLs.

---

## 6. Execute sql/schema.sql

- In Supabase, open SQL Editor → New query.
- Paste the entire contents of sql/schema.sql.
- Click Run.

This creates:

- Tables: profiles, games, game_likes, friendships, messages, notifications, avatars
- Row Level Security policies on every table
- Triggers:
  - on_auth_user_created → auto-creates a profiles row + avatars row for every new user
  - on_game_like_change → keeps games.likes in sync and creates a notification
  - on_friend_request, on_friend_accepted → create notifications
  - on_new_message → creates a notification for the receiver
- Realtime publication for messages

---

## 7. Execute sql/seed.sql

**Important:** create one account first using the signup page — the seed data
attaches demo games to the oldest existing profile.

Then run sql/seed.sql in the SQL Editor. It will:

- Insert 10+ fictional demo games owned by that first profile
- Print a notice if no profile exists yet

---

## 8. How Supabase Auth works here

- Signup (signup.html) → supabase.auth.signUp() with username and display_name
  in options.data. Supabase stores them in raw_user_meta_data.
- A Postgres trigger (handle_new_user) then creates the profiles row with a
  unique, sanitised username and the avatars row with defaults.
- Login (login.html) → supabase.auth.signInWithPassword().
- Session → the Supabase JS client persists the session in localStorage
  under the hood and auto-refreshs it. index.html calls getSession() on boot,
  so refreshing the page keeps you signed in.
- Sign out → supabase.auth.signOut().
- Password reset → supabase.auth.resetPasswordForEmail() with a
  redirectTo back to your site.

⚠️ **Email confirmation**

By default a new Supabase project requires email confirmation before the user
can log in. During testing you can:

- Supabase dashboard → Authentication → Providers → Email →
  toggle Confirm email off, or
- Leave it on and click the confirmation link Supabase emails you.

The signup page shows a clear message in both cases.

---

## 9. Configure redirect URLs

Supabase dashboard → Authentication → URL Configuration:

- Site URL: http://localhost:5173 (or your deployed origin)
- Additional Redirect URLs:
  - http://localhost:5173/login.html
  - https://YOUR-DOMAIN/login.html

Otherwise password-reset emails will link to the wrong place.

---

## 10. Deploy to a static host

The project is entirely static. Deploy to:

- Netlify / Vercel (drag & drop the folder)
- GitHub Pages
- Cloudflare Pages
- Any static S3 bucket

Remember to update Site URL and Redirect URLs in Supabase to your production domain.

---

## 11. Security warnings

- Never commit a real service_role key to git.
- Never disable RLS on any table.
- Never trust creator_id, sender_id, user_id sent from the browser —
  RLS policies in schema.sql enforce ownership at the database level.
- All user-generated content is HTML-escaped before rendering (see esc() in app.js).
- The anon key is public by design. Treat it as public information.

---

## 12. Testing checklist

- [ ] Signup sends email confirmation / creates profile
- [ ] Login works, logout works
- [ ] Session survives page refresh
- [ ] Profile auto-created, editable
- [ ] Games load from Supabase
- [ ] Creating a game inserts a row with your auth.uid() as creator_id
- [ ] Editing / deleting a game only works for the owner (RLS)
- [ ] Liking a game inserts into game_likes, unlike deletes it
- [ ] Search queries Supabase, not a local array
- [ ] Friend request → notification → accept → friendship
- [ ] Messages persist, realtime works with two browsers
- [ ] Notifications appear, mark-as-read works
- [ ] Avatar saves to Supabase
- [ ] Trying to update another user's profile fails (RLS)
- [ ] Mobile layout works

---

## 13. License

MIT. See package.json.
