'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewInvitationAdmin() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    occasion: 'زفاف',
    templateId: ''
  });
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        setTemplates(data);
        if (data.length > 0) setFormData(prev => ({ ...prev, templateId: data[0].slug }));
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: formData.name,
          phone: formData.phone,
          countryCode: '',
          occasion: formData.occasion,
          templateId: formData.templateId
        })
      });
      const data = await res.json();
      if (res.ok) {
        // Redirect to editor
        router.push(`/edit/${data.slug}`);
      } else {
        alert('حدث خطأ');
      }
    } catch (err) {
      console.error(err);
      alert('خطأ في الاتصال');
    }
    setLoading(false);
  };

  return (
    <div className="admin-form-container" style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>إنشاء دعوة جديدة</h2>
        <Link href="/admin/invitations" className="btn btn-sm">رجوع</Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>اسم العميل</label>
          <input type="text" name="name" required className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={formData.name} onChange={handleChange} />
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>رقم هاتف العميل</label>
          <input type="text" name="phone" required className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={formData.phone} onChange={handleChange} />
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>المناسبة</label>
          <select name="occasion" className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={formData.occasion} onChange={handleChange}>
            <option value="زفاف">زفاف</option>
            <option value="خطوبة">خطوبة</option>
            <option value="عقد قران">عقد قران</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>اختر القالب</label>
          <select name="templateId" className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={formData.templateId} onChange={handleChange}>
            {templates.map(t => (
              <option key={t.id} value={t.slug}>{t.nameAr}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontWeight: 'bold' }} disabled={loading}>
          {loading ? 'جاري الإنشاء...' : 'إنشاء وتعديل الدعوة'}
        </button>
      </form>
    </div>
  );
}
