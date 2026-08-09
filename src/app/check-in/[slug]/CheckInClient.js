'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

function StatCard({ label, value, compact = false }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: compact ? '16px' : '18px',
        padding: compact ? '14px 12px' : '16px',
        border: '1px solid rgba(127,42,31,0.12)',
        boxShadow: '0 14px 30px rgba(15, 23, 42, 0.06)',
      }}
    >
      <div
        style={{
          color: '#7f2a1f',
          fontSize: compact ? '0.76rem' : '0.9rem',
          marginBottom: compact ? '6px' : '8px',
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div style={{ color: '#111827', fontSize: compact ? '1.45rem' : '1.8rem', fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function FieldBlock({ label, children, hint }) {
  return (
    <label style={{ display: 'grid', gap: '8px' }}>
      <span style={{ color: '#7f2a1f', fontSize: '0.82rem', fontWeight: 800 }}>{label}</span>
      {children}
      {hint ? <span style={{ color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.6 }}>{hint}</span> : null}
    </label>
  );
}

function getStatusLabel(status) {
  switch (status) {
    case 'ACTIVE':
      return 'نشطة';
    case 'PARTIAL':
      return 'استخدمت جزئيًا';
    case 'USED':
      return 'مستخدمة بالكامل';
    case 'DISABLED':
      return 'معطلة';
    case 'CANCELLED':
      return 'ملغاة';
    default:
      return status || '-';
  }
}

function getStatusStyle(status) {
  switch (status) {
    case 'ACTIVE':
      return { background: '#ecfdf5', color: '#065f46' };
    case 'PARTIAL':
      return { background: '#eff6ff', color: '#1d4ed8' };
    case 'USED':
      return { background: '#fef3c7', color: '#92400e' };
    case 'DISABLED':
    case 'CANCELLED':
      return { background: '#fef2f2', color: '#b91c1c' };
    default:
      return { background: '#f3f4f6', color: '#374151' };
  }
}

function CameraIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M4 8.5C4 7.39543 4.89543 6.5 6 6.5H7.55C8.12 6.5 8.66 6.256 9.04 5.83L9.58 5.22C9.96 4.794 10.5 4.55 11.07 4.55H12.93C13.5 4.55 14.04 4.794 14.42 5.22L14.96 5.83C15.34 6.256 15.88 6.5 16.45 6.5H18C19.1046 6.5 20 7.39543 20 8.5V17C20 18.1046 19.1046 19 18 19H6C4.89543 19 4 18.1046 4 17V8.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12.5" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="9" r="0.8" fill="currentColor" />
    </svg>
  );
}

function CopyIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M9 9.75C9 8.50736 10.0074 7.5 11.25 7.5H17.25C18.4926 7.5 19.5 8.50736 19.5 9.75V17.25C19.5 18.4926 18.4926 19.5 17.25 19.5H11.25C10.0074 19.5 9 18.4926 9 17.25V9.75Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15 7.5V6.75C15 5.50736 13.9926 4.5 12.75 4.5H6.75C5.50736 4.5 4.5 5.50736 4.5 6.75V14.25C4.5 15.4926 5.50736 16.5 6.75 16.5H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const cardStyle = {
  background: '#fff',
  borderRadius: '24px',
  padding: '22px',
  border: '1px solid rgba(127,42,31,0.12)',
  boxShadow: '0 18px 50px rgba(15, 23, 42, 0.06)',
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '14px',
  border: '1px solid #dbe3ef',
  background: '#fff',
  color: '#111827',
  fontSize: '0.98rem',
};

const mainInputStyle = {
  ...inputStyle,
  padding: '14px 16px',
  borderRadius: '16px',
  fontSize: '1rem',
};

const inlineActionButtonStyle = {
  height: '40px',
  borderRadius: '12px',
  border: '1px solid rgba(127,42,31,0.18)',
  background: '#fff',
  color: '#7f2a1f',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

function formatDate(dateValue) {
  try {
    return new Date(dateValue).toLocaleString('ar-EG');
  } catch {
    return '-';
  }
}

export default function CheckInClient({ initialInvitation }) {
  const [pin, setPin] = useState('');
  const [authorized, setAuthorized] = useState(!initialInvitation.entryConfig?.pinRequired);
  const [searchQuery, setSearchQuery] = useState('');
  const [scanInput, setScanInput] = useState('');
  const [checkedInCount, setCheckedInCount] = useState(1);
  const [gateLabel, setGateLabel] = useState(initialInvitation.entryConfig?.gateLabelDefault || '');
  const [deviceLabel, setDeviceLabel] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffCode, setStaffCode] = useState('');
  const [summary, setSummary] = useState(null);
  const [matches, setMatches] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingScan, setProcessingScan] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [sharePageBusy, setSharePageBusy] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraRequesting, setCameraRequesting] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [viewportWidth, setViewportWidth] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const readerRef = useRef(null);
  const scannerControlsRef = useRef(null);
  const scanLockRef = useRef(false);
  const lastScanRef = useRef('');

  const invitationTitle = useMemo(
    () => [initialInvitation.groomName, initialInvitation.brideName].filter(Boolean).join(' و '),
    [initialInvitation.brideName, initialInvitation.groomName],
  );

  async function fetchOverview(query = '') {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (pin) {
        params.set('pin', pin);
      }
      if (query) {
        params.set('q', query);
      }
      params.set('limit', '20');

      const response = await fetch(`/api/check-in/${initialInvitation.slug}?${params.toString()}`, {
        cache: 'no-store',
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || 'تعذر تحميل بيانات الدخول.');
      }

      setAuthorized(true);
      setSummary(result.data?.summary || null);
      setMatches(result.data?.matches || []);
      setRecentLogs(result.data?.recentLogs || []);
      return result.data;
    } catch (error) {
      setAuthorized(false);
      setFeedback({ type: 'error', message: error.message || 'تعذر تحميل بيانات الدخول.' });
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function submitScan(rawValue) {
    const value = String(rawValue || '').trim();
    if (!value) {
      setFeedback({ type: 'error', message: 'أدخل أو امسح رمز الدخول أولًا.' });
      return;
    }

    setProcessingScan(true);
    setFeedback({ type: '', message: '' });

    try {
      const response = await fetch(`/api/check-in/${initialInvitation.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin,
          rawValue: value,
          checkedInCount,
          gateLabel,
          deviceLabel,
          staffName,
          staffCode,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || 'تعذر تسجيل الدخول.');
      }

      const entryPass = result.data?.entryPass;
      setFeedback({
        type: 'success',
        message: `تم تسجيل ${result.data?.checkedInCount || 1} دخول بنجاح${entryPass?.guestName ? ` للضيف ${entryPass.guestName}` : ''}.`,
      });
      setScanInput('');
      setSearchQuery('');
      await fetchOverview('');
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'تعذر تسجيل الدخول.' });
      throw error;
    } finally {
      setProcessingScan(false);
    }
  }

  async function handleUnlock(event) {
    event.preventDefault();
    await fetchOverview('');
  }

  async function handleSearch(event) {
    event.preventDefault();
    await fetchOverview(searchQuery);
  }

  async function handleQuickCheckIn(rawValue) {
    try {
      await submitScan(rawValue);
    } catch {
      // Feedback already shown by submitScan.
    }
  }

  async function handleCopyPageLink() {
    if (typeof window === 'undefined') {
      return;
    }

    setSharePageBusy(true);
    const absoluteUrl = window.location.href;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(absoluteUrl);
      } else {
        const helperInput = document.createElement('input');
        helperInput.value = absoluteUrl;
        helperInput.style.position = 'fixed';
        helperInput.style.opacity = '0';
        document.body.appendChild(helperInput);
        helperInput.focus();
        helperInput.select();
        document.execCommand('copy');
        document.body.removeChild(helperInput);
      }

      setFeedback({
        type: 'success',
        message: 'تم نسخ رابط صفحة البوابة. يمكنك الآن إرساله لصاحب الدعوة أو لفريق القاعة.',
      });
    } catch {
      setFeedback({
        type: 'error',
        message: 'تعذر نسخ الرابط تلقائيًا. انسخه من شريط المتصفح.',
      });
    } finally {
      setSharePageBusy(false);
    }
  }

  async function handleCameraButtonClick() {
    if (cameraEnabled) {
      setCameraEnabled(false);
      setCameraError('');
      return;
    }

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('الكاميرا غير مدعومة على هذا الجهاز أو المتصفح.');
      return;
    }

    setCameraRequesting(true);
    setCameraError('');

    try {
      const permissionStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
        },
        audio: false,
      });

      permissionStream.getTracks().forEach((track) => track.stop());
      setCameraEnabled(true);
    } catch (error) {
      const denied =
        error?.name === 'NotAllowedError' ||
        error?.name === 'PermissionDeniedError' ||
        error?.name === 'SecurityError';

      setCameraEnabled(false);
      setCameraError(
        denied
          ? 'تم رفض إذن الكاميرا. اسمح للمتصفح باستخدام الكاميرا ثم حاول مرة أخرى.'
          : 'تعذر الوصول إلى الكاميرا على هذا الجهاز أو المتصفح.',
      );
    } finally {
      setCameraRequesting(false);
    }
  }

  function stopCamera() {
    if (scannerControlsRef.current?.stop) {
      scannerControlsRef.current.stop();
    }

    scannerControlsRef.current = null;

    if (readerRef.current?.reset) {
      readerRef.current.reset();
    }

    readerRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const syncViewport = () => setViewportWidth(window.innerWidth);

    setCameraSupported(Boolean(navigator.mediaDevices?.getUserMedia));
    setDeviceLabel(window.navigator.userAgent.slice(0, 100));
    syncViewport();
    window.addEventListener('resize', syncViewport);

    return () => {
      window.removeEventListener('resize', syncViewport);
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!authorized || !cameraEnabled || !cameraSupported || typeof window === 'undefined') {
      stopCamera();
      return undefined;
    }

    let cancelled = false;

    async function startCamera() {
      try {
        setCameraError('');

        if (!videoRef.current) {
          throw new Error('Missing video element.');
        }

        const { BrowserQRCodeReader } = await import('@zxing/browser');
        if (cancelled) {
          return;
        }

        const reader = new BrowserQRCodeReader();
        readerRef.current = reader;

        const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, async (result, error) => {
          if (error || scanLockRef.current) {
            return;
          }

          const rawText = typeof result?.getText === 'function' ? result.getText() : result?.text;
          const rawValue = String(rawText || '').trim();
          if (!rawValue || rawValue === lastScanRef.current) {
            return;
          }

          scanLockRef.current = true;
          lastScanRef.current = rawValue;

          try {
            await handleQuickCheckIn(rawValue);
          } finally {
            window.setTimeout(() => {
              scanLockRef.current = false;
            }, 1400);
          }
        });

        if (cancelled) {
          controls?.stop?.();
          return;
        }

        scannerControlsRef.current = controls;
        if (videoRef.current?.srcObject instanceof MediaStream) {
          streamRef.current = videoRef.current.srcObject;
        }
      } catch (error) {
        console.error('Camera startup failed:', error);
        setCameraEnabled(false);
        setCameraError('تعذر تشغيل الكاميرا على هذا الجهاز أو المتصفح.');
      }
    }

    void startCamera();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [authorized, cameraEnabled, cameraSupported, checkedInCount, deviceLabel, gateLabel, pin, staffCode, staffName]);

  useEffect(() => {
    if (authorized) {
      void fetchOverview('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized]);

  const summaryCards = summary || {
    totalPasses: 0,
    totalAllowedEntries: 0,
    totalUsedEntries: 0,
    remainingEntries: 0,
  };

  const isPhone = viewportWidth > 0 ? viewportWidth <= 640 : false;
  const isTablet = viewportWidth > 0 ? viewportWidth <= 1024 : false;
  const isNarrowLayout = viewportWidth > 0 ? viewportWidth <= 980 : false;
  const shareLabel = isPhone ? 'رابط' : 'نسخ';
  const pagePadding = isPhone ? '12px' : isTablet ? '18px' : '24px';
  const shellGap = isPhone ? '14px' : '20px';
  const shellMaxWidth = isPhone ? '100%' : '1280px';
  const heroPadding = isPhone ? '18px' : '24px';
  const dynamicCardStyle = {
    ...cardStyle,
    padding: isPhone ? '16px' : '22px',
    borderRadius: isPhone ? '22px' : '24px',
  };
  const compactInputStyle = {
    ...inputStyle,
    padding: isPhone ? '11px 12px' : inputStyle.padding,
    fontSize: isPhone ? '0.92rem' : inputStyle.fontSize,
    borderRadius: isPhone ? '12px' : inputStyle.borderRadius,
  };
  const compactMainInputStyle = {
    ...mainInputStyle,
    padding: isPhone ? '13px 14px' : mainInputStyle.padding,
    fontSize: isPhone ? '0.95rem' : mainInputStyle.fontSize,
    borderRadius: isPhone ? '14px' : mainInputStyle.borderRadius,
  };
  const scanInputPaddingEnd = cameraSupported ? (isPhone ? '136px' : '146px') : isPhone ? '88px' : '84px';
  const summaryGridColumns = isPhone ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(180px, 1fr))';
  const layoutColumns = isNarrowLayout ? '1fr' : 'minmax(0, 1.18fr) minmax(340px, 0.82fr)';
  const formGridColumns = isPhone ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(180px, 1fr))';
  const searchBarColumns = isPhone ? '1fr' : 'minmax(0, 1fr) auto';
  const recentLogsContainerStyle =
    isPhone || isTablet
      ? {
          maxHeight: isPhone ? '400px' : '520px',
          overflowY: 'auto',
          paddingInlineEnd: '4px',
        }
      : {};
  const searchResultsContainerStyle = isPhone
    ? {
        maxHeight: '320px',
        overflowY: 'auto',
        paddingInlineEnd: '4px',
      }
    : {};

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f9f6ef 0%, #f3f6fb 100%)',
        padding: pagePadding,
        direction: 'rtl',
      }}
    >
      <div style={{ maxWidth: shellMaxWidth, margin: '0 auto', display: 'grid', gap: shellGap }}>
        <section
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(252,248,239,0.98) 54%, rgba(244,248,255,0.98) 100%)',
            borderRadius: isPhone ? '24px' : '28px',
            padding: heroPadding,
            border: '1px solid rgba(195,154,88,0.18)',
            boxShadow: '0 18px 50px rgba(15, 23, 42, 0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background:
                'radial-gradient(circle at top right, rgba(195,154,88,0.16) 0%, rgba(195,154,88,0) 38%), radial-gradient(circle at bottom left, rgba(127,42,31,0.08) 0%, rgba(127,42,31,0) 34%)',
            }}
          />

          <div
            style={{
              position: 'relative',
              display: 'grid',
              gap: isPhone ? '16px' : '18px',
              gridTemplateColumns: isPhone ? '1fr' : 'minmax(0, 1.2fr) minmax(220px, 0.8fr)',
              alignItems: 'start',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: isPhone ? '8px 12px' : '9px 14px',
                  borderRadius: '999px',
                  background: 'rgba(195,154,88,0.12)',
                  color: '#9a7b42',
                  fontWeight: 800,
                  fontSize: isPhone ? '0.78rem' : '0.84rem',
                  marginBottom: '12px',
                }}
              >
                بوابة الفحص الذكية
              </div>

              <h1 style={{ margin: 0, color: '#111827', fontSize: isPhone ? '1.7rem' : '2rem', lineHeight: 1.15 }}>
                {invitationTitle || 'بطاقات الدخول'}
              </h1>

              <p style={{ margin: '10px 0 0', color: '#6b7280', lineHeight: 1.9, fontSize: isPhone ? '0.94rem' : '1rem' }}>
                امسح رمز QR أو ابحث باسم الضيف أو الكود، وسجل الدخول مباشرة مع حفظ كل العمليات في نفس اللحظة.
              </p>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginTop: isPhone ? '14px' : '16px',
                }}
              >
                <div
                  style={{
                    padding: '9px 12px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.84)',
                    border: '1px solid rgba(127,42,31,0.1)',
                    color: '#475569',
                    fontSize: isPhone ? '0.82rem' : '0.88rem',
                  }}
                >
                  مصممة للعمل السريع من الموبايل
                </div>
                <div
                  style={{
                    padding: '9px 12px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.84)',
                    border: '1px solid rgba(127,42,31,0.1)',
                    color: '#475569',
                    fontSize: isPhone ? '0.82rem' : '0.88rem',
                  }}
                >
                  مسح مباشر + بحث + تسجيل فوري
                </div>
              </div>
            </div>

            <div
              style={{
                minWidth: 0,
                background: 'rgba(248,250,252,0.88)',
                borderRadius: isPhone ? '18px' : '20px',
                padding: isPhone ? '14px' : '16px',
                border: '1px solid rgba(127,42,31,0.1)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div style={{ color: '#7f2a1f', fontWeight: 800, marginBottom: '6px', fontSize: isPhone ? '0.82rem' : '0.9rem' }}>
                الدعوة
              </div>
              <div style={{ color: '#111827', fontWeight: 700 }}>{initialInvitation.slug}</div>
              <div style={{ color: '#6b7280', fontSize: isPhone ? '0.84rem' : '0.9rem', marginTop: '6px', lineHeight: 1.8 }}>
                {initialInvitation.entryConfig?.pinRequired ? 'الدخول محمي برمز PIN' : 'الدخول مفتوح بدون PIN'}
              </div>
              <div
                style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(127,42,31,0.08)',
                  color: '#94a3b8',
                  fontSize: isPhone ? '0.78rem' : '0.82rem',
                  lineHeight: 1.8,
                }}
              >
                أرسل هذا الرابط لفريق القاعة وسيتمكن من تأكيد الدخول أو المسح بالكاميرا من نفس الصفحة.
              </div>
            </div>
          </div>
        </section>

        {!authorized ? (
          <section
            style={{
              ...dynamicCardStyle,
              maxWidth: '520px',
              margin: '0 auto',
              width: '100%',
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '10px', color: '#111827', fontSize: isPhone ? '1.35rem' : '1.5rem' }}>
              إدخال رمز بوابة الدخول
            </h2>
            <p style={{ color: '#6b7280', lineHeight: 1.8, fontSize: isPhone ? '0.92rem' : '1rem' }}>
              هذه الصفحة مخصصة لفريق القاعة. أدخل رمز PIN للبدء في مسح الأكواد أو البحث عن الضيوف.
            </p>

            <form onSubmit={handleUnlock} style={{ display: 'grid', gap: '12px' }}>
              <input type="password" value={pin} onChange={(event) => setPin(event.target.value)} placeholder="PIN" style={compactMainInputStyle} />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'جارٍ التحقق...' : 'فتح البوابة'}
              </button>
            </form>
          </section>
        ) : (
          <>
            {feedback.message ? (
              <section
                style={{
                  background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
                  color: feedback.type === 'success' ? '#065f46' : '#b91c1c',
                  borderRadius: isPhone ? '16px' : '18px',
                  padding: isPhone ? '14px 16px' : '16px 18px',
                  border: `1px solid ${feedback.type === 'success' ? 'rgba(6,95,70,0.18)' : 'rgba(185,28,28,0.18)'}`,
                  fontWeight: 700,
                  fontSize: isPhone ? '0.9rem' : '0.96rem',
                  lineHeight: 1.8,
                }}
              >
                {feedback.message}
              </section>
            ) : null}

            <section style={{ display: 'grid', gap: isPhone ? '10px' : '14px', gridTemplateColumns: summaryGridColumns }}>
              <StatCard label="إجمالي التصاريح" value={summaryCards.totalPasses} compact={isPhone} />
              <StatCard label="الدخولات المسموحة" value={summaryCards.totalAllowedEntries} compact={isPhone} />
              <StatCard label="الدخولات المستخدمة" value={summaryCards.totalUsedEntries} compact={isPhone} />
              <StatCard label="المتبقي" value={summaryCards.remainingEntries} compact={isPhone} />
            </section>

            <section style={{ display: 'grid', gap: shellGap, gridTemplateColumns: layoutColumns }}>
              <div style={dynamicCardStyle}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '14px',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    marginBottom: isPhone ? '14px' : '16px',
                  }}
                >
                  <div style={{ display: 'grid', gap: '6px', minWidth: 0 }}>
                    <div style={{ color: '#9a7b42', fontSize: '0.8rem', fontWeight: 800 }}>منطقة التشغيل</div>
                    <h2 style={{ margin: 0, color: '#111827', fontSize: isPhone ? '1.35rem' : '1.5rem' }}>المسح والبحث</h2>
                    <div style={{ color: '#6b7280', fontSize: isPhone ? '0.86rem' : '0.92rem', lineHeight: 1.8 }}>
                      امسح الكود أو الصق بياناته أو انسخ رابط البوابة من نفس الحقل.
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '16px',
                      background: 'rgba(248,250,252,0.92)',
                      border: '1px solid rgba(127,42,31,0.1)',
                      color: '#334155',
                      fontSize: isPhone ? '0.82rem' : '0.88rem',
                      fontWeight: 700,
                    }}
                  >
                    <span
                      style={{
                        width: '9px',
                        height: '9px',
                        borderRadius: '999px',
                        background: cameraEnabled ? '#16a34a' : '#c39a58',
                        boxShadow: cameraEnabled ? '0 0 0 5px rgba(22,163,74,0.14)' : '0 0 0 5px rgba(195,154,88,0.14)',
                      }}
                    />
                    {cameraEnabled ? 'الكاميرا قيد التشغيل' : 'جاهزة للمسح اليدوي أو بالكاميرا'}
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gap: '12px',
                    gridTemplateColumns: formGridColumns,
                    marginBottom: '16px',
                    padding: isPhone ? '12px' : '14px',
                    borderRadius: '20px',
                    background: 'rgba(248,250,252,0.7)',
                    border: '1px solid rgba(127,42,31,0.08)',
                  }}
                >
                  <FieldBlock label="اسم البوابة">
                    <input type="text" value={gateLabel} onChange={(event) => setGateLabel(event.target.value)} placeholder="اسم البوابة" style={compactInputStyle} />
                  </FieldBlock>
                  <FieldBlock label="اسم الموظف">
                    <input type="text" value={staffName} onChange={(event) => setStaffName(event.target.value)} placeholder="اسم الموظف" style={compactInputStyle} />
                  </FieldBlock>
                  <FieldBlock label="كود الموظف">
                    <input type="text" value={staffCode} onChange={(event) => setStaffCode(event.target.value)} placeholder="كود الموظف" style={compactInputStyle} />
                  </FieldBlock>
                  <FieldBlock label="عدد الداخلين">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={checkedInCount}
                      onChange={(event) => setCheckedInCount(Math.max(1, Number(event.target.value || 1)))}
                      placeholder="عدد الداخلين"
                      style={compactInputStyle}
                    />
                  </FieldBlock>
                </div>

                {cameraEnabled ? (
                  <div style={{ marginBottom: '16px' }}>
                    <div
                      style={{
                        borderRadius: isPhone ? '20px' : '22px',
                        overflow: 'hidden',
                        border: '1px solid rgba(127,42,31,0.12)',
                        background: '#111827',
                        minHeight: isPhone ? '220px' : '260px',
                        boxShadow: '0 16px 42px rgba(15, 23, 42, 0.18)',
                      }}
                    >
                      <video
                        ref={videoRef}
                        muted
                        playsInline
                        autoPlay
                        style={{ width: '100%', display: 'block', minHeight: isPhone ? '220px' : '260px', objectFit: 'cover' }}
                      />
                    </div>
                    {cameraError ? (
                      <div style={{ marginTop: '10px', color: '#b91c1c', fontSize: isPhone ? '0.86rem' : '0.92rem' }}>{cameraError}</div>
                    ) : (
                      <div style={{ marginTop: '10px', color: '#6b7280', fontSize: isPhone ? '0.86rem' : '0.92rem', lineHeight: 1.8 }}>
                        وجّه الكاميرا إلى كود QR وسيتم تسجيل الدخول تلقائيًا.
                      </div>
                    )}
                  </div>
                ) : null}

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void submitScan(scanInput);
                  }}
                  style={{ display: 'grid', gap: '12px', marginBottom: '18px' }}
                >
                  <div style={{ color: '#7f2a1f', fontWeight: 800, fontSize: isPhone ? '0.9rem' : '0.96rem' }}>المسح السريع</div>

                  <div style={{ position: 'relative', minWidth: 0 }}>
                    <input
                      type="text"
                      value={scanInput}
                      onChange={(event) => setScanInput(event.target.value)}
                      placeholder="الصق بيانات QR أو أدخل كود FRH-..."
                      style={{
                        ...compactMainInputStyle,
                        width: '100%',
                        minWidth: 0,
                        paddingInlineEnd: scanInputPaddingEnd,
                      }}
                    />

                    <div
                      style={{
                        position: 'absolute',
                        insetInlineEnd: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: isPhone ? '6px' : '8px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          void handleCopyPageLink();
                        }}
                        disabled={sharePageBusy}
                        title="نسخ رابط الصفحة"
                        aria-label="نسخ رابط الصفحة"
                        style={{
                          ...inlineActionButtonStyle,
                          minWidth: isPhone ? '74px' : '64px',
                          height: isPhone ? '38px' : '40px',
                          padding: isPhone ? '0 10px' : '0 12px',
                          gap: isPhone ? '4px' : '6px',
                          opacity: sharePageBusy ? 0.7 : 1,
                          borderRadius: isPhone ? '11px' : '12px',
                        }}
                      >
                        <CopyIcon />
                        <span style={{ fontSize: isPhone ? '0.8rem' : '0.88rem', fontWeight: 700 }}>{sharePageBusy ? '...' : shareLabel}</span>
                      </button>

                      {cameraSupported ? (
                        <button
                          type="button"
                          onClick={() => {
                            void handleCameraButtonClick();
                          }}
                          title={cameraEnabled ? 'إيقاف الكاميرا' : 'فتح الكاميرا'}
                          aria-label={cameraEnabled ? 'إيقاف الكاميرا' : 'فتح الكاميرا'}
                          disabled={cameraRequesting}
                          style={{
                            ...inlineActionButtonStyle,
                            width: isPhone ? '38px' : '40px',
                            minWidth: isPhone ? '38px' : '40px',
                            height: isPhone ? '38px' : '40px',
                            padding: '0',
                            background: cameraEnabled ? '#7f2a1f' : '#fff',
                            color: cameraEnabled ? '#fff' : '#7f2a1f',
                            opacity: cameraRequesting ? 0.7 : 1,
                            borderRadius: isPhone ? '11px' : '12px',
                          }}
                        >
                          <CameraIcon size={20} />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={processingScan}>
                    {processingScan ? 'جارٍ تسجيل الدخول...' : 'تأكيد الدخول الآن'}
                  </button>
                </form>

                <form onSubmit={handleSearch} style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ color: '#7f2a1f', fontWeight: 800, fontSize: isPhone ? '0.9rem' : '0.96rem' }}>بحث بالاسم أو الهاتف أو الكود</div>
                  <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: searchBarColumns }}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="ابحث عن ضيف أو كود"
                      style={{ ...compactMainInputStyle, width: '100%' }}
                    />
                    <button type="submit" className="btn btn-outline" disabled={loading}>
                      {loading ? 'جارٍ البحث...' : 'بحث'}
                    </button>
                  </div>
                </form>

                <div style={{ marginTop: '18px' }}>
                  <h3 style={{ margin: '0 0 12px', color: '#111827', fontSize: isPhone ? '1rem' : '1.08rem' }}>نتائج البحث</h3>
                  {matches.length === 0 ? (
                    <div style={{ color: '#6b7280', fontSize: isPhone ? '0.9rem' : '0.96rem' }}>لا توجد نتائج مطابقة حاليًا.</div>
                  ) : (
                    <div
                      style={{
                        display: 'grid',
                        gap: '12px',
                        ...searchResultsContainerStyle,
                      }}
                    >
                      {matches.map((entryPass) => {
                        const badge = getStatusStyle(entryPass.status);

                        return (
                          <div
                            key={entryPass.id}
                            style={{
                              borderRadius: isPhone ? '16px' : '18px',
                              border: '1px solid rgba(127,42,31,0.12)',
                              padding: isPhone ? '14px' : '16px',
                              background: '#fcfcfd',
                              display: 'grid',
                              gap: '10px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                              <div>
                                <div style={{ fontWeight: 800, color: '#111827', marginBottom: '4px' }}>{entryPass.guestName || entryPass.passCode}</div>
                                <div style={{ color: '#6b7280', fontSize: isPhone ? '0.86rem' : '0.92rem', lineHeight: 1.7 }}>
                                  الكود: {entryPass.passCode}
                                  {entryPass.phone ? ` • ${entryPass.phone}` : ''}
                                </div>
                              </div>
                              <span
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '999px',
                                  fontSize: isPhone ? '0.78rem' : '0.85rem',
                                  fontWeight: 700,
                                  ...badge,
                                }}
                              >
                                {getStatusLabel(entryPass.status)}
                              </span>
                            </div>

                            <div style={{ color: '#374151', fontSize: isPhone ? '0.88rem' : '0.95rem', lineHeight: 1.85 }}>
                              المسموح: {entryPass.allowedEntries} • المستخدم: {entryPass.usedEntries} • المتبقي: {entryPass.remainingEntries}
                              {entryPass.tableNumber ? ` • الطاولة: ${entryPass.tableNumber}` : ''}
                            </div>

                            <div style={{ display: 'grid', gap: '8px', gridTemplateColumns: isPhone ? '1fr' : 'repeat(2, max-content)' }}>
                              <button
                                type="button"
                                className="btn btn-primary"
                                disabled={
                                  processingScan ||
                                  entryPass.status === 'USED' ||
                                  entryPass.status === 'DISABLED' ||
                                  entryPass.status === 'CANCELLED'
                                }
                                onClick={() => {
                                  void handleQuickCheckIn(entryPass.passCode);
                                }}
                              >
                                تسجيل {checkedInCount} دخول
                              </button>
                              <button type="button" className="btn btn-outline" onClick={() => setScanInput(entryPass.passCode)}>
                                تعبئة الكود
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div style={dynamicCardStyle}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    marginBottom: isPhone ? '12px' : '14px',
                  }}
                >
                  <div style={{ display: 'grid', gap: '4px' }}>
                    <div style={{ color: '#9a7b42', fontSize: '0.8rem', fontWeight: 800 }}>تحديث</div>
                    <h2 style={{ margin: 0, color: '#111827', fontSize: isPhone ? '1.2rem' : '1.5rem' }}>آخر عمليات الدخول</h2>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      void fetchOverview(searchQuery);
                    }}
                  >
                    تحديث
                  </button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gap: '12px',
                    ...recentLogsContainerStyle,
                  }}
                >
                  {recentLogs.length === 0 ? (
                    <div style={{ color: '#6b7280', fontSize: isPhone ? '0.9rem' : '0.96rem' }}>لا توجد عمليات دخول مسجلة بعد.</div>
                  ) : (
                    recentLogs.map((log) => (
                      <div
                        key={log.id}
                        style={{
                          borderRadius: isPhone ? '16px' : '18px',
                          border: '1px solid rgba(127,42,31,0.12)',
                          padding: isPhone ? '13px 14px' : '14px 16px',
                          background: '#fcfcfd',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                          <div style={{ fontWeight: 800, color: '#111827' }}>{log.entryPass?.guestName || log.entryPass?.passCode || 'بطاقة دخول'}</div>
                          <div style={{ color: '#6b7280', fontSize: isPhone ? '0.8rem' : '0.88rem' }}>{formatDate(log.createdAt)}</div>
                        </div>
                        <div style={{ marginTop: '6px', color: '#374151', fontSize: isPhone ? '0.86rem' : '0.94rem', lineHeight: 1.8 }}>
                          تم تسجيل {log.checkedInCount} دخول • المتبقي: {log.remainingAfter}
                          {log.gateLabel ? ` • البوابة: ${log.gateLabel}` : ''}
                          {log.staffName ? ` • الموظف: ${log.staffName}` : ''}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
