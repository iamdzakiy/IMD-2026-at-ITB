'use client';

import { Check, ExternalLink, Search, X } from 'lucide-react';
import { useState } from 'react';

interface SubmissionsTableProps {
  submissions: any[]; // Use any for Prisma complex types
  adminId: string;
}

export default function SubmissionsTable({
  submissions,
  adminId,
}: SubmissionsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [competitionFilter, setCompetitionFilter] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{
    submissionId: string;
    action: 'approve' | 'reject';
  } | null>(null);
  const [feedback, setFeedback] = useState('');

  // Filter submissions
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.registration.team?.teamName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (
        submission.registration.team?.members?.[0]?.fullName ||
        submission.registration.user.name
      )
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      submission.registration.user.email
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || submission.status === statusFilter;

    const matchesCompetition =
      competitionFilter === 'all' ||
      submission.registration.competition.code === competitionFilter;

    return matchesSearch && matchesStatus && matchesCompetition;
  });

  // Get unique competitions (use competition.code)
  const competitions = Array.from(
    new Set(
      submissions.map((s) => s.registration.competition?.code).filter(Boolean),
    ),
  );

  const handleAction = async (
    submissionId: string,
    action: 'approve' | 'reject',
  ) => {
    setFeedbackModal({ submissionId, action });
    setFeedback('');
  };

  const confirmAction = async () => {
    if (!feedbackModal) return;

    setIsProcessing(feedbackModal.submissionId);

    try {
      const response = await fetch(
        `/api/admin/submissions/preliminary/${feedbackModal.submissionId}/${feedbackModal.action}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adminId,
            feedback: feedback.trim() || undefined,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process action');
      }

      // Reload page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Action error:', error);
      alert(
        error instanceof Error ? error.message : 'Failed to process action',
      );
    } finally {
      setIsProcessing(null);
      setFeedbackModal(null);
      setFeedback('');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      qualified: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };

    const labels = {
      pending: 'PENDING',
      qualified: 'APPROVED',
      rejected: 'REJECTED',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {labels[status as keyof typeof labels] || status.toUpperCase()}
      </span>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className='bg-white rounded-lg border border-gray-200'>
      {/* Filters */}
      <div className='p-4 border-b border-gray-200 space-y-4'>
        <div className='flex flex-col md:flex-row gap-4'>
          {/* Search */}
          <div className='flex-1 relative'>
            <Search
              className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
              size={20}
            />
            <input
              type='text'
              placeholder='Search team name, team leader, or email...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            <option value='all'>All Status</option>
            <option value='pending'>Pending</option>
            <option value='qualified'>Approved</option>
            <option value='rejected'>Rejected</option>
          </select>

          {/* Competition Filter */}
          <select
            value={competitionFilter}
            onChange={(e) => setCompetitionFilter(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            <option value='all'>All Competitions</option>
            {competitions.map((code) => (
              <option key={code} value={code}>
                {code.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className='flex items-center justify-between text-sm text-gray-500'>
          <p>
            Showing {filteredSubmissions.length} of {submissions.length}{' '}
            submissions
          </p>
        </div>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50 border-b border-gray-200'>
            <tr>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                Team
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                Competition
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                File
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                Submitted
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan={6} className='px-4 py-8 text-center text-gray-500'>
                  No submissions found
                </td>
              </tr>
            ) : (
              filteredSubmissions.map((submission) => (
                <tr key={submission.id} className='hover:bg-gray-50'>
                  <td className='px-4 py-4'>
                    <div>
                      <p className='font-semibold text-gray-900'>
                        {submission.registration.team?.teamName || 'N/A'}
                      </p>
                      <p className='text-sm text-gray-500'>
                        {submission.registration.team?.members?.[0]?.fullName ||
                          submission.registration.user.name}
                      </p>
                      <p className='text-xs text-gray-400'>
                        {submission.registration.user.email}
                      </p>
                    </div>
                  </td>
                  <td className='px-4 py-4'>
                    <div>
                      <p className='font-medium text-gray-900'>
                        {submission.registration.competition.name}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {submission.registration.competition.code.toUpperCase()}
                      </p>
                    </div>
                  </td>
                  <td className='px-4 py-4'>
                    <div className='flex items-center gap-2'>
                      <a
                        href={submission.fileUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 hover:text-blue-800 flex items-center gap-1'
                      >
                        <ExternalLink size={16} />
                        <span className='text-sm'>View File</span>
                      </a>
                    </div>
                    <p className='text-xs text-gray-500 mt-1'>
                      {formatFileSize(submission.fileSize)}
                    </p>
                  </td>
                  <td className='px-4 py-4'>
                    <p className='text-sm text-gray-900'>
                      {formatDate(submission.submittedAt)}
                    </p>
                    {submission.reviewedAt && (
                      <p className='text-xs text-gray-500'>
                        Reviewed: {formatDate(submission.reviewedAt)}
                      </p>
                    )}
                  </td>
                  <td className='px-4 py-4'>
                    {getStatusBadge(submission.status)}
                    {submission.reviewNotes && (
                      <p className='text-xs text-gray-500 mt-1'>
                        {submission.reviewNotes}
                      </p>
                    )}
                  </td>
                  <td className='px-4 py-4'>
                    <div className='flex items-center justify-center gap-2'>
                      {submission.status === 'pending' && (
                        <>
                          <button
                            onClick={() =>
                              handleAction(submission.id, 'approve')
                            }
                            disabled={isProcessing === submission.id}
                            className='p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50'
                            title='Approve'
                          >
                            <Check size={20} />
                          </button>
                          <button
                            onClick={() =>
                              handleAction(submission.id, 'reject')
                            }
                            disabled={isProcessing === submission.id}
                            className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50'
                            title='Reject'
                          >
                            <X size={20} />
                          </button>
                        </>
                      )}
                      {submission.status !== 'pending' && (
                        <span className='text-xs text-gray-400'>
                          No actions available
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Feedback Modal */}
      {feedbackModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-bold text-gray-900 mb-4'>
              {feedbackModal.action === 'approve' ? 'Approve' : 'Reject'}{' '}
              Submission
            </h3>
            <p className='text-sm text-gray-600 mb-4'>
              {feedbackModal.action === 'approve'
                ? 'Team will be notified and moved to next phase. Add optional feedback:'
                : 'Team will be notified. Please provide feedback on why this submission was rejected:'}
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={
                feedbackModal.action === 'approve'
                  ? 'Great work! Your proposal is well-structured...'
                  : 'Your submission needs improvement in...'
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
              rows={4}
              required={feedbackModal.action === 'reject'}
            />
            <div className='flex gap-3 mt-4'>
              <button
                onClick={() => {
                  setFeedbackModal(null);
                  setFeedback('');
                }}
                disabled={isProcessing !== null}
                className='flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50'
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={
                  isProcessing !== null ||
                  (feedbackModal.action === 'reject' && !feedback.trim())
                }
                className={`flex-1 px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-50 ${
                  feedbackModal.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
