'use client';

import { AdminRole } from '@prisma/client';
import {
  Banknote,
  Calendar,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Settings,
  Shield,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminSidebarProps {
  admin: {
    id: string;
    username: string;
    email: string;
    role: AdminRole;
    isActive: boolean;
  };
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: AdminRole[]; // If specified, only show to these roles
}

export default function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname();

  const navigationItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: 'Registrations',
      href: '/admin/registrations',
      icon: <Users size={20} />,
      roles: ['super_admin', 'moderator'],
    },
    {
      label: 'Preliminary Submissions',
      href: '/admin/submissions/preliminary',
      icon: <FileText size={20} />,
      roles: ['super_admin', 'moderator'],
    },
    {
      label: 'Semifinal Submissions',
      href: '/admin/submissions/semifinal',
      icon: <Trophy size={20} />,
      roles: ['super_admin', 'moderator'],
    },
    {
      label: 'Final Submissions',
      href: '/admin/submissions/final',
      icon: <Trophy size={20} />,
      roles: ['super_admin', 'moderator'],
    },
    {
      label: 'Finance',
      href: '/admin/finance',
      icon: <Banknote size={20} />,
      roles: ['super_admin', 'finance'],
    },
    {
      label: 'Event Registrations',
      href: '/admin/events',
      icon: <Calendar size={20} />,
      roles: ['super_admin', 'event_admin'],
    },
    {
      label: 'Staff Management',
      href: '/admin/staff',
      icon: <UserPlus size={20} />,
      roles: ['super_admin'],
    },
    {
      label: 'Simulate Participant',
      href: '/admin/simulate',
      icon: <FlaskConical size={20} />,
      roles: ['super_admin'],
    },
    {
      label: 'Settings',
      href: '/admin/settings',
      icon: <Settings size={20} />,
    },
  ];

  // Filter navigation based on admin role
  const visibleNavItems = navigationItems.filter((item) => {
    if (!item.roles) return true; // Show to all if no role restriction
    return item.roles.includes(admin.role);
  });

  const getRoleBadgeColor = (role: AdminRole) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800';
      case 'finance':
        return 'bg-green-100 text-green-800';
      case 'event_admin':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: AdminRole) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'moderator':
        return 'Moderator';
      case 'finance':
        return 'Finance';
      case 'event_admin':
        return 'Event Admin';
      default:
        return role;
    }
  };

  return (
    <aside className='w-64 bg-white border-r border-gray-200 flex flex-col'>
      {/* Logo & Brand */}
      <div className='p-6 border-b border-gray-200'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center'>
            <Shield className='text-white' size={24} />
          </div>
          <div>
            <h1 className='text-xl font-bold text-gray-900'>IMD 2026 at ITB 3.0</h1>
            <p className='text-xs text-gray-500'>Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Admin Info */}
      <div className='p-4 border-b border-gray-200 bg-gray-50'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center'>
            <span className='text-white font-semibold text-sm'>
              {admin.username.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-gray-900 truncate'>
              {admin.username}
            </p>
            <span
              className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(
                admin.role,
              )}`}
            >
              {getRoleLabel(admin.role)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className='flex-1 overflow-y-auto p-4'>
        <ul className='space-y-1'>
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span
                    className={isActive ? 'text-blue-700' : 'text-gray-500'}
                  >
                    {item.icon}
                  </span>
                  <span className='text-sm'>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className='p-4 border-t border-gray-200'>
        <p className='text-xs text-gray-500 text-center'>
          © 2026 IMD 2026 at ITB Student Branch
        </p>
      </div>
    </aside>
  );
}
