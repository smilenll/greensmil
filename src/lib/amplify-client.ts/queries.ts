/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getPhoto = /* GraphQL */ `query GetPhoto($id: ID!) {
  getPhoto(id: $id) {
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
` as GeneratedQuery<APITypes.GetPhotoQueryVariables, APITypes.GetPhotoQuery>;
export const getPhotoLike = /* GraphQL */ `query GetPhotoLike($photoId: ID!, $userId: String!) {
  getPhotoLike(photoId: $photoId, userId: $userId) {
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
` as GeneratedQuery<
  APITypes.GetPhotoLikeQueryVariables,
  APITypes.GetPhotoLikeQuery
>;
export const listPhotoLikes = /* GraphQL */ `query ListPhotoLikes(
  $filter: ModelPhotoLikeFilterInput
  $limit: Int
  $nextToken: String
  $photoId: ID
  $sortDirection: ModelSortDirection
  $userId: ModelStringKeyConditionInput
) {
  listPhotoLikes(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    photoId: $photoId
    sortDirection: $sortDirection
    userId: $userId
  ) {
    items {
      createdAt
      owner
      photoId
      updatedAt
      userId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListPhotoLikesQueryVariables,
  APITypes.ListPhotoLikesQuery
>;
export const listPhotos = /* GraphQL */ `query ListPhotos(
  $filter: ModelPhotoFilterInput
  $limit: Int
  $nextToken: String
) {
  listPhotos(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListPhotosQueryVariables,
  APITypes.ListPhotosQuery
>;
