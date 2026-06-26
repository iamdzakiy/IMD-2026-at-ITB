import { CheckCircle, Clock, Users as UsersIcon, XCircle } from 'lucide-react';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

import EventRegistrationsTable from './EventRegistrationsTable';

/**
 * ============================================================================
 * ADMIN EVENT REGISTRATIONS PAGE
 * ============================================================================
 *
 * Purpose: Review and approve/reject event registrations
 * Access: super_admin, event_admin only
 * ============================================================================
 */

export default async function AdminEventRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; event?: string }>;
}) {
  const session = await auth();

  if (!session?.admin) {
    redirect('/admin-login');
  }

  // Only super_admin and event_admin can access
  if (!['super_admin', 'event_admin'].includes(session.admin.role)) {
    redirect('/admin/dashboard');
  }

  const params = await searchParams;
  const status = params.status || 'all';
  const eventFilter = params.event || 'all';

  // Build filter
  const filter: {
    verificationStatus?: 'pending' | 'approved' | 'rejected';
    eventCode?: string;
  } = {};
  if (status === 'pending') filter.verificationStatus = 'pending';
  else if (status === 'approved') filter.verificationStatus = 'approved';
  else if (status === 'rejected') filter.verificationStatus = 'rejected';
  if (eventFilter !== 'all') filter.eventCode = eventFilter;

  // Fetch registrations + statistics in parallel
  const [registrations, ...stats] = await Promise.all([
    prisma.eventRegistration.findMany({
      where: filter,
      select: {
        id: true,
        eventCode: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        institution: true,
        verificationStatus: true,
        rejectionReason: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.eventRegistration.count(),
    prisma.eventRegistration.count({
      where: { verificationStatus: 'pending' },
    }),
    prisma.eventRegistration.count({
      where: { verificationStatus: 'approved' },
    }),
    prisma.eventRegistration.count({
      where: { verificationStatus: 'rejected' },
    }),
  ]);

  const [totalRegistrations, pendingCount, approvedCount, rejectedCount] =
    stats;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>
          Event Registrations
        </h1>
        <p className='text-gray-600 mt-2'>
          Review and approve registrations for events (YIF & Grand Seminar)
        </p>
      </div>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white rounded-xl p-6 border border-gray-200'>
          <div className='flex items-center gap-3 mb-2'>
            <UsersIcon className='text-blue-600' size={24} />
            <h3 className='font-semibold text-gray-900'>Total</h3>
          </div>
          <p className='text-3xl font-bold text-gray-900'>
            {totalRegistrations}
          </p>
          <p className='text-sm text-gray-600 mt-1'>All registrations</p>
        </div>

        <div className='bg-yellow-50 rounded-xl p-6 border border-yellow-200'>
          <div className='flex items-center gap-3 mb-2'>
            <Clock className='text-yellow-600' size={24} />
            <h3 className='font-semibold text-yellow-900'>Pending</h3>
          </div>
          <p className='text-3xl font-bold text-yellow-900'>{pendingCount}</p>
          <p className='text-sm text-yellow-700 mt-1'>Awaiting review</p>
        </div>

        <div className='bg-green-50 rounded-xl p-6 border border-green-200'>
          <div className='flex items-center gap-3 mb-2'>
            <CheckCircle className='text-green-600' size={24} />
            <h3 className='font-semibold text-green-900'>Approved</h3>
          </div>
          <p className='text-3xl font-bold text-green-900'>{approvedCount}</p>
          <p className='text-sm text-green-700 mt-1'>Confirmed attendees</p>
        </div>

        <div className='bg-red-50 rounded-xl p-6 border border-red-200'>
          <div className='flex items-center gap-3 mb-2'>
            <XCircle className='text-red-600' size={24} />
            <h3 className='font-semibold text-red-900'>Rejected</h3>
          </div>
          <p className='text-3xl font-bold text-red-900'>{rejectedCount}</p>
          <p className='text-sm text-red-700 mt-1'>Declined registrations</p>
        </div>
      </div>

      {/* Registrations Table */}
      <EventRegistrationsTable
        registrations={registrations}
        currentStatus={status}
      />
    </div>
  );
}
