'use client';

import {
  AlertCircle,
  CheckCircle,
  Clock,
  Lock,
  PartyPopper,
  Rocket,
  Trophy,
} from 'lucide-react';

interface StatusBannerProps {
  registration: any;
}

export default function StatusBanner({ registration }: StatusBannerProps) {
  const {
    verificationStatus,
    currentPhase,
    isPreliminaryQualified,
    isSemifinalQualified,
    preliminary,
    semifinal,
    competition,
  } = registration;

  // ============================================================================
  // 1. PENDING REGISTRATION
  // ============================================================================
  if (verificationStatus === 'pending') {
    return (
      <div className='mb-8 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500/50 rounded-2xl p-6 backdrop-blur-sm'>
        <div className='flex items-start gap-4'>
          <Clock className='w-6 h-6 text-yellow-400 flex-shrink-0 mt-1' />
          <div>
            <h3 className='text-xl font-bold text-yellow-400 mb-2'>
              Waiting for Approval
            </h3>
            <p className='text-gray-300'>
              Your registration is currently being reviewed by our admin team.
              You will receive an email notification once your registration is
              approved. Please check your inbox and spam folder regularly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 2. REJECTED REGISTRATION
  // ============================================================================
  if (verificationStatus === 'rejected') {
    return (
      <div className='mb-8 bg-gradient-to-r from-red-500/20 to-red-600/20 border-2 border-red-500/50 rounded-2xl p-6 backdrop-blur-sm'>
        <div className='flex items-start gap-4'>
          <AlertCircle className='w-6 h-6 text-red-400 flex-shrink-0 mt-1' />
          <div>
            <h3 className='text-xl font-bold text-red-400 mb-2'>
              Registration Rejected
            </h3>
            <p className='text-gray-300 mb-3'>
              Unfortunately, your registration has been rejected by our admin
              team.
            </p>
            {registration.rejectionReason && (
              <div className='bg-red-900/30 border border-red-500/30 rounded-lg p-4'>
                <p className='text-sm font-semibold text-red-300 mb-1'>
                  Reason:
                </p>
                <p className='text-gray-300'>{registration.rejectionReason}</p>
              </div>
            )}
            <p className='text-gray-400 text-sm mt-3'>
              If you believe this is a mistake, please contact us at{' '}
              <a
                href='mailto:imd 2026 at itb@IMD 2026 at ITB-itb.org'
                className='text-[#FFCD8D] hover:underline'
              >
                imd 2026 at itb@IMD 2026 at ITB-itb.org
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 3. APPROVED STATES — Phase-specific messages
  // ============================================================================
  if (verificationStatus === 'approved') {
    // --------------------------------------------------------------------------
    // Phase: PRELIMINARY — User can submit their preliminary work
    // --------------------------------------------------------------------------
    if (currentPhase === 'preliminary') {
      // Check if preliminary submission is pending review
      if (preliminary && preliminary.status === 'pending') {
        return (
          <div className='mb-8 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-2 border-blue-500/50 rounded-2xl p-6 backdrop-blur-sm'>
            <div className='flex items-start gap-4'>
              <Clock className='w-6 h-6 text-blue-400 flex-shrink-0 mt-1' />
              <div>
                <h3 className='text-xl font-bold text-blue-400 mb-2'>
                  Preliminary Submission Under Review
                </h3>
                <p className='text-gray-300'>
                  Your preliminary submission has been received and is being
                  reviewed by our panel. You will be notified via email once the
                  review is complete. Sit tight!
                </p>
              </div>
            </div>
          </div>
        );
      }

      // Check if preliminary was rejected (user can re-submit)
      if (preliminary && preliminary.status === 'rejected') {
        return (
          <div className='mb-8 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-2 border-orange-500/50 rounded-2xl p-6 backdrop-blur-sm'>
            <div className='flex items-start gap-4'>
              <AlertCircle className='w-6 h-6 text-orange-400 flex-shrink-0 mt-1' />
              <div>
                <h3 className='text-xl font-bold text-orange-400 mb-2'>
                  Preliminary Submission Needs Revision
                </h3>
                <p className='text-gray-300 mb-2'>
                  Your preliminary submission needs some changes. Please review
                  the feedback below and re-submit.
                </p>
                {preliminary.reviewNotes && (
                  <div className='bg-orange-900/30 border border-orange-500/30 rounded-lg p-4 mt-2'>
                    <p className='text-sm font-semibold text-orange-300 mb-1'>
                      Reviewer Feedback:
                    </p>
                    <p className='text-gray-300'>{preliminary.reviewNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      // Default: No submission yet — registration just approved
      return (
        <div className='mb-8 bg-gradient-to-r from-green-500/20 to-green-600/20 border-2 border-green-500/50 rounded-2xl p-6 backdrop-blur-sm'>
          <div className='flex items-start gap-4'>
            <CheckCircle className='w-6 h-6 text-green-400 flex-shrink-0 mt-1' />
            <div>
              <h3 className='text-xl font-bold text-green-400 mb-2'>
                Registration Approved!
              </h3>
              <p className='text-gray-300'>
                Congratulations! Your registration has been approved. You can
                now proceed with your preliminary submission below.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // --------------------------------------------------------------------------
    // Phase: SEMIFINAL — Check if we're in a waiting/freeze state or can submit
    // --------------------------------------------------------------------------
    if (currentPhase === 'semifinal') {
      // Preliminary qualified, check if semifinal phase is active
      const semifinalStart = new Date(competition.semifinalStart);
      const semifinalDeadline = new Date(competition.semifinalDeadline);
      const now = new Date();
      const isSemifinalPhaseOpen =
        now >= semifinalStart && now <= semifinalDeadline;

      // Check if semifinal submission exists and is pending review
      if (
        (semifinal && semifinal.proposalUrl) ||
        semifinal?.paperUrl ||
        semifinal?.businessPlanUrl
      ) {
        return (
          <div className='mb-8 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-2 border-blue-500/50 rounded-2xl p-6 backdrop-blur-sm'>
            <div className='flex items-start gap-4'>
              <Clock className='w-6 h-6 text-blue-400 flex-shrink-0 mt-1' />
              <div>
                <h3 className='text-xl font-bold text-blue-400 mb-2'>
                  Semifinal Submission Under Review
                </h3>
                <p className='text-gray-300'>
                  Your semifinal submission has been received and is being
                  reviewed by our panel. You will be notified via email once the
                  review is complete.
                </p>
              </div>
            </div>
          </div>
        );
      }

      // Semifinal phase is open — user can submit
      if (isSemifinalPhaseOpen) {
        return (
          <div className='mb-8 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border-2 border-emerald-500/50 rounded-2xl p-6 backdrop-blur-sm'>
            <div className='flex items-start gap-4'>
              <Rocket className='w-6 h-6 text-emerald-400 flex-shrink-0 mt-1' />
              <div>
                <h3 className='text-xl font-bold text-emerald-400 mb-2'>
                  Preliminary Phase Passed!
                </h3>
                <p className='text-gray-300'>
                  Congratulations, you have advanced to the semifinal! 🎉 The
                  semifinal phase is now open. Please submit your semifinal
                  materials below before the deadline.
                </p>
              </div>
            </div>
          </div>
        );
      }

      // Semifinal phase not yet open — FREEZE/WAIT state
      return (
        <div className='mb-8 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border-2 border-purple-500/50 rounded-2xl p-6 backdrop-blur-sm'>
          <div className='flex items-start gap-4'>
            <Lock className='w-6 h-6 text-purple-400 flex-shrink-0 mt-1' />
            <div>
              <h3 className='text-xl font-bold text-purple-400 mb-2'>
                Preliminary Phase Passed! 🎉
              </h3>
              <p className='text-gray-300 mb-2'>
                Congratulations, you have advanced to the semifinal. Please wait
                until the semifinal phase begins.
              </p>
              <p className='text-gray-400 text-sm'>
                The semifinal phase will open on{' '}
                <span className='text-[#FFCD8D] font-medium'>
                  {new Date(competition.semifinalStart).toLocaleDateString(
                    'en-US',
                    {
                      timeZone: 'Asia/Jakarta',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    },
                  )}
                </span>
                . You will be notified when submissions open.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // --------------------------------------------------------------------------
    // Phase: FINAL — Check if we're in waiting/freeze state or can submit
    // --------------------------------------------------------------------------
    if (currentPhase === 'final') {
      const finalDeadline = competition.finalDeadline
        ? new Date(competition.finalDeadline)
        : null;
      const now = new Date();
      const isFinalPhaseOpen = finalDeadline ? now <= finalDeadline : false;

      // Check if final submission exists
      if (registration.final) {
        return (
          <div className='mb-8 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-2 border-blue-500/50 rounded-2xl p-6 backdrop-blur-sm'>
            <div className='flex items-start gap-4'>
              <Trophy className='w-6 h-6 text-blue-400 flex-shrink-0 mt-1' />
              <div>
                <h3 className='text-xl font-bold text-blue-400 mb-2'>
                  Final Submission Received!
                </h3>
                <p className='text-gray-300'>
                  Your final submission has been received. Good luck! 🏆 We will
                  announce the results soon.
                </p>
              </div>
            </div>
          </div>
        );
      }

      // Final phase is open — user can submit
      if (isFinalPhaseOpen) {
        return (
          <div className='mb-8 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-2 border-amber-500/50 rounded-2xl p-6 backdrop-blur-sm'>
            <div className='flex items-start gap-4'>
              <PartyPopper className='w-6 h-6 text-amber-400 flex-shrink-0 mt-1' />
              <div>
                <h3 className='text-xl font-bold text-amber-400 mb-2'>
                  Semifinal Phase Passed! 🎉
                </h3>
                <p className='text-gray-300'>
                  Congratulations, you have advanced to the final! The final
                  phase is now open. Please submit your final materials below
                  before the deadline.
                </p>
              </div>
            </div>
          </div>
        );
      }

      // Final phase not yet open — FREEZE/WAIT state
      return (
        <div className='mb-8 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border-2 border-purple-500/50 rounded-2xl p-6 backdrop-blur-sm'>
          <div className='flex items-start gap-4'>
            <Lock className='w-6 h-6 text-purple-400 flex-shrink-0 mt-1' />
            <div>
              <h3 className='text-xl font-bold text-purple-400 mb-2'>
                Semifinal Phase Passed! 🎉
              </h3>
              <p className='text-gray-300 mb-2'>
                Congratulations, you have advanced to the final. Please wait
                until the final phase begins.
              </p>
              {finalDeadline && (
                <p className='text-gray-400 text-sm'>
                  The final phase will open on{' '}
                  <span className='text-[#FFCD8D] font-medium'>
                    {new Date(competition.finalStart).toLocaleDateString(
                      'en-US',
                      {
                        timeZone: 'Asia/Jakarta',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      },
                    )}
                  </span>
                  . You will be notified when submissions open.
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Default approved banner for registration phase
    return (
      <div className='mb-8 bg-gradient-to-r from-green-500/20 to-green-600/20 border-2 border-green-500/50 rounded-2xl p-6 backdrop-blur-sm'>
        <div className='flex items-start gap-4'>
          <CheckCircle className='w-6 h-6 text-green-400 flex-shrink-0 mt-1' />
          <div>
            <h3 className='text-xl font-bold text-green-400 mb-2'>
              Registration Approved!
            </h3>
            <p className='text-gray-300'>
              Congratulations! Your registration has been approved. You can now
              proceed with your submissions below.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
