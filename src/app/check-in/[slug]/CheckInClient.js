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
    setFeedback({ type: '', message: '' });

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
    } catch (error) {
      // Feedback already shown in submitScan.
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
      } catch (error) {
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
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#9a7b42', fontWeight: 700, marginBottom: '8px' }}>بوابة الدخول الذكية</div>
              <h1 style={{ margin: 0, color: '#111827', fontSize: '2rem' }}>{invitationTitle || 'بطاقات الدخول'}</h1>
              <p style={{ margin: '10px 0 0', color: '#6b7280', lineHeight: 1.9 }}>
                امسح الـ QR أو ابحث باسم الضيف أو الكود لتسجيل الدخول مع حفظ كل العمليات مباشرة.
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
              background: '#fff',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid rgba(127,42,31,0.12)',
              boxShadow: '0 18px 50px rgba(15, 23, 42, 0.06)',
              maxWidth: '520px',
              margin: '0 auto',
              width: '100%',
            }}
          >
            <h2 style={{ marginTop: 0, color: '#111827' }}>إدخال رمز بوابة الدخول</h2>
            <p style={{ color: '#6b7280', lineHeight: 1.8 }}>
              هذه الصفحة مخصصة لفريق القاعة. أدخل رمز الـ PIN للبدء في مسح الأكواد أو البحث عن الضيوف.
            </p>

            <form onSubmit={handleUnlock} style={{ display: 'grid', gap: '12px' }}>
              <input
                type="password"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                placeholder="PIN"
                style={{ padding: '14px 16px', borderRadius: '16px', border: '1px solid #dbe3ef', fontSize: '1rem' }}
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
              <div
                style={{
                  background: '#fff',
                  borderRadius: '24px',
                  padding: '22px',
                  border: '1px solid rgba(127,42,31,0.12)',
                  boxShadow: '0 18px 50px rgba(15, 23, 42, 0.06)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ margin: 0, color: '#111827' }}>المسح والبحث</h2>
                  {cameraSupported ? (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setCameraEnabled((current) => !current)}
                    >
                      {cameraEnabled ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'}
                    </button>
                  ) : null}
                </div>

                <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '14px' }}>
                  <input
                    type="text"
                    value={gateLabel}
                    onChange={(event) => setGateLabel(event.target.value)}
                    placeholder="اسم البوابة"
                    style={{ padding: '12px 14px', borderRadius: '14px', border: '1px solid #dbe3ef' }}
                  />
                  <input
                    type="text"
                    value={staffName}
                    onChange={(event) => setStaffName(event.target.value)}
                    placeholder="اسم الموظف"
                    style={{ padding: '12px 14px', borderRadius: '14px', border: '1px solid #dbe3ef' }}
                  />
                  <input
                    type="text"
                    value={staffCode}
                    onChange={(event) => setStaffCode(event.target.value)}
                    placeholder="كود الموظف"
                    style={{ padding: '12px 14px', borderRadius: '14px', border: '1px solid #dbe3ef' }}
                  />
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={checkedInCount}
                    onChange={(event) => setCheckedInCount(Number(event.target.value || 1))}
                    placeholder="عدد الداخلين"
                    style={{ padding: '12px 14px', borderRadius: '14px', border: '1px solid #dbe3ef' }}
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
                        وجه الكاميرا إلى كود QR وسيتم تسجيل الدخول تلقائيًا.
                      </div>
                    )}
                  </div>
                ) : null}

                <form onSubmit={(event) => { event.preventDefault(); void submitScan(scanInput); }} style={{ display: 'grid', gap: '12px', marginBottom: '18px' }}>
                  <input
                    type="text"
                    value={scanInput}
                    onChange={(event) => setScanInput(event.target.value)}
                    placeholder="الصق بيانات QR أو أدخل كود FRH-..."
                    style={{ padding: '14px 16px', borderRadius: '16px', border: '1px solid #dbe3ef', fontSize: '1rem' }}
                  />
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
                      style={{ flex: '1 1 260px', padding: '14px 16px', borderRadius: '16px', border: '1px solid #dbe3ef' }}
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
                                <div style={{ fontWeight: 800, color: '#111827', marginBottom: '4px' }}>{entryPass.guestName || entryPass.passCode}</div>
                                <div style={{ color: '#6b7280', fontSize: '0.92rem' }}>
                                  الكود: {entryPass.passCode} {entryPass.phone ? `• ${entryPass.phone}` : ''}
                                </div>
                              </div>
                              <span style={{ padding: '6px 10px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, ...badge }}>
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
                                disabled={processingScan || entryPass.status === 'USED' || entryPass.status === 'DISABLED' || entryPass.status === 'CANCELLED'}
                                onClick={() => { void handleQuickCheckIn(entryPass.passCode); }}
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

              <div
                style={{
                  background: '#fff',
                  borderRadius: '24px',
                  padding: '22px',
                  border: '1px solid rgba(127,42,31,0.12)',
                  boxShadow: '0 18px 50px rgba(15, 23, 42, 0.06)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px' }}>
                  <h2 style={{ margin: 0, color: '#111827' }}>آخر عمليات الدخول</h2>
                  <button type="button" className="btn btn-outline" onClick={() => { void fetchOverview(searchQuery); }}>
                    تحديث
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '12px' }}>
                  {recentLogs.length === 0 ? (
                    <div style={{ color: '#6b7280' }}>لا توجد عمليات دخول مسجلة بعد.</div>
                  ) : recentLogs.map((log) => (
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
                        <div style={{ color: '#6b7280', fontSize: '0.88rem' }}>
                          {new Date(log.createdAt).toLocaleString('ar-EG')}
                        </div>
                      </div>
                      <div style={{ marginTop: '6px', color: '#374151', fontSize: '0.94rem', lineHeight: 1.8 }}>
                        تم تسجيل {log.checkedInCount} دخول • المتبقي: {log.remainingAfter}
                        {log.gateLabel ? ` • البوابة: ${log.gateLabel}` : ''}
                        {log.staffName ? ` • الموظف: ${log.staffName}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
