import { proxyCustomAdsRequest } from '@/lib/customAdsProxy';
import type { NextRequest } from 'next/server';

const HEADER_NAMES = ['origin', 'referer', 'user-agent'];

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }){
  const { id } = await context.params;

  return proxyCustomAdsRequest({
    request,
    pathname: `/api/media/${encodeURIComponent(id)}`,
    method: 'GET',
    headerNames: HEADER_NAMES,
  });
}

export async function HEAD(request: NextRequest, context: { params: Promise<{ id: string }> }){
  const { id } = await context.params;

  return proxyCustomAdsRequest({
    request,
    pathname: `/api/media/${encodeURIComponent(id)}`,
    method: 'HEAD',
    headerNames: HEADER_NAMES,
  });
}
