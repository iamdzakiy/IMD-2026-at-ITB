/**
 * ============================================================================
 * PRESIGNED UPLOAD URL API
 * ============================================================================
 *
 * POST - Generate a presigned URL for direct client-to-Supabase file upload.
 *
 * This bypasses the Vercel 4.5MB serverless function body limit by letting
 * the client upload directly to Supabase Storage. The server only handles
 * the small JSON metadata request.
 *
 * Flow:
 * 1. Client sends file metadata (name, size, type, bucket, prefix)
 * 2. Server validates metadata & generates a signed upload URL
 * 3. Client uploads directly to Supabase using the signed URL
 * 4. Client submits the storagePath to the relevant submission API
 *
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { FILE_SIZE_LIMITS, validateFileServer } from '@/lib/fileConfig';
import { RATE_LIMITS, rateLimit } from '@/lib/rate-limit';
import { getSupabaseAdmin } from '@/lib/supabase';

const PHASE_MAP: Record<string, keyof typeof FILE_SIZE_LIMITS> = {
  payments: 'payment',
  preliminary: 'preliminary',
  semifinal: 'semifinal',
  final: 'final',
};

export async function POST(req: NextRequest) {
  try {
    const rateLimitResponse = await rateLimit(req, RATE_LIMITS.API);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { bucket, fileName, contentType, fileSize, prefix } = body;

    // Validate bucket
    if (!bucket || !PHASE_MAP[bucket]) {
      return NextResponse.json(
        { error: 'Invalid storage bucket' },
        { status: 400 },
      );
    }

    if (!fileName || !contentType || typeof fileSize !== 'number') {
      return NextResponse.json(
        { error: 'Missing file metadata (fileName, contentType, fileSize)' },
        { status: 400 },
      );
    }

    // Validate file against phase config
    const phase = PHASE_MAP[bucket];
    const validation = validateFileServer(
      { name: fileName, size: fileSize, type: contentType },
      phase,
    );
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Build storage path — preserve original filename as last path segment
    // so downloads retain the name the participant uploaded.
    const timestamp = Date.now();
    const sanitizedFileName = fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_');
    const storagePath = prefix
      ? `${prefix}/${timestamp}/${sanitizedFileName}`
      : `${timestamp}/${sanitizedFileName}`;

    // Create signed upload URL via Supabase admin client
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(storagePath);

    if (error) {
      console.error(`❌ Presigned URL error [${bucket}]:`, error.message);
      return NextResponse.json(
        { error: 'Failed to create upload URL. Please try again.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      storagePath: data.path,
      token: data.token,
    });
  } catch (error: any) {
    console.error('Presign endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
