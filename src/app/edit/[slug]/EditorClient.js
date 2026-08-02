'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function EditorClient({ initialData }) {
  // Parse sections JSON safely
  let initialSections = {
    gallery: true,
    timeline: true,
    rsvp: true,
    calendar: true
  };
  try {
    if (initialData.sections) {
      initialSections = { ...initialSections, ...JSON.parse(initialData.sections) };
    }
  } catch(e) {}
  
  // Parse coupleStory safely
  let extraFields = {};
  try {
    if (initialData.coupleStory) {
      extraFields = JSON.parse(initialData.coupleStory);
    }
  } catch (e) {}

  const [formData, setFormData] = useState({
    groomName: initialData.groomName || 'اسم العريس',
    brideName: initialData.brideName || 'اسم العروس',
    weddingDate: initialData.weddingDate ? new Date(initialData.weddingDate).toISOString().slice(0, 16) : '2026-12-18T19:00',
    venueName: initialData.venueName || 'اسم القاعة',
    venueAddress: initialData.venueAddress || 'المدينة — العنوان',
    locationLink: extraFields.locationLink || 'https://maps.google.com',
    welcomeMessage: initialData.welcomeMessage || 'يتشرّفان بدعوتكم لمشاركتهما فرحة العمر',
    verseText: extraFields.verseText || 'اللّهُمَّ بارِكْ لهُما، وبارِكْ عليهِما، واجمَعْ بينهُما في خير',
    invitationText: extraFields.invitationText || 'بقلوبٍ مفعمةٍ بالفرح، نتشرّف بدعوتكم لحضور حفل زفافنا.',
    groomParentsLabel: extraFields.groomParentsLabel || 'والدا العريس',
    groomParents: extraFields.groomParents || 'عائلة العريس',
    brideParentsLabel: extraFields.brideParentsLabel || 'والدا العروس',
    brideParents: extraFields.brideParents || 'عائلة العروس',
    closingNote: extraFields.closingNote || 'بحضوركم تكتمل فرحتنا',
    closingHashtag: extraFields.closingHashtag || '#فرحتنا',
    closingFamilies: extraFields.closingFamilies || 'عائلتي العريس والعروس',
    contactLabel: extraFields.contactLabel || 'للاستفسار والتأكيد',
    contactName: extraFields.contactName || '',
    contactPhone: extraFields.contactPhone || '',
    venueImage: extraFields.venueImage || '',
    musicUrl: initialData.musicUrl || ''
  });

  const [program, setProgram] = useState(extraFields.program || [
    { time: "٧:٠٠ مساءً", title: "استقبال الضيوف" },
    { time: "٨:٣٠ مساءً", title: "الزفة" },
    { time: "٩:٣٠ مساءً", title: "العشاء" },
  ]);

  const [notes, setNotes] = useState(extraFields.notes || [
    "يُرجى الحضور قبل الموعد بنصف ساعة",
    "نتشرّف بحضوركم بأبهى حلّة",
    "الدعوة تشمل حاملها والعائلة الكريمة"
  ]);

  const [galleryImages, setGalleryImages] = useState(extraFields.galleryImages || [
    'https://da3wa.co/media/gallery/1.jpg',
    'https://da3wa.co/media/gallery/2.jpg',
    'https://da3wa.co/media/gallery/3.jpg',
    'https://da3wa.co/media/gallery/4.jpg'
  ]);

  const [sections, setSections] = useState(initialSections);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basics'); // basics, texts, program, media, sections
  const iframeRef = useRef(null);

  // Sync to iframe whenever data changes
  useEffect(() => {
    if (!iframeRef.current) return;
    
    const doc = iframeRef.current.contentDocument;
    const win = iframeRef.current.contentWindow;
    if (!doc || !win) return;

    const updateEl = (id, text) => {
      const el = doc.getElementById(id);
      if (el) el.innerText = text;
    };

    updateEl('heroGroom', formData.groomName);
    updateEl('heroBride', formData.brideName);
    
    // Format date for preview
    const dateObj = new Date(formData.weddingDate);
    const dateStr = dateObj.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const monthYear = dateObj.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
    const dayNum = dateObj.toLocaleDateString('ar-EG', { day: 'numeric' });
    const weekdayName = dateObj.toLocaleDateString('ar-EG', { weekday: 'long' });
    
    updateEl('heroDate', dateStr);
    updateEl('heroInvite', formData.welcomeMessage);
    updateEl('verseText', formData.verseText);
    updateEl('invitationText', formData.invitationText);
    updateEl('groomParents', formData.groomParents);
    updateEl('brideParents', formData.brideParents);
    updateEl('weddingDate', dateStr);
    updateEl('weddingTime', timeStr);
    updateEl('venueName', formData.venueName);
    updateEl('venueAddr', formData.venueAddress);
    updateEl('closingNote', formData.closingNote);
    updateEl('closingHashtag', formData.closingHashtag);
    updateEl('closingFamilies', formData.closingFamilies);
    
    // Sync Calendar Data manually
    const updateClassEl = (className, text) => {
      const el = doc.querySelector(className);
      if (el) el.innerText = text;
    };
    updateClassEl('.cal-top', monthYear);
    updateClassEl('.cal-wd', weekdayName);
    updateClassEl('.cal-day', dayNum);
    updateClassEl('.cal-time', timeStr);
    
    // Family labels update via querySelector
    const familyLabels = doc.querySelectorAll('.family__label');
    if (familyLabels.length >= 2) {
      familyLabels[0].innerText = formData.groomParentsLabel;
      familyLabels[1].innerText = formData.brideParentsLabel;
    }
    
    const mapBtn = doc.getElementById('mapBtn');
    if (mapBtn) mapBtn.href = formData.locationLink;
    
    // Sync Config Arrays via script.js global functions
    if (typeof win.buildTimeline === 'function') win.buildTimeline(program);
    if (typeof win.buildNotes === 'function') win.buildNotes(notes);
    if (typeof win.buildContact === 'function') win.buildContact({
      contactLabel: formData.contactLabel,
      contactName: formData.contactName,
      contactPhone: formData.contactPhone
    });
    
    // Sync Venue Image
    const vp = doc.getElementById("venuePhoto");
    if (vp && formData.venueImage) vp.style.backgroundImage = `url("${formData.venueImage}")`;

    // Sync Music
    const audioEl = doc.getElementById("bgMusic");
    if (audioEl && formData.musicUrl) {
      if (audioEl.src !== formData.musicUrl) {
        audioEl.src = formData.musicUrl;
      }
    }

    // Sync Gallery Images (Live Replacement)
    const memGrid = doc.querySelector('.mem-grid');
    if (memGrid && galleryImages.length > 0) {
      memGrid.className = `mem-grid n${Math.min(galleryImages.length, 4)}`;
      memGrid.innerHTML = galleryImages.map(img => `<figure class="mem-cell"><img src="${img}" loading="lazy" decoding="async" /></figure>`).join('');
    }
    
    // Sync Section Toggles via injected CSS
    let styleTag = doc.getElementById('editor-preview-styles');
    if (!styleTag) {
      styleTag = doc.createElement('style');
      styleTag.id = 'editor-preview-styles';
      doc.head.appendChild(styleTag);
    }

    let css = '';
    if (!sections.gallery) css += '#da3wa-mem { display: none !important; }\n';
    if (!sections.timeline) css += '.program, #timeline { display: none !important; }\n';
    if (!sections.rsvp) css += '#da3wa-rsvp { display: none !important; }\n';
    if (!sections.calendar) css += '#da3wa-cal { display: none !important; }\n';
    
    // Hide demo CTA and watermark footer
    css += '#farha-democta, #da3wa-democta, #da3wa-credit { display: none !important; }\n';
    
    styleTag.innerHTML = css;
    
  }, [formData, sections, program, notes, galleryImages]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggle = (e) => {
    setSections({ ...sections, [e.target.name]: e.target.checked });
  };
  
  const handleProgramChange = (index, field, value) => {
    const newArr = [...program];
    newArr[index][field] = value;
    setProgram(newArr);
  };
  
  const handleNoteChange = (index, value) => {
    const newArr = [...notes];
    newArr[index] = value;
    setNotes(newArr);
  };
  
  const handleGalleryChange = (index, value) => {
    const newArr = [...galleryImages];
    newArr[index] = value;
    setGalleryImages(newArr);
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/editor/${initialData.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          program, 
          notes,
          galleryImages,
          sections: JSON.stringify(sections) 
        })
      });
      if (res.ok) {
        alert('تم إرسال الدعوة وفي انتظار قبول النشر');
      } else {
        alert('حدث خطأ أثناء الحفظ');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في الاتصال');
    }
    setSaving(false);
  };

  return (
    <div className="editor-container">
      <div className="editor-topbar">
        <Link href="/" className="logo-text">FARHA</Link>
        <div className="topbar-actions">
          <button className="publish-btn" onClick={handlePublish} disabled={saving}>
            {saving ? 'جاري الحفظ...' : 'إرسال الدعوة'}
          </button>
        </div>
      </div>

      <div className="editor-layout">
        <div className="editor-sidebar">
          
          <div className="tabs-header">
            <button className={`tab-btn ${activeTab === 'basics' ? 'active' : ''}`} onClick={() => setActiveTab('basics')}>الأساسيات</button>
            <button className={`tab-btn ${activeTab === 'texts' ? 'active' : ''}`} onClick={() => setActiveTab('texts')}>النصوص</button>
            <button className={`tab-btn ${activeTab === 'program' ? 'active' : ''}`} onClick={() => setActiveTab('program')}>البرنامج والملاحظات</button>
            <button className={`tab-btn ${activeTab === 'media' ? 'active' : ''}`} onClick={() => setActiveTab('media')}>الصور</button>
            <button className={`tab-btn ${activeTab === 'sections' ? 'active' : ''}`} onClick={() => setActiveTab('sections')}>الأقسام</button>
          </div>

          <div className="tabs-content">
            {activeTab === 'basics' && (
              <>
                <div className="editor-section">
                  <h3 className="section-title">العرسان</h3>
                  <div className="input-group">
                    <label>اسم العريس</label>
                    <input type="text" name="groomName" value={formData.groomName} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>اسم العروس</label>
                    <input type="text" name="brideName" value={formData.brideName} onChange={handleChange} />
                  </div>
                </div>

                <div className="editor-section">
                  <h3 className="section-title">المكان والزمان</h3>
                  <div className="input-group">
                    <label>التاريخ والوقت</label>
                    <input type="datetime-local" name="weddingDate" value={formData.weddingDate} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>اسم القاعة</label>
                    <input type="text" name="venueName" value={formData.venueName} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>العنوان</label>
                    <input type="text" name="venueAddress" value={formData.venueAddress} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>رابط الموقع (Google Maps)</label>
                    <input type="url" name="locationLink" value={formData.locationLink} onChange={handleChange} dir="ltr" />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'texts' && (
              <>
                <div className="editor-section">
                  <h3 className="section-title">الافتتاحية</h3>
                  <div className="input-group">
                    <label>العبارة الترحيبية</label>
                    <input type="text" name="welcomeMessage" value={formData.welcomeMessage} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>الدعاء / الآية</label>
                    <textarea name="verseText" rows="2" value={formData.verseText} onChange={handleChange}></textarea>
                  </div>
                  <div className="input-group">
                    <label>نص الدعوة الرئيسي</label>
                    <textarea name="invitationText" rows="3" value={formData.invitationText} onChange={handleChange}></textarea>
                  </div>
                </div>
                
                <div className="editor-section">
                  <h3 className="section-title">العوائل</h3>
                  <div className="input-row">
                    <div className="input-group">
                      <label>عنوان عائلة العريس</label>
                      <input type="text" name="groomParentsLabel" value={formData.groomParentsLabel} onChange={handleChange} />
                    </div>
                    <div className="input-group">
                      <label>اسم العائلة</label>
                      <input type="text" name="groomParents" value={formData.groomParents} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="input-row">
                    <div className="input-group">
                      <label>عنوان عائلة العروس</label>
                      <input type="text" name="brideParentsLabel" value={formData.brideParentsLabel} onChange={handleChange} />
                    </div>
                    <div className="input-group">
                      <label>اسم العائلة</label>
                      <input type="text" name="brideParents" value={formData.brideParents} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div className="editor-section">
                  <h3 className="section-title">الخاتمة</h3>
                  <div className="input-group">
                    <label>كلمة الختام</label>
                    <input type="text" name="closingNote" value={formData.closingNote} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>هاشتاغ الزفاف</label>
                    <input type="text" name="closingHashtag" value={formData.closingHashtag} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>توقيع العائلتين</label>
                    <input type="text" name="closingFamilies" value={formData.closingFamilies} onChange={handleChange} />
                  </div>
                </div>

                <div className="editor-section">
                  <h3 className="section-title">بيانات التواصل</h3>
                  <div className="input-group">
                    <label>عنوان التواصل</label>
                    <input type="text" name="contactLabel" value={formData.contactLabel} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>اسم الشخص</label>
                    <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>رقم الواتساب (بالصيغة الدولية)</label>
                    <input type="text" name="contactPhone" value={formData.contactPhone} onChange={handleChange} dir="ltr" />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'program' && (
              <>
                <div className="editor-section">
                  <h3 className="section-title">الفعاليات الزمنيّة</h3>
                  {program.map((item, index) => (
                    <div key={index} className="program-item">
                      <div className="program-inputs">
                        <input type="text" value={item.time} onChange={(e) => handleProgramChange(index, 'time', e.target.value)} placeholder="الوقت" />
                        <input type="text" value={item.title} onChange={(e) => handleProgramChange(index, 'title', e.target.value)} placeholder="الفعالية" />
                      </div>
                      <button className="remove-program-btn" onClick={() => setProgram(program.filter((_, i) => i !== index))}>×</button>
                    </div>
                  ))}
                  <button className="add-program-btn" onClick={() => setProgram([...program, { time: '٠:٠٠', title: 'جديد' }])}>+ إضافة فقرة</button>
                </div>

                <div className="editor-section">
                  <h3 className="section-title">الملاحظات</h3>
                  {notes.map((note, index) => (
                    <div key={index} className="program-item">
                      <div className="program-inputs">
                        <input type="text" value={note} onChange={(e) => handleNoteChange(index, e.target.value)} placeholder="اكتب ملاحظة..." />
                      </div>
                      <button className="remove-program-btn" onClick={() => setNotes(notes.filter((_, i) => i !== index))}>×</button>
                    </div>
                  ))}
                  <button className="add-program-btn" onClick={() => setNotes([...notes, 'ملاحظة جديدة'])}>+ إضافة ملاحظة</button>
                </div>
              </>
            )}

            {activeTab === 'media' && (
              <>
                <div className="editor-section">
                  <h3 className="section-title">صورة القاعة (خلفية)</h3>
                  <div className="input-group">
                    <label>رابط الصورة المباشر</label>
                    <input type="url" name="venueImage" value={formData.venueImage} onChange={handleChange} dir="ltr" placeholder="https://..." />
                  </div>
                </div>

                <div className="editor-section">
                  <h3 className="section-title">موسيقى الدعوة</h3>
                  <div className="input-group">
                    <label>رابط الملف الصوتي (MP3 المباشر)</label>
                    <input type="url" name="musicUrl" value={formData.musicUrl} onChange={handleChange} dir="ltr" placeholder="https://.../music.mp3" />
                  </div>
                </div>

                <div className="editor-section">
                  <h3 className="section-title">معرض الصور (Gallery)</h3>
                  {galleryImages.map((img, index) => (
                    <div key={index} className="program-item">
                      <div className="program-inputs">
                        <input type="url" value={img} onChange={(e) => handleGalleryChange(index, e.target.value)} placeholder="رابط الصورة المباشر" dir="ltr" />
                      </div>
                      <button className="remove-program-btn" onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== index))}>×</button>
                    </div>
                  ))}
                  <button className="add-program-btn" onClick={() => setGalleryImages([...galleryImages, ''])}>+ إضافة صورة لمعرض الذكريات</button>
                </div>
              </>
            )}

            {activeTab === 'sections' && (
              <div className="editor-section">
                <h3 className="section-title">تشغيل/إيقاف الأقسام</h3>
                <label className="toggle-row">
                  <span>معرض الصور (الذكريات)</span>
                  <input type="checkbox" name="gallery" checked={sections.gallery} onChange={handleToggle} />
                </label>
                <label className="toggle-row">
                  <span>برنامج الحفل (الفعاليات)</span>
                  <input type="checkbox" name="timeline" checked={sections.timeline} onChange={handleToggle} />
                </label>
                <label className="toggle-row">
                  <span>تأكيد الحضور (RSVP)</span>
                  <input type="checkbox" name="rsvp" checked={sections.rsvp} onChange={handleToggle} />
                </label>
                <label className="toggle-row">
                  <span>حفظ الموعد (التقويم)</span>
                  <input type="checkbox" name="calendar" checked={sections.calendar} onChange={handleToggle} />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Left Area - Iframe Preview */}
        <div className="editor-preview-container">
          <div className="preview-wrapper">
            <iframe 
              ref={iframeRef}
              src={`/${initialData.template.slug}/index.html`}
              className="editor-iframe"
              title="معاينة الدعوة"
              onLoad={() => setFormData(prev => ({...prev}))}
            ></iframe>
          </div>
        </div>
      </div>

      <style jsx>{`
        .editor-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background-color: #fbfaf8;
          font-family: var(--font-arabic), sans-serif;
          direction: rtl;
        }
        .editor-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 30px;
          background-color: #fff;
          border-bottom: 1px solid #eee;
          z-index: 10;
        }
        .logo-text {
          font-family: Georgia, serif;
          font-size: 1.5rem;
          font-weight: bold;
          color: #c49a45;
          text-decoration: none;
        }
        .publish-btn {
          background: linear-gradient(135deg, #ff4d7d, #8a5cf0);
          color: #fff;
          border: none;
          padding: 10px 24px;
          border-radius: 999px;
          font-weight: bold;
          cursor: pointer;
          font-family: inherit;
          font-size: 1rem;
          box-shadow: 0 4px 15px rgba(255, 77, 125, 0.3);
          transition: transform 0.2s;
        }
        .publish-btn:hover { transform: translateY(-2px); }
        .editor-layout {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        .editor-sidebar {
          width: 440px;
          background-color: #fff;
          border-left: 1px solid #eee;
          display: flex;
          flex-direction: column;
        }
        .tabs-header {
          display: flex;
          border-bottom: 1px solid #eee;
        }
        .tab-btn {
          flex: 1;
          background: none;
          border: none;
          padding: 18px 0;
          font-family: inherit;
          font-weight: bold;
          color: #888;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: 0.2s;
          font-size: 0.85rem;
        }
        .tab-btn.active {
          color: #ff4d7d;
          border-bottom-color: #ff4d7d;
        }
        .tabs-content {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .editor-section {
          background: #fff;
          border: 1px solid #eaeaea;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .section-title {
          font-size: 1.1rem;
          color: #ff4d7d;
          margin-top: 0;
          margin-bottom: 15px;
          border-bottom: 1px dashed #eee;
          padding-bottom: 10px;
        }
        .input-group { margin-bottom: 15px; flex: 1; }
        .input-row { display: flex; gap: 15px; }
        .input-group label {
          display: block;
          font-weight: bold;
          font-size: 0.9rem;
          margin-bottom: 8px;
          color: #2a2140;
        }
        .input-group input, .input-group textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.95rem;
          outline: none;
          box-sizing: border-box;
        }
        .input-group input:focus, .input-group textarea:focus {
          border-color: #ff4d7d;
        }
        .toggle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f5f5f5;
          font-weight: bold;
          color: #2a2140;
          cursor: pointer;
        }
        .toggle-row:last-child { border-bottom: none; }
        
        .program-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          background: #fbfaf8;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #eaeaea;
        }
        .program-inputs {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }
        .program-inputs input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-family: inherit;
          font-size: 0.9rem;
          outline: none;
        }
        .program-inputs input:focus { border-color: #ff4d7d; }
        .remove-program-btn {
          background: #ffe3e3;
          color: #ff4d4d;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-size: 1.2rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
        }
        .remove-program-btn:hover { background: #ffcccc; }
        .add-program-btn {
          width: 100%;
          padding: 12px;
          background: #f0f2f5;
          color: #555;
          border: 1px dashed #ccc;
          border-radius: 8px;
          font-family: inherit;
          font-weight: bold;
          cursor: pointer;
          margin-top: 10px;
        }
        .add-program-btn:hover { background: #e4e6e9; border-color: #aaa; }

        .editor-preview-container {
          flex: 1;
          background-color: #f0f2f5;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 30px;
          overflow-y: auto;
        }
        .preview-wrapper {
          width: 400px;
          height: 800px;
          background: #fff;
          border-radius: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          overflow: hidden;
          border: 12px solid #333;
          position: relative;
        }
        .editor-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
      `}</style>
    </div>
  );
}
