import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Reality Radio Network',
  description: 'Admin dashboard for managing RRN content',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950">
      {children}
    </div>
  );
}
