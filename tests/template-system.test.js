import { describe, expect, it } from 'vitest';
import {
  buildInvitationRenderConfig,
  getAllTemplateManifests,
  migrateTemplateConfigBetweenManifests,
  normalizeInvitationData,
  validateTemplateManifest,
} from '@/lib/template-system';

describe('template manifest registry', () => {
  it('returns a manifest for every registered template and each manifest validates', () => {
    const manifests = getAllTemplateManifests();

    expect(manifests.length).toBeGreaterThan(10);

    manifests.forEach((manifest) => {
      const result = validateTemplateManifest(manifest);
      expect(result.success).toBe(true);
    });
  });
});

describe('legacy normalization', () => {
  it('parses legacy JSON columns into structured configs', () => {
    const normalized = normalizeInvitationData({
      groomName: 'أحمد',
      brideName: 'ليلى',
      welcomeMessage: 'أهلاً بكم',
      coupleStory: JSON.stringify({
        verseText: 'اللهم بارك',
        galleryImages: ['https://example.com/1.jpg'],
        program: [{ time: '7:00', title: 'الاستقبال' }],
        notes: ['احضروا مبكرًا'],
      }),
      sections: JSON.stringify({ gallery: false }),
      customColors: JSON.stringify({ primaryColor: '#111111' }),
      customFonts: JSON.stringify({ fontBody: 'Tajawal' }),
    });

    expect(normalized.contentConfig.verseText).toBe('اللهم بارك');
    expect(normalized.contentConfig.galleryImages).toHaveLength(1);
    expect(normalized.sectionConfig.gallery).toBe(false);
    expect(normalized.themeConfig.primaryColor).toBe('#111111');
    expect(normalized.themeConfig.fontBody).toBe('Tajawal');
  });
});

describe('render config builder', () => {
  it('creates a typed render config for preview/public runtime', () => {
    const manifest = getAllTemplateManifests().find((item) => item.slug === 'classic');

    const renderConfig = buildInvitationRenderConfig({
      invitation: {
        id: 'inv-1',
        slug: 'test-slug',
        locale: 'ar',
        weddingDate: new Date('2026-12-18T19:00:00.000Z'),
        contentConfig: {
          groomName: 'أحمد',
          brideName: 'ليلى',
          invitationText: 'ننتظر حضوركم',
        },
        themeConfig: {
          primaryColor: '#123456',
        },
        sectionConfig: {
          hero: true,
          gallery: false,
        },
        openingConfig: {
          allowSkip: true,
        },
      },
      manifest,
      opening: {
        slug: 'minimal-fade',
        type: 'shared-overlay',
      },
      preview: true,
    });

    expect(renderConfig.templateSlug).toBe('classic');
    expect(renderConfig.opening.slug).toBe('minimal-fade');
    expect(renderConfig.preview).toBe(true);
    expect(renderConfig.fields.invitationText).toBe('ننتظر حضوركم');
    expect(renderConfig.theme.primaryColor).toBe('#123456');
  });
});

describe('template switch migration', () => {
  it('preserves compatible fields and retains incompatible ones separately', () => {
    const manifests = getAllTemplateManifests();
    const currentManifest = manifests.find((item) => item.slug === 'classic');
    const nextManifest = manifests.find((item) => item.slug === 'royal');

    const migration = migrateTemplateConfigBetweenManifests(
      {
        groomName: 'أحمد',
        brideName: 'ليلى',
        hiddenCustomValue: 'legacy',
      },
      currentManifest,
      nextManifest,
    );

    expect(migration.preserved.groomName).toBe('أحمد');
    expect(migration.preserved.brideName).toBe('ليلى');
    expect(migration.hidden.hiddenCustomValue).toBe('legacy');
    expect(migration.lostKeys).toContain('hiddenCustomValue');
  });
});
