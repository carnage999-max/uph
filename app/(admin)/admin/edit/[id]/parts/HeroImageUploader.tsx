'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { styles } from '@/lib/constants';

type Props = {
  propertyId: string;
  heroImageUrl: string;
};

export default function HeroImageUploader({ propertyId, heroImageUrl }: Props){
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(){
    if (!file) return;
    setPending(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}/hero`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok){
        const data = await response.json().catch(()=> null);
        throw new Error(data?.message || 'Failed to update property image.');
      }
      setFile(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Unable to upload image.');
    } finally {
      setPending(false);
    }
  }
  console.log('heroImageUrl', heroImageUrl);

  return (
    <section className={`${styles.card} overflow-hidden`}>
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="relative h-72 w-full bg-gray-100">
          {heroImageUrl ? (
            <Image
              src={heroImageUrl}
              alt="Property image preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 66vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              No property image yet
            </div>
          )}
        </div>
        <div className={`${styles.cardPad} space-y-3`}>
          <div>
            <h2 className="font-montserrat text-lg font-semibold text-gray-900">Property image</h2>
            <p className="text-sm text-gray-600">
              Upload a high-resolution landscape photo. This anchors the public-facing detail page.
            </p>
          </div>
          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-2 text-xs text-red-600">{error}</div>}
          <input
            type="file"
            accept="image/*"
            className={styles.inputBase}
            onChange={(event)=> setFile(event.target.files?.[0] ?? null)}
          />
          {file && (
            <div className="text-xs text-gray-500">{file.name}</div>
          )}
          <button
            type="button"
            onClick={handleUpload}
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={!file || pending}
          >
            {pending ? 'Uploading…' : 'Update property image'}
          </button>
        </div>
      </div>
    </section>
  );
}
