import {
  AlertTriangle,
  Banknote,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Trophy,
  Users,
} from 'lucide-react';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export default async function AdminDashboardPage() {
  const session = await auth();
  const role = session?.admin?.role;
  const isEventAdminOnly = role === 'event_admin';

  // Fetch only the stats relevant to the current admin's role
  const [
    totalUsers,
    totalRegistrations,
    pendingRegistrations,
    approvedRegistrations,
    preliminarySubmissions,
    pendingPreliminary,
    semifinalSubmissions,
    finalSubmissions,
    pendingPayments,
    totalEventRegistrations,
    pendingEventRegistrations,
  ] = await Promise.all([
    // Competition stats — skip for event_admin (they have no access to these)
    isEventAdminOnly ? Promise.resolve(0) : prisma.user.count(),
    isEventAdminOnly
      ? Promise.resolve(0)
      : prisma.competitionRegistration.count(),
    isEventAdminOnly
      ? Promise.resolve(0)
      : prisma.competitionRegistration.count({
          where: { verificationStatus: 'pending' },
        }),
    isEventAdminOnly
      ? Promise.resolve(0)
      : prisma.competitionRegistration.count({
          where: { verificationStatus: 'approved' },
        }),
    isEventAdminOnly
      ? Promise.resolve(0)
      : prisma.preliminarySubmission.count(),
    isEventAdminOnly
      ? Promise.resolve(0)
      : prisma.preliminarySubmission.count({
          where: { status: 'pending' },
        }),
    isEventAdminOnly ? Promise.resolve(0) : prisma.semifinalSubmission.count(),
    isEventAdminOnly ? Promise.resolve(0) : prisma.finalSubmission.count(),
    isEventAdminOnly
      ? Promise.resolve(0)
      : prisma.payment.count({
          where: { status: 'pending' },
        }),
    prisma.eventRegistration.count(),
    prisma.eventRegistration.count({
      where: { verificationStatus: 'pending' },
    }),
  ]);

  // Stats grid — event_admin sees only event stats
  const stats = isEventAdminOnly
    ? [
        {
          label: 'Total Event Registrations',
          value: totalEventRegistrations,
          icon: <Calendar size={24} />,
          color: 'bg-orange-500',
          textColor: 'text-orange-700',
          bgColor: 'bg-orange-50',
        },
        {
          label: 'Pending Event Registrations',
          value: pendingEventRegistrations,
          icon: <Clock size={24} />,
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
        },
        {
          label: 'Approved',
          value: totalEventRegistrations - pendingEventRegistrations,
          icon: <CheckCircle size={24} />,
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
        },
      ]
    : [
        {
          label: 'Total Users',
          value: totalUsers,
          icon: <Users size={24} />,
          color: 'bg-blue-500',
          textColor: 'text-blue-700',
          bgColor: 'bg-blue-50',
        },
        {
          label: 'Total Registrations',
          value: totalRegistrations,
          icon: <FileText size={24} />,
          color: 'bg-purple-500',
          textColor: 'text-purple-700',
          bgColor: 'bg-purple-50',
        },
        {
          label: 'Pending Registrations',
          value: pendingRegistrations,
          icon: <Clock size={24} />,
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
        },
        {
          label: 'Approved Registrations',
          value: approvedRegistrations,
          icon: <CheckCircle size={24} />,
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
        },
      ];

  const actionableStats = [
    {
      label: 'Pending Registrations',
      value: pendingRegistrations,
      href: '/admin/registrations?status=pending',
      icon: <AlertTriangle size={20} />,
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      visible: ['super_admin', 'moderator'].includes(
        session?.admin?.role || '',
      ),
    },
    {
      label: 'Pending Preliminary Review',
      value: pendingPreliminary,
      href: '/admin/submissions/preliminary',
      icon: <FileText size={20} />,
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      visible: ['super_admin', 'moderator'].includes(
        session?.admin?.role || '',
      ),
    },
    {
      label: 'Pending Payment Verification',
      value: pendingPayments,
      href: '/admin/finance?status=pending',
      icon: <Banknote size={20} />,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      visible: ['super_admin', 'finance'].includes(session?.admin?.role || ''),
    },
    {
      label: 'Pending Event Registrations',
      value: pendingEventRegistrations,
      href: '/admin/events?status=pending',
      icon: <Calendar size={20} />,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      visible: ['super_admin', 'event_admin'].includes(
        session?.admin?.role || '',
      ),
    },
  ].filter((stat) => stat.visible);

  return (
    <div className='space-y-6'>
      {/* Welcome Section */}
      <div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-5 sm:p-8 text-white'>
        <h1 className='text-xl sm:text-3xl font-bold mb-2 break-words'>
          Welcome back, {session?.admin?.username}! 👋
        </h1>
        <p className='text-blue-100'>
          Here&apos;s what&apos;s happening with IMD 2026 at ITB 3.0 today
        </p>
      </div>

      {/* Main Statistics Grid */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6'>
        {stats.map((stat, index) => (
          <div
            key={index}
            className='bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow'
          >
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <p className='text-sm text-gray-600 mb-1'>{stat.label}</p>
                <p className='text-3xl font-bold text-gray-900'>{stat.value}</p>
              </div>
              <div
                className={`${stat.bgColor} ${stat.textColor} p-3 rounded-lg`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actionable Items */}
      {actionableStats.length > 0 && (
        <div>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>
            ⚡ Requires Your Attention
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {actionableStats.map((stat, index) => (
              <a
                key={index}
                href={stat.href}
                className={`${stat.bgColor} border-2 border-transparent hover:border-gray-300 rounded-xl p-6 transition-all hover:shadow-md`}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className={`${stat.color}`}>{stat.icon}</div>
                    <div>
                      <p className='text-sm text-gray-600'>{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                  <AlertTriangle className={stat.color} size={24} />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Additional Stats — competition data, hidden for event_admin */}
      {!isEventAdminOnly && (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='bg-white rounded-xl p-6 border border-gray-200'>
            <div className='flex items-center gap-3 mb-4'>
              <FileText className='text-blue-600' size={24} />
              <h3 className='font-semibold text-gray-900'>
                Preliminary Submissions
              </h3>
            </div>
            <p className='text-3xl font-bold text-gray-900'>
              {preliminarySubmissions}
            </p>
            <p className='text-sm text-gray-600 mt-1'>Total submitted</p>
          </div>

          <div className='bg-white rounded-xl p-6 border border-gray-200'>
            <div className='flex items-center gap-3 mb-4'>
              <Trophy className='text-purple-600' size={24} />
              <h3 className='font-semibold text-gray-900'>
                Semifinal Submissions
              </h3>
            </div>
            <p className='text-3xl font-bold text-gray-900'>
              {semifinalSubmissions}
            </p>
            <p className='text-sm text-gray-600 mt-1'>Submissions received</p>
          </div>

          <div className='bg-white rounded-xl p-6 border border-gray-200'>
            <div className='flex items-center gap-3 mb-4'>
              <Trophy className='text-amber-600' size={24} />
              <h3 className='font-semibold text-gray-900'>Final Submissions</h3>
            </div>
            <p className='text-3xl font-bold text-gray-900'>
              {finalSubmissions}
            </p>
            <p className='text-sm text-gray-600 mt-1'>Submissions received</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className='text-xl font-bold text-gray-900 mb-4'>Quick Actions</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {!isEventAdminOnly && (
            <a
              href='/admin/registrations'
              className='bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all'
            >
              <Users className='text-blue-600 mb-3' size={28} />
              <h3 className='font-semibold text-gray-900 mb-1'>
                View Registrations
              </h3>
              <p className='text-sm text-gray-600'>
                Review and approve team registrations
              </p>
            </a>
          )}

          {['super_admin', 'moderator'].includes(
            session?.admin?.role || '',
          ) && (
            <a
              href='/admin/submissions/preliminary'
              className='bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-md transition-all'
            >
              <FileText className='text-purple-600 mb-3' size={28} />
              <h3 className='font-semibold text-gray-900 mb-1'>
                Preliminary Submissions
              </h3>
              <p className='text-sm text-gray-600'>
                Evaluate preliminary submissions
              </p>
            </a>
          )}

          {['super_admin', 'moderator'].includes(
            session?.admin?.role || '',
          ) && (
            <a
              href='/admin/submissions/semifinal'
              className='bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all'
            >
              <Trophy className='text-blue-600 mb-3' size={28} />
              <h3 className='font-semibold text-gray-900 mb-1'>
                Semifinal Submissions
              </h3>
              <p className='text-sm text-gray-600'>
                Evaluate semifinal submissions
              </p>
            </a>
          )}

          {['super_admin', 'moderator'].includes(
            session?.admin?.role || '',
          ) && (
            <a
              href='/admin/submissions/final'
              className='bg-white border border-gray-200 rounded-xl p-6 hover:border-amber-300 hover:shadow-md transition-all'
            >
              <Trophy className='text-amber-600 mb-3' size={28} />
              <h3 className='font-semibold text-gray-900 mb-1'>
                Final Submissions
              </h3>
              <p className='text-sm text-gray-600'>
                Evaluate final submissions
              </p>
            </a>
          )}

          {['super_admin', 'finance'].includes(session?.admin?.role || '') && (
            <a
              href='/admin/finance'
              className='bg-white border border-gray-200 rounded-xl p-6 hover:border-green-300 hover:shadow-md transition-all'
            >
              <Banknote className='text-green-600 mb-3' size={28} />
              <h3 className='font-semibold text-gray-900 mb-1'>
                Finance Dashboard
              </h3>
              <p className='text-sm text-gray-600'>
                Monitor payments and cash flow
              </p>
            </a>
          )}

          {['super_admin', 'event_admin'].includes(
            session?.admin?.role || '',
          ) && (
            <a
              href='/admin/events'
              className='bg-white border border-gray-200 rounded-xl p-6 hover:border-orange-300 hover:shadow-md transition-all'
            >
              <Calendar className='text-orange-600 mb-3' size={28} />
              <h3 className='font-semibold text-gray-900 mb-1'>
                Event Registrations
              </h3>
              <p className='text-sm text-gray-600'>
                Review and approve event registrations
              </p>
            </a>
          )}

          {session?.admin?.role === 'super_admin' && (
            <a
              href='/admin/staff'
              className='bg-white border border-gray-200 rounded-xl p-6 hover:border-red-300 hover:shadow-md transition-all'
            >
              <Users className='text-red-600 mb-3' size={28} />
              <h3 className='font-semibold text-gray-900 mb-1'>Manage Staff</h3>
              <p className='text-sm text-gray-600'>
                Create and manage admin accounts
              </p>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
