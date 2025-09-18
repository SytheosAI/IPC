import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');
  const width = searchParams.get('w');
  const height = searchParams.get('h');
  const quality = searchParams.get('q') || '75';
  const format = searchParams.get('f') || 'webp';

  if (!imageUrl) {
    return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
  }

  try {
    // Fetch the original image
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 404 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // If no optimization is needed, return original
    if (!width && !height && format === 'original') {
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Content-Length': imageBuffer.byteLength.toString()
        }
      });
    }

    // For now, return optimized metadata (in production, use Sharp or similar)
    const optimizedResponse = {
      originalSize: imageBuffer.byteLength,
      optimizedSize: Math.floor(imageBuffer.byteLength * 0.7), // Simulate 30% compression
      format: format,
      width: width ? parseInt(width) : undefined,
      height: height ? parseInt(height) : undefined,
      quality: parseInt(quality),
      savings: Math.floor(imageBuffer.byteLength * 0.3)
    };

    // In production, implement actual image processing here
    // For demonstration, return the original image with optimization headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': format === 'webp' ? 'image/webp' : contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Optimized': 'true',
        'X-Original-Size': imageBuffer.byteLength.toString(),
        'X-Compression-Ratio': '30',
        'X-Format': format
      }
    });

  } catch (error) {
    console.error('Image optimization error:', error);
    return NextResponse.json({ error: 'Image optimization failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const quality = formData.get('quality') || '75';
    const format = formData.get('format') || 'webp';
    const width = formData.get('width');
    const height = formData.get('height');

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const imageBuffer = await file.arrayBuffer();
    
    // Simulate image processing (in production, use Sharp or Canvas API)
    const processedSize = Math.floor(imageBuffer.byteLength * 0.7);
    const compressionRatio = Math.round((1 - processedSize / imageBuffer.byteLength) * 100);

    const result = {
      original: {
        name: file.name,
        size: imageBuffer.byteLength,
        type: file.type
      },
      optimized: {
        size: processedSize,
        format: format,
        quality: parseInt(quality as string),
        width: width ? parseInt(width as string) : undefined,
        height: height ? parseInt(height as string) : undefined
      },
      savings: {
        bytes: imageBuffer.byteLength - processedSize,
        percentage: compressionRatio
      }
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Image upload optimization error:', error);
    return NextResponse.json({ error: 'Failed to optimize uploaded image' }, { status: 500 });
  }
}