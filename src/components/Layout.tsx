import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Train, LogOut, Plus } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { username, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary-600 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <Train className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold font-serif">火车旅行记录</h1>
              <p className="text-xs text-primary-200">Train Trip Journal</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/new"
              className="flex items-center gap-2 bg-accent-500 hover:bg-accent-600 px-4 py-2 rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">新增记录</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-sm text-primary-100 hidden sm:inline">
                欢迎，{username}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-primary-100 hover:text-white transition-colors p-2 rounded-lg hover:bg-primary-700"
                title="退出登录"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6 w-full">
        <div className="animate-fade-in">{children}</div>
      </main>
      <footer className="bg-primary-700 text-primary-200 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>🚂 火车旅行记录 · 珍藏每一段旅途回忆</p>
        </div>
      </footer>
    </div>
  );
}
