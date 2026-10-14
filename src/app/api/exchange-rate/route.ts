import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function GET() {
  try {
    // Fetch live telegram public channel web view via curl with IPv4 enforcement & User-Agent
    const { stdout: html } = await execFileAsync('curl', [
      '-s',
      '--ipv4',
      '-A',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      '--max-time',
      '10',
      'https://t.me/s/kabul_dollar',
    ]);

    if (!html || html.length < 500) {
      return NextResponse.json(
        { success: false, error: 'عدم دریافت محتوا از کانال تلگرام' },
        { status: 502 }
      );
    }

    // Match all telegram post message text blocks
    const matches = [
      ...html.matchAll(
        /<div class="tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/g
      ),
    ];

    if (!matches || matches.length === 0) {
      return NextResponse.json(
        { success: false, error: 'پیامی در کانال یافت نشد' },
        { status: 404 }
      );
    }

    let foundRate: number | null = null;
    const foundCity: string = 'کابل';
    let foundMessage: string = '';

    // Search from newest to oldest message
    // STRICT RULE: Only extract from messages specifically designated for KABUL (کابل / ڪابل).
    // NEVER fallback to Kandahar, Ghazni, Nangarhar, Herat, Khost, or other cities.
    for (let i = matches.length - 1; i >= 0; i--) {
      const raw = matches[i][1]
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#036;/g, '$')
        .trim();

      // Normalize Arabic, Persian, Pashto kaf/ye and tatweel
      const norm = raw
        .replace(/ڪ/g, 'ک')
        .replace(/ك/g, 'ک')
        .replace(/ـ/g, '') // Remove tatweel / kashida
        .replace(/[يۍې]/g, 'ی')
        .replace(/[\u200B-\u200F\uFEFF]/g, '')
        .replace(/\s+/g, ' ');

      // Check if this post is specifically for Kabul
      const isKabul = norm.includes('کابل');

      // Exclude posts that are specifically for other provinces (unless explicitly mentioning Kabul)
      const isOtherCityOnly =
        !isKabul &&
        (norm.includes('ننگرهار') ||
          norm.includes('کندهار') ||
          norm.includes('خوست') ||
          norm.includes('هرات') ||
          norm.includes('غزنی') ||
          norm.includes('مزار'));

      if (isKabul && !isOtherCityOnly) {
        // Look specifically for Dollar to Afghani exchange rate in Kabul message
        // Patterns like: "دالر افغانی 64.86", "دالر به افغانی 64.86", "دالر ... افغانی ... 64.86"
        const specificDollarMatch = norm.match(
          /(?:دالر|ډالر)\s*(?:به)?\s*(?:افغانی|افغانۍ)[^\d]*(\d{2}\.\d{2})/
        );

        if (specificDollarMatch) {
          foundRate = parseFloat(specificDollarMatch[1]);
          foundMessage = raw;
          break;
        }

        // If "دالر" and "افغانی" are both present in this Kabul post, look for the first valid 2-digit decimal (e.g. 64.86)
        if ((norm.includes('دالر') || norm.includes('ډالر')) && (norm.includes('افغانی') || norm.includes('افغانۍ'))) {
          const numMatch = norm.match(/(\d{2}\.\d{2})/);
          if (numMatch) {
            foundRate = parseFloat(numMatch[1]);
            foundMessage = raw;
            break;
          }
        }
      }
    }

    if (!foundRate) {
      return NextResponse.json(
        {
          success: false,
          error: 'نرخ دالر کابل در پیام‌های اخیر کانال یافت نشد (پیام‌های سایر ولایات نادیده گرفته شد)',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      rate: foundRate,
      city: foundCity,
      rawMessage: foundMessage,
      channel: '@kabul_dollar',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'خطا در خواندن نرخ' },
      { status: 500 }
    );
  }
}
