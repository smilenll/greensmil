import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Photo: a
    .model({
      title: a.string().required(),
      description: a.string(),
      imageKey: a.string().required(), // S3 key for the image
      imageUrl: a.string(), // Public URL for the image
      uploadedBy: a.string().required(), // User ID who uploaded
      likes: a.hasMany('PhotoLike', 'photoId'),
      likeCount: a.integer().default(0),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.guest().to(['read']), // Allow public read access
      allow.authenticated().to(['read']),
      allow.group('admin').to(['create', 'update', 'delete']),
    ]),

  PhotoLike: a
    .model({
      photoId: a.id().required(),
      photo: a.belongsTo('Photo', 'photoId'),
      userId: a.string().required(), // Cognito user ID
      createdAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ])
    .identifier(['photoId', 'userId']), // Composite key to prevent duplicate likes
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
