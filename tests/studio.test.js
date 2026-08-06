import { describe, expect, it } from 'vitest';
import { getAllTemplateManifests } from '@/lib/template-system';
import {
  buildStudioSessionUpdateData,
  createStudioDraftFromManifest,
} from '@/lib/studio';
import { scanTemplateStudioInventory } from '@/lib/studio-inventory';

describe('template studio draft helpers', () => {
  it('creates a default editable draft from a manifest', () => {
    const manifest = getAllTemplateManifests().find((item) => item.slug === 'classic');
    const draft = createStudioDraftFromManifest(manifest);

    expect(draft.templateSlug).toBe('classic');
    expect(draft.openingSlug).toBe('native-template');
    expect(draft.sectionConfig.hero).toBe(true);
    expect(draft.themeConfig.primaryColor).toBeTruthy();
  });

  it('splits media bindings from content when persisting the session', () => {
    const manifest = getAllTemplateManifests().find((item) => item.slug === 'classic');
    const draft = createStudioDraftFromManifest(manifest, {
      contentConfig: {
        groomName: 'أحمد',
        venueImage: '/uploads/test.jpg',
      },
    });

    const payload = buildStudioSessionUpdateData({ manifest, draft });

    expect(payload.content.groomName).toBe('أحمد');
    expect(payload.assets.venueImage).toBe('/uploads/test.jpg');
  });
});

describe('template studio inventory', () => {
  it('scans actual public assets and returns summary counts', () => {
    const report = scanTemplateStudioInventory();

    expect(report.summary.templates).toBeGreaterThan(10);
    expect(report.summary.images).toBeGreaterThan(50);
    expect(report.summary.videos).toBeGreaterThan(5);
    expect(report.templates.every((template) => template.hasIndex)).toBe(true);
  });
});
