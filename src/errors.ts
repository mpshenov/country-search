export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export type ErrorKind = 'aborted' | 'timeout' | 'http' | 'network';

export function classifyError(error: unknown): ErrorKind {
  void error;
  return 'network';
}
