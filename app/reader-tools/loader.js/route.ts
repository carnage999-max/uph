import { proxyCustomAdsRequest } from '@/lib/customAdsProxy';
import type { NextRequest } from 'next/server';

const HEADER_NAMES = ['origin', 'referer', 'user-agent'];

export async function GET(request: NextRequest){
  return proxyCustomAdsRequest({
    request,
    pathname: '/widget.js',
    method: 'GET',
    headerNames: HEADER_NAMES,
  });
}

export async function HEAD(request: NextRequest){
  return proxyCustomAdsRequest({
    request,
    pathname: '/widget.js',
    method: 'HEAD',
    headerNames: HEADER_NAMES,
  });
}
