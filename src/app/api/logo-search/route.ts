import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json({ success: false, results: [] });
    }

    const secretKey =
      process.env.LOGODEV_SECRET_KEY || 'sk_VK5wF9hqRBSDE7sBE68X8w';
    const pubKey =
      process.env.NEXT_PUBLIC_LOGODEV_PUBLIC_KEY || 'pk_LMJ_gZeWQ2SH1bnRDMeIwg';

    // 1. Direct domain cleanup
    let clean = query.toLowerCase().trim();
    clean = clean.replace(/^(https?:\/\/)?/, '');
    clean = clean.split('/')[0].split('?')[0].split('#')[0];
    clean = clean.replace(/^www\d*\./, '');
    clean = clean.replace(/[^a-z0-9.-]/g, '');

    // 2. Query Logo.dev Search API
    const res = await fetch(`https://api.logo.dev/search?q=${encodeURIComponent(clean || query)}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        success: true,
        query,
        detectedDomain: clean.includes('.') ? clean : (data[0]?.domain || `${clean}.com`),
        results: Array.isArray(data) ? data : [],
      });
    }

    // Fallback if search API is rate limited or fails
    return NextResponse.json({
      success: true,
      query,
      detectedDomain: clean.includes('.') ? clean : `${clean}.com`,
      results: [
        {
          name: query,
          domain: clean.includes('.') ? clean : `${clean}.com`,
          logo_url: `https://img.logo.dev/${clean.includes('.') ? clean : `${clean}.com`}?token=${pubKey}`,
        },
      ],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error searching logo' },
      { status: 500 }
    );
  }
}
