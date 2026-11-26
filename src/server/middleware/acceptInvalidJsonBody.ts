import type { NextFunction, Request, Response } from 'express';

function isJsonParseError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && Reflect.get(error, 'type') === 'entity.parse.failed';
}

/** Передаёт запрос с неразобранным JSON-телом дальше без тела, чтобы маршрут сам ответил на ошибку данных. */
export function acceptInvalidJsonBody(error: unknown, req: Request, _res: Response, next: NextFunction): void {
  if (!isJsonParseError(error)) {
    next(error);
    return;
  }

  req.body = undefined;
  next();
}
