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
  - `POST /api/admin/generate-blog` currently **does not call any image generation API**; it only handles uploaded images and external URLs.
  - Frontend blog rendering currently **ignores the stored `blog_posts.image` column**, and instead derives `post.image` from the **first `<img>` tag in `content`**.

## Observed code-level issues (evidence)

### 1) AI image generation path is missing

- UI offers `imageSource: 'ai'` and explicitly says “AI Generated (DALL-E 3)”.
  - File: `components/BlogGeneratorClient.tsx` (dropdown includes `ai` option).
- Server handler `app/api/admin/generate-blog/route.ts`:
  - Uses `OPENAI_API_KEY` for text generation via `https://api.openai.com/v1/chat/completions`.
  - **No call** to `https://api.openai.com/v1/images/generations` (or any image provider).
  - The returned response payload also does not include a truthful `aiImageGenerated` flag.

### 2) Stored featured image is not used by blog pages

- Posts are stored with an `image` column in DB via `app/api/admin/posts/route.ts`.
- But `lib/blog.ts:getPublishedBlogPosts()` does not SELECT `image` and instead sets `image: extractFirstImage(post.content)`.
- `lib/blog.ts:getPostBySlug()` SELECTs `image` but then overwrites it with `image: extractFirstImage(post.content)`.
- Result: even if publish stores `image`, the UI will show placeholder images unless the HTML content contains `<img ...>`.

## Fix instrumentation added (evidence)

- Correlation ID:
  - `POST /api/admin/generate-blog` now reads `x-correlation-id` / `x-request-id` or generates a UUID and returns it in the JSON response as `correlationId` and response header `x-correlation-id`.
- Structured logs:
  - `app/api/admin/generate-blog/route.ts` now emits JSON logs for stages: `received`, `validating_request`, `generating_text`, `generating_images`, `done`, `failed`.
- DB “generation run” record:
  - New table `blog_generation_runs` is created by `lib/db.ts` init.
  - The generator endpoint creates/updates a row per correlationId.
  - `POST /api/admin/posts` updates the run to `published` when the generator UI passes `correlationId`.

## Environment knobs added

- `BLOG_DB_PATH`:
  - Overrides the SQLite path (default: `data/web44ai.db`).
  - Used by both `lib/blog.ts` (read path) and `lib/db.ts` (read/write path).
  - Enables repeatable tests using a temp DB.

## Reproduction plan (pending execution)

### Local run

1. Install deps: `npm install`
2. Start dev server: `npm run dev`
3. Visit `/admin/login` and authenticate.
4. Visit `/admin/blog-generator`.
5. Generate with:
   - Topic: `Test blog generator`
   - Primary keyword: `test keyword`
   - Image Source: `AI Generated (DALL-E 3)`
6. Capture:
   - Browser console logs
   - Network request/response for `POST /api/admin/generate-blog`
   - Server logs for the same request
7. Publish, then verify:
   - `POST /api/admin/posts` response
   - DB row in `data/web44ai.db`
   - `/blog/<slug>` returns 200 and shows featured image

### Correlation IDs / request IDs

- To be added once instrumentation is in place.

### Notes

- This repo uses SQLite (`data/web44ai.db`) and writes images to `public/blog-images/`.
- In serverless environments (e.g. Vercel), runtime writes to the repo filesystem are not durable; this may be a production-only failure class for both DB writes and image writes.

## How to inspect a specific generation run

After clicking **Generate Blog Post**, the preview JSON includes `correlationId` and the response header includes `x-correlation-id`.

You can fetch the persisted run record (admin-only):

- `GET /api/admin/generate-blog/<correlationId>`
