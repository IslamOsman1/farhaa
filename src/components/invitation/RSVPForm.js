'use client';

import { useState } from 'react';

export default function RSVPForm({ invitationId }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    status: 'attending',
    companions: 0,
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`/api/invitations/${invitationId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setSubmitted(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="inv-section">
        <h2 className="inv-title">شكراً لك!</h2>
        <p className="inv-subtitle">تم استلام ردك بنجاح. نتطلع لرؤيتك.</p>
      </section>
    );
  }

  return (
    <section className="inv-section">
      <h2 className="inv-title">تأكيد الحضور</h2>
      <form className="rsvp-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>الاسم الكريم</label>
          <input 
            type="text" 
            className="form-input" 
            required 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label>رقم الجوال</label>
          <input 
            type="tel" 
            className="form-input" 
            required 
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>هل ستحضر؟</label>
          <div className="form-radio-group">
            <label className="form-radio-label">
              <input 
                type="radio" 
                name="status" 
                value="attending" 
                checked={formData.status === 'attending'}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              />
              بكل سرور
            </label>
            <label className="form-radio-label">
              <input 
                type="radio" 
                name="status" 
                value="declined" 
                checked={formData.status === 'declined'}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              />
              أعتذر عن الحضور
            </label>
          </div>
        </div>

        {formData.status === 'attending' && (
          <div className="form-group">
            <label>عدد المرافقين</label>
            <input 
              type="number" 
              className="form-input" 
              min="0"
              max="10"
              value={formData.companions}
              onChange={(e) => setFormData({...formData, companions: parseInt(e.target.value) || 0})}
            />
          </div>
        )}

        <div className="form-group">
          <label>رسالة للعروسين (اختياري)</label>
          <textarea 
            className="form-input" 
            rows="3"
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
          ></textarea>
        </div>

        <button type="submit" className="inv-btn" disabled={loading}>
          {loading ? 'جاري الإرسال...' : 'تأكيد الحضور'}
        </button>
      </form>
    </section>
  );
}
