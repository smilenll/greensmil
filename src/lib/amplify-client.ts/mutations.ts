/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createPhoto = /* GraphQL */ `mutation CreatePhoto(
  $condition: ModelPhotoConditionInput
  $input: CreatePhotoInput!
) {
  createPhoto(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreatePhotoMutationVariables,
  APITypes.CreatePhotoMutation
>;
export const createPhotoLike = /* GraphQL */ `mutation CreatePhotoLike(
  $condition: ModelPhotoLikeConditionInput
  $input: CreatePhotoLikeInput!
) {
  createPhotoLike(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreatePhotoLikeMutationVariables,
  APITypes.CreatePhotoLikeMutation
>;
export const deletePhoto = /* GraphQL */ `mutation DeletePhoto(
  $condition: ModelPhotoConditionInput
  $input: DeletePhotoInput!
) {
  deletePhoto(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeletePhotoMutationVariables,
  APITypes.DeletePhotoMutation
>;
export const deletePhotoLike = /* GraphQL */ `mutation DeletePhotoLike(
  $condition: ModelPhotoLikeConditionInput
  $input: DeletePhotoLikeInput!
) {
  deletePhotoLike(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeletePhotoLikeMutationVariables,
  APITypes.DeletePhotoLikeMutation
>;
export const updatePhoto = /* GraphQL */ `mutation UpdatePhoto(
  $condition: ModelPhotoConditionInput
  $input: UpdatePhotoInput!
) {
  updatePhoto(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdatePhotoMutationVariables,
  APITypes.UpdatePhotoMutation
>;
export const updatePhotoLike = /* GraphQL */ `mutation UpdatePhotoLike(
  $condition: ModelPhotoLikeConditionInput
  $input: UpdatePhotoLikeInput!
) {
  updatePhotoLike(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdatePhotoLikeMutationVariables,
  APITypes.UpdatePhotoLikeMutation
>;
