import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import db from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: { correlationId: string } }
) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const row = db
    .prepare(
      `SELECT
        correlation_id,
        status,
        stage,
        request_json,
        result_json,
        error_code,
        error_message,
        retry_count,
        created_at,
        updated_at
      FROM blog_generation_runs
      WHERE correlation_id = ?`
    )
    .get(params.correlationId) as
    | undefined
    | {
        correlation_id: string;
        status: string;
        stage: string | null;
        request_json: string | null;
        result_json: string | null;
        error_code: string | null;
        error_message: string | null;
        retry_count: number;
        created_at: string;
        updated_at: string;
      };

  if (!row) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    correlationId: row.correlation_id,
    status: row.status,
    stage: row.stage,
    request: row.request_json ? JSON.parse(row.request_json) : null,
    result: row.result_json ? JSON.parse(row.result_json) : null,
    errorCode: row.error_code,
    errorMessage: row.error_message,
    retryCount: row.retry_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

