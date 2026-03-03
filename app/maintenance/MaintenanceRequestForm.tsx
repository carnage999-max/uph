'use client';

import { useState } from 'react';
import { styles } from '@/lib/constants';

type Props = {
  issueTypes: string[];
};

export default function MaintenanceRequestForm({ issueTypes }: Props){
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok){
        const error = await response.json().catch(()=> null);
        throw new Error(error?.message || 'Failed to submit request');
      }

      setStatus({
        type: 'success',
        message: 'Thanks! Your maintenance request has been received. We\'ll be in touch shortly.',
      });
      form.reset();
    } catch (error: any) {
      setStatus({
        type: 'error',
        message: error.message || 'Something went wrong. Please try again or call the office.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="grid gap-5 md:grid-cols-2" aria-label="Maintenance request form" onSubmit={handleSubmit}>
      {status && (
        <div
          className={`md:col-span-2 rounded-2xl border p-4 text-sm ${
            status.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {status.message}
        </div>
      )}

      <div className="md:col-span-1 space-y-2">
        <label className="text-sm font-semibold text-gray-700" htmlFor="maintenance-name">
          Full name
        </label>
        <input id="maintenance-name" name="name" type="text" placeholder="Jane Doe" required className={styles.inputBase} />
      </div>

      <div className="md:col-span-1 space-y-2">
        <label className="text-sm font-semibold text-gray-700" htmlFor="maintenance-phone">
          Phone number
        </label>
        <input id="maintenance-phone" name="phone" type="tel" placeholder="(207) 555-0123" required className={styles.inputBase} />
      </div>

      <div className="md:col-span-1 space-y-2">
        <label className="text-sm font-semibold text-gray-700" htmlFor="maintenance-email">
          Email address (optional)
        </label>
        <input id="maintenance-email" name="email" type="email" placeholder="you@example.com" className={styles.inputBase} />
      </div>

      <div className="md:col-span-2 space-y-2">
        <label className="text-sm font-semibold text-gray-700" htmlFor="maintenance-address">
          Property address
        </label>
        <input id="maintenance-address" name="address" type="text" placeholder="123 Main St, Unit 2" required className={styles.inputBase} />
      </div>

      <div className="md:col-span-1 space-y-2">
        <label className="text-sm font-semibold text-gray-700" htmlFor="maintenance-issue">
          Issue type
        </label>
        <select id="maintenance-issue" name="issueType" className={`${styles.inputBase} bg-white`} defaultValue="" required>
          <option value="" disabled>Choose an issue</option>
          {issueTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="md:col-span-1 space-y-2">
        <label className="text-sm font-semibold text-gray-700" htmlFor="maintenance-access">
          Entry permission
        </label>
        <select id="maintenance-access" name="entryPermission" className={`${styles.inputBase} bg-white`} defaultValue="yes">
          <option value="yes">Yes, maintenance can enter with key</option>
          <option value="no">No, please call to schedule</option>
        </select>
      </div>

      <div className="md:col-span-2 space-y-2">
        <label className="text-sm font-semibold text-gray-700" htmlFor="maintenance-description">
          Describe the issue
        </label>
        <textarea
          id="maintenance-description"
          name="description"
          rows={5}
          placeholder="Share as much detail as possible, including when the issue started."
          className={styles.textarea}
          required
        />
      </div>

      <div className="md:col-span-2 space-y-2">
        <label className="text-sm font-semibold text-gray-700" htmlFor="maintenance-media">
          Upload photo or video (optional)
        </label>
        <input id="maintenance-media" name="media" type="file" className={`${styles.inputBase} cursor-pointer`} />
      </div>

      <div className="md:col-span-2 flex flex-col gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          After submitting, our team emails a confirmation with your ticket number.
        </p>
        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
}
