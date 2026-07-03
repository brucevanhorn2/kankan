import fs from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

export async function atomicWrite(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);
  const tmpFilePath = `${filePath}.tmp-${randomBytes(4).toString('hex')}`;

  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(tmpFilePath, content, 'utf-8');
    await fs.rename(tmpFilePath, filePath);
  } catch (error) {
    try {
      await fs.unlink(tmpFilePath);
    } catch {
      // Ignore cleanup errors.
    }
    throw error;
  }
}
