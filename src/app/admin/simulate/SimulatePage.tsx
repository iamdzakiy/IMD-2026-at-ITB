'use client';

import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Loader2,
  Play,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface SimulatePageProps {
  adminUsername: string;
}

interface SimSession {
  simulationId: string;
  registrationId: string;
  competitionCode: string;
  competitionName: string;
  storagePrefix: string;
}

const SEMIFINAL_FIELDS: Record<
  string,
  {
    title: string;
    fields: {
      key: string;
      label: string;
      type: 'file' | 'url';
      accept?: string;
      description: string;
    }[];
  }
> = {
  BCC: {
    title: 'Business Plan / Proposal',
    fields: [
      {
        key: 'businessPlanUrl',
        label: 'Business Plan / Proposal',
        type: 'file',
        accept: '.pdf,.doc,.docx',
        description: 'PDF or Word, max 20MB',
      },
    ],
  },
  PTC: {
    title: 'Proposal Document',
    fields: [
      {
        key: 'proposalUrl',
        label: 'Proposal Document',
        type: 'file',
        accept: '.pdf,.doc,.docx',
        description: 'PDF or Word, max 20MB',
      },
    ],
  },
  TPC: {
    title: 'Research Paper & Poster Campaign',
    fields: [
      {
        key: 'paperUrl',
        label: 'Research Paper',
        type: 'file',
        accept: '.pdf,.doc,.docx',
        description: 'IMD 2026 at ITB format, PDF or Word, max 20MB',
      },
      {
        key: 'presentationUrl',
        label: 'Poster Campaign',
        type: 'file',
        accept: '.pdf,.ppt,.pptx',
        description: 'PDF or PowerPoint, max 20MB',
      },
    ],
  },
};

