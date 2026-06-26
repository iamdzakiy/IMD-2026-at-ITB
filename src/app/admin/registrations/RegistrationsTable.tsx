'use client';

import { format } from 'date-fns';
import {
  Building2,
  CheckCircle,
  ExternalLink,
  Eye,
  ImageIcon,
  Loader2,
  Mail,
  Phone,
  Users,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  institution: string;
}

interface Team {
  id: string;
  teamName: string;
  proofOfRegistrationLink: string | null;
  members: TeamMember[];
}

interface Registration {
  id: string;
  verificationStatus: string;
  currentPhase: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    createdAt: Date;
  };
  competition: {
    id: string;
    code: string;
    name: string;
  };
  team: Team | null;
  payment: {
    id: string;
    amount: number;
    paymentProofUrl: string;
    paymentMethod: string;
    billName: string;
    status: string;
    submittedAt: Date;
  } | null;
}

interface RegistrationsTableProps {
  registrations: Registration[];
  currentStatus: string;
}

export default function RegistrationsTable({
  registrations,
  currentStatus,
}: RegistrationsTableProps): React.JSX.Element {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleApprove = async (registrationId: string) => {
    if (!confirm('Are you sure you want to approve this registration?')) {
      return;
    }

    setLoadingId(registrationId);

    try {
      const response = await fetch(
        `/api/admin/registrations/${registrationId}/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve registration');
      }

      toast.success('Registration approved successfully! Email sent to team.', {
        duration: 4000,
        icon: '✅',
      });

      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('Approve error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to approve registration',
      );
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (registrationId: string) => {
    const reason = prompt(
      'Please provide a reason for rejection (will be sent to the team):',
    );

    if (!reason || reason.trim() === '') {
      toast.error('Rejection reason is required');
      return;
    }

    setLoadingId(registrationId);

    try {
      const response = await fetch(
        `/api/admin/registrations/${registrationId}/reject`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason: reason.trim() }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject registration');
      }

      toast.success('Registration rejected. Notification email sent.', {
        duration: 4000,
        icon: '❌',
      });

      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('Reject error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to reject registration',
      );
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
            <span className='w-2 h-2 rounded-full bg-yellow-500'></span>
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
            <CheckCircle size={12} />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'>
            <XCircle size={12} />
            Rejected
          </span>
        );
      default:
        return (
          <span className='px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
            {status}
          </span>
        );
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      <Toaster position='top-right' />

      <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
        {/* Filter Tabs */}
        <div className='border-b border-gray-200 bg-gray-50'>
          <div className='flex gap-1 p-2 overflow-x-auto'>
            {[
              { label: 'All', value: 'all' },
              { label: 'Pending', value: 'pending' },
              { label: 'Approved', value: 'approved' },
              { label: 'Rejected', value: 'rejected' },
            ].map((filter) => (
              <a
                key={filter.value}
                href={`/admin/registrations?status=${filter.value}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentStatus === filter.value
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {filter.label}
              </a>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className='overflow-x-auto'>
          {registrations.length === 0 ? (
            <div className='text-center py-12'>
              <Users className='mx-auto text-gray-400 mb-3' size={48} />
              <p className='text-gray-600 text-lg font-medium'>
                No registrations found
              </p>
              <p className='text-gray-500 text-sm mt-1'>
                {currentStatus === 'pending'
                  ? 'All registrations have been reviewed'
                  : 'Try changing the filter to see more results'}
              </p>
            </div>
          ) : (
            <table className='w-full'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <th className='text-left px-6 py-4 text-sm font-semibold text-gray-900'>
                    Team / Competition
                  </th>
                  <th className='text-left px-6 py-4 text-sm font-semibold text-gray-900'>
                    Leader
                  </th>
                  <th className='text-left px-6 py-4 text-sm font-semibold text-gray-900'>
                    Status
                  </th>
                  <th className='text-left px-6 py-4 text-sm font-semibold text-gray-900'>
                    Registered
                  </th>
                  <th className='text-right px-6 py-4 text-sm font-semibold text-gray-900'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {registrations.map((registration) => (
                  <React.Fragment key={registration.id}>
                    <tr className='hover:bg-gray-50 transition-colors'>
                      <td className='px-6 py-4'>
                        <div>
                          <p className='font-semibold text-gray-900'>
                            {registration.team?.teamName || 'No Team Name'}
                          </p>
                          <p className='text-sm text-gray-600'>
                            <span className='inline-flex items-center gap-1'>
                              <span className='font-mono font-bold text-blue-600'>
                                {registration.competition.code}
                              </span>
                              · {registration.competition.name}
                            </span>
                          </p>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div>
                          <p className='font-medium text-gray-900'>
                            {registration.team?.members?.[0]?.fullName ||
                              registration.user.name}
                          </p>
                          <p className='text-sm text-gray-600 flex items-center gap-1'>
                            <Mail size={12} />
                            {registration.user.email}
                          </p>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        {getStatusBadge(registration.verificationStatus)}
                      </td>
                      <td className='px-6 py-4'>
                        <p className='text-sm text-gray-600'>
                          {registration.createdAt
                            ? format(
                                new Date(registration.createdAt),
                                'MMM dd, yyyy',
                              )
                            : 'N/A'}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {registration.createdAt
                            ? format(new Date(registration.createdAt), 'HH:mm')
                            : ''}
                        </p>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center justify-end gap-2'>
                          {/* View Details Button */}
                          <button
                            onClick={() => toggleExpand(registration.id)}
                            className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                            title='View details'
                          >
                            <Eye size={18} />
                          </button>

                          {/* Approve/Reject Buttons - Only for pending */}
                          {registration.verificationStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(registration.id)}
                                disabled={loadingId === registration.id}
                                className='flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium'
                                title='Approve registration'
                              >
                                {loadingId === registration.id ? (
                                  <Loader2 size={14} className='animate-spin' />
                                ) : (
                                  <CheckCircle size={14} />
                                )}
                                Approve
                              </button>

                              <button
                                onClick={() => handleReject(registration.id)}
                                disabled={loadingId === registration.id}
                                className='flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium'
                                title='Reject registration'
                              >
                                {loadingId === registration.id ? (
                                  <Loader2 size={14} className='animate-spin' />
                                ) : (
                                  <XCircle size={14} />
                                )}
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Details Row */}
                    {expandedId === registration.id && (
                      <tr>
                        <td colSpan={5} className='bg-gray-50 px-6 py-4'>
                          <div className='space-y-4'>
                            <h4 className='font-semibold text-gray-900 text-lg mb-3'>
                              Team Details
                            </h4>

                            {/* Team Members */}
                            <div>
                              <h5 className='font-medium text-gray-700 mb-2 flex items-center gap-2'>
                                <Users size={16} />
                                Team Members (
                                {registration.team?.members.length || 0})
                              </h5>
                              {registration.team?.members &&
                              registration.team.members.length > 0 ? (
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                                  {registration.team.members.map(
                                    (member, index) => (
                                      <div
                                        key={member.id}
                                        className='bg-white rounded-lg p-4 border border-gray-200'
                                      >
                                        <p className='font-medium text-gray-900 mb-2'>
                                          #{index + 1} - {member.fullName}
                                        </p>
                                        <div className='space-y-1 text-sm text-gray-600'>
                                          <p className='flex items-center gap-2'>
                                            <Mail size={12} />
                                            {member.email}
                                          </p>
                                          <p className='flex items-center gap-2'>
                                            <Phone size={12} />
                                            {member.phoneNumber}
                                          </p>
                                          {member.institution && (
                                            <p className='flex items-center gap-2'>
                                              <Building2 size={12} />
                                              {member.institution}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              ) : (
                                <p className='text-sm text-gray-500 italic'>
                                  No team members found
                                </p>
                              )}
                            </div>

                            {/* Shared Proof of Registration */}
                            {registration.team?.proofOfRegistrationLink && (
                              <div className='pb-3 border-b border-gray-200'>
                                <h5 className='font-medium text-gray-700 mb-2 flex items-center gap-2'>
                                  <ExternalLink size={16} />
                                  Proof of Registration (Shared)
                                </h5>
                                <a
                                  href={
                                    registration.team.proofOfRegistrationLink
                                  }
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='text-blue-600 hover:text-blue-700 hover:underline text-sm flex items-center gap-1'
                                >
                                  <ExternalLink size={12} />
                                  View Shared Proof Link
                                </a>
                              </div>
                            )}

                            {/* Payment Proof */}
                            {registration.payment && (
                              <div className='pb-3 border-b border-gray-200'>
                                <h5 className='font-medium text-gray-700 mb-2 flex items-center gap-2'>
                                  <ImageIcon size={16} />
                                  Payment Proof
                                </h5>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                  <div>
                                    <a
                                      href={
                                        registration.payment.paymentProofUrl
                                      }
                                      target='_blank'
                                      rel='noopener noreferrer'
                                    >
                                      <img
                                        src={
                                          registration.payment.paymentProofUrl
                                        }
                                        alt='Payment proof'
                                        className='max-h-48 rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity'
                                      />
                                    </a>
                                  </div>
                                  <div className='space-y-2 text-sm'>
                                    <div>
                                      <span className='text-gray-500'>
                                        Amount:
                                      </span>{' '}
                                      <span className='ml-2 font-medium text-gray-900'>
                                        Rp{' '}
                                        {registration.payment.amount.toLocaleString(
                                          'id-ID',
                                        )}
                                      </span>
                                    </div>
                                    <div>
                                      <span className='text-gray-500'>
                                        Method:
                                      </span>{' '}
                                      <span className='ml-2 text-gray-900'>
                                        {registration.payment.paymentMethod}
                                      </span>
                                    </div>
                                    <div>
                                      <span className='text-gray-500'>
                                        Status:
                                      </span>{' '}
                                      <span
                                        className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${registration.payment.status === 'verified' ? 'bg-green-100 text-green-800' : registration.payment.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}
                                      >
                                        {registration.payment.status}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Registration Info */}
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-200'>
                              <div>
                                <p className='text-xs text-gray-500 mb-1'>
                                  User ID
                                </p>
                                <p className='text-sm font-mono text-gray-700'>
                                  {registration.user.id.substring(0, 8)}...
                                </p>
                              </div>
                              <div>
                                <p className='text-xs text-gray-500 mb-1'>
                                  Registration ID
                                </p>
                                <p className='text-sm font-mono text-gray-700'>
                                  {registration.id.substring(0, 8)}...
                                </p>
                              </div>
                              <div>
                                <p className='text-xs text-gray-500 mb-1'>
                                  Current Phase
                                </p>
                                <p className='text-sm font-medium text-gray-900'>
                                  {registration.currentPhase}
                                </p>
                              </div>
                              <div>
                                <p className='text-xs text-gray-500 mb-1'>
                                  User Since
                                </p>
                                <p className='text-sm text-gray-700'>
                                  {registration.user.createdAt
                                    ? format(
                                        new Date(registration.user.createdAt),
                                        'MMM dd, yyyy',
                                      )
                                    : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
