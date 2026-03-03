import MaintenanceRequestList from './MaintenanceRequestList';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminMaintenancePage() {
  const session = await requireAdminSession();
  if (!session) redirect('/admin/login');

  const pageSize = 10;
  const [requests, total] = await Promise.all([
    prisma.maintenanceRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: pageSize,
    }),
    prisma.maintenanceRequest.count(),
  ]);

  // Serialize Date objects to strings for client component
  const serializedRequests = requests.map((req) => ({
    ...req,
    createdAt: req.createdAt.toISOString(),
    statusUpdatedAt: req.statusUpdatedAt ? req.statusUpdatedAt.toISOString() : undefined,
  }));

  const pagination = {
    page: 1,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };

  return <MaintenanceRequestList requests={serializedRequests} pagination={pagination} />;
}
