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
      aiReports: a.hasMany('PhotoAIReport', 'photoId'),
      comments: a.hasMany('Comment', 'photoId'),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']), // Only authenticated users can read
      allow.group('admin').to(['create', 'update', 'delete']),
    ]),

  PhotoAIReport: a
    .model({
      photoId: a.id().required(),
      photo: a.belongsTo('Photo', 'photoId'),
      // Composition
      compositionScore: a.float().required(),
      compositionRationale: a.string().required(),
      // Lighting and Exposure
      lightingScore: a.float().required(),
      lightingRationale: a.string().required(),
      // Subject and Storytelling
      subjectScore: a.float().required(),
      subjectRationale: a.string().required(),
      // Technical Quality
      technicalScore: a.float().required(),
      technicalRationale: a.string().required(),
      // Creativity and Originality
      creativityScore: a.float().required(),
      creativityRationale: a.string().required(),
      // Overall
      overallScore: a.float().required(),
      analyzedAt: a.datetime().required(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.group('admin').to(['create', 'delete']),
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

  Comment: a
    .model({
      photoId: a.id().required(),
      photo: a.belongsTo('Photo', 'photoId'),
      userId: a.string().required(), // Cognito user ID
      username: a.string().required(), // Username for display
      content: a.string().required(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read', 'create']), // Authenticated users can read and create
      allow.owner(), // Users can update/delete their own comments
      allow.group('admin').to(['delete']), // Admins can delete any comment
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
