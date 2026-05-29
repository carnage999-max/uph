"use client";

import dynamic from 'next/dynamic';

const MaineMapInner = dynamic(() => import('@/components/MaineMapInner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] w-full items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-600">
      Loading map...
    </div>
  ),
});

export default function MaineMap(){
  return <MaineMapInner />;
}
