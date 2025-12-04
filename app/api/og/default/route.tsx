import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#111827',
          backgroundImage: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
        }}
      >
        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '80px',
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: 'white',
              marginBottom: 24,
              letterSpacing: '-0.02em',
            }}
          >
            Ultimate Property Holdings
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 36,
              color: '#D1D5DB',
              marginBottom: 48,
              maxWidth: '80%',
            }}
          >
            Premium Residential Apartments Across Maine
          </div>

          {/* Features */}
          <div
            style={{
              display: 'flex',
              gap: 48,
              marginTop: 32,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ fontSize: 48 }}>🐾</div>
              <div style={{ fontSize: 24, color: '#10B981', fontWeight: 600 }}>
                Pet Friendly
              </div>
              <div style={{ fontSize: 18, color: '#9CA3AF' }}>
                $200 one-time fee
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ fontSize: 48 }}>✓</div>
              <div style={{ fontSize: 24, color: '#10B981', fontWeight: 600 }}>
                Bad Credit OK
              </div>
              <div style={{ fontSize: 18, color: '#9CA3AF' }}>
                We work with you
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ fontSize: 48 }}>💬</div>
              <div style={{ fontSize: 24, color: '#10B981', fontWeight: 600 }}>
                Responsive Owners
              </div>
              <div style={{ fontSize: 18, color: '#9CA3AF' }}>
                Quick communication
              </div>
            </div>
          </div>
        </div>

        {/* Website URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 28,
            color: '#6B7280',
          }}
        >
          ultimatepropertyholdings.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
