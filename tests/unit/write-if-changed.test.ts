import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeIfChanged } from '../../src/utils/write-if-changed.js';
import { readFile, rm, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';

describe('writeIfChanged', () => {
  const testDir = resolve(tmpdir(), 'fondamenta-test-wic-' + Date.now());
  const testFile = resolve(testDir, 'test-output.md');

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('should write new file and return true', async () => {
    const changed = await writeIfChanged(testFile, '# Hello\n');
    expect(changed).toBe(true);

    const content = await readFile(testFile, 'utf-8');
    expect(content).toBe('# Hello\n');
  });

  it('should return false when content is identical', async () => {
    await writeIfChanged(testFile, '# Hello\n');
    const changed = await writeIfChanged(testFile, '# Hello\n');
    expect(changed).toBe(false);
  });

  it('should return true when content differs', async () => {
    await writeIfChanged(testFile, '# Hello\n');
    const changed = await writeIfChanged(testFile, '# Updated\n');
    expect(changed).toBe(true);

    const content = await readFile(testFile, 'utf-8');
    expect(content).toBe('# Updated\n');
  });

  it('should create parent directories if needed', async () => {
    const deepFile = resolve(testDir, 'deep/nested/dir/output.md');
    const changed = await writeIfChanged(deepFile, 'content');
    expect(changed).toBe(true);

    const content = await readFile(deepFile, 'utf-8');
    expect(content).toBe('content');
  });
});
