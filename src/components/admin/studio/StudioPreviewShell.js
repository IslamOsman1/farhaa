'use client';

import { useMemo, useState } from 'react';
import RenderFrame from '@/components/invitation/RenderFrame';

const DEVICE_SPECS = {
  mobile: {
    label: 'هاتف',
    width: 'min(100%, 430px)',
    aspectRatio: '390 / 844',
    frameRadius: '34px',
    shellPadding: '14px',
  },
  tablet: {
    label: 'تابلت',
    width: 'min(100%, 820px)',
    aspectRatio: '768 / 1024',
    frameRadius: '38px',
    shellPadding: '16px',
  },
  desktop: {
    label: 'سطح مكتب',
    width: 'min(100%, 1280px)',
    aspectRatio: '1280 / 860',
    frameRadius: '24px',
    shellPadding: '12px',
  },
};

export default function StudioPreviewShell({
  templateSlug,
  manifest,
  renderConfig,
  deviceMode = 'mobile',
  fullscreen = false,
}) {
  const [loadedSignature, setLoadedSignature] = useState('');
  const device = DEVICE_SPECS[deviceMode] || DEVICE_SPECS.mobile;
  const frameSignature = useMemo(
    () => `${templateSlug}:${renderConfig?.opening?.slug || 'opening'}:${deviceMode}`,
    [deviceMode, renderConfig?.opening?.slug, templateSlug],
  );
  const loaded = loadedSignature === frameSignature;

  return (
    <div className={`studio-preview-shell ${fullscreen ? 'studio-preview-shell--fullscreen' : ''}`}>
      <div className="studio-preview-shell__stage">
        <div
          className={`studio-preview-shell__device studio-preview-shell__device--${deviceMode}`}
          style={{
            width: device.width,
            padding: device.shellPadding,
            borderRadius: deviceMode === 'desktop' ? '30px' : '44px',
          }}
        >
          {deviceMode !== 'desktop' ? (
            <div className="studio-preview-shell__topbar" aria-hidden="true">
              <span className="studio-preview-shell__camera-dot" />
            </div>
          ) : null}

          <div
            className="studio-preview-shell__screen"
            style={{
              aspectRatio: device.aspectRatio,
              borderRadius: device.frameRadius,
            }}
            data-testid="studio-frame-host"
          >
            {!loaded ? <div className="studio-preview-shell__loading">جاري تجهيز المعاينة...</div> : null}
            <RenderFrame
              key={frameSignature}
              templateSlug={templateSlug}
              renderConfig={renderConfig}
              manifest={manifest}
              className="studio-preview-shell__frame-wrap"
              frameClassName="studio-preview-shell__frame"
              disablePromoBar
              disableOpening
              onLoad={() => setLoadedSignature(frameSignature)}
            />
          </div>

          {deviceMode !== 'desktop' ? <div className="studio-preview-shell__home-indicator" aria-hidden="true" /> : null}
        </div>
      </div>

      <style jsx>{`
        .studio-preview-shell {
          display: grid;
          gap: 12px;
          min-height: 100%;
        }
        .studio-preview-shell--fullscreen {
          height: 100%;
        }
        .studio-preview-shell__stage {
          display: grid;
          place-items: center;
          min-height: 100%;
          background:
            radial-gradient(circle at top, rgba(255, 246, 241, 0.96), rgba(244, 235, 230, 0.9)),
            linear-gradient(180deg, #fff, #f6ede8);
          border-radius: 28px;
          padding: 18px;
        }
        .studio-preview-shell--fullscreen .studio-preview-shell__stage {
          height: 100%;
          padding: 28px;
        }
        .studio-preview-shell__device {
          display: grid;
          gap: 12px;
          background: linear-gradient(180deg, #282224, #161214);
          box-shadow: 0 28px 80px rgba(20, 17, 18, 0.22);
        }
        .studio-preview-shell__device--desktop {
          gap: 0;
          background: linear-gradient(180deg, #f4f0ec, #dfd6d0);
          box-shadow: 0 28px 70px rgba(34, 24, 22, 0.14);
        }
        .studio-preview-shell__topbar {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 18px;
        }
        .studio-preview-shell__camera-dot {
          width: 74px;
          height: 8px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
        }
        .studio-preview-shell__screen {
          position: relative;
          overflow: hidden;
          background: #fff;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
        }
        .studio-preview-shell__frame-wrap,
        .studio-preview-shell__frame {
          width: 100%;
          height: 100%;
        }
        .studio-preview-shell__loading {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(250, 243, 239, 0.96));
          color: #765953;
          font-size: 0.95rem;
          z-index: 2;
        }
        .studio-preview-shell__home-indicator {
          width: 36%;
          max-width: 140px;
          height: 5px;
          margin-inline: auto;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.22);
        }
      `}</style>
    </div>
  );
}
