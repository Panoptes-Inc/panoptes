import type { PanoptesFailureCode } from '../types';

export class PanoptesApiError extends Error {
  code: string;
  status: number | null;
  retryable: boolean;

  constructor(message: string, options: { code?: string; status?: number | null; retryable?: boolean } = {}) {
    super(message);
    this.name = 'PanoptesApiError';
    this.code = options.code ?? 'unknown_error';
    this.status = options.status ?? null;
    this.retryable = options.retryable ?? false;
  }
}

export function normalizePanoptesError(error: unknown): { code: string; message: string; retryable: boolean } {
  if (error instanceof PanoptesApiError) {
    return {
      code: error.code,
      message: error.message,
      retryable: error.retryable
    };
  }

  if (error instanceof Error) {
    return {
      code: 'unknown_error',
      message: error.message || 'Unknown error occurred.',
      retryable: false
    };
  }

  return {
    code: 'unknown_error',
    message: 'Unknown error occurred.',
    retryable: false
  };
}

export function failureCodeToMessage(code: PanoptesFailureCode | null): string {
  switch (code) {
    case 'url_unreachable':
      return 'URL にアクセスできませんでした。URL の形式や公開状態を確認してください。';
    case 'crawl_failed':
      return '初回クロールに失敗しました。時間をおいて再試行してください。';
    case 'inference_failed':
      return '推定結果の生成に失敗しました。';
    case 'inference_confirmation_expired':
      return '推定確認の有効期限が切れました。再試行してください。';
    case 'competitor_discovery_failed':
    case 'competitor_insufficient':
    case 'competitor_analysis_partial_failure':
      return '競合分析の途中で問題が発生しました。';
    case 'industry_analysis_failed':
      return '業界構造分析に失敗しました。';
    case 'strategy_generation_failed':
      return '戦略生成に失敗しました。';
    case 'snapshot_commit_failed':
      return 'snapshot の保存に失敗しました。';
    case 'job_timed_out':
      return '分析がタイムアウトしました。もう一度お試しください。';
    case 'job_cancelled':
      return '分析がキャンセルされました。';
    case 'stale_job_ignored':
      return '古い分析結果は現在の画面に反映されません。';
    default:
      return '予期しないエラーが発生しました。';
  }
}
