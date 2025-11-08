import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import outputs from '../../../../amplify_outputs.json';

const s3Client = new S3Client({
  region: outputs.storage?.aws_region || 'us-east-2',
  ...(process.env.COGNITO_ACCESS_KEY_ID ? {
    credentials: {
      accessKeyId: process.env.COGNITO_ACCESS_KEY_ID,
      secretAccessKey: process.env.COGNITO_SECRET_ACCESS_KEY || '',
    },
  } : {}),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageKey = searchParams.get('key');

  if (!imageKey) {
    return new NextResponse('Missing image key', { status: 400 });
  }

  const bucketName = outputs.storage?.bucket_name;
  if (!bucketName) {
    return new NextResponse('Storage not configured', { status: 500 });
  }

  try {
    // Generate signed URL
    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: imageKey,
      }),
      { expiresIn: 3600 }
    );

    // Fetch the image from S3
    const imageResponse = await fetch(signedUrl);

    if (!imageResponse.ok) {
      return new NextResponse('Failed to fetch image', { status: imageResponse.status });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // Return the image with caching headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
