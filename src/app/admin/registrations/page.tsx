import { CheckCircle, Clock, Users as UsersIcon, XCircle } from 'lucide-react';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

import RegistrationsTable from './RegistrationsTable';

/**
 * ============================================================================
 * ADMIN REGISTRATIONS PAGE
 * ============================================================================
 *
 * Purpose: Review and approve/reject team registrations
 * Access: super_admin, moderator only
 *
 * Features:
 * - View all registrations with filtering (pending, approved, rejected, all)
 * - Approve button with email notification
 * - Reject button with email notification
 * - View team details (members, institution, etc.)
 *
 * ============================================================================
 */

export default async function AdminRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();

  // Check admin access
  if (!session?.admin) {
    redirect('/admin-login');
  }

  // Only super_admin and moderator can access
  if (!['super_admin', 'moderator'].includes(session.admin.role)) {
    redirect('/admin/dashboard');
  }

  const params = await searchParams;
  const status = params.status || 'all';

  // Build filter based on status
  const filter: { verificationStatus?: 'pending' | 'approved' | 'rejected' } =
    {};
  if (status === 'pending') {
    filter.verificationStatus = 'pending';
  } else if (status === 'approved') {
    filter.verificationStatus = 'approved';
  } else if (status === 'rejected') {
    filter.verificationStatus = 'rejected';
  }

  // Fetch registrations with all related data + Get statistics in parallel
  const [registrations, ...stats] = await Promise.all([
    prisma.competitionRegistration.findMany({
      where: filter,
      select: {
        id: true,
        verificationStatus: true,
        currentPhase: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            createdAt: true,
          },
        },
        competition: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        team: {
          select: {
            id: true,
            teamName: true,
            proofOfRegistrationLink: true,
            members: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                institution: true,
                orderIndex: true,
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            paymentProofUrl: true,
            paymentMethod: true,
            billName: true,
            status: true,
            submittedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.competitionRegistration.count(),
    prisma.competitionRegistration.count({
      where: { verificationStatus: 'pending' },
    }),
    prisma.competitionRegistration.count({
      where: { verificationStatus: 'approved' },
    }),
    prisma.competitionRegistration.count({
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
          Competition Registrations
        </h1>
        <p className='text-gray-600 mt-2'>
          Review and approve team registrations for all competitions
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
          <p className='text-sm text-green-700 mt-1'>Verified teams</p>
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
      <RegistrationsTable
        registrations={registrations}
        currentStatus={status}
      />
    </div>
  );
}
