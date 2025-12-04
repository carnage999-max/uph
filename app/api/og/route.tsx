import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  
  const title = searchParams.get('title') || 'Ultimate Property Holdings';
  const location = searchParams.get('location') || '';
  const rent = searchParams.get('rent') || '';
  const image = searchParams.get('image') || '';

  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            backgroundColor: '#111827',
          }}
        >
          {/* Background Image */}
          {image && (
            <img
              src={image}
              alt=""
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.4,
              }}
            />
          )}
          
          {/* Gradient Overlay */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to bottom, rgba(17, 24, 39, 0.7), rgba(17, 24, 39, 0.95))',
            }}
          />

          {/* Content */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '60px',
              height: '100%',
              color: 'white',
            }}
          >
            {/* Logo/Brand */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: 28,
                fontWeight: 600,
              }}
            >
              Ultimate Property Holdings
            </div>

            {/* Property Info */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  maxWidth: '90%',
                }}
              >
                {title}
              </div>
              
              {location && (
                <div
                  style={{
                    fontSize: 32,
                    color: '#D1D5DB',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  📍 {location}
                </div>
              )}

              {rent && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 48,
                      fontWeight: 700,
                      backgroundColor: '#10B981',
                      color: 'white',
                      padding: '16px 32px',
                      borderRadius: 12,
                    }}
                  >
                    {rent}
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            <div
              style={{
                display: 'flex',
                gap: 32,
                fontSize: 20,
                color: '#D1D5DB',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                🐾 Pet Friendly
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                ✓ Bad Credit OK
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                💬 Responsive Owners
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
