'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getTemplateManifest } from '@/lib/template-system';

const OPENING_LAYER_SELECTORS = '#envelope-screen, #intro-layer, #popup-overlay, #preloader, #opening-screen, #cover, #gate, #envelope, #env';
function isElementVisible(node) {
  if (!node) return false;

  const style = node.ownerDocument?.defaultView?.getComputedStyle(node);
  if (!style) return false;
  return (
    style.display !== 'none'
    && style.visibility !== 'hidden'
    && style.opacity !== '0'
    && !node.hidden
  );
}

export default function RenderFrame({
  templateSlug,
  renderConfig,
  manifest,
  className = '',
  frameClassName = '',
  bridgeMessage = null,
  onLoad = null,
  disablePromoBar = false,
  disableOpening = false,
}) {
  const iframeRef = useRef(null);
  const openingIframeRef = useRef(null);
  const [loadedFrameSignature, setLoadedFrameSignature] = useState('');
  const [loadedOpeningSignature, setLoadedOpeningSignature] = useState('');
  const [dismissedOpeningSignature, setDismissedOpeningSignature] = useState('');

  const sourceTemplateSlug = renderConfig?.opening?.sourceTemplateSlug || renderConfig?.opening?.config?.sourceTemplateSlug || '';
  const sourceManifest = useMemo(
    () => (sourceTemplateSlug ? getTemplateManifest(sourceTemplateSlug) : null),
    [sourceTemplateSlug],
  );
  const hasTemplateOpening = Boolean(
    renderConfig?.opening?.type === 'template-opening'
    && sourceTemplateSlug
    && sourceManifest,
  );
  const showPromoBar = !disablePromoBar && renderConfig?.ui?.showPromoBar !== false && !renderConfig?.preview;

  const frameSrc = useMemo(() => {
    const params = new URLSearchParams();
    if (!showPromoBar) {
      params.set('farhaPromoBar', '0');
    }
    if (
      disableOpening
      || (
      renderConfig?.preview
      || renderConfig?.opening?.slug === 'no-opening'
      || renderConfig?.opening?.type === 'template-opening'
      )
    ) {
      params.set('farhaOpening', '0');
      params.set('autoopen', '1');
    }

    const query = params.toString();
    return `/${templateSlug}/index.html${query ? `?${query}` : ''}`;
  }, [disableOpening, renderConfig?.opening?.slug, renderConfig?.opening?.type, renderConfig?.preview, showPromoBar, templateSlug]);
  const openingFrameSrc = useMemo(() => {
    if (!sourceTemplateSlug) {
      return '';
    }

    const params = new URLSearchParams();
    params.set('farhaPromoBar', '0');
    params.set('farhaOpeningOnly', '1');
    return `/${sourceTemplateSlug}/index.html?${params.toString()}`;
  }, [sourceTemplateSlug]);
  const frameLoaded = loadedFrameSignature === frameSrc;
  const openingSignature = `${sourceTemplateSlug}:${renderConfig?.opening?.slug || ''}`;
  const openingLoaded = loadedOpeningSignature === openingSignature;
  const openingVisible = hasTemplateOpening && dismissedOpeningSignature !== openingSignature;

  const baseRenderConfig = useMemo(() => {
    if (!hasTemplateOpening) {
      return renderConfig;
    }

    return {
      ...renderConfig,
      opening: {
        slug: 'no-opening',
        type: 'none',
        config: { allowSkip: true },
      },
    };
  }, [hasTemplateOpening, renderConfig]);

  const openingRenderConfig = useMemo(() => {
    if (!hasTemplateOpening || !sourceManifest) {
      return null;
    }

    return {
      ...renderConfig,
      templateSlug: sourceManifest.slug,
      opening: {
        slug: 'native-template',
        type: 'native-template',
        config: {
          allowSkip: true,
          sourceTemplateSlug,
        },
      },
    };
  }, [hasTemplateOpening, renderConfig, sourceManifest, sourceTemplateSlug]);

  useEffect(() => {
    if (!frameLoaded || !iframeRef.current?.contentWindow || !baseRenderConfig) return;

    iframeRef.current.contentWindow.postMessage(
      {
        type: 'FARHA_RENDER_CONFIG',
        version: '1.0.0',
        manifest,
        renderConfig: baseRenderConfig,
      },
      window.location.origin,
    );
  }, [baseRenderConfig, frameLoaded, manifest]);

  useEffect(() => {
    if (!openingVisible || !openingLoaded || !openingIframeRef.current?.contentWindow || !openingRenderConfig || !sourceManifest) {
      return;
    }

    openingIframeRef.current.contentWindow.postMessage(
      {
        type: 'FARHA_RENDER_CONFIG',
        version: '1.0.0',
        manifest: sourceManifest,
        renderConfig: openingRenderConfig,
      },
      window.location.origin,
    );
  }, [openingLoaded, openingRenderConfig, openingVisible, sourceManifest]);

  useEffect(() => {
    if (!openingVisible || !openingLoaded || !openingIframeRef.current) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const frame = openingIframeRef.current;
      const openingDocument = frame?.contentDocument;
      if (!openingDocument) {
        return;
      }

      const openingLayers = Array.from(openingDocument.querySelectorAll(OPENING_LAYER_SELECTORS));
      const visibleOpeningLayers = openingLayers.filter(isElementVisible);
      if (openingLayers.length > 0 && visibleOpeningLayers.length === 0) {
        setDismissedOpeningSignature(openingSignature);
      }
    }, 500);

    return () => window.clearInterval(intervalId);
  }, [openingLoaded, openingSignature, openingVisible]);

  useEffect(() => {
    if (!frameLoaded || !iframeRef.current?.contentWindow || !bridgeMessage) {
      return;
    }

    iframeRef.current.contentWindow.postMessage(bridgeMessage, window.location.origin);
  }, [bridgeMessage, frameLoaded]);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100%',
      }}
    >
      <iframe
        ref={iframeRef}
        src={frameSrc}
        title="Farha Invitation Preview"
        className={frameClassName}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          minHeight: '100%',
          border: 'none',
          background: '#fff',
        }}
        onLoad={() => {
            setLoadedFrameSignature(frameSrc);
            if (typeof onLoad === 'function') {
              onLoad();
            }
        }}
      />

      {hasTemplateOpening && openingVisible ? (
        <div
          className="farha-opening-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 30,
            background: 'rgba(11, 12, 18, 0.3)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <button
            type="button"
            onClick={() => setDismissedOpeningSignature(openingSignature)}
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 2,
              border: '1px solid rgba(255,255,255,0.24)',
              background: 'rgba(255,255,255,0.16)',
              color: '#fff',
              borderRadius: 999,
              padding: '10px 16px',
              font: '600 14px Tajawal, sans-serif',
              cursor: 'pointer',
            }}
          >
            تخطي الافتتاحية
          </button>

          <iframe
            key={openingSignature}
            ref={openingIframeRef}
            src={openingFrameSrc}
            title="Farha Opening Preview"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: '#fff',
            }}
            onLoad={() => setLoadedOpeningSignature(openingSignature)}
          />
        </div>
      ) : null}
    </div>
  );
}
