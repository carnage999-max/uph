import { customAdsOptions, proxyCustomAdsRequest } from '@/lib/customAdsProxy';
import type { NextRequest } from 'next/server';

const HEADER_NAMES = ['origin', 'referer', 'user-agent', 'content-type'];
const ALLOWED_METHODS = 'POST, OPTIONS';

export async function POST(request: NextRequest){
  return proxyCustomAdsRequest({
    request,
    pathname: '/api/events',
    method: 'POST',
    body: await request.arrayBuffer(),
    headerNames: HEADER_NAMES,
  });
}

export function OPTIONS(){
  return customAdsOptions(ALLOWED_METHODS);
}
