# Debug Session — Blog Generator Deep Fix

Date: 2025-12-18
Workspace: `/workspace`
Branch: `cursor/blog-generator-deep-fix-d9d8`

## Step 0 — Baseline reproduction (how it’s invoked)

### Entry points found (evidence)

- Admin page UI: `app/admin/blog-generator/page.tsx` renders `components/BlogGeneratorClient.tsx`.
- Generate request from UI:
  - Client calls `POST /api/admin/generate-blog` (see `components/BlogGeneratorClient.tsx`, `handleGenerate`).
- Publish request from UI:
  - Client calls `POST /api/admin/posts` (see `components/BlogGeneratorClient.tsx`, `handlePublish`).
- Rendering:
  - Blog index page: `app/blog/page.tsx` reads posts via `lib/blog.ts:getPublishedBlogPosts()`.
  - Blog detail page: `app/blog/[slug]/page.tsx` reads post via `lib/blog.ts:getPostBySlug()`.

### Expected vs actual (initial)

- Expected:
  - Selecting **Image Source = AI Generated (DALL-E 3)** should generate an image and return a usable image URL.
  - Publishing should store the featured image and the blog list/detail pages should render it.

- Actual (from code inspection; runtime reproduction still pending):
  - `POST /api/admin/generate-blog` previously **did not call any image generation API**; it only handled uploaded images and external URLs.
  - Frontend blog rendering previously **ignored the stored `blog_posts.image` column**, and instead derived `post.image` from the **first `<img>` tag in `content`**.

## Observed code-level issues (evidence)

### 1) AI image generation path was missing

- UI offers `imageSource: 'ai'` and explicitly says “AI Generated (DALL-E 3)”.
  - File: `components/BlogGeneratorClient.tsx`.
- Server handler `app/api/admin/generate-blog/route.ts` previously:
  - Used `OPENAI_API_KEY` for text generation via `https://api.openai.com/v1/chat/completions`.
  - Had **no call** to `https://api.openai.com/v1/images/generations`.

### 2) Stored featured image was not used by blog pages

- Posts are stored with an `image` column in DB via `app/api/admin/posts/route.ts`.
- But `lib/blog.ts:getPublishedBlogPosts()` did not select `image` and instead set `image: extractFirstImage(post.content)`.
- `lib/blog.ts:getPostBySlug()` selected `image` but then overwrote it with `image: extractFirstImage(post.content)`.

## Fix instrumentation added (evidence)

- Correlation ID:
  - `POST /api/admin/generate-blog` reads `x-correlation-id` / `x-request-id` or generates an ID, returns it in JSON as `correlationId` and response header `x-correlation-id`.
- Structured logs:
  - `app/api/admin/generate-blog/route.ts` emits JSON logs for stages: `received`, `validating_request`, `generating_text`, `generating_images`, `done`, `failed`.
- DB “generation run” record:
  - New table `blog_generation_runs` is created by `lib/db.ts` init.
  - The generator endpoint creates/updates a row per correlationId.
  - `POST /api/admin/posts` updates the run to `published` when the generator UI passes `correlationId`.

## Environment knobs added

- `BLOG_DB_PATH`:
  - Overrides the SQLite path (default: `data/web44ai.db`).
  - Used by both `lib/blog.ts` (read path) and `lib/db.ts` (read/write path).
  - Enables repeatable tests using a temp DB.

## Manual “test data” seeding (ready to use)

I seeded a published post into a disposable DB for manual UI testing:

- DB: `/tmp/web44ai-manual.db`
- Slug: `manual-test-1766066910310`

To see it render as a real page, start the dev server with the same DB:

- `BLOG_DB_PATH=/tmp/web44ai-manual.db npm run dev`
- Then open: `http://localhost:3000/blog/manual-test-1766066910310`

(You can also run `BLOG_DB_PATH=/tmp/web44ai-manual.db node scripts/seed-test-blog-post.js` to seed a new one.)

## How to inspect a specific generation run

After clicking **Generate Blog Post**, the preview JSON includes `correlationId` and the response header includes `x-correlation-id`.

You can fetch the persisted run record (admin-only):

- `GET /api/admin/generate-blog/<correlationId>`
