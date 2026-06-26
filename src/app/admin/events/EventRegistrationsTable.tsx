'use client';

import { format } from 'date-fns';
import {
  Building2,
  CheckCircle,
  Eye,
  Loader2,
  Mail,
  Phone,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface Registration {
  id: string;
  eventCode: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  institution: string;
  verificationStatus: string;
  rejectionReason: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
  } | null;
}

interface EventRegistrationsTableProps {
  registrations: Registration[];
  currentStatus: string;
}

export default function EventRegistrationsTable({
  registrations,
  currentStatus,
}: EventRegistrationsTableProps): React.JSX.Element {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleApprove = async (registrationId: string) => {
    if (!confirm('Are you sure you want to approve this registration?')) return;
    setLoadingId(registrationId);
    try {
      const response = await fetch(
        `/api/admin/events/${registrationId}/approve`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || 'Failed to approve registration');
      toast.success('Registration approved!', { duration: 4000, icon: '✅' });
      setTimeout(() => router.refresh(), 1500);
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
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason || reason.trim() === '') {
      toast.error('Rejection reason is required');
      return;
    }
    setLoadingId(registrationId);
    try {
      const response = await fetch(
        `/api/admin/events/${registrationId}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: reason.trim() }),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || 'Failed to reject registration');
      toast.success('Registration rejected.', { duration: 4000, icon: '❌' });
      setTimeout(() => router.refresh(), 1500);
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
          <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'>
            Rejected
          </span>
        );
      default:
        return (
          <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
            {status}
          </span>
        );
    }
  };

  const getEventLabel = (code: string) => {
    switch (code) {
      case 'yif-x-grand-seminar':
        return 'YIF & Grand Seminar';
      default:
        return code;
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const statusTabs = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ];

  return (
    <>
      <Toaster position='top-right' />

      <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
        {/* Filter Tabs */}
        <div className='border-b border-gray-200 px-6 pt-4'>
          <div className='flex gap-4'>
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() =>
                  router.push(
                    `/admin/events${tab.value !== 'all' ? `?status=${tab.value}` : ''}`,
                  )
                }
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  currentStatus === tab.value
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='bg-gray-50 border-b border-gray-200'>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                  Registrant
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                  Event
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                  Institution
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                  Registered
                </th>
                <th className='px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {registrations.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className='px-6 py-12 text-center text-gray-500'
                  >
                    No registrations found
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <React.Fragment key={reg.id}>
                    <tr className='hover:bg-gray-50 transition-colors'>
                      <td className='px-6 py-4'>
                        <div>
                          <p className='font-medium text-gray-900'>
                            {reg.fullName}
                          </p>
                          <p className='text-sm text-gray-500'>{reg.email}</p>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800'>
                          {getEventLabel(reg.eventCode)}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-700'>
                        {reg.institution}
                      </td>
                      <td className='px-6 py-4'>
                        {getStatusBadge(reg.verificationStatus)}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-500'>
                        {format(new Date(reg.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center justify-end gap-2'>
                          <button
                            onClick={() => toggleExpand(reg.id)}
                            className='p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                            title='View details'
                          >
                            <Eye size={16} />
                          </button>

                          {reg.verificationStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(reg.id)}
                                disabled={loadingId === reg.id}
                                className='p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50'
                                title='Approve'
                              >
                                {loadingId === reg.id ? (
                                  <Loader2 size={16} className='animate-spin' />
                                ) : (
                                  <CheckCircle size={16} />
                                )}
                              </button>
                              <button
                                onClick={() => handleReject(reg.id)}
                                disabled={loadingId === reg.id}
                                className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50'
                                title='Reject'
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Detail Row */}
                    {expandedId === reg.id && (
                      <tr className='bg-gray-50'>
                        <td colSpan={6} className='px-6 py-6'>
                          <div className='grid grid-cols-1 gap-6'>
                            {/* Contact Info */}
                            <div className='bg-white rounded-xl p-5 border border-gray-200'>
                              <h4 className='text-sm font-semibold text-gray-900 mb-3'>
                                Contact Information
                              </h4>
                              <div className='space-y-2'>
                                <div className='flex items-center gap-2 text-sm'>
                                  <Mail size={14} className='text-gray-400' />
                                  <span className='text-gray-700'>
                                    {reg.email}
                                  </span>
                                </div>
                                <div className='flex items-center gap-2 text-sm'>
                                  <Phone size={14} className='text-gray-400' />
                                  <span className='text-gray-700'>
                                    {reg.phoneNumber}
                                  </span>
                                </div>
                                <div className='flex items-center gap-2 text-sm'>
                                  <Building2
                                    size={14}
                                    className='text-gray-400'
                                  />
                                  <span className='text-gray-700'>
                                    {reg.institution}
                                  </span>
                                </div>
                              </div>
                              {reg.user && (
                                <div className='mt-3 pt-3 border-t border-gray-200'>
                                  <p className='text-xs text-gray-500'>
                                    Linked Account: @{reg.user.username} (
                                    {reg.user.email})
                                  </p>
                                </div>
                              )}
                              {reg.rejectionReason && (
                                <div className='mt-3 pt-3 border-t border-gray-200'>
                                  <p className='text-xs font-medium text-red-600'>
                                    Rejection Reason:
                                  </p>
                                  <p className='text-xs text-red-500 mt-1'>
                                    {reg.rejectionReason}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Registration Metadata */}
                          <div className='mt-4 bg-white rounded-xl p-4 border border-gray-200'>
                            <div className='flex flex-wrap gap-4 text-xs text-gray-500'>
                              <span>
                                Registration ID:{' '}
                                <code className='bg-gray-100 px-1.5 py-0.5 rounded'>
                                  {reg.id}
                                </code>
                              </span>
                              <span>
                                Registered:{' '}
                                {format(
                                  new Date(reg.createdAt),
                                  'MMM d, yyyy HH:mm',
                                )}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
