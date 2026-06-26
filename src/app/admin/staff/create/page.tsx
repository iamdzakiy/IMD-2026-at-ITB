import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';

import CreateAdminForm from './CreateAdminForm';

export default async function CreateAdminPage() {
  const session = await auth();

  // Only super admin can access
  if (session?.admin?.role !== 'super_admin') {
    redirect('/admin/dashboard');
  }

  return (
    <div className='max-w-2xl mx-auto'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Create Admin Account
        </h1>
        <p className='text-gray-600 mt-1'>
          Add new admin staff to manage IMD 2026 at ITB 3.0
        </p>
      </div>

      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
        <p className='text-sm text-blue-800'>
          <strong>Note:</strong> The new admin will receive their credentials
          immediately. Make sure to share the password securely with them.
        </p>
      </div>

      <CreateAdminForm />
    </div>
  );
}
