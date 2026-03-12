/**
 * writeIfChanged — Only writes file if content actually changed.
 * Prevents unnecessary git diffs and timestamp noise.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function writeIfChanged(filePath: string, content: string): Promise<boolean> {
  let existing = '';
  try {
    existing = await readFile(filePath, 'utf-8');
  } catch {
    // File doesn't exist — will be created
    await mkdir(dirname(filePath), { recursive: true });
  }

  if (existing === content) {
    return false; // No change
  }

  await writeFile(filePath, content, 'utf-8');
  return true; // Changed
}
