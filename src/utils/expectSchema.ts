import { expect, test } from '@playwright/test';
import { z } from 'zod';

/**
 * Validates `data` against a Zod schema and fails the test with a readable,
 * field-by-field message when the contract is broken. Returns the typed data.
 */
export function expectSchema<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = z.prettifyError(result.error);
    test.info().annotations.push({ type: 'contract violation', description: details });
    expect(result.success, `Response does not match schema:\n${details}`).toBe(true);
  }
  return result.data as z.infer<T>;
}
