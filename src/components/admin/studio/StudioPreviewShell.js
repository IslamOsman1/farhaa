'use client';

import { useMemo, useState } from 'react';
import RenderFrame from '@/components/invitation/RenderFrame';

const DEVICE_SPECS = {
  mobile: {
    width: 'min(100%, 430px)',
    aspectRatio: '390 / 844',
    shellRadius: '40px',
    screenRadius: '32px',
    padding: '14px',
  },
  tablet: {
    width: 'min(100%, 820px)',
    aspectRatio: '768 / 1024',
    shellRadius: '34px',
    screenRadius: '28px',
    padding: '16px',
  },
  desktop: {
    width: 'min(100%, 1280px)',
    aspectRatio: '1280 / 860',
    shellRadius: '26px',
    screenRadius: '18px',
    padding: '12px',
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
      <div className="studio-preview-shell__backdrop">
        <div
          className={`studio-preview-shell__device studio-preview-shell__device--${deviceMode}`}
          style={{
            width: device.width,
            borderRadius: device.shellRadius,
            padding: device.padding,
          }}
        >
          <div
            className="studio-preview-shell__screen"
            style={{
              aspectRatio: device.aspectRatio,
              borderRadius: device.screenRadius,
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
        </div>
      </div>

      <style jsx>{`
        .studio-preview-shell {
          min-height: 100%;
        }
        .studio-preview-shell--fullscreen {
          height: 100%;
        }
        .studio-preview-shell__backdrop {
          display: grid;
          place-items: center;
          min-height: 100%;
          padding: 18px;
          border-radius: 28px;
          background:
            radial-gradient(circle at top, rgba(255, 247, 242, 0.96), rgba(244, 236, 231, 0.92)),
            linear-gradient(180deg, #ffffff, #f6ede8);
        }
        .studio-preview-shell--fullscreen .studio-preview-shell__backdrop {
          height: 100%;
          padding: 28px;
        }
        .studio-preview-shell__device {
          background: linear-gradient(180deg, #2c2527, #151214);
          box-shadow: 0 24px 70px rgba(22, 16, 18, 0.2);
        }
        .studio-preview-shell__device--desktop {
          background: linear-gradient(180deg, #ece5df, #d9d0ca);
          box-shadow: 0 24px 60px rgba(42, 28, 25, 0.12);
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
          z-index: 2;
          display: grid;
          place-items: center;
          color: #765953;
          font-size: 0.95rem;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(250, 243, 239, 0.96));
        }
      `}</style>
    </div>
  );
}
