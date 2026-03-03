'use client';

import { useState } from 'react';
import { styles } from '@/lib/constants';

type MaintenanceRequest = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  address: string;
  issueType: string;
  entryPermission: string;
  description: string;
  attachmentUrl: string | null;
  attachmentKey?: string | null;
  status: string;
};

type Props = {
  requests: MaintenanceRequest[];
};

const STATUS_OPTIONS = ['new', 'in-progress', 'completed', 'closed'];
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  'in-progress': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-gray-50 text-gray-700 border-gray-200',
};

export default function MaintenanceRequestList({ requests: initialRequests }: Props) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>(initialRequests);
  const [filter, setFilter] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = filter
    ? requests.filter((r) => r.status === filter)
    : requests;

  async function updateStatus(id: string, newStatus: string) {
    setUpdating(id);
    try {
      const response = await fetch(`/api/admin/maintenance/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update');

      const updated = await response.json();
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? updated : r))
      );
    } catch (error) {
      alert('Error updating status');
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className={`${styles.container} space-y-6`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-montserrat text-2xl font-semibold text-gray-900">Maintenance Requests</h1>
          <p className="text-sm text-gray-600">
            {requests.length} total • {requests.filter((r) => r.status === 'new').length} new
          </p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('')}
          className={`text-sm px-3 py-1 rounded-lg border transition-all ${
            filter === ''
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
          }`}
        >
          All ({requests.length})
        </button>
        {STATUS_OPTIONS.map((status) => {
          const count = requests.filter((r) => r.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`text-sm px-3 py-1 rounded-lg border transition-all capitalize ${
                filter === status
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              {status} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className={`${styles.card} ${styles.cardPad} text-center text-sm text-gray-600`}>
          No maintenance requests found.
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((request) => (
            <div
              key={request.id}
              className={`${styles.card} ${styles.cardPad} cursor-pointer transition-shadow hover:shadow-md`}
              onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="font-montserrat text-lg font-semibold text-gray-900">
                      {request.name}
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full border capitalize ${STATUS_COLORS[request.status]}`}
                    >
                      {request.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>Address:</strong> {request.address}</div>
                    <div><strong>Issue:</strong> {request.issueType}</div>
                    <div><strong>Phone:</strong> <a href={`tel:${request.phone}`} className="text-blue-600 hover:underline">{request.phone}</a></div>
                    <div><strong>Submitted:</strong> {new Date(request.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      updateStatus(request.id, e.target.value);
                      e.currentTarget.value = request.status;
                    }}
                    value={request.status}
                    disabled={updating === request.id}
                    className={`text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-gray-300 disabled:opacity-50 ${styles.inputBase}`}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status} className="capitalize">
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {expandedId === request.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                      {request.description}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 text-sm">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Entry Permission</h4>
                      <p className="text-gray-600">{request.entryPermission}</p>
                    </div>
                    {request.attachmentUrl && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Attachment</h4>
                        <a
                          href={request.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          View attachment
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700">
                      <strong>Ticket ID:</strong> {request.id}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
