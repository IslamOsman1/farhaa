'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

function StatCard({ label, value }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '18px',
        padding: '16px',
        border: '1px solid rgba(127,42,31,0.12)',
        boxShadow: '0 14px 30px rgba(15, 23, 42, 0.06)',
      }}
    >
      <div style={{ color: '#7f2a1f', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 700 }}>{label}</div>
      <div style={{ color: '#111827', fontSize: '1.8rem', fontWeight: 800 }}>{value}</div>
    </div>
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
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
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
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M9 9.75C9 8.50736 10.0074 7.5 11.25 7.5H17.25C18.4926 7.5 19.5 8.50736 19.5 9.75V17.25C19.5 18.4926 18.4926 19.5 17.25 19.5H11.25C10.0074 19.5 9 18.4926 9 17.25V9.75Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M15 7.5V6.75C15 5.50736 13.9926 4.5 12.75 4.5H6.75C5.50736 4.5 4.5 5.50736 4.5 6.75V14.25C4.5 15.4926 5.50736 16.5 6.75 16.5H9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
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
  const [cameraError, setCameraError] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const scanLockRef = useRef(false);
  const lastScanRef = useRef('');

  const invitationTitle = useMemo(
    () => [initialInvitation.groomName, initialInvitation.brideName].filter(Boolean).join(' و '),
    [initialInvitation.brideName, initialInvitation.groomName],
  );

  async function fetchOverview(query = '') {
    setLoading(true);
    setFeedback((current) => (current.type === 'success' && current.message ? current : { type: '', message: '' }));

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
      // Feedback already shown in submitScan.
    }
  }

  async function handleCopyPageLink() {
    if (typeof window === 'undefined') {
      return;
    }

    const absoluteUrl = window.location.href;
    setSharePageBusy(true);

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
        message: 'تم نسخ رابط صفحة البوابة. يمكنك إرساله الآن لصاحب الدعوة أو لفريق القاعة.',
      });
    } catch {
      setFeedback({
        type: 'error',
        message: 'تعذر نسخ الرابط تلقائيًا. انسخ رابط الصفحة من شريط المتصفح.',
      });
    } finally {
      setSharePageBusy(false);
    }
  }

  function stopCamera() {
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

    setCameraSupported(Boolean(window.BarcodeDetector && navigator.mediaDevices?.getUserMedia));
    setDeviceLabel(window.navigator.userAgent.slice(0, 100));

    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (!authorized || !cameraEnabled || !cameraSupported || typeof window === 'undefined') {
      stopCamera();
      return undefined;
    }

    let cancelled = false;
    let intervalId = null;

    async function start() {
      try {
        setCameraError('');

        if (!detectorRef.current) {
          detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        intervalId = window.setInterval(async () => {
          if (scanLockRef.current || !videoRef.current || videoRef.current.readyState < 2) {
            return;
          }

          try {
            const detected = await detectorRef.current.detect(videoRef.current);
            const rawValue = detected?.[0]?.rawValue ? String(detected[0].rawValue).trim() : '';
            if (!rawValue || rawValue === lastScanRef.current) {
              return;
            }

            scanLockRef.current = true;
            lastScanRef.current = rawValue;
            await handleQuickCheckIn(rawValue);
            window.setTimeout(() => {
              scanLockRef.current = false;
            }, 1400);
          } catch (detectError) {
            console.error('Barcode detection failed:', detectError);
          }
        }, 700);
      } catch {
        setCameraEnabled(false);
        setCameraError('تعذر تشغيل الكاميرا على هذا الجهاز أو المتصفح.');
      }
    }

    void start();

    return () => {
      cancelled = true;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
      stopCamera();
    };
  }, [authorized, cameraEnabled, cameraSupported, checkedInCount, deviceLabel, gateLabel, pin, staffCode, staffName]);

  useEffect(() => {
    if (authorized) {
      void fetchOverview('');
    }
    // Run once after authorization state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized]);

  const summaryCards = summary || {
    totalPasses: 0,
    totalAllowedEntries: 0,
    totalUsedEntries: 0,
    remainingEntries: 0,
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f9f6ef 0%, #f3f6fb 100%)',
        padding: '24px',
        direction: 'rtl',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gap: '20px' }}>
        <section
          style={{
            background: '#fff',
            borderRadius: '28px',
            padding: '24px',
            border: '1px solid rgba(195,154,88,0.18)',
            boxShadow: '0 18px 50px rgba(15, 23, 42, 0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '18px',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
            }}
          >
            <div>
              <div style={{ color: '#9a7b42', fontWeight: 700, marginBottom: '8px' }}>بوابة الدخول الذكية</div>
              <h1 style={{ margin: 0, color: '#111827', fontSize: '2rem' }}>{invitationTitle || 'بطاقات الدخول'}</h1>
              <p style={{ margin: '10px 0 0', color: '#6b7280', lineHeight: 1.9 }}>
                امسح رمز QR أو ابحث باسم الضيف أو الكود، وسجّل الدخول مباشرة مع حفظ كل العمليات في نفس اللحظة.
              </p>
            </div>

            <div
              style={{
                minWidth: '220px',
                background: '#f8fafc',
                borderRadius: '20px',
                padding: '14px 16px',
                border: '1px solid rgba(127,42,31,0.1)',
              }}
            >
              <div style={{ color: '#7f2a1f', fontWeight: 800, marginBottom: '6px' }}>الدعوة</div>
              <div style={{ color: '#111827', fontWeight: 700 }}>{initialInvitation.slug}</div>
              <div style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '6px' }}>
                {initialInvitation.entryConfig?.pinRequired ? 'الدخول محمي برمز PIN' : 'الدخول مفتوح بدون PIN'}
              </div>
            </div>
          </div>
        </section>

        {!authorized ? (
          <section
            style={{
              ...cardStyle,
              maxWidth: '520px',
              margin: '0 auto',
              width: '100%',
            }}
          >
            <h2 style={{ marginTop: 0, color: '#111827' }}>إدخال رمز بوابة الدخول</h2>
            <p style={{ color: '#6b7280', lineHeight: 1.8 }}>
              هذه الصفحة مخصصة لفريق القاعة. أدخل رمز PIN للبدء في مسح الأكواد أو البحث عن الضيوف.
            </p>

            <form onSubmit={handleUnlock} style={{ display: 'grid', gap: '12px' }}>
              <input
                type="password"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                placeholder="PIN"
                style={mainInputStyle}
              />
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
                  borderRadius: '18px',
                  padding: '16px 18px',
                  border: `1px solid ${feedback.type === 'success' ? 'rgba(6,95,70,0.18)' : 'rgba(185,28,28,0.18)'}`,
                  fontWeight: 700,
                }}
              >
                {feedback.message}
              </section>
            ) : null}

            <section style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <StatCard label="إجمالي التصاريح" value={summaryCards.totalPasses} />
              <StatCard label="الدخولات المسموحة" value={summaryCards.totalAllowedEntries} />
              <StatCard label="الدخولات المستخدمة" value={summaryCards.totalUsedEntries} />
              <StatCard label="المتبقي" value={summaryCards.remainingEntries} />
            </section>

            <section style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(320px, 0.85fr)' }}>
              <div style={cardStyle}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <h2 style={{ margin: 0, color: '#111827' }}>المسح والبحث</h2>
                  <div style={{ color: '#6b7280', fontSize: '0.92rem' }}>امسح الكود أو انسخ رابط البوابة من نفس الحقل</div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gap: '12px',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    marginBottom: '14px',
                  }}
                >
                  <input
                    type="text"
                    value={gateLabel}
                    onChange={(event) => setGateLabel(event.target.value)}
                    placeholder="اسم البوابة"
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    value={staffName}
                    onChange={(event) => setStaffName(event.target.value)}
                    placeholder="اسم الموظف"
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    value={staffCode}
                    onChange={(event) => setStaffCode(event.target.value)}
                    placeholder="كود الموظف"
                    style={inputStyle}
                  />
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={checkedInCount}
                    onChange={(event) => setCheckedInCount(Math.max(1, Number(event.target.value || 1)))}
                    placeholder="عدد الداخلين"
                    style={inputStyle}
                  />
                </div>

                {cameraEnabled ? (
                  <div style={{ marginBottom: '16px' }}>
                    <div
                      style={{
                        borderRadius: '22px',
                        overflow: 'hidden',
                        border: '1px solid rgba(127,42,31,0.12)',
                        background: '#111827',
                        minHeight: '260px',
                      }}
                    >
                      <video
                        ref={videoRef}
                        muted
                        playsInline
                        autoPlay
                        style={{ width: '100%', display: 'block', minHeight: '260px', objectFit: 'cover' }}
                      />
                    </div>
                    {cameraError ? (
                      <div style={{ marginTop: '10px', color: '#b91c1c', fontSize: '0.92rem' }}>{cameraError}</div>
                    ) : (
                      <div style={{ marginTop: '10px', color: '#6b7280', fontSize: '0.92rem' }}>
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
                  <div style={{ position: 'relative', flex: '1 1 320px', minWidth: 0 }}>
                    <input
                      type="text"
                      value={scanInput}
                      onChange={(event) => setScanInput(event.target.value)}
                      placeholder="الصق بيانات QR أو أدخل كود FRH-..."
                      style={{
                        ...mainInputStyle,
                        width: '100%',
                        minWidth: 0,
                        paddingLeft: '16px',
                        paddingRight: '16px',
                        paddingInlineEnd: cameraSupported ? '142px' : '82px',
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
                        gap: '8px',
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
                          height: '40px',
                          minWidth: '64px',
                          padding: '0 12px',
                          borderRadius: '12px',
                          border: '1px solid rgba(127,42,31,0.18)',
                          background: '#fff',
                          color: '#7f2a1f',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontWeight: 700,
                          cursor: sharePageBusy ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <CopyIcon />
                        <span style={{ fontSize: '0.88rem' }}>{sharePageBusy ? '...' : 'نسخ'}</span>
                      </button>
                      {cameraSupported ? (
                        <button
                          type="button"
                          onClick={() => setCameraEnabled((current) => !current)}
                          title={cameraEnabled ? 'إيقاف الكاميرا' : 'فتح الكاميرا'}
                          aria-label={cameraEnabled ? 'إيقاف الكاميرا' : 'فتح الكاميرا'}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            border: '1px solid rgba(127,42,31,0.18)',
                            background: cameraEnabled ? '#7f2a1f' : '#fff',
                            color: cameraEnabled ? '#fff' : '#7f2a1f',
                            padding: '0',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
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
                  <div style={{ color: '#7f2a1f', fontWeight: 800 }}>بحث بالاسم أو الهاتف أو الكود</div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="ابحث عن ضيف أو كود"
                      style={{ ...mainInputStyle, flex: '1 1 260px' }}
                    />
                    <button type="submit" className="btn btn-outline" disabled={loading}>
                      {loading ? 'جارٍ البحث...' : 'بحث'}
                    </button>
                  </div>
                </form>

                <div style={{ marginTop: '18px' }}>
                  <h3 style={{ margin: '0 0 12px', color: '#111827' }}>نتائج البحث</h3>
                  {matches.length === 0 ? (
                    <div style={{ color: '#6b7280' }}>لا توجد نتائج مطابقة حاليًا.</div>
                  ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {matches.map((entryPass) => {
                        const badge = getStatusStyle(entryPass.status);

                        return (
                          <div
                            key={entryPass.id}
                            style={{
                              borderRadius: '18px',
                              border: '1px solid rgba(127,42,31,0.12)',
                              padding: '16px',
                              background: '#fcfcfd',
                              display: 'grid',
                              gap: '10px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                              <div>
                                <div style={{ fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
                                  {entryPass.guestName || entryPass.passCode}
                                </div>
                                <div style={{ color: '#6b7280', fontSize: '0.92rem' }}>
                                  الكود: {entryPass.passCode} {entryPass.phone ? `• ${entryPass.phone}` : ''}
                                </div>
                              </div>
                              <span
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '999px',
                                  fontSize: '0.85rem',
                                  fontWeight: 700,
                                  ...badge,
                                }}
                              >
                                {getStatusLabel(entryPass.status)}
                              </span>
                            </div>

                            <div style={{ color: '#374151', fontSize: '0.95rem' }}>
                              المسموح: {entryPass.allowedEntries} • المستخدم: {entryPass.usedEntries} • المتبقي: {entryPass.remainingEntries}
                              {entryPass.tableNumber ? ` • الطاولة: ${entryPass.tableNumber}` : ''}
                            </div>

                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
                              <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => setScanInput(entryPass.passCode)}
                              >
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

              <div style={cardStyle}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <h2 style={{ margin: 0, color: '#111827' }}>آخر عمليات الدخول</h2>
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

                <div style={{ display: 'grid', gap: '12px' }}>
                  {recentLogs.length === 0 ? (
                    <div style={{ color: '#6b7280' }}>لا توجد عمليات دخول مسجلة بعد.</div>
                  ) : (
                    recentLogs.map((log) => (
                      <div
                        key={log.id}
                        style={{
                          borderRadius: '18px',
                          border: '1px solid rgba(127,42,31,0.12)',
                          padding: '14px 16px',
                          background: '#fcfcfd',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                          <div style={{ fontWeight: 800, color: '#111827' }}>
                            {log.entryPass?.guestName || log.entryPass?.passCode || 'بطاقة دخول'}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '0.88rem' }}>{formatDate(log.createdAt)}</div>
                        </div>
                        <div style={{ marginTop: '6px', color: '#374151', fontSize: '0.94rem', lineHeight: 1.8 }}>
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
