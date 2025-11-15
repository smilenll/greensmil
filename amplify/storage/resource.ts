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
});
