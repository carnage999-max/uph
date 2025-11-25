'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { styles } from '@/lib/constants';

type GalleryImage = {
  id: string;
  url: string;
};

type Props = {
  propertyId: string;
  images: Array<{ id: string; url: string }>;
};

export default function GalleryManager({ propertyId, images }: Props){
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [pending, setPending] = useState(false);

  async function handleUpload(){
    if (!files.length) return;
    setPending(true);
    const formData = new FormData();
    files.forEach((file)=> formData.append('files', file));
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}/gallery`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok){
        const data = await response.json().catch(()=> null);
        throw new Error(data?.message || 'Failed to upload images.');
      }
      setFiles([]);
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Unable to upload images.');
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(image: GalleryImage){
    if (!confirm('Remove this image?')) return;
    const response = await fetch(`/api/admin/properties/${propertyId}/gallery/${image.id}`, {
      method: 'DELETE',
    });
    if (!response.ok){
      const data = await response.json().catch(()=> null);
      alert(data?.message || 'Failed to remove image.');
      return;
    }
    router.refresh();
  }

  return (
    <section className={`${styles.card} ${styles.cardPad} space-y-4`}>
      <div>
        <h2 className="font-montserrat text-lg font-semibold text-gray-900">Other images</h2>
        <p className="text-sm text-gray-600">Supplement the property image with interior or exterior shots.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image)=> (
          <div key={image.id} className="group relative overflow-hidden rounded-xl border">
            <Image 
              src={image.url} 
              alt="Other property image" 
              width={400} 
              height={300} 
              className="h-40 w-full object-cover" 
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
            />
            <button
              type="button"
              onClick={()=> handleDelete(image)}
              className="absolute right-2 top-2 hidden rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white group-hover:block"
            >
              Remove
            </button>
          </div>
        ))}
        {images.length === 0 && (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm text-gray-500">
            No other images yet
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="file"
          accept="image/*"
          multiple
          className={`${styles.inputBase} sm:max-w-xs`}
          onChange={(event)=> setFiles(event.target.files ? Array.from(event.target.files) : [])}
        />
        {!!files.length && (
          <div className="text-xs text-gray-500">{files.length} image{files.length === 1 ? '' : 's'} ready</div>
        )}
        <button
          type="button"
          onClick={handleUpload}
          className={`${styles.btn} ${styles.btnPrimary}`}
          disabled={!files.length || pending}
        >
          {pending ? 'Uploading…' : 'Add images'}
        </button>
      </div>
    </section>
  );
}
