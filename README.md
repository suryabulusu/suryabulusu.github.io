## Personal Website

The site is [suryabulusu.github.io](https://suryabulusu.github.io)

## Stack

- [Eleventy](https://www.11ty.dev/) static site generator
- Nunjucks templates for layouts and pages
- Plain HTML for Distill posts with passthrough assets
- Node.js tooling for linting, formatting, and builds

## Project Structure

```
src/
  index.njk               # About page (home)
  posts/                  # Post archive + Distill posts
    feed.njk              # RSS feed (outputs /feed.xml)
  projects/               # Projects page
  presentations/          # Talks, workshops
  code/                   # Code & open source listings
  tags/                   # Tag index + per-tag pages
  now/                    # Now page
  _includes/
    layouts/
      base.njk            # Global <head> + shell
      page.njk            # Base page layout with nav/footer
    partials/
      nav.njk             # Main site navigation
  _data/
    site.js               # Global metadata (title, description, email)
    writingElsewhere.js   # External essays
    talks.js              # Talks & presentations
    resources.js          # Workshops and guides
    codeRepos.js          # Open-source projects
  assets/                 # Images, PDFs, misc assets
  css/                    # Styles (site.css)
  js/                     # Disqus loader, TOC helpers, talk tag filter
```

- Distill HTML posts live under `src/posts/<slug>/index.html`. Each has YAML front matter (`layout: null`) so Eleventy emits them unchanged while still indexing metadata.
- Asset references inside post folders remain the same (e.g. `/posts/mangli-kanduri/...`). Eleventy passthrough keeps the directory layout intact.

## Commands

```
npm install          # install deps + setup git hooks
npm run dev          # eleventy --serve (watch + local server)
npm run build        # eleventy (static build into _site/)
npm run lint         # run ESLint on JS files
npm run format       # auto-format all files with Prettier
npm run format:check # check if files are formatted correctly
```

The output directory `_site/` is ignored by git.

## Git Hooks

This project uses [Husky](https://github.com/typicode/husky) to run pre-commit hooks. When you commit, `lint-staged` automatically:

- Formats staged files with Prettier
- Lints and fixes staged JS files with ESLint

This ensures consistent code quality without manual intervention.

## TODO / Next Steps

- Revisit `/posts/` once there are enough entries to bring back Eleventy pagination.
