#!/usr/bin/env node
/**
 * Schedule Buffer posts from buffer-posts.json.
 * Supports Buffer GraphQL API (BUFFER_API_KEY) and legacy v1 (BUFFER_ACCESS_TOKEN).
 * Usage: node scripts/schedule-buffer-posts.mjs [--dry-run]
 */
import fs from "fs";
import path from "path";

const dryRun = process.argv.includes("--dry-run");
const apiKey = process.env.BUFFER_API_KEY?.trim();
const legacyToken = process.env.BUFFER_ACCESS_TOKEN?.trim();
const channelId =
  process.env.BUFFER_CHANNEL_ID?.trim() ||
  process.env.BUFFER_PROFILE_ID?.trim() ||
  "69d26c06031bfa423cd0c50d";

const bufferPath = path.join(process.cwd(), "seo-growth-police-station-agent", "buffer", "buffer-posts.json");
const posts = JSON.parse(fs.readFileSync(bufferPath, "utf8"));

const token = apiKey || legacyToken;

if (!token && !dryRun) {
  const inCi = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";
  console.log("No Buffer credentials found. Set BUFFER_API_KEY (preferred) or BUFFER_ACCESS_TOKEN.");
  console.log("  Generate a key: Buffer → Settings → API → Personal Keys");
  console.log("  For GitHub Actions: add BUFFER_API_KEY as a repository secret");
  console.log("\nCalendar files ready:");
  console.log("  seo-growth-police-station-agent/buffer/buffer-posts.csv");
  console.log("  seo-growth-police-station-agent/buffer/buffer-posts.json");
  console.log(`\n${posts.length} posts ready. Upload at https://publish.buffer.com`);
  if (inCi) {
    console.log("\nSkipping schedule in CI until BUFFER_API_KEY or BUFFER_ACCESS_TOKEN is configured.");
    process.exit(0);
  }
  process.exit(1);
}

const results = {
  organization: "My Organization",
  organizationId: "69d26bdf0f822245c9a723c4",
  channel: "Police Station Agent (LinkedIn)",
  channelId,
  scheduledAt: new Date().toISOString(),
  api: apiKey ? "graphql" : "v1",
  posts: [],
};

async function scheduleGraphQL(item) {
  const text = `${item.text}\n\n${item.hashtags}`;
  const dueAt = `${item.date}T08:30:00.000Z`;
  const query = `
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess {
          post { id dueAt }
        }
        ... on MutationError {
          message
        }
      }
    }
  `;
  const res = await fetch("https://api.buffer.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query,
      variables: {
        input: {
          text,
          channelId,
          schedulingType: "automatic",
          mode: "customScheduled",
          dueAt,
        },
      },
    }),
  });
  const data = await res.json();
  if (!res.ok || data.errors?.length) {
    throw new Error(JSON.stringify(data.errors || data));
  }
  const result = data.data?.createPost;
  if (result?.message) {
    throw new Error(result.message);
  }
  return {
    id: result?.post?.id,
    dueAt: result?.post?.dueAt || dueAt,
  };
}

async function scheduleV1(item) {
  const text = `${item.text}\n\n${item.hashtags}`;
  const body = new URLSearchParams({
    access_token: token,
    profile_ids: channelId,
    text,
    scheduled_at: `${item.date}T08:30:00Z`,
    shorten: "false",
  });
  const res = await fetch("https://api.bufferapp.com/1/updates/create.json", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(JSON.stringify(data));
  }
  return {
    id: data.updates?.[0]?.id || data.id,
    dueAt: data.updates?.[0]?.due_at || `${item.date}T08:30:00.000Z`,
  };
}

for (const item of posts) {
  if (dryRun) {
    console.log(`[dry-run] ${item.date}: ${item.slug}`);
    continue;
  }
  try {
    const scheduled = apiKey ? await scheduleGraphQL(item) : await scheduleV1(item);
    results.posts.push({
      id: scheduled.id,
      dueAt: scheduled.dueAt,
      url: item.url,
      slug: item.slug,
    });
    console.log(`Scheduled ${item.date}: ${item.slug}`);
  } catch (err) {
    console.error(`Failed ${item.slug}:`, err.message || err);
    process.exit(1);
  }
}

if (!dryRun) {
  const outPath = path.join(process.cwd(), "seo-growth-police-station-agent", "buffer", "buffer-scheduled-results.json");
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2) + "\n");
  console.log(`\nWrote ${results.posts.length} scheduled posts to buffer-scheduled-results.json`);
}
