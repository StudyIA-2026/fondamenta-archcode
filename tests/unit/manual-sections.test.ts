import { describe, it, expect } from 'vitest';
import { extractManualSections, insertManualSections, extractManualTail } from '../../src/utils/manual-sections.js';

describe('Manual Sections', () => {
  const sampleGenerated = `# Pages

> Auto-generated content

## /home

- **Route:** /home
- **Type:** server

<!-- MANUAL-START:home-notes -->
<!-- MANUAL-END:home-notes -->

## /about

- **Route:** /about
`;

  const sampleWithManual = `# Pages

> Auto-generated content

## /home

- **Route:** /home
- **Type:** server

<!-- MANUAL-START:home-notes -->
This is my custom note about the home page.
It spans multiple lines.
<!-- MANUAL-END:home-notes -->

## /about

- **Route:** /about
`;

  it('should extract manual sections from content', () => {
    const sections = extractManualSections(sampleWithManual);
    expect(sections).toHaveLength(1);
    expect(sections[0].id).toBe('home-notes');
    expect(sections[0].content).toContain('This is my custom note');
    expect(sections[0].content).toContain('multiple lines');
  });

  it('should return empty array when no manual sections exist', () => {
    const sections = extractManualSections('# Simple content\n\nNo markers here.');
    expect(sections).toHaveLength(0);
  });

  it('should insert preserved sections into regenerated content', () => {
    const preserved = extractManualSections(sampleWithManual);
    const result = insertManualSections(sampleGenerated, preserved);

    expect(result).toContain('This is my custom note');
    expect(result).toContain('multiple lines');
    expect(result).toContain('<!-- MANUAL-START:home-notes -->');
    expect(result).toContain('<!-- MANUAL-END:home-notes -->');
  });

  it('should round-trip: generate → inject manual → regenerate → preserve', () => {
    // Step 1: Start with generated content (empty markers)
    const generated1 = sampleGenerated;

    // Step 2: User adds manual content
    const withManual = sampleWithManual;

    // Step 3: Extract manual sections
    const preserved = extractManualSections(withManual);
    expect(preserved).toHaveLength(1);

    // Step 4: Regenerate (simulates re-running fondamenta analyze)
    const generated2 = sampleGenerated; // Same structure, empty markers

    // Step 5: Insert preserved sections
    const result = insertManualSections(generated2, preserved);

    // Step 6: Verify manual content survived
    expect(result).toContain('This is my custom note');

    // Step 7: Extract again — should still find the section
    const preserved2 = extractManualSections(result);
    expect(preserved2).toHaveLength(1);
    expect(preserved2[0].content).toBe(preserved[0].content);
  });

  it('should append preserved sections when markers are missing from generated content', () => {
    const noMarkers = `# Pages

> Auto-generated content

## /home

- **Route:** /home
`;

    const preserved = [
      { id: 'custom-notes', content: 'My preserved notes' },
    ];

    const result = insertManualSections(noMarkers, preserved);
    expect(result).toContain('<!-- MANUAL-START:custom-notes -->');
    expect(result).toContain('My preserved notes');
    expect(result).toContain('<!-- MANUAL-END:custom-notes -->');
  });

  it('should handle multiple manual sections', () => {
    const content = `# Doc

<!-- MANUAL-START:section-a -->
Content A
<!-- MANUAL-END:section-a -->

Some auto content

<!-- MANUAL-START:section-b -->
Content B
<!-- MANUAL-END:section-b -->
`;

    const sections = extractManualSections(content);
    expect(sections).toHaveLength(2);
    expect(sections[0].id).toBe('section-a');
    expect(sections[0].content).toBe('Content A');
    expect(sections[1].id).toBe('section-b');
    expect(sections[1].content).toBe('Content B');
  });

  describe('extractManualTail', () => {
    it('should extract content from split heading to end', () => {
      const content = `# Auto Content

Some generated stuff

## Manual Notes

This is user-written content.
Should be preserved.
`;

      const tail = extractManualTail(content, '## Manual Notes');
      expect(tail).toContain('## Manual Notes');
      expect(tail).toContain('This is user-written content');
      expect(tail).toContain('Should be preserved');
    });

    it('should return empty string when heading not found', () => {
      const tail = extractManualTail('# Simple doc\n\nContent', '## Manual Notes');
      expect(tail).toBe('');
    });

    it('should return empty string for empty content', () => {
      expect(extractManualTail('', '## Manual Notes')).toBe('');
    });
  });
});