export default function SimulatePage({ adminUsername }: SimulatePageProps) {
  const [simSession, setSimSession] = useState<SimSession | null>(null);
  const [selectedComp, setSelectedComp] = useState<string>('BCC');
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [error, setError] = useState('');

  // ── Start simulation ──
  const handleStart = async () => {
    setIsStarting(true);
    setError('');
    setSubmitResult(null);
    setFiles({});
    setUrls({});

    try {
      const res = await fetch('/api/admin/simulate/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitionCode: selectedComp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start');
      setSimSession(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsStarting(false);
    }
  };

  // ── Upload a single file via simulation presign endpoint ──
  const uploadFile = async (file: File, fieldKey: string): Promise<string> => {
    if (!simSession) throw new Error('No active simulation');

    // Step 1: Get presigned URL
    const presignRes = await fetch('/api/admin/simulate/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
        storagePrefix: `${simSession.storagePrefix}-${fieldKey.replace('Url', '')}`,
        registrationId: simSession.registrationId,
      }),
    });
    const presignData = await presignRes.json();
    if (!presignRes.ok) throw new Error(presignData.error || 'Presign failed');

    // Step 2: PUT file directly to Supabase signed URL
    const uploadRes = await fetch(presignData.signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    });
    if (!uploadRes.ok) {
      let detail = '';
      try {
        const b = await uploadRes.json();
        detail = b.error || b.message || '';
      } catch {
        /* ignore */
      }
      throw new Error(
        `Upload failed (${uploadRes.status})${detail ? `: ${detail}` : ''}`,
      );
    }

    return presignData.storagePath;
  };

  // ── Submit simulation ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simSession) return;

    const config = SEMIFINAL_FIELDS[simSession.competitionCode];
    setError('');
    setFileErrors({});

    // Validate required fields
    for (const field of config.fields) {
      if (field.type === 'file' && !files[field.key]) {
        setError(`${field.label} is required`);
        return;
      }
      if (field.type === 'url' && !urls[field.key]) {
        setError(`${field.label} is required`);
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const uploadedFiles: Record<string, string> = {};
      const urlFields: Record<string, string> = {};

      for (const field of config.fields) {
        if (field.type === 'file' && files[field.key]) {
          setUploadProgress(`Uploading ${field.label}...`);
          uploadedFiles[field.key] = await uploadFile(
            files[field.key]!,
            field.key,
          );
        }
        if (field.type === 'url' && urls[field.key]) {
          urlFields[field.key] = urls[field.key];
        }
      }

      setUploadProgress('Saving submission...');
      const res = await fetch('/api/admin/simulate/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: simSession.registrationId,
          competitionCode: simSession.competitionCode,
          files: uploadedFiles,
          urls: urlFields,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submit failed');

      setSubmitResult({
        success: true,
        message: 'Submission saved to DB successfully. Upload flow verified!',
      });
      setFiles({});
      setUrls({});
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  // ── Cleanup ──
  const handleCleanup = async () => {
    if (
      !confirm(
        'Clean up all simulation data? This will delete DB records and Supabase storage files.',
      )
    )
      return;

    setIsCleaning(true);
    setError('');

    try {
      const res = await fetch('/api/admin/simulate/cleanup', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: simSession?.registrationId ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cleanup failed');

      setSimSession(null);
      setSubmitResult(null);
      setFiles({});
      setUrls({});
      setError('');
      alert(
        `✅ Cleanup complete.\n\nDeleted:\n${(data.deleted as string[]).join('\n')}`,
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCleaning(false);
    }
  };

  const config = simSession
    ? SEMIFINAL_FIELDS[simSession.competitionCode]
    : null;

  return (
    <div className='max-w-3xl mx-auto space-y-6'>
      {/* Page header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>
          Participant Simulation
        </h1>
        <p className='mt-1 text-sm text-gray-500'>
          Simulate the semifinal submission flow from a participant&apos;s
          perspective. All rules bypassed. Data cleaned up after testing.
        </p>
      </div>

      {/* Active simulation banner */}
      {simSession && (
        <div className='bg-orange-50 border-2 border-orange-400 rounded-xl p-4 flex items-start gap-3'>
          <AlertTriangle
            className='text-orange-500 mt-0.5 flex-shrink-0'
            size={20}
          />
          <div className='flex-1 min-w-0'>
            <p className='font-semibold text-orange-800'>
              SIMULATION MODE ACTIVE
            </p>
            <p className='text-sm text-orange-700 mt-0.5'>
              Admin: <strong>{adminUsername}</strong> — Competition:{' '}
              <strong>
                {simSession.competitionCode} ({simSession.competitionName})
              </strong>
            </p>
            <p className='text-xs text-orange-600 mt-1 font-mono'>
              Registration: {simSession.registrationId}
            </p>
          </div>
          <button
            onClick={handleCleanup}
            disabled={isCleaning}
            className='flex-shrink-0 flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg disabled:opacity-50'
          >
            {isCleaning ? (
              <Loader2 size={14} className='animate-spin' />
            ) : (
              <Trash2 size={14} />
            )}
            {isCleaning ? 'Cleaning...' : 'End & Clean'}
          </button>
        </div>
      )}

      {/* Competition selector — shown when no active simulation */}
      {!simSession && (
        <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm'>
          <h2 className='text-base font-semibold text-gray-800 mb-4'>
            Start Simulation
          </h2>

          <div className='mb-5'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Select Competition
            </label>
            <div className='grid grid-cols-3 gap-3'>
              {['BCC', 'PTC', 'TPC'].map((code) => (
                <button
                  key={code}
                  type='button'
                  onClick={() => setSelectedComp(code)}
                  className={`py-3 rounded-lg border-2 text-sm font-semibold transition-colors ${
                    selectedComp === code
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
            <p className='mt-2 text-xs text-gray-500'>
              {selectedComp === 'BCC' &&
                'Business Case Competition — Business Plan + Pitch Deck'}
              {selectedComp === 'PTC' &&
                'ProtoTech Competition — Proposal Document'}
              {selectedComp === 'TPC' &&
                'Technovate Paper Competition — Research Paper + Poster Campaign'}
            </p>
          </div>

          <button
            onClick={handleStart}
            disabled={isStarting}
            className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-50 transition-colors'
          >
            {isStarting ? (
              <Loader2 size={16} className='animate-spin' />
            ) : (
              <Play size={16} />
            )}
            {isStarting ? 'Starting...' : `Start ${selectedComp} Simulation`}
          </button>
        </div>
      )}

      {/* Submission form — shown during active simulation */}
      {simSession && config && (
        <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
          <div className='bg-gray-50 border-b border-gray-200 px-6 py-4'>
            <h2 className='text-base font-semibold text-gray-800'>
              Semifinal Submission — {config.title}
            </h2>
            <p className='text-xs text-gray-500 mt-0.5'>
              All deadline and phase checks are bypassed for this simulation.
            </p>
          </div>

          {/* Submit result */}
          {submitResult && (
            <div
              className={`mx-6 mt-4 p-3 rounded-lg flex items-start gap-2 text-sm ${
                submitResult.success
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              <CheckCircle size={16} className='mt-0.5 flex-shrink-0' />
              <span>{submitResult.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className='p-6 space-y-5'>
            {config.fields.map((field) => (
              <div key={field.key}>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  {field.label} <span className='text-red-500'>*</span>
                </label>
                <p className='text-xs text-gray-400 mb-2'>
                  {field.description}
                </p>

                {field.type === 'file' ? (
                  <label
                    htmlFor={`sim-file-${field.key}`}
                    className='block cursor-pointer'
                  >
                    <div
                      className={`border-2 border-dashed rounded-lg p-5 text-center hover:border-blue-400 transition-colors ${
                        files[field.key]
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <Upload
                        size={20}
                        className='mx-auto mb-2 text-gray-400'
                      />
                      {files[field.key] ? (
                        <div className='flex items-center justify-center gap-2'>
                          <FileText size={14} className='text-blue-600' />
                          <span className='text-sm text-blue-700 font-medium truncate max-w-xs'>
                            {files[field.key]!.name}
                          </span>
                          <button
                            type='button'
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setFiles((p) => ({ ...p, [field.key]: null }));
                            }}
                            className='text-gray-400 hover:text-red-500'
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <p className='text-sm text-gray-500'>
                          Click to select file
                        </p>
                      )}
                    </div>
                    <input
                      id={`sim-file-${field.key}`}
                      type='file'
                      accept={field.accept}
                      className='hidden'
                      disabled={isSubmitting}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        if (f.size > 20 * 1024 * 1024) {
                          setFileErrors((p) => ({
                            ...p,
                            [field.key]: 'File exceeds 20MB',
                          }));
                          return;
                        }
                        setFileErrors((p) => ({ ...p, [field.key]: '' }));
                        setFiles((p) => ({ ...p, [field.key]: f }));
                      }}
                    />
                    {fileErrors[field.key] && (
                      <p className='text-xs text-red-500 mt-1'>
                        {fileErrors[field.key]}
                      </p>
                    )}
                  </label>
                ) : (
                  <input
                    type='url'
                    value={urls[field.key] || ''}
                    onChange={(e) =>
                      setUrls((p) => ({ ...p, [field.key]: e.target.value }))
                    }
                    placeholder='https://...'
                    disabled={isSubmitting}
                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                )}
              </div>
            ))}

            {error && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700'>
                {error}
              </div>
            )}

            <div className='flex items-center gap-3 pt-2'>
              <button
                type='submit'
                disabled={isSubmitting}
                className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-50 transition-colors'
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className='animate-spin' />
                    {uploadProgress || 'Uploading...'}
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Test Submit
                  </>
                )}
              </button>

              {submitResult?.success && (
                <button
                  type='button'
                  onClick={() => {
                    setSubmitResult(null);
                    setFiles({});
                    setUrls({});
                  }}
                  className='text-sm text-gray-500 hover:text-gray-700 underline'
                >
                  Test again
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Emergency cleanup */}
      <div className='bg-white rounded-xl border border-gray-200 p-5 shadow-sm'>
        <h3 className='text-sm font-semibold text-gray-700 mb-1'>
          Emergency Cleanup
        </h3>
        <p className='text-xs text-gray-500 mb-3'>
          Purges ALL simulation records from the database and storage — use if a
          previous session was interrupted.
        </p>
        <button
          onClick={async () => {
            if (!confirm('Delete ALL simulation data across all sessions?'))
              return;
            setIsCleaning(true);
            try {
              const res = await fetch('/api/admin/simulate/cleanup', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ registrationId: null }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error);
              setSimSession(null);
              alert(
                `✅ ${data.message}\n\n${(data.deleted as string[]).join('\n') || 'Nothing to delete.'}`,
              );
            } catch (err: any) {
              setError(err.message);
            } finally {
              setIsCleaning(false);
            }
          }}
          disabled={isCleaning}
          className='flex items-center gap-2 border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 transition-colors'
        >
          {isCleaning ? (
            <Loader2 size={14} className='animate-spin' />
          ) : (
            <Trash2 size={14} />
          )}
          Clean All Simulations
        </button>
      </div>
    </div>
  );
}
