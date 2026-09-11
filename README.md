# All Around Services of NWFL — website

A hand-built replacement for <https://www.allaroundservicesnwfl.com/>.

Static HTML, CSS and JavaScript. **No framework, no build step, no dependencies.**
Open any `.html` file in a browser and it works. Drop the folder on any host and
it works there too.

---

## What's here

```
index.html         Home
kitchens.html      Kitchen remodeling
bathrooms.html     Bathroom remodeling
exteriors.html     Decks & porches (#decks), siding (#siding), fences (#fences)
painting.html      Interior/exterior painting + cabinet refinishing
work.html          Photo gallery (filterable, with a lightbox)
about.html         About Steve & the company
reviews.html       All seven customer reviews
contact.html       Free-estimate form
404.html           Not-found page

assets/css/site.css   One stylesheet, all pages
assets/js/site.js     One script, all pages (no libraries)
assets/img/           36 project photos as WebP, plus the OG image and icons

robots.txt  sitemap.xml  site.webmanifest  .nojekyll
```

The header and footer are **deliberately duplicated** into every page rather than
templated — that keeps the site build-free. A change to the nav or footer means a
find-and-replace across the ten `.html` files.

---

## Before this goes live — the four things to do

Search the HTML for `EDIT:` to find these in place.

1. **Wire up the contact form.** `contact.html` posts to
   `https://formspree.io/f/REPLACE_FORM_ID`. Create a free form at
   [formspree.io](https://formspree.io), then replace `REPLACE_FORM_ID` with the
   real ID. *Until you do, the form still works* — it opens the visitor's email
   app with everything filled in and addressed to `steve@allaroundservicesnwfl.com`.
2. **Confirm the service area.** `index.html` and `about.html` list
   Santa Rosa Beach / WaterColor / 30A / Bay County. Add or remove communities.
3. **Confirm the five-step process** on `kitchens.html` ("What to expect").
   It is written to be accurate and generic — adjust it to how jobs actually run.
4. **Add a Google review link** on `reviews.html` so customers can leave one
   (there is a placeholder comment where it goes). A Florida contractor licence
   number, if there is one, belongs in the footer — it lifts trust and rankings.

---

## Photography

All 36 photos are the client's own, pulled from the existing site and re-encoded
to WebP at two or three widths each with `srcset`.

**Four images from the old site were deliberately left out:**

- one exact byte-for-byte duplicate of another gallery photo;
- three staged, professionally-lit banner shots (the old home-page banner, the
  "Envision Your Remodeled Space" image and one living-room shot). They are much
  higher resolution than everything else and styled like stock photography, so
  showing them as completed work would be a claim the rest of the gallery does
  not support. The site says "every photo here is a job we did" — that stays true.

If Steve confirms any of those three are his jobs, they can be added back to
`assets/img/` and listed in the gallery.

Photo captions are descriptive rather than specific (no addresses or client
names). Replace them with real project names whenever those are available.

---

## Running it locally

```bash
python -m http.server 8808
```

Then open <http://localhost:8808>. (There is also an `allaround` entry in
`../.claude/launch.json`.)

---

## Design notes

- **The ring.** "All Around" is taken literally: the hero is a rotating ring of
  the company's services wrapped around a photo that cycles through them, and the
  logo mark is a ring whose arc fills as you scroll the page.
- **Palette.** Warm limewash `#F3EFE6`, ink `#15191D`, deep navy `#0D1A28`, and a
  clay red-orange `#BE441C`. The navy and orange are a deliberate nod to the old
  brand's colours, matured. All text/background pairs meet WCAG AA.
- **Type.** Fraunces (variable, `WONK` on) for display; Schibsted Grotesk for
  everything else. Both from Google Fonts.
- **Shape.** Arched photo frames echo the coastal architecture and the arched
  mirrors in the bathroom photos.
- **Motion** is subtle and every bit of it is disabled under
  `prefers-reduced-motion`.

## Accessibility & performance

- Semantic landmarks, one `<h1>` per page, skip link, visible focus rings.
- The lightbox is a real dialog: focus moves into it, `Tab` is trapped, `Esc`
  closes it, arrow keys move between photos, and focus returns to the tile.
- Every image has an `alt`, intrinsic `width`/`height` (no layout shift),
  `loading="lazy"` below the fold, and `srcset`.
- No horizontal scroll from 320px to 1440px+.
- `HomeAndConstructionBusiness` JSON-LD on the home page with hours, service
  area, phone and services; canonical URLs and Open Graph tags on every page.
- Zero JavaScript dependencies. The only third-party request is Google Fonts.
