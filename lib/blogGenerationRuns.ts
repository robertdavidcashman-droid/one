import db from '@/lib/db';

export type BlogGenerationRunStatus =
  | 'queued'
  | 'generating_text'
  | 'generating_images'
  | 'saving'
  | 'published'
  | 'failed';

export function createBlogGenerationRun(args: {
  correlationId: string;
  status: BlogGenerationRunStatus;
  stage?: string | null;
  requestJson?: unknown;
}) {
  const stmt = db.prepare(`
    INSERT INTO blog_generation_runs
      (correlation_id, status, stage, request_json, updated_at)
    VALUES
      (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  stmt.run(
    args.correlationId,
    args.status,
    args.stage || null,
    args.requestJson ? JSON.stringify(args.requestJson) : null
  );
}

export function updateBlogGenerationRun(args: {
  correlationId: string;
  status?: BlogGenerationRunStatus;
  stage?: string | null;
  resultJson?: unknown;
  errorCode?: string | null;
  errorMessage?: string | null;
}) {
  const stmt = db.prepare(`
    UPDATE blog_generation_runs
    SET
      status = COALESCE(?, status),
      stage = COALESCE(?, stage),
      result_json = COALESCE(?, result_json),
      error_code = COALESCE(?, error_code),
      error_message = COALESCE(?, error_message),
      updated_at = CURRENT_TIMESTAMP
    WHERE correlation_id = ?
  `);

  stmt.run(
    args.status || null,
    args.stage ?? null,
    args.resultJson !== undefined ? JSON.stringify(args.resultJson) : null,
    args.errorCode ?? null,
    args.errorMessage ?? null,
    args.correlationId
  );
}

