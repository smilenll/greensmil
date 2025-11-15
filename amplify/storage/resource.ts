import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'photoGallery',
  access: (allow) => ({
    'photos/*': [
      allow.authenticated.to(['read']),
      allow.guest.to(['read']), // Allow public read access
      allow.groups(['admin']).to(['read', 'write', 'delete']),
    ],
  }),
  cors: {
    allowedOrigins: ['*'], // Allow all origins for photo gallery
    allowedMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
    allowedHeaders: ['*'],
    exposedHeaders: ['ETag', 'x-amz-server-side-encryption', 'x-amz-request-id', 'x-amz-id-2'],
    maxAgeSeconds: 3000,
  },
});
