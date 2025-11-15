/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type Photo = {
  __typename: "Photo",
  createdAt?: string | null,
  description?: string | null,
  id: string,
  imageKey: string,
  imageUrl?: string | null,
  likeCount?: number | null,
  likes?: ModelPhotoLikeConnection | null,
  title: string,
  updatedAt?: string | null,
  uploadedBy: string,
};

export type ModelPhotoLikeConnection = {
  __typename: "ModelPhotoLikeConnection",
  items:  Array<PhotoLike | null >,
  nextToken?: string | null,
};

export type PhotoLike = {
  __typename: "PhotoLike",
  createdAt?: string | null,
  owner?: string | null,
  photo?: Photo | null,
  photoId: string,
  updatedAt: string,
  userId: string,
};

export type ModelPhotoLikeFilterInput = {
  and?: Array< ModelPhotoLikeFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelPhotoLikeFilterInput | null,
  or?: Array< ModelPhotoLikeFilterInput | null > | null,
  owner?: ModelStringInput | null,
  photoId?: ModelIDInput | null,
  updatedAt?: ModelStringInput | null,
  userId?: ModelStringInput | null,
};

export type ModelStringInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  _null = "_null",
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
}


export type ModelSizeInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelIDInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelStringKeyConditionInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
};

export type ModelPhotoFilterInput = {
  and?: Array< ModelPhotoFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  description?: ModelStringInput | null,
  id?: ModelIDInput | null,
  imageKey?: ModelStringInput | null,
  imageUrl?: ModelStringInput | null,
  likeCount?: ModelIntInput | null,
  not?: ModelPhotoFilterInput | null,
  or?: Array< ModelPhotoFilterInput | null > | null,
  title?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  uploadedBy?: ModelStringInput | null,
};

export type ModelIntInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelPhotoConnection = {
  __typename: "ModelPhotoConnection",
  items:  Array<Photo | null >,
  nextToken?: string | null,
};

export type ModelPhotoConditionInput = {
  and?: Array< ModelPhotoConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  description?: ModelStringInput | null,
  imageKey?: ModelStringInput | null,
  imageUrl?: ModelStringInput | null,
  likeCount?: ModelIntInput | null,
  not?: ModelPhotoConditionInput | null,
  or?: Array< ModelPhotoConditionInput | null > | null,
  title?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  uploadedBy?: ModelStringInput | null,
};

export type CreatePhotoInput = {
  createdAt?: string | null,
  description?: string | null,
  id?: string | null,
  imageKey: string,
  imageUrl?: string | null,
  likeCount?: number | null,
  title: string,
  updatedAt?: string | null,
  uploadedBy: string,
};

