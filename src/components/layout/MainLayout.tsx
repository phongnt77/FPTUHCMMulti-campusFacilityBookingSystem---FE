import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { User } from '../../data/mockData';

interface MainLayoutProps {
  children: ReactNode;
  user: User;
  title: string;
  subtitle?: string;
}

export default function MainLayout({ children, user, title, subtitle }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar user={user} />
      <div className="pl-64">
        <Header user={user} title={title} subtitle={subtitle} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

