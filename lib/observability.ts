export type LogLevel = 'info' | 'warn' | 'error';

export type BlogGeneratorStage =
  | 'received'
  | 'validating_request'
  | 'generating_text'
  | 'generating_images'
  | 'assembling_preview'
  | 'done'
  | 'failed';

export function getOrCreateCorrelationId(existing?: string | null): string {
  const cleaned = (existing || '').trim();
  if (cleaned) return cleaned;

  // Node.js runtime provides crypto.randomUUID().
  // (If not available, fall back to a timestamp-based id.)
  const maybeCrypto = globalThis.crypto as undefined | { randomUUID?: () => string };
  if (maybeCrypto?.randomUUID) return maybeCrypto.randomUUID();

  return `corr_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function logJson(
  level: LogLevel,
  event: {
    stage: BlogGeneratorStage;
    correlationId: string;
    success?: boolean;
    durationMs?: number;
    errorCode?: string;
    errorMessage?: string;
    [k: string]: unknown;
  }
) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    ...event,
  };

  if (level === 'error') console.error(JSON.stringify(payload));
  else if (level === 'warn') console.warn(JSON.stringify(payload));
  else console.log(JSON.stringify(payload));
}

