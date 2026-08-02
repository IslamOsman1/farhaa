import Providers from './Providers';
import AdminLayout from '../../components/admin/AdminLayout';
import '../../styles/admin.css';

export const metadata = {
  title: 'لوحة تحكم فرحة',
};

export default function Layout({ children }) {
  return (
    <Providers>
      <AdminLayout>
        {children}
      </AdminLayout>
    </Providers>
  );
}
