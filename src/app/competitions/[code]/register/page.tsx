'use client';

import { ChevronRight, FileImage, Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import Footer from '@/components/site/Footer';
import Navbar from '@/components/site/Navbar';
import { uploadViaPresignedUrl } from '@/lib/clientUpload';

type Competition = 'BCC' | 'TPC' | 'PTC';

interface TeamMember {
  fullName: string;
  phoneNumber: string;
  email?: string;
  institution: string;
}

interface FormData {
  competitionCode: Competition;
  teamName: string;
  leaderName: string;
  leaderPhone: string;
  leaderInstitution: string;
  proofOfRegistrationLink: string;
  members: TeamMember[];
  paymentProof: File | null;
}

// Registration fee tiers per competition
const PRICING: Record<Competition, { early: number; normal: number }> = {
  BCC: { early: 150000, normal: 180000 },
  TPC: { early: 125000, normal: 150000 },
  PTC: { early: 200000, normal: 220000 },
};

const COMPETITION_DETAILS = {
  BCC: { name: 'Business Case Competition', min: 3, max: 3 },
  TPC: { name: 'Technovate Paper Competition', min: 1, max: 3 },
  PTC: { name: 'ProtoTech Competition', min: 3, max: 5 },
};

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function RegistrationContent() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status: authStatus } = useSession();
  const rawCode = (params.code as string).toUpperCase();
  const isValidCode = rawCode in COMPETITION_DETAILS;
  const competitionCode = (isValidCode ? rawCode : 'BCC') as Competition;

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [regCheckLoading, setRegCheckLoading] = useState(true);
  const [regClosed, setRegClosed] = useState<string | null>(null);
  const [isExtendedReg, setIsExtendedReg] = useState(false);

  // Dynamic pricing state based on registration batch
  const [currentBatch, setCurrentBatch] = useState<'early' | 'normal'>('early');
  const [batchLabel, setBatchLabel] = useState<string>('Early Registration');

  // Event-based discount state (early-price parity)
  const [discountEligible, setDiscountEligible] = useState(false);
  const [discountInfo, setDiscountInfo] = useState<{
    label: string;
    description: string;
    type: string;
  } | null>(null);

  useEffect(() => {
    if (!isValidCode) {
      router.push('/competitions');
    }
  }, [isValidCode, router]);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push(
        '/login?callbackUrl=' +
          encodeURIComponent(
            `/competitions/${competitionCode.toLowerCase()}/register`,
          ),
      );
    }
  }, [authStatus, router, competitionCode]);

  // Check registration status and determine batch pricing
  useEffect(() => {
    if (authStatus !== 'authenticated') return;

    async function checkRegistration() {
      try {
        const regRes = await fetch('/api/competitions/register');
        if (regRes.ok) {
          const regData = await regRes.json();
          if (regData.registered) {
            setRegClosed(
              `You are already registered for ${regData.registration.competition}. Each user can only register for one competition.`,
            );
            setRegCheckLoading(false);
            return;
          }
        }

        const compRes = await fetch(
          `/api/competitions/${competitionCode.toLowerCase()}`,
        );
        if (compRes.ok) {
          const compData = await compRes.json();
          const comp = compData.competition || compData;
          const now = new Date();
          const regOpen = new Date(comp.registrationOpen);
          const regDeadline = new Date(comp.registrationDeadline);

          if (now < regOpen) {
            setRegClosed(
              'Registration has not opened yet. Please check the competition timeline.',
            );
          } else if (now > regDeadline) {
            setRegClosed('Registration deadline has passed.');
          } else if (!comp.isActive) {
            setRegClosed(
              'This competition is currently closed for registration.',
            );
          }

          // Determine batch from timeline events
          if (comp.timelineEvents) {
            const batch1 = comp.timelineEvents.find(
              (e: any) => e.phase === 'registration_batch_1',
            );
            const batch2 = comp.timelineEvents.find(
              (e: any) => e.phase === 'registration_batch_2',
            );

            if (batch1 && batch2) {
              const batch1End = new Date(batch1.endDate);
              const batch2Start = new Date(batch2.startDate);

              if (now <= batch1End) {
                setCurrentBatch('early');
                setBatchLabel('Early Registration');
              } else if (now >= batch2Start) {
                setCurrentBatch('normal');
                setBatchLabel('Extended Registration');
                setIsExtendedReg(true);
              } else {
                setCurrentBatch('normal');
                setBatchLabel('Normal Registration');
              }
            }
          }
        }
      } catch {
        // If we can't check, allow form to load
      } finally {
        setRegCheckLoading(false);
      }
    }

    // Check discount eligibility (parallel with registration check)
    async function checkDiscount() {
      try {
        const res = await fetch('/api/competitions/check-discount');
        if (res.ok) {
          const data = await res.json();
          if (data.eligible && data.discount) {
            setDiscountEligible(true);
            setDiscountInfo(data.discount);
          }
        }
      } catch {
        // Discount check failure is non-critical
      }
    }

    checkRegistration();
    checkDiscount();
  }, [authStatus, competitionCode]);

  const baseFee = PRICING[competitionCode][currentBatch];

  // Calculate discounted fee if eligible (early-price parity)
  // If eligible, the user always pays the early registration price
  const earlyFee = PRICING[competitionCode].early;
  const currentFee =
    discountEligible && discountInfo && baseFee > earlyFee ? earlyFee : baseFee;

  const discountAmount = baseFee - currentFee;

  const [formData, setFormData] = useState<FormData>({
    competitionCode: competitionCode,
    teamName: '',
    leaderName: '',
    leaderPhone: '',
    leaderInstitution: '',
    proofOfRegistrationLink: '',
    members: [],
    paymentProof: null,
  });

  useEffect(() => {
    const minMembers = COMPETITION_DETAILS[formData.competitionCode].min;
    const initialMembers = Array(minMembers - 1)
      .fill(null)
      .map(() => ({
        fullName: '',
        phoneNumber: '',
        institution: '',
      }));
    setFormData((prev) => ({ ...prev, members: initialMembers }));
  }, [formData.competitionCode]);

  const validateStep = (step: number): boolean => {
    setError('');

    if (step === 1) {
      if (!formData.teamName.trim()) {
        setError('Team name is required');
        return false;
      }
    }

    if (step === 2) {
      if (!formData.leaderName.trim()) {
        setError('Leader full name is required');
        return false;
      }
      if (!formData.leaderPhone.trim()) {
        setError('Leader phone number is required');
        return false;
      }
      if (formData.leaderPhone.replace(/\D/g, '').length < 10) {
        setError('Leader phone number must be at least 10 digits');
        return false;
      }
      if (!formData.leaderInstitution.trim()) {
        setError('Leader institution/university is required');
        return false;
      }
      if (
        !formData.proofOfRegistrationLink.trim() ||
        !formData.proofOfRegistrationLink.startsWith('http')
      ) {
        setError(
          'Proof of registration link is required (must be a valid URL)',
        );
        return false;
      }

      for (let i = 0; i < formData.members.length; i++) {
        const member = formData.members[i];
        if (!member.fullName.trim()) {
          setError(`Member ${i + 2} full name is required`);
          return false;
        }
        if (!member.phoneNumber.trim()) {
          setError(`Member ${i + 2} phone number is required`);
          return false;
        }
        if (member.phoneNumber.replace(/\D/g, '').length < 10) {
          setError(`Member ${i + 2} phone number must be at least 10 digits`);
          return false;
        }
        if (!member.institution.trim()) {
          setError(`Member ${i + 2} institution/university is required`);
          return false;
        }
      }
    }

    if (step === 3) {
      if (!formData.paymentProof) {
        setError('Payment proof is required');
        return false;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(formData.paymentProof.type)) {
        setError('Payment proof must be a JPG or PNG image');
        return false;
      }
      if (formData.paymentProof.size > 5 * 1024 * 1024) {
        setError('Payment proof file size must be less than 5MB');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError('');
  };

  const isSubmitting = useRef(false);

  const handleSubmit = useCallback(async () => {
    if (!validateStep(3)) return;
    if (isSubmitting.current) return;

    isSubmitting.current = true;
    setIsLoading(true);
    setError('');

    try {
      // Step 1: Upload payment proof via presigned URL (bypasses server body limit)
      let paymentProofStoragePath: string | null = null;
      if (formData.paymentProof) {
        const sanitizedTeamName = formData.teamName.replace(
          /[^a-zA-Z0-9]/g,
          '_',
        );
        const prefix = `payment_${sanitizedTeamName}`;
        const uploadResult = await uploadViaPresignedUrl(
          formData.paymentProof,
          'payments',
          prefix,
        );
        paymentProofStoragePath = uploadResult.storagePath;
      }

      // Step 2: Submit registration form with payment proof storage path
      const body = new globalThis.FormData();
      body.append('competitionCode', formData.competitionCode);
      body.append('teamName', formData.teamName);
      body.append('leaderName', formData.leaderName);
      body.append('leaderPhone', formData.leaderPhone);
      body.append('leaderInstitution', formData.leaderInstitution);
      body.append('proofOfRegistrationLink', formData.proofOfRegistrationLink);

      const membersPayload = formData.members
        .filter((m) => m.fullName.trim() !== '')
        .map((m, idx) => ({
          fullName: m.fullName,
          email:
            m.email ||
            `member.${Date.now()}.${idx}.${Math.random().toString(36).slice(2, 9)}@placeholder.imd 2026 at itb.id`,
          phoneNumber: m.phoneNumber,
          institution: m.institution,
        }));
      body.append('members', JSON.stringify(membersPayload));

      // Send storage path instead of the file (presigned URL flow)
      if (paymentProofStoragePath) {
        body.append('paymentProofStoragePath', paymentProofStoragePath);
      } else if (formData.paymentProof) {
        // Fallback: send file directly (legacy flow, limited by Vercel 4.5MB)
        body.append('paymentProof', formData.paymentProof);
      }

      const response = await fetch('/api/competitions/register', {
        method: 'POST',
        body,
        signal: AbortSignal.timeout(60000),
      });

      let data: any;
      try {
        data = await response.json();
      } catch {
        throw new Error(`Server error (${response.status}). Please try again.`);
      }

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            data.error?.message || 'Too many requests. Please try again later.',
          );
        }
        throw new Error(
          data.error?.message || data.error || 'Registration failed',
        );
      }

      const needsActivation = data.registration?.needsActivation
        ? 'true'
        : 'false';
      const userEmail = session?.user?.email || '';
      router.push(
        `/competitions/${competitionCode.toLowerCase()}/register/success?email=${encodeURIComponent(userEmail)}&needsActivation=${needsActivation}`,
      );
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError(
          'Request timeout. Please check your connection and try again.',
        );
      } else {
        setError(
          err instanceof Error ? err.message : 'Failed to submit registration',
        );
      }
    } finally {
      setIsLoading(false);
      isSubmitting.current = false;
    }
  }, [formData, competitionCode, router, session]);

  const addMember = () => {
    const maxMembers = COMPETITION_DETAILS[formData.competitionCode].max;
    if (formData.members.length < maxMembers - 1) {
      setFormData((prev) => ({
        ...prev,
        members: [
          ...prev.members,
          { fullName: '', phoneNumber: '', institution: '' },
        ],
      }));
    }
  };

  const removeMember = (index: number) => {
    const minMembers = COMPETITION_DETAILS[formData.competitionCode].min;
    if (formData.members.length > minMembers - 1) {
      setFormData((prev) => ({
        ...prev,
        members: prev.members.filter((_, i) => i !== index),
      }));
    }
  };

  const updateMember = (
    index: number,
    field: keyof TeamMember,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.map((m, i) =>
        i === index ? { ...m, [field]: value } : m,
      ),
    }));
  };

  if (
    !isValidCode ||
    authStatus === 'loading' ||
    authStatus === 'unauthenticated' ||
    regCheckLoading
  ) {
    return (
      <>
        <Navbar />
        <div className='min-h-screen bg-gradient-to-b from-[#0B0102] via-[#190204] to-[#0B0102] flex items-center justify-center'>
          <Loader2 className='text-[#FFCD8D] animate-spin' size={40} />
        </div>
        <Footer />
      </>
    );
  }

  if (regClosed) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-[#0B0102] via-[#190204] to-[#0B0102] pt-32 pb-16 px-4 font-['Gemunu_Libre']">
          <div className='max-w-2xl mx-auto text-center'>
            <div className='backdrop-blur-xl bg-gradient-to-br from-[#5A2424]/40 via-[#3d1a1a]/30 to-[#2d0e0e]/40 rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-2xl'>
              <div className='w-20 h-20 mx-auto bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center border-2 border-red-500/30 mb-6'>
                <X className='w-10 h-10 text-red-400' />
              </div>
              <h2 className='text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-[#FFE4B5] via-[#FFCD8D] to-[#FFE4B5] bg-clip-text text-transparent'>
                Registration Unavailable
              </h2>
              <p className='text-gray-400 text-base md:text-lg mb-8'>
                {regClosed}
              </p>
              <Link
                href={`/competitions/${competitionCode.toLowerCase()}`}
                className='inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#8B3A3A] to-[#6B2D2D] border-2 border-[#FFCD8D]/30 rounded-2xl text-white font-bold hover:from-[#9B4A4A] hover:to-[#7B3D3D] transition-all duration-300'
              >
                Back to Competition
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-[#0B0102] via-[#190204] to-[#0B0102] pt-32 pb-16 px-4 font-['Gemunu_Libre']">
        <div className='max-w-5xl mx-auto'>
          <div className='text-center mb-8 sm:mb-12'>
            {/* Extended Registration Notice */}
            {isExtendedReg && (
              <div className='mb-5 sm:mb-6'>
                <div className='inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 backdrop-blur-sm'>
                  <span className='relative flex h-2.5 w-2.5'>
                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75' />
                    <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400' />
                  </span>
                  <span className='text-amber-200 font-bold text-sm sm:text-base tracking-wide'>
                    Extended Registration — Until March 16, 2026
                  </span>
                </div>
              </div>
            )}
            <h1 className='text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-3 tracking-wide'>
              Registration Form
            </h1>
            <p className='text-gray-400 text-base sm:text-lg'>
              Complete the form below to register your team
            </p>
          </div>

          <div className='relative'>
            <div className='absolute -left-4 -top-16 sm:-left-8 sm:-top-20 md:-left-12 md:-top-24 z-20 hidden sm:block'>
              <Image
                src='/mascots/mascot-3.svg'
                alt='Mascot'
                width={200}
                height={200}
                className='w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 drop-shadow-2xl'
              />
            </div>

            <div className='relative backdrop-blur-xl bg-gradient-to-br from-[#5A2424]/40 via-[#3d1a1a]/30 to-[#2d0e0e]/40 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 md:p-12 border border-white/10 shadow-2xl'>
              <div className='bg-gradient-to-br from-[#6B2D2D]/50 to-[#4a1f1f]/50 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 mb-8'>
                <h2 className='text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 bg-gradient-to-r from-[#FFE4B5] via-[#FFCD8D] to-[#FFE4B5] bg-clip-text text-transparent'>
                  {currentStep === 1 && 'Team Identity'}
                  {currentStep === 2 && 'Team Members'}
                  {currentStep === 3 && 'Payment'}
                  {currentStep === 4 && 'Review & Confirm'}
                </h2>

                <div className='flex items-center justify-center gap-1 sm:gap-2'>
                  {[
                    'Team Identity',
                    'Team Members',
                    'Payment',
                    'Review & Confirm',
                  ].map((label, index) => {
                    const step = index + 1;
                    return (
                      <div key={step} className='flex items-center'>
                        <div className='flex flex-col items-center'>
                          <div
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                              step === currentStep
                                ? 'bg-gradient-to-br from-[#FFCD8D] to-[#E8A05D] text-[#2d0e0e] scale-110 shadow-lg shadow-orange-500/30'
                                : step < currentStep
                                  ? 'bg-[#6B2D2D] text-white border-2 border-[#FFCD8D]/50'
                                  : 'bg-[#3d1a1a]/60 text-gray-500 border-2 border-gray-600/30'
                            }`}
                          >
                            {step}
                          </div>
                          <span className='text-[10px] sm:text-xs text-gray-400 mt-1 sm:mt-2 max-w-[60px] sm:max-w-[100px] text-center leading-tight'>
                            {label}
                          </span>
                        </div>
                        {step < 4 && (
                          <div
                            className={`w-6 sm:w-12 md:w-20 h-0.5 sm:h-1 mx-0.5 sm:mx-2 rounded-full transition-all ${
                              step < currentStep
                                ? 'bg-gradient-to-r from-[#FFCD8D] to-[#E8A05D]'
                                : 'bg-gray-700/50'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className='bg-gradient-to-br from-[#5A2424]/30 to-[#3d1a1a]/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-10 border border-white/5'>
                {error && (
                  <div className='mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-2xl backdrop-blur-sm'>
                    <p className='text-red-200 text-sm'>{error}</p>
                  </div>
                )}

                {/* Step 1: Team Identity */}
                {currentStep === 1 && (
                  <div className='space-y-6'>
                    <div className='bg-gradient-to-r from-[#6B2D2D]/50 to-[#4a1f1f]/50 backdrop-blur-md rounded-2xl p-6 border border-[#FFCD8D]/20'>
                      <h3 className='text-xl font-bold text-[#FFCD8D] mb-1'>
                        {COMPETITION_DETAILS[competitionCode].name}
                      </h3>
                      <p className='text-xs text-gray-400'>
                        {COMPETITION_DETAILS[competitionCode].min ===
                        COMPETITION_DETAILS[competitionCode].max
                          ? `Requires exactly ${COMPETITION_DETAILS[competitionCode].min} members`
                          : `Requires ${COMPETITION_DETAILS[competitionCode].min}-${COMPETITION_DETAILS[competitionCode].max} members`}
                      </p>
                    </div>

                    <div>
                      <label className='block text-white mb-3 font-medium text-lg'>
                        Team Name<span className='text-[#FFCD8D] ml-1'>*</span>
                      </label>
                      <input
                        type='text'
                        value={formData.teamName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            teamName: e.target.value,
                          }))
                        }
                        placeholder='Choose a creative name that represents your team (max 50 characters)'
                        className='w-full bg-[#2d0e0e]/60 backdrop-blur-sm border-2 border-white/10 focus:border-[#FFCD8D]/50 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none transition-all duration-300'
                        maxLength={50}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Team Members */}
                {currentStep === 2 && (
                  <div className='space-y-8'>
                    {/* Shared Proof of Registration */}
                    <div className='bg-gradient-to-r from-[#6B2D2D]/50 to-[#4a1f1f]/50 backdrop-blur-md rounded-2xl p-6 border border-[#FFCD8D]/20'>
                      <h3 className='text-lg font-bold text-[#FFCD8D] mb-2'>
                        Proof of Registration
                      </h3>
                      <p className='text-xs text-gray-400 mb-4'>
                        Provide a single Google Drive link containing proof of
                        registration for{' '}
                        <strong className='text-[#FFCD8D]'>
                          all team members
                        </strong>{' '}
                        (team leader included). Make sure the link is accessible
                        (set permissions to &quot;Anyone with the link&quot;).
                      </p>
                      <input
                        type='url'
                        value={formData.proofOfRegistrationLink}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            proofOfRegistrationLink: e.target.value,
                          }))
                        }
                        placeholder='https://drive.google.com/...'
                        className='w-full bg-[#2d0e0e]/60 backdrop-blur-sm border-2 border-white/10 focus:border-[#FFCD8D]/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all text-sm'
                      />
                    </div>

                    {/* Leader Section */}
                    <div className='bg-gradient-to-br from-[#6B2D2D]/40 to-[#4a1f1f]/30 backdrop-blur-md rounded-2xl p-6 border border-white/10'>
                      <h3 className='text-2xl font-bold text-[#FFCD8D] mb-4'>
                        #1 Team Leader
                      </h3>

                      <div className='space-y-4'>
                        <div>
                          <label className='block text-white mb-2 text-sm font-medium'>
                            Full Name <span className='text-[#FFCD8D]'>*</span>
                          </label>
                          <input
                            type='text'
                            value={formData.leaderName}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                leaderName: e.target.value,
                              }))
                            }
                            placeholder='Enter your full name'
                            className='w-full bg-[#2d0e0e]/60 backdrop-blur-sm border-2 border-white/10 focus:border-[#FFCD8D]/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all text-sm'
                          />
                        </div>

                        <div>
                          <label className='block text-white mb-2 text-sm font-medium'>
                            Phone Number{' '}
                            <span className='text-[#FFCD8D]'>*</span>
                          </label>
                          <input
                            type='tel'
                            value={formData.leaderPhone}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                leaderPhone: e.target.value,
                              }))
                            }
                            placeholder='e.g. 08123456789'
                            className='w-full bg-[#2d0e0e]/60 backdrop-blur-sm border-2 border-white/10 focus:border-[#FFCD8D]/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all text-sm'
                          />
                        </div>

                        <div>
                          <label className='block text-white mb-2 text-sm font-medium'>
                            Institution / University{' '}
                            <span className='text-[#FFCD8D]'>*</span>
                          </label>
                          <input
                            type='text'
                            value={formData.leaderInstitution}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                leaderInstitution: e.target.value,
                              }))
                            }
                            placeholder='Full name of your institution'
                            className='w-full bg-[#2d0e0e]/60 backdrop-blur-sm border-2 border-white/10 focus:border-[#FFCD8D]/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all text-sm'
                          />
                        </div>
                      </div>
                    </div>

                    {/* Members Sections */}
                    {formData.members.map((member, index) => (
                      <div
                        key={index}
                        className='bg-gradient-to-br from-[#6B2D2D]/40 to-[#4a1f1f]/30 backdrop-blur-md rounded-2xl p-6 border border-white/10'
                      >
                        <div className='flex items-center justify-between mb-4'>
                          <h3 className='text-2xl font-bold text-[#FFCD8D]'>
                            #{index + 2} Member
                          </h3>
                          {formData.members.length >
                            COMPETITION_DETAILS[formData.competitionCode].min -
                              1 && (
                            <button
                              type='button'
                              onClick={() => removeMember(index)}
                              className='text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-1 border border-red-400/50 rounded-lg'
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className='space-y-4'>
                          <div>
                            <label className='block text-white mb-2 text-sm font-medium'>
                              Full Name{' '}
                              <span className='text-[#FFCD8D]'>*</span>
                            </label>
                            <input
                              type='text'
                              value={member.fullName}
                              onChange={(e) =>
                                updateMember(index, 'fullName', e.target.value)
                              }
                              placeholder='Enter full name'
                              className='w-full bg-[#2d0e0e]/60 backdrop-blur-sm border-2 border-white/10 focus:border-[#FFCD8D]/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all text-sm'
                            />
                          </div>

                          <div>
                            <label className='block text-white mb-2 text-sm font-medium'>
                              Phone Number{' '}
                              <span className='text-[#FFCD8D]'>*</span>
                            </label>
                            <input
                              type='tel'
                              value={member.phoneNumber}
                              onChange={(e) =>
                                updateMember(
                                  index,
                                  'phoneNumber',
                                  e.target.value,
                                )
                              }
                              placeholder='e.g. 08123456789'
                              className='w-full bg-[#2d0e0e]/60 backdrop-blur-sm border-2 border-white/10 focus:border-[#FFCD8D]/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all text-sm'
                            />
                          </div>

                          <div>
                            <label className='block text-white mb-2 text-sm font-medium'>
                              Institution / University{' '}
                              <span className='text-[#FFCD8D]'>*</span>
                            </label>
                            <input
                              type='text'
                              value={member.institution}
                              onChange={(e) =>
                                updateMember(
                                  index,
                                  'institution',
                                  e.target.value,
                                )
                              }
                              placeholder='Full name of your institution'
                              className='w-full bg-[#2d0e0e]/60 backdrop-blur-sm border-2 border-white/10 focus:border-[#FFCD8D]/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all text-sm'
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {formData.members.length <
                      COMPETITION_DETAILS[formData.competitionCode].max - 1 && (
                      <button
                        type='button'
                        onClick={addMember}
                        className='w-full py-4 bg-[#2d0e0e]/40 backdrop-blur-sm border-2 border-dashed border-[#FFCD8D]/30 rounded-2xl text-gray-300 hover:border-[#FFCD8D] hover:text-[#FFCD8D] transition-all duration-300 font-medium'
                      >
                        + Add Member (Optional)
                      </button>
                    )}
                  </div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 3 && (
                  <div className='space-y-6'>
                    <div className='bg-gradient-to-r from-[#6B2D2D]/50 to-[#4a1f1f]/50 backdrop-blur-md rounded-2xl p-6 border border-[#FFCD8D]/20'>
                      <h3 className='text-xl font-bold text-[#FFCD8D] mb-3'>
                        Registration Fee
                      </h3>
                      <div className='flex items-center gap-3 mb-2'>
                        <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FFCD8D]/20 text-[#FFCD8D] border border-[#FFCD8D]/30'>
                          {batchLabel}
                        </span>
                        {discountEligible && discountInfo && (
                          <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30'>
                            🎉 {discountInfo.label}
                          </span>
                        )}
                      </div>

                      {discountEligible && discountAmount > 0 ? (
                        <>
                          <p className='text-lg text-gray-400 line-through mb-1'>
                            {formatCurrency(baseFee)}
                          </p>
                          <p className='text-3xl font-bold text-white mb-1'>
                            {formatCurrency(currentFee)}
                          </p>
                          <p className='text-sm text-green-400 mb-2'>
                            You save {formatCurrency(discountAmount)}!
                          </p>
                          <p className='text-xs text-gray-400'>
                            {discountInfo?.description}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className='text-3xl font-bold text-white mb-2'>
                            {formatCurrency(currentFee)}
                          </p>
                          <p className='text-xs text-gray-400'>
                            The fee shown is based on the current registration
                            period ({batchLabel}). Please pay{' '}
                            <strong className='text-[#FFCD8D]'>exactly</strong>{' '}
                            this amount.
                          </p>
                        </>
                      )}
                    </div>

                    {/* QRIS Payment Section */}
                    <div className='bg-gradient-to-br from-[#6B2D2D]/40 to-[#4a1f1f]/30 backdrop-blur-md rounded-2xl p-6 border border-white/10'>
                      <h4 className='text-lg font-bold text-[#FFCD8D] mb-4'>
                        Payment via QRIS
                      </h4>
                      <div className='flex justify-center mb-4'>
                        {/* QRIS Payment Image Placeholder
                            TODO: Replace this placeholder with the actual QRIS payment image.
                            Place the QRIS image file at /public/payments/qris.png and update the src below. */}
                        <div className='w-64 h-64 bg-[#2d0e0e]/60 border-2 border-dashed border-[#FFCD8D]/30 rounded-2xl flex items-center justify-center overflow-hidden'>
                          <Image
                            src='/payments/qris.webp'
                            alt='QRIS Payment Code'
                            width={240}
                            height={240}
                            className='rounded-xl object-contain'
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              if (target.parentElement) {
                                target.parentElement.innerHTML =
                                  '<p class="text-gray-500 text-sm text-center px-4">QRIS image will be displayed here.<br/>Contact admin for payment details.</p>';
                              }
                            }}
                          />
                        </div>
                      </div>
                      <p className='text-sm text-gray-300 text-center'>
                        Scan the QRIS code above to make payment of{' '}
                        <strong className='text-[#FFCD8D]'>
                          {formatCurrency(currentFee)}
                        </strong>
                      </p>
                    </div>

                    {/* Payment Instructions */}
                    <div className='bg-gradient-to-br from-[#6B2D2D]/40 to-[#4a1f1f]/30 backdrop-blur-md rounded-2xl p-6 border border-white/10'>
                      <h4 className='text-lg font-bold text-[#FFCD8D] mb-3'>
                        Payment Instructions
                      </h4>
                      <ol className='space-y-2 text-sm text-gray-300 list-decimal list-inside'>
                        <li>
                          Pay exactly{' '}
                          <strong className='text-[#FFCD8D]'>
                            {formatCurrency(currentFee)}
                          </strong>{' '}
                          using the QRIS code above
                        </li>
                        <li>
                          Take a screenshot or download the payment confirmation
                        </li>
                        <li>
                          Upload the payment proof below (JPG/PNG, max 5MB)
                        </li>
                      </ol>
                    </div>

                    {/* Upload Payment Proof */}
                    <div className='bg-gradient-to-br from-[#6B2D2D]/40 to-[#4a1f1f]/30 backdrop-blur-md rounded-2xl p-6 border border-white/10'>
                      <h4 className='text-lg font-bold text-[#FFCD8D] mb-3'>
                        Upload Payment Proof{' '}
                        <span className='text-[#FFCD8D]'>*</span>
                      </h4>

                      {!formData.paymentProof ? (
                        <label className='flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#FFCD8D]/30 rounded-2xl cursor-pointer hover:border-[#FFCD8D] transition-all duration-300 bg-[#2d0e0e]/40'>
                          <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                            <Upload className='w-12 h-12 mb-4 text-[#FFCD8D]/60' />
                            <p className='mb-2 text-lg text-gray-300'>
                              <span className='font-semibold text-[#FFCD8D]'>
                                Click to upload
                              </span>{' '}
                              or drag and drop
                            </p>
                            <p className='text-sm text-gray-500'>
                              JPG or PNG (MAX. 5MB)
                            </p>
                          </div>
                          <input
                            type='file'
                            className='hidden'
                            accept='image/jpeg,image/png,image/jpg'
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setFormData((prev) => ({
                                  ...prev,
                                  paymentProof: file,
                                }));
                              }
                            }}
                          />
                        </label>
                      ) : (
                        <div className='space-y-4'>
                          <div className='relative'>
                            <img
                              src={URL.createObjectURL(formData.paymentProof)}
                              alt='Payment proof preview'
                              className='w-full max-h-80 object-contain rounded-xl border border-white/10'
                            />
                            <button
                              type='button'
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  paymentProof: null,
                                }))
                              }
                              className='absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors'
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <div className='flex items-center gap-3 text-sm text-gray-300'>
                            <FileImage size={16} className='text-[#FFCD8D]' />
                            <span>{formData.paymentProof.name}</span>
                            <span className='text-gray-500'>
                              (
                              {(
                                formData.paymentProof.size /
                                1024 /
                                1024
                              ).toFixed(2)}{' '}
                              MB)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Review & Confirm */}
                {currentStep === 4 && (
                  <div className='space-y-6'>
                    <div className='bg-gradient-to-br from-[#6B2D2D]/40 to-[#4a1f1f]/30 backdrop-blur-md rounded-2xl p-8 border border-white/10'>
                      <h3 className='text-3xl font-bold text-center mb-2 bg-gradient-to-r from-[#FFE4B5] via-[#FFCD8D] to-[#FFE4B5] bg-clip-text text-transparent'>
                        {formData.teamName}
                      </h3>
                      <p className='text-center text-gray-400 mb-6 text-lg'>
                        {COMPETITION_DETAILS[competitionCode].name}
                      </p>

                      <div className='border-t border-white/10 pt-6'>
                        <h4 className='text-sm font-semibold text-[#FFCD8D] mb-3 uppercase tracking-wide'>
                          Proof of Registration
                        </h4>
                        <a
                          href={formData.proofOfRegistrationLink}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-[#FFCD8D] hover:text-[#E8A05D] underline text-sm'
                        >
                          View Shared Link
                        </a>
                      </div>

                      <div className='border-t border-white/10 pt-6 mt-6'>
                        <h4 className='text-sm font-semibold text-[#FFCD8D] mb-3 uppercase tracking-wide'>
                          Team Leader
                        </h4>
                        <div className='space-y-2 text-sm'>
                          <div className='flex justify-between'>
                            <span className='text-gray-400'>Name:</span>
                            <span className='text-white font-medium'>
                              {formData.leaderName}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-gray-400'>Email:</span>
                            <span className='text-white'>
                              {session?.user?.email || 'N/A'}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-gray-400'>Phone:</span>
                            <span className='text-white'>
                              {formData.leaderPhone}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-gray-400'>Institution:</span>
                            <span className='text-white'>
                              {formData.leaderInstitution}
                            </span>
                          </div>
                        </div>
                      </div>

                      {formData.members.length > 0 && (
                        <div className='border-t border-white/10 pt-6 mt-6'>
                          <h4 className='text-sm font-semibold text-[#FFCD8D] mb-3 uppercase tracking-wide'>
                            Team Members
                          </h4>
                          <div className='space-y-4'>
                            {formData.members.map((member, index) => (
                              <div key={index} className='text-sm space-y-1'>
                                <div className='flex justify-between'>
                                  <span className='text-gray-400'>
                                    Member {index + 2}:
                                  </span>
                                  <span className='text-white font-medium'>
                                    {member.fullName}
                                  </span>
                                </div>
                                <div className='flex justify-between'>
                                  <span className='text-gray-400'>Phone:</span>
                                  <span className='text-white'>
                                    {member.phoneNumber}
                                  </span>
                                </div>
                                <div className='flex justify-between'>
                                  <span className='text-gray-400'>
                                    Institution:
                                  </span>
                                  <span className='text-white'>
                                    {member.institution}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className='border-t border-white/10 pt-6 mt-6'>
                        <h4 className='text-sm font-semibold text-[#FFCD8D] mb-3 uppercase tracking-wide'>
                          Registration Fee
                        </h4>
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-400'>{batchLabel}:</span>
                          <span
                            className={`font-bold ${discountEligible && discountAmount > 0 ? 'text-gray-400 line-through' : 'text-white'}`}
                          >
                            {formatCurrency(baseFee)}
                          </span>
                        </div>
                        {discountEligible && discountAmount > 0 && (
                          <>
                            <div className='flex justify-between text-sm mt-1'>
                              <span className='text-green-400'>
                                {discountInfo?.label}:
                              </span>
                              <span className='text-green-400 font-bold'>
                                -{formatCurrency(discountAmount)}
                              </span>
                            </div>
                            <div className='flex justify-between text-sm mt-2 pt-2 border-t border-white/10'>
                              <span className='text-white font-semibold'>
                                Total:
                              </span>
                              <span className='text-white font-bold text-lg'>
                                {formatCurrency(currentFee)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {formData.paymentProof && (
                      <div className='bg-gradient-to-br from-[#6B2D2D]/40 to-[#4a1f1f]/30 backdrop-blur-md rounded-2xl p-6 border border-white/10'>
                        <h4 className='text-sm font-semibold text-[#FFCD8D] mb-3 uppercase tracking-wide'>
                          Payment Proof
                        </h4>
                        <div className='flex items-center gap-3 text-sm text-gray-300'>
                          <FileImage size={16} className='text-[#FFCD8D]' />
                          <span>{formData.paymentProof.name}</span>
                          <span className='text-gray-500'>
                            (
                            {(formData.paymentProof.size / 1024 / 1024).toFixed(
                              2,
                            )}{' '}
                            MB)
                          </span>
                        </div>
                      </div>
                    )}

                    <div className='text-center text-sm text-gray-400 bg-[#2d0e0e]/40 backdrop-blur-sm rounded-2xl p-4 border border-white/5'>
                      ℹ️ After submission, you will receive a confirmation
                      within 24 hours. Please check your inbox and spam folder.
                    </div>
                  </div>
                )}

                <div className='flex justify-between items-center mt-10 gap-4'>
                  {currentStep > 1 && (
                    <button
                      type='button'
                      onClick={handleBack}
                      disabled={isLoading}
                      className='px-8 py-4 bg-[#2d0e0e]/60 backdrop-blur-sm border-2 border-white/10 rounded-2xl text-white hover:border-[#FFCD8D]/50 hover:bg-[#3d1a1a]/60 transition-all duration-300 disabled:opacity-50 font-medium'
                    >
                      Back
                    </button>
                  )}

                  {currentStep === 1 && <div />}

                  {currentStep < 4 ? (
                    <button
                      type='button'
                      onClick={handleNext}
                      disabled={isLoading}
                      className='flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#8B4513] to-[#6B2D2D] border-2 border-[#FFCD8D]/30 rounded-2xl text-white hover:from-[#9B5523] hover:to-[#7B3D3D] transition-all duration-300 shadow-lg shadow-orange-900/20 disabled:opacity-50 ml-auto font-bold'
                    >
                      <span>Next</span>
                      <ChevronRight size={20} />
                    </button>
                  ) : (
                    <button
                      type='button'
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className='flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-[#FFCD8D] via-[#E8A05D] to-[#FFCD8D] rounded-2xl text-[#2d0e0e] font-bold hover:from-[#FFD9A3] hover:via-[#F0B070] hover:to-[#FFD9A3] transition-all duration-300 shadow-xl shadow-orange-500/30 disabled:opacity-50 ml-auto text-lg'
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className='animate-spin' size={22} />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function CompetitionRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-[#0B0102] flex items-center justify-center'>
          <Loader2 className='text-[#FFCD8D] animate-spin' size={40} />
        </div>
      }
    >
      <RegistrationContent />
    </Suspense>
  );
}
