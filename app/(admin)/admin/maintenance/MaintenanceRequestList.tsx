'use client';

import { useState, useEffect } from 'react';
import { styles } from '@/lib/constants';

type MaintenanceRequest = {
  id: string;
  createdAt: string;
  updatedAt?: Date;
  name: string;
  email?: string | null;
  phone: string;
  address: string;
  issueType: string;
  entryPermission: string;
  description: string;
  attachmentUrl: string | null;
  attachmentKey?: string | null;
  status: string;
  statusUpdatedAt?: string;
  adminComment?: string | null;
  commentAttachmentUrl?: string | null;
  commentAttachmentKey?: string | null;
};

type PaginationData = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const STATUS_OPTIONS = ['new', 'in-progress', 'completed', 'closed'];
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  'in-progress': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-gray-50 text-gray-700 border-gray-200',
};

export default function MaintenanceRequestList({ requests: initialRequests, pagination: initialPagination }: { requests: MaintenanceRequest[]; pagination: PaginationData }) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>(initialRequests);
  const [pagination, setPagination] = useState<PaginationData>(initialPagination);
  const [filter, setFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [updateingModal, setUpdatingModal] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchRequests(page: number, filterStatus: string, searchQuery: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (filterStatus) params.set('status', filterStatus);
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/admin/maintenance?${params}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setRequests(data.requests);
      setPagination(data.pagination);
    } catch (error) {
      alert('Error fetching maintenance requests');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(id: string, newStatus: string) {
    setUpdatingModal(id);
  }

  async function submitStatusUpdate(id: string, newStatus: string) {
    setUpdating(id);
    try {
      let response;

      if (comment || mediaFile) {
        const formData = new FormData();
        formData.set('status', newStatus);
        if (comment) formData.set('comment', comment);
        if (mediaFile) formData.set('media', mediaFile);

        response = await fetch(`/api/admin/maintenance/${id}`, {
          method: 'PATCH',
          body: formData,
        });
      } else {
        response = await fetch(`/api/admin/maintenance/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
      }

      if (!response.ok) throw new Error('Failed to update');

      const updated = await response.json();
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setUpdatingModal(null);
      setComment('');
      setMediaFile(null);
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
            {pagination.total} total • {requests.filter((r) => r.status === 'new').length} new
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            fetchRequests(1, filter, e.target.value);
          }}
          className={`${styles.inputBase} flex-1 rounded-lg`}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => {
            setFilter('');
            fetchRequests(1, '', search);
          }}
          className={`text-sm px-3 py-1 rounded-lg border transition-all ${
            filter === ''
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
          }`}
        >
          All ({pagination.total})
        </button>
        {STATUS_OPTIONS.map((status) => {
          const count = requests.filter((r) => r.status === status).length;
          return (
            <button
              key={status}
              onClick={() => {
                setFilter(status);
                fetchRequests(1, status, search);
              }}
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

      {/* List */}
      {requests.length === 0 ? (
        <div className={`${styles.card} ${styles.cardPad} text-center text-sm text-gray-600`}>
          No maintenance requests found.
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className={`${styles.card} ${styles.cardPad} cursor-pointer transition-shadow hover:shadow-md`}
                onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(request.id, request.status);
                    }}
                    className={`${styles.btn} ${styles.btnPrimary} whitespace-nowrap`}
                  >
                    Update Status
                  </button>
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

                    {request.adminComment && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-700 font-semibold mb-2">Last Admin Comment:</p>
                        <p className="text-sm text-blue-700 whitespace-pre-wrap">{request.adminComment}</p>
                        {request.statusUpdatedAt && (
                          <p className="text-xs text-blue-600 mt-2">
                            Updated: {new Date(request.statusUpdatedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-xs text-gray-700">
                        <strong>Ticket ID:</strong> {request.id}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => fetchRequests(pagination.page - 1, filter, search)}
              disabled={pagination.page === 1 || loading}
              className={`px-4 py-2 rounded-lg border ${
                pagination.page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              Previous
            </button>
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <button
              onClick={() => fetchRequests(pagination.page + 1, filter, search)}
              disabled={pagination.page === pagination.totalPages || loading}
              className={`px-4 py-2 rounded-lg border ${
                pagination.page === pagination.totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Status Update Modal */}
      {updateingModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setUpdatingModal(null)}
        >
          <div
            className={`${styles.card} ${styles.cardPad} w-full max-w-md`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-montserrat text-lg font-semibold text-gray-900 mb-4">Update Status</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">New Status</label>
                <select
                  value={
                    requests.find((r) => r.id === updateingModal)?.status || ''
                  }
                  onChange={(e) => {
                    // Status will be applied on submit
                  }}
                  className={`${styles.inputBase} w-full rounded-lg`}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status} className="capitalize">
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Add Comment (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Add any additional information or comments..."
                  className={`${styles.textarea} w-full rounded-lg`}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Attachment (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                  className={`${styles.inputBase} w-full rounded-lg cursor-pointer`}
                />
                {mediaFile && (
                  <p className="text-xs text-gray-600 mt-1">{mediaFile.name}</p>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setUpdatingModal(null)}
                  className={`${styles.btn} ${styles.btnGhost}`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const newStatus = requests.find(
                      (r) => r.id === updateingModal
                    )?.status;
                    if (newStatus) {
                      submitStatusUpdate(updateingModal, newStatus);
                    }
                  }}
                  disabled={updating === updateingModal}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  {updating === updateingModal ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
