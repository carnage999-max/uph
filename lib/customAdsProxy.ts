import { NextResponse, type NextRequest } from 'next/server';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-encoding',
  'content-length',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

const PROXY_TIMEOUT_MS = 15000;

function getAdsServiceBaseUrl(){
  const rawUrl = process.env.CUSTOM_ADS_SERVICE_URL?.trim();

  if (!rawUrl) {
    throw new Error('CUSTOM_ADS_SERVICE_URL is not configured.');
  }

  const url = new URL(rawUrl);
  url.pathname = url.pathname.replace(/\/$/, '');
  url.search = '';
  url.hash = '';

  return url.toString().replace(/\/$/, '');
}

function buildUpstreamUrl(pathname: string, search = ''){
  const upstreamUrl = new URL(`${getAdsServiceBaseUrl()}${pathname}`);
  upstreamUrl.search = search;
  return upstreamUrl;
}

function buildForwardedHeaders(request: NextRequest, names: string[]){
  const headers = new Headers();

  for (const name of names) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  return headers;
}

function buildResponseHeaders(upstreamHeaders: Headers){
  const headers = new Headers(upstreamHeaders);

  for (const header of Array.from(headers.keys())) {
    if (HOP_BY_HOP_HEADERS.has(header.toLowerCase())) {
      headers.delete(header);
    }
  }

  return headers;
}

export function customAdsOptions(methods: string){
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: methods,
      'Access-Control-Allow-Methods': methods,
      'Access-Control-Allow-Headers': 'content-type',
    },
  });
}

export async function proxyCustomAdsRequest({
  request,
  pathname,
  method,
  search,
  headerNames,
  body,
}: {
  request: NextRequest;
  pathname: string;
  method: string;
  search?: string;
  headerNames: string[];
  body?: BodyInit;
}){
  let upstreamUrl: URL;

  try {
    upstreamUrl = buildUpstreamUrl(pathname, search);
  } catch (error) {
    console.error('[customAdsProxy] Configuration error:', error);
    return NextResponse.json({ message: 'CUSTOM_ADS_SERVICE_URL is not configured.' }, { status: 500 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers: buildForwardedHeaders(request, headerNames),
      body,
      cache: 'no-store',
      signal: controller.signal,
    });

    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: buildResponseHeaders(upstreamResponse.headers),
    });
  } catch (error) {
    console.error('[customAdsProxy] Upstream request failed:', error);
    return NextResponse.json({ message: 'Ads service unavailable.' }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
