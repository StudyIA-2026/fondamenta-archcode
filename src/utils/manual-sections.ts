/**
 * Manual Section Preservation — Ported from StudyIA generate-fondamenta.ts
 *
 * Supports two patterns:
 * 1. Marker-based: <!-- MANUAL-START:id --> ... <!-- MANUAL-END:id -->
 * 2. Split-point: Everything after a specific heading is preserved
 */

const MANUAL_START = /<!--\s*MANUAL-START:(\S+)\s*-->/;
const MANUAL_END = /<!--\s*MANUAL-END:(\S+)\s*-->/;

export interface ManualSection {
  id: string;
  content: string;
}

/**
 * Extract all manual sections from markdown content (marker-based)
 */
export function extractManualSections(content: string): ManualSection[] {
  const sections: ManualSection[] = [];
  const lines = content.split('\n');
  let currentId: string | null = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    const startMatch = line.match(MANUAL_START);
    const endMatch = line.match(MANUAL_END);

    if (startMatch) {
      currentId = startMatch[1];
      currentContent = [];
    } else if (endMatch && currentId && endMatch[1] === currentId) {
      sections.push({ id: currentId, content: currentContent.join('\n') });
      currentId = null;
      currentContent = [];
    } else if (currentId) {
      currentContent.push(line);
    }
  }

  return sections;
}

/**
 * Insert preserved manual sections into generated content
 */
export function insertManualSections(generated: string, preserved: ManualSection[]): string {
  if (preserved.length === 0) return generated;

  const sectionMap = new Map(preserved.map(s => [s.id, s.content]));
  const insertedIds = new Set<string>();
  const lines = generated.split('\n');
  const result: string[] = [];
  let insideManual = false;

  for (const line of lines) {
    const startMatch = line.match(MANUAL_START);
    const endMatch = line.match(MANUAL_END);

    if (startMatch) {
      result.push(line);
      const preservedContent = sectionMap.get(startMatch[1]);
      if (preservedContent) {
        result.push(preservedContent);
        insertedIds.add(startMatch[1]);
      }
      insideManual = true;
    } else if (endMatch) {
      insideManual = false;
      result.push(line);
    } else if (!insideManual) {
      result.push(line);
    }
  }

  // Append any preserved sections whose markers weren't found in generated content
  const unmatched = preserved.filter(s => !insertedIds.has(s.id));
  if (unmatched.length > 0) {
    result.push('');
    for (const section of unmatched) {
      result.push(`<!-- MANUAL-START:${section.id} -->`);
      result.push(section.content);
      result.push(`<!-- MANUAL-END:${section.id} -->`);
    }
  }

  return result.join('\n');
}

/**
 * Extract content from a heading to end of file (split-point pattern)
 */
export function extractManualTail(content: string, splitHeading: string): string {
  if (!content) return '';
  const idx = content.indexOf(splitHeading);
  return idx === -1 ? '' : content.substring(idx);
}
