/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreatePhoto = /* GraphQL */ `subscription OnCreatePhoto($filter: ModelSubscriptionPhotoFilterInput) {
  onCreatePhoto(filter: $filter) {
    createdAt
    description
    id
    imageKey
    imageUrl
    likeCount
    likes {
      nextToken
      __typename
    }
    title
    updatedAt
    uploadedBy
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreatePhotoSubscriptionVariables,
  APITypes.OnCreatePhotoSubscription
>;
export const onCreatePhotoLike = /* GraphQL */ `subscription OnCreatePhotoLike(
  $filter: ModelSubscriptionPhotoLikeFilterInput
  $owner: String
) {
  onCreatePhotoLike(filter: $filter, owner: $owner) {
    createdAt
    owner
    photo {
      createdAt
      description
      id
      imageKey
      imageUrl
      likeCount
      title
      updatedAt
      uploadedBy
      __typename
    }
    photoId
    updatedAt
    userId
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreatePhotoLikeSubscriptionVariables,
  APITypes.OnCreatePhotoLikeSubscription
>;
export const onDeletePhoto = /* GraphQL */ `subscription OnDeletePhoto($filter: ModelSubscriptionPhotoFilterInput) {
  onDeletePhoto(filter: $filter) {
    createdAt
    description
    id
    imageKey
    imageUrl
    likeCount
    likes {
      nextToken
      __typename
    }
    title
    updatedAt
    uploadedBy
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeletePhotoSubscriptionVariables,
  APITypes.OnDeletePhotoSubscription
>;
export const onDeletePhotoLike = /* GraphQL */ `subscription OnDeletePhotoLike(
  $filter: ModelSubscriptionPhotoLikeFilterInput
  $owner: String
) {
  onDeletePhotoLike(filter: $filter, owner: $owner) {
    createdAt
    owner
    photo {
      createdAt
      description
      id
      imageKey
      imageUrl
      likeCount
      title
      updatedAt
      uploadedBy
      __typename
    }
    photoId
    updatedAt
    userId
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeletePhotoLikeSubscriptionVariables,
  APITypes.OnDeletePhotoLikeSubscription
>;
export const onUpdatePhoto = /* GraphQL */ `subscription OnUpdatePhoto($filter: ModelSubscriptionPhotoFilterInput) {
  onUpdatePhoto(filter: $filter) {
    createdAt
    description
    id
    imageKey
    imageUrl
    likeCount
    likes {
      nextToken
      __typename
    }
    title
    updatedAt
    uploadedBy
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdatePhotoSubscriptionVariables,
  APITypes.OnUpdatePhotoSubscription
>;
export const onUpdatePhotoLike = /* GraphQL */ `subscription OnUpdatePhotoLike(
  $filter: ModelSubscriptionPhotoLikeFilterInput
  $owner: String
) {
  onUpdatePhotoLike(filter: $filter, owner: $owner) {
    createdAt
    owner
    photo {
      createdAt
      description
      id
      imageKey
      imageUrl
      likeCount
      title
      updatedAt
      uploadedBy
      __typename
    }
    photoId
    updatedAt
    userId
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdatePhotoLikeSubscriptionVariables,
  APITypes.OnUpdatePhotoLikeSubscription
>;
