/**
 * E2E Test: Presigned Upload Flow for Preliminary Submission
 *
 * Simulates the full browser flow:
 * 1. Login via NextAuth credentials
 * 2. Request presigned upload URL from /api/upload/presign
 * 3. Upload a ~5MB test PDF to Supabase via presigned URL
 * 4. Submit metadata to /api/dashboard/submissions/preliminary
 * 5. Verify the DB record was created
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = 'test-upload@imd 2026 at itb.dev';
const TEST_PASSWORD = 'TestUpload123!';

// Generate a fake PDF buffer of ~5MB (above Vercel's 4.5MB limit)
function generateTestPdf(sizeBytes: number): Buffer {
  // Minimal valid PDF header + padding to reach target size
  const header = Buffer.from(
    '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n' +
      '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n' +
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n',
  );
  const trailer = Buffer.from(
    '\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n' +
      'trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF\n',
  );
  // Fill the middle with random data to reach target size
  const paddingSize = Math.max(0, sizeBytes - header.length - trailer.length);
  const padding = Buffer.alloc(paddingSize);
  // Fill with random bytes so it's not trivially compressible
  for (let i = 0; i < paddingSize; i += 1024) {
    const chunk = Math.min(1024, paddingSize - i);
    for (let j = 0; j < chunk; j++) {
      padding[i + j] = Math.floor(Math.random() * 256);
    }
  }
  return Buffer.concat([header, padding, trailer]);
}

async function step(name: string, fn: () => Promise<any>): Promise<any> {
  const start = Date.now();
  process.stdout.write(`  ⏳ ${name}...`);
  try {
    const result = await fn();
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    process.stdout.write(`\r  ✅ ${name} (${elapsed}s)\n`);
    return result;
  } catch (err: any) {
    process.stdout.write(`\r  ❌ ${name}\n`);
    console.error(`     Error: ${err.message}`);
    throw err;
  }
}

async function main() {
  console.log('\n══════════════════════════════════════════════════');
  console.log('  E2E TEST: Presigned Upload → Preliminary Submit');
  console.log('══════════════════════════════════════════════════\n');

  const FILE_SIZE = 5 * 1024 * 1024; // 5 MB — above Vercel 4.5MB limit
  console.log(`  Target: ${BASE_URL}`);
  console.log(`  File size: ${(FILE_SIZE / 1024 / 1024).toFixed(1)} MB\n`);

  // ── Step 1: Login via NextAuth ──
  const sessionCookie = await step('Login as test user', async () => {
    // Get CSRF token + cookies
    const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
    if (!csrfRes.ok) throw new Error(`CSRF fetch failed: ${csrfRes.status}`);
    const { csrfToken } = await csrfRes.json();

    // Extract CSRF cookies to forward with login request
    const csrfCookies = (csrfRes.headers.getSetCookie?.() || [])
      .map((c: string) => c.split(';')[0])
      .join('; ');

    // Login with credentials (forward CSRF cookies)
    const loginRes = await fetch(
      `${BASE_URL}/api/auth/callback/user-credentials`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Cookie: csrfCookies,
        },
        body: new URLSearchParams({
          csrfToken,
          identifier: TEST_EMAIL,
          password: TEST_PASSWORD,
          json: 'true',
        }),
        redirect: 'manual', // Don't follow redirect, we need the cookies
      },
    );

    // Extract session cookie from Set-Cookie headers
    const setCookies = loginRes.headers.getSetCookie?.() || [];
    const allCookies = setCookies
      .map((c: string) => c.split(';')[0])
      .join('; ');

    // Combine CSRF cookies + session cookie
    const combined = [csrfCookies, allCookies].filter(Boolean).join('; ');
    if (!combined.includes('session-token'))
      throw new Error('No session token in login response');

    return combined;
  });

  // Verify session works
  await step('Verify session is valid', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/session`, {
      headers: { Cookie: sessionCookie },
    });
    const session = await res.json();
    if (!session?.user?.email) {
      throw new Error(
        `Session invalid. Got: ${JSON.stringify(session).slice(0, 200)}`,
      );
    }
    return session.user.email;
  });

  // ── Step 2: Get registration ID ──
  const registration = await step('Fetch test registration', async () => {
    const user = await prisma.user.findUnique({
      where: { email: TEST_EMAIL },
      include: {
        registration: {
          include: { competition: true, team: true },
        },
      },
    });
    if (!user?.registration) throw new Error('Registration not found');
    return user.registration;
  });

  // ── Step 3: Generate test PDF ──
  const testPdf = await step(
    `Generate ${(FILE_SIZE / 1024 / 1024).toFixed(1)} MB test PDF`,
    async () => {
      return generateTestPdf(FILE_SIZE);
    },
  );

  // ── Step 4: Get presigned upload URL ──
  const presignData = await step('Request presigned upload URL', async () => {
    const teamName = registration.team?.teamName || 'team';
    const prefix = `${registration.competition.code}-${teamName}`.replace(
      /[^a-zA-Z0-9-]/g,
      '_',
    );

    const res = await fetch(`${BASE_URL}/api/upload/presign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        bucket: 'preliminary',
        fileName: 'test-upload-5mb.pdf',
        fileSize: FILE_SIZE,
        contentType: 'application/pdf',
        prefix,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        `Presign failed (${res.status}): ${data.error || JSON.stringify(data)}`,
      );
    }
    if (!data.signedUrl) throw new Error('No signedUrl in response');
    return data;
  });

  // ── Step 5: Upload file directly to Supabase via signed URL (plain fetch) ──
  await step(
    `Upload ${(FILE_SIZE / 1024 / 1024).toFixed(1)} MB to Supabase`,
    async () => {
      const res = await fetch(presignData.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/pdf' },
        body: testPdf,
      });

      if (!res.ok) {
        let detail = '';
        try {
          const errBody = await res.json();
          detail = errBody.error || errBody.message || '';
        } catch {
          // ignore
        }
        throw new Error(
          `Supabase upload failed (${res.status}): ${detail || res.statusText}`,
        );
      }
    },
  );

  // ── Step 6: Submit metadata to preliminary API ──
  const submission = await step(
    'Submit metadata to preliminary API',
    async () => {
      const res = await fetch(
        `${BASE_URL}/api/dashboard/submissions/preliminary`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: sessionCookie,
          },
          body: JSON.stringify({
            registrationId: registration.id,
            competitionCode: registration.competition.code,
            storagePath: presignData.storagePath,
            fileName: 'test-upload-5mb.pdf',
            fileSize: FILE_SIZE,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          `Submit failed (${res.status}): ${data.error || JSON.stringify(data)}`,
        );
      }
      return data;
    },
  );

  // ── Step 7: Verify DB record ──
  await step('Verify DB record exists', async () => {
    const dbSubmission = await prisma.preliminarySubmission.findUnique({
      where: { registrationId: registration.id },
    });
    if (!dbSubmission) throw new Error('Submission not found in DB');
    if (!dbSubmission.fileUrl) throw new Error('fileUrl is empty');
    if (dbSubmission.fileSize !== FILE_SIZE)
      throw new Error(
        `fileSize mismatch: expected ${FILE_SIZE}, got ${dbSubmission.fileSize}`,
      );
    return {
      id: dbSubmission.id,
      fileSize: dbSubmission.fileSize,
      status: dbSubmission.status,
    };
  });

  console.log('\n══════════════════════════════════════════════════');
  console.log('  ✅ ALL TESTS PASSED');
  console.log('  Presigned upload flow works correctly for 5 MB file.');
  console.log('  The old Vercel 4.5MB body limit is bypassed.');
  console.log('══════════════════════════════════════════════════\n');

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('\n❌ E2E TEST FAILED:', err.message);
  await prisma.$disconnect();
  process.exit(1);
});