export type ModelPhotoLikeConditionInput = {
  and?: Array< ModelPhotoLikeConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  not?: ModelPhotoLikeConditionInput | null,
  or?: Array< ModelPhotoLikeConditionInput | null > | null,
  owner?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreatePhotoLikeInput = {
  createdAt?: string | null,
  photoId: string,
  userId: string,
};

export type DeletePhotoInput = {
  id: string,
};

export type DeletePhotoLikeInput = {
  photoId: string,
  userId: string,
};

export type UpdatePhotoInput = {
  createdAt?: string | null,
  description?: string | null,
  id: string,
  imageKey?: string | null,
  imageUrl?: string | null,
  likeCount?: number | null,
  title?: string | null,
  updatedAt?: string | null,
  uploadedBy?: string | null,
};

export type UpdatePhotoLikeInput = {
  createdAt?: string | null,
  photoId: string,
  userId: string,
};

export type ModelSubscriptionPhotoFilterInput = {
  and?: Array< ModelSubscriptionPhotoFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  description?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  imageKey?: ModelSubscriptionStringInput | null,
  imageUrl?: ModelSubscriptionStringInput | null,
  likeCount?: ModelSubscriptionIntInput | null,
  or?: Array< ModelSubscriptionPhotoFilterInput | null > | null,
  title?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  uploadedBy?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionStringInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionIDInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionIntInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  in?: Array< number | null > | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionPhotoLikeFilterInput = {
  and?: Array< ModelSubscriptionPhotoLikeFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionPhotoLikeFilterInput | null > | null,
  owner?: ModelStringInput | null,
  photoId?: ModelSubscriptionIDInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  userId?: ModelSubscriptionStringInput | null,
};

export type GetPhotoQueryVariables = {
  id: string,
};

export type GetPhotoQuery = {
  getPhoto?:  {
    __typename: "Photo",
    createdAt?: string | null,
    description?: string | null,
    id: string,
    imageKey: string,
    imageUrl?: string | null,
    likeCount?: number | null,
    likes?:  {
      __typename: "ModelPhotoLikeConnection",
      nextToken?: string | null,
    } | null,
    title: string,
    updatedAt?: string | null,
    uploadedBy: string,
  } | null,
};

export type GetPhotoLikeQueryVariables = {
  photoId: string,
  userId: string,
};

export type GetPhotoLikeQuery = {
  getPhotoLike?:  {
    __typename: "PhotoLike",
    createdAt?: string | null,
    owner?: string | null,
    photo?:  {
      __typename: "Photo",
      createdAt?: string | null,
      description?: string | null,
      id: string,
      imageKey: string,
      imageUrl?: string | null,
      likeCount?: number | null,
      title: string,
      updatedAt?: string | null,
      uploadedBy: string,
    } | null,
    photoId: string,
    updatedAt: string,
    userId: string,
  } | null,
};

export type ListPhotoLikesQueryVariables = {
  filter?: ModelPhotoLikeFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  photoId?: string | null,
  sortDirection?: ModelSortDirection | null,
  userId?: ModelStringKeyConditionInput | null,
};

export type ListPhotoLikesQuery = {
  listPhotoLikes?:  {
    __typename: "ModelPhotoLikeConnection",
    items:  Array< {
      __typename: "PhotoLike",
      createdAt?: string | null,
      owner?: string | null,
      photoId: string,
      updatedAt: string,
      userId: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListPhotosQueryVariables = {
  filter?: ModelPhotoFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListPhotosQuery = {
  listPhotos?:  {
    __typename: "ModelPhotoConnection",
    items:  Array< {
      __typename: "Photo",
      createdAt?: string | null,
      description?: string | null,
      id: string,
      imageKey: string,
      imageUrl?: string | null,
      likeCount?: number | null,
      title: string,
      updatedAt?: string | null,
      uploadedBy: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type CreatePhotoMutationVariables = {
  condition?: ModelPhotoConditionInput | null,
  input: CreatePhotoInput,
};

export type CreatePhotoMutation = {
  createPhoto?:  {
    __typename: "Photo",
    createdAt?: string | null,
    description?: string | null,
    id: string,
    imageKey: string,
    imageUrl?: string | null,
    likeCount?: number | null,
    likes?:  {
      __typename: "ModelPhotoLikeConnection",
      nextToken?: string | null,
    } | null,
    title: string,
    updatedAt?: string | null,
    uploadedBy: string,
  } | null,
};

export type CreatePhotoLikeMutationVariables = {
  condition?: ModelPhotoLikeConditionInput | null,
  input: CreatePhotoLikeInput,
};

export type CreatePhotoLikeMutation = {
  createPhotoLike?:  {
    __typename: "PhotoLike",
    createdAt?: string | null,
    owner?: string | null,
    photo?:  {
      __typename: "Photo",
      createdAt?: string | null,
      description?: string | null,
      id: string,
      imageKey: string,
      imageUrl?: string | null,
      likeCount?: number | null,
      title: string,
      updatedAt?: string | null,
      uploadedBy: string,
    } | null,
    photoId: string,
    updatedAt: string,
    userId: string,
  } | null,
};

export type DeletePhotoMutationVariables = {
  condition?: ModelPhotoConditionInput | null,
  input: DeletePhotoInput,
};

export type DeletePhotoMutation = {
  deletePhoto?:  {
    __typename: "Photo",
    createdAt?: string | null,
    description?: string | null,
    id: string,
    imageKey: string,
    imageUrl?: string | null,
    likeCount?: number | null,
    likes?:  {
      __typename: "ModelPhotoLikeConnection",
      nextToken?: string | null,
    } | null,
    title: string,
    updatedAt?: string | null,
    uploadedBy: string,
  } | null,
};

export type DeletePhotoLikeMutationVariables = {
  condition?: ModelPhotoLikeConditionInput | null,
  input: DeletePhotoLikeInput,
};

export type DeletePhotoLikeMutation = {
  deletePhotoLike?:  {
    __typename: "PhotoLike",
    createdAt?: string | null,
    owner?: string | null,
    photo?:  {
      __typename: "Photo",
      createdAt?: string | null,
      description?: string | null,
      id: string,
      imageKey: string,
      imageUrl?: string | null,
      likeCount?: number | null,
      title: string,
      updatedAt?: string | null,
      uploadedBy: string,
    } | null,
    photoId: string,
    updatedAt: string,
    userId: string,
  } | null,
};

export type UpdatePhotoMutationVariables = {
  condition?: ModelPhotoConditionInput | null,
  input: UpdatePhotoInput,
};

export type UpdatePhotoMutation = {
  updatePhoto?:  {
    __typename: "Photo",
    createdAt?: string | null,
    description?: string | null,
    id: string,
    imageKey: string,
    imageUrl?: string | null,
    likeCount?: number | null,
    likes?:  {
      __typename: "ModelPhotoLikeConnection",
      nextToken?: string | null,
    } | null,
    title: string,
    updatedAt?: string | null,
    uploadedBy: string,
  } | null,
};

export type UpdatePhotoLikeMutationVariables = {
  condition?: ModelPhotoLikeConditionInput | null,
  input: UpdatePhotoLikeInput,
};

export type UpdatePhotoLikeMutation = {
  updatePhotoLike?:  {
    __typename: "PhotoLike",
    createdAt?: string | null,
    owner?: string | null,
    photo?:  {
      __typename: "Photo",
      createdAt?: string | null,
      description?: string | null,
      id: string,
      imageKey: string,
      imageUrl?: string | null,
      likeCount?: number | null,
      title: string,
      updatedAt?: string | null,
      uploadedBy: string,
    } | null,
    photoId: string,
    updatedAt: string,
    userId: string,
  } | null,
};

export type OnCreatePhotoSubscriptionVariables = {
  filter?: ModelSubscriptionPhotoFilterInput | null,
};

export type OnCreatePhotoSubscription = {
  onCreatePhoto?:  {
    __typename: "Photo",
    createdAt?: string | null,
    description?: string | null,
    id: string,
    imageKey: string,
    imageUrl?: string | null,
    likeCount?: number | null,
    likes?:  {
      __typename: "ModelPhotoLikeConnection",
      nextToken?: string | null,
    } | null,
    title: string,
    updatedAt?: string | null,
    uploadedBy: string,
  } | null,
};

export type OnCreatePhotoLikeSubscriptionVariables = {
  filter?: ModelSubscriptionPhotoLikeFilterInput | null,
  owner?: string | null,
};

export type OnCreatePhotoLikeSubscription = {
  onCreatePhotoLike?:  {
    __typename: "PhotoLike",
    createdAt?: string | null,
    owner?: string | null,
    photo?:  {
      __typename: "Photo",
      createdAt?: string | null,
      description?: string | null,
      id: string,
      imageKey: string,
      imageUrl?: string | null,
      likeCount?: number | null,
      title: string,
      updatedAt?: string | null,
      uploadedBy: string,
    } | null,
    photoId: string,
    updatedAt: string,
    userId: string,
  } | null,
};

export type OnDeletePhotoSubscriptionVariables = {
  filter?: ModelSubscriptionPhotoFilterInput | null,
};

export type OnDeletePhotoSubscription = {
  onDeletePhoto?:  {
    __typename: "Photo",
    createdAt?: string | null,
    description?: string | null,
    id: string,
    imageKey: string,
    imageUrl?: string | null,
    likeCount?: number | null,
    likes?:  {
      __typename: "ModelPhotoLikeConnection",
      nextToken?: string | null,
    } | null,
    title: string,
    updatedAt?: string | null,
    uploadedBy: string,
  } | null,
};

export type OnDeletePhotoLikeSubscriptionVariables = {
  filter?: ModelSubscriptionPhotoLikeFilterInput | null,
  owner?: string | null,
};

export type OnDeletePhotoLikeSubscription = {
  onDeletePhotoLike?:  {
    __typename: "PhotoLike",
    createdAt?: string | null,
    owner?: string | null,
    photo?:  {
      __typename: "Photo",
      createdAt?: string | null,
      description?: string | null,
      id: string,
      imageKey: string,
      imageUrl?: string | null,
      likeCount?: number | null,
      title: string,
      updatedAt?: string | null,
      uploadedBy: string,
    } | null,
    photoId: string,
    updatedAt: string,
    userId: string,
  } | null,
};

export type OnUpdatePhotoSubscriptionVariables = {
  filter?: ModelSubscriptionPhotoFilterInput | null,
};

export type OnUpdatePhotoSubscription = {
  onUpdatePhoto?:  {
    __typename: "Photo",
    createdAt?: string | null,
    description?: string | null,
    id: string,
    imageKey: string,
    imageUrl?: string | null,
    likeCount?: number | null,
    likes?:  {
      __typename: "ModelPhotoLikeConnection",
      nextToken?: string | null,
    } | null,
    title: string,
    updatedAt?: string | null,
    uploadedBy: string,
  } | null,
};

export type OnUpdatePhotoLikeSubscriptionVariables = {
  filter?: ModelSubscriptionPhotoLikeFilterInput | null,
  owner?: string | null,
};

export type OnUpdatePhotoLikeSubscription = {
  onUpdatePhotoLike?:  {
    __typename: "PhotoLike",
    createdAt?: string | null,
    owner?: string | null,
    photo?:  {
      __typename: "Photo",
      createdAt?: string | null,
      description?: string | null,
      id: string,
      imageKey: string,
      imageUrl?: string | null,
      likeCount?: number | null,
      title: string,
      updatedAt?: string | null,
      uploadedBy: string,
    } | null,
    photoId: string,
    updatedAt: string,
    userId: string,
  } | null,
};
