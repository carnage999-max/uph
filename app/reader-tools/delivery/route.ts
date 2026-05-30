import { customAdsOptions, proxyCustomAdsRequest } from '@/lib/customAdsProxy';
import type { NextRequest } from 'next/server';

const HEADER_NAMES = ['origin', 'referer', 'user-agent'];
const ALLOWED_METHODS = 'GET, OPTIONS';

export async function GET(request: NextRequest){
  return proxyCustomAdsRequest({
    request,
    pathname: '/api/delivery',
    method: 'GET',
    search: request.nextUrl.search,
    headerNames: HEADER_NAMES,
  });
}

export function OPTIONS(){
  return customAdsOptions(ALLOWED_METHODS);
}
