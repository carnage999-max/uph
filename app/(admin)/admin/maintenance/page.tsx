import MaintenanceRequestList from './MaintenanceRequestList';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminMaintenancePage() {
  const session = await requireAdminSession();
  if (!session) redirect('/admin/login');

  const requests = await prisma.maintenanceRequest.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Serialize Date objects to strings for client component
  const serializedRequests = requests.map((req) => ({
    ...req,
    createdAt: req.createdAt.toISOString(),
  }));

  return <MaintenanceRequestList requests={serializedRequests} />;
}
