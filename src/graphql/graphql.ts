/* eslint-disable */
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Bigdecimal: { input: any; output: any; }
  Boolean1: { input: any; output: any; }
  Date: { input: any; output: any; }
  Enum: { input: any; output: any; }
  Int32: { input: any; output: any; }
  Int64: { input: any; output: any; }
  String1: { input: any; output: any; }
  Timestamptz: { input: any; output: any; }
  Uuid: { input: any; output: any; }
};

export type BoolAggExp = {
  __typename?: 'BoolAggExp';
  _count: Scalars['Int64']['output'];
  _count_distinct: Scalars['Int64']['output'];
  bool_and?: Maybe<Scalars['Boolean1']['output']>;
  bool_or?: Maybe<Scalars['Boolean1']['output']>;
  every?: Maybe<Scalars['Boolean1']['output']>;
};

export type BoolBoolExp = {
  _and?: InputMaybe<Array<BoolBoolExp>>;
  _eq?: InputMaybe<Scalars['Boolean1']['input']>;
  _gt?: InputMaybe<Scalars['Boolean1']['input']>;
  _gte?: InputMaybe<Scalars['Boolean1']['input']>;
  _in?: InputMaybe<Array<Scalars['Boolean1']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Boolean1']['input']>;
  _lte?: InputMaybe<Scalars['Boolean1']['input']>;
  _neq?: InputMaybe<Scalars['Boolean1']['input']>;
  _not?: InputMaybe<BoolBoolExp>;
  _or?: InputMaybe<Array<BoolBoolExp>>;
};

export type Companies = {
  __typename?: 'Companies';
  createdAt?: Maybe<Scalars['Timestamptz']['output']>;
  id: Scalars['Uuid']['output'];
  name: Scalars['String1']['output'];
  receipts?: Maybe<Array<Receipts>>;
  receiptsAggregate: ReceiptsAggExp;
  users?: Maybe<Array<Users>>;
  usersAggregate: UsersAggExp;
};


export type CompaniesReceiptsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<ReceiptsOrderByExp>>;
  where?: InputMaybe<ReceiptsBoolExp>;
};


export type CompaniesReceiptsAggregateArgs = {
  filter_input?: InputMaybe<ReceiptsFilterInput>;
};


export type CompaniesUsersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<UsersOrderByExp>>;
  where?: InputMaybe<UsersBoolExp>;
};


export type CompaniesUsersAggregateArgs = {
  filter_input?: InputMaybe<UsersFilterInput>;
};

export type CompaniesAggExp = {
  __typename?: 'CompaniesAggExp';
  _count: Scalars['Int64']['output'];
  createdAt: TimestamptzAggExp;
  id: UuidAggExp;
  name: TextAggExp;
};

export type CompaniesBoolExp = {
  _and?: InputMaybe<Array<CompaniesBoolExp>>;
  _not?: InputMaybe<CompaniesBoolExp>;
  _or?: InputMaybe<Array<CompaniesBoolExp>>;
  createdAt?: InputMaybe<TimestamptzBoolExp>;
  id?: InputMaybe<UuidBoolExp>;
  name?: InputMaybe<TextBoolExp>;
  receipts?: InputMaybe<ReceiptsBoolExp>;
  users?: InputMaybe<UsersBoolExp>;
};

export type CompaniesFilterInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<CompaniesOrderByExp>>;
  where?: InputMaybe<CompaniesBoolExp>;
};

export type CompaniesOrderByExp = {
  createdAt?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  name?: InputMaybe<OrderBy>;
};

export type DateAggExp = {
  __typename?: 'DateAggExp';
  _count: Scalars['Int64']['output'];
  _count_distinct: Scalars['Int64']['output'];
  max?: Maybe<Scalars['Date']['output']>;
  min?: Maybe<Scalars['Date']['output']>;
};

export type DateBoolExp = {
  _and?: InputMaybe<Array<DateBoolExp>>;
  _eq?: InputMaybe<Scalars['Date']['input']>;
  _gt?: InputMaybe<Scalars['Date']['input']>;
  _gte?: InputMaybe<Scalars['Date']['input']>;
  _in?: InputMaybe<Array<Scalars['Date']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Date']['input']>;
  _lte?: InputMaybe<Scalars['Date']['input']>;
  _neq?: InputMaybe<Scalars['Date']['input']>;
  _not?: InputMaybe<DateBoolExp>;
  _or?: InputMaybe<Array<DateBoolExp>>;
};

/** Responses from the 'delete_companies_by_id' procedure */
export type DeleteCompaniesByIdResponse = {
  __typename?: 'DeleteCompaniesByIdResponse';
  /** The number of rows affected by the mutation */
  affectedRows: Scalars['Int32']['output'];
  /** Data from rows affected by the mutation */
  returning: Array<Companies>;
};

/** Responses from the 'delete_receipt_items_by_id' procedure */
export type DeleteReceiptItemsByIdResponse = {
  __typename?: 'DeleteReceiptItemsByIdResponse';
  /** The number of rows affected by the mutation */
  affectedRows: Scalars['Int32']['output'];
  /** Data from rows affected by the mutation */
  returning: Array<ReceiptItems>;
};

/** Responses from the 'delete_receipts_by_id' procedure */
export type DeleteReceiptsByIdResponse = {
  __typename?: 'DeleteReceiptsByIdResponse';
  /** The number of rows affected by the mutation */
  affectedRows: Scalars['Int32']['output'];
  /** Data from rows affected by the mutation */
  returning: Array<Receipts>;
};

/** Responses from the 'delete_users_by_email' procedure */
export type DeleteUsersByEmailResponse = {
  __typename?: 'DeleteUsersByEmailResponse';
  /** The number of rows affected by the mutation */
  affectedRows: Scalars['Int32']['output'];
  /** Data from rows affected by the mutation */
  returning: Array<Users>;
};

/** Responses from the 'delete_users_by_id' procedure */
export type DeleteUsersByIdResponse = {
  __typename?: 'DeleteUsersByIdResponse';
  /** The number of rows affected by the mutation */
  affectedRows: Scalars['Int32']['output'];
  /** Data from rows affected by the mutation */
  returning: Array<Users>;
};

export type InsertCompaniesObjectInput = {
  createdAt?: InputMaybe<Scalars['Timestamptz']['input']>;
  id?: InputMaybe<Scalars['Uuid']['input']>;
  name: Scalars['String1']['input'];
};

/** Responses from the 'insert_companies' procedure */
export type InsertCompaniesResponse = {
  __typename?: 'InsertCompaniesResponse';
  /** The number of rows affected by the mutation */
  affectedRows: Scalars['Int32']['output'];
  /** Data from rows affected by the mutation */
  returning: Array<Companies>;
};

export type InsertReceiptItemsObjectInput = {
  category?: InputMaybe<Scalars['String1']['input']>;
  createdAt?: InputMaybe<Scalars['Timestamptz']['input']>;
  description: Scalars['String1']['input'];
  id?: InputMaybe<Scalars['Uuid']['input']>;
  isPriceAnomaly?: InputMaybe<Scalars['Boolean1']['input']>;
  quantity?: InputMaybe<Scalars['Bigdecimal']['input']>;
  receiptId: Scalars['Uuid']['input'];
  totalPrice: Scalars['Bigdecimal']['input'];
  unitPrice: Scalars['Bigdecimal']['input'];
};

/** Responses from the 'insert_receipt_items' procedure */
export type InsertReceiptItemsResponse = {
  __typename?: 'InsertReceiptItemsResponse';
  /** The number of rows affected by the mutation */
  affectedRows: Scalars['Int32']['output'];
  /** Data from rows affected by the mutation */
  returning: Array<ReceiptItems>;
};

export type InsertReceiptsObjectInput = {
  companyId: Scalars['Uuid']['input'];
  createdAt?: InputMaybe<Scalars['Timestamptz']['input']>;
  id?: InputMaybe<Scalars['Uuid']['input']>;
  imageUrl?: InputMaybe<Scalars['String1']['input']>;
  receiptDate: Scalars['Date']['input'];
  status?: InputMaybe<Scalars['String1']['input']>;
  totalAmount: Scalars['Bigdecimal']['input'];
  userId: Scalars['Uuid']['input'];
  vendorName: Scalars['String1']['input'];
};

/** Responses from the 'insert_receipts' procedure */
export type InsertReceiptsResponse = {
  __typename?: 'InsertReceiptsResponse';
  /** The number of rows affected by the mutation */
  affectedRows: Scalars['Int32']['output'];
  /** Data from rows affected by the mutation */
  returning: Array<Receipts>;
};

export type InsertUsersObjectInput = {
  companyId: Scalars['Uuid']['input'];
  createdAt?: InputMaybe<Scalars['Timestamptz']['input']>;
  email: Scalars['String1']['input'];
  fullName: Scalars['String1']['input'];
  id?: InputMaybe<Scalars['Uuid']['input']>;
  role: Scalars['Enum']['input'];
};

/** Responses from the 'insert_users' procedure */
export type InsertUsersResponse = {
  __typename?: 'InsertUsersResponse';
  /** The number of rows affected by the mutation */
  affectedRows: Scalars['Int32']['output'];
  /** Data from rows affected by the mutation */
  returning: Array<Users>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Delete any row on the 'companies' collection using the 'id' key */
  deleteCompaniesById: DeleteCompaniesByIdResponse;
  /** Delete any row on the 'receipt_items' collection using the 'id' key */
  deleteReceiptItemsById: DeleteReceiptItemsByIdResponse;
  /** Delete any row on the 'receipts' collection using the 'id' key */
  deleteReceiptsById: DeleteReceiptsByIdResponse;
  /** Delete any row on the 'users' collection using the 'email' key */
  deleteUsersByEmail: DeleteUsersByEmailResponse;
  /** Delete any row on the 'users' collection using the 'id' key */
  deleteUsersById: DeleteUsersByIdResponse;
  /** Insert into the companies table */
  insertCompanies: InsertCompaniesResponse;
  /** Insert into the receipt_items table */
  insertReceiptItems: InsertReceiptItemsResponse;
  /** Insert into the receipts table */
  insertReceipts: InsertReceiptsResponse;
  /** Insert into the users table */
  insertUsers: InsertUsersResponse;
  /** Update any row on the 'companies' collection using the 'id' key */
  updateCompaniesById: UpdateCompaniesByIdResponse;
  /** Update any row on the 'receipt_items' collection using the 'id' key */
  updateReceiptItemsById: UpdateReceiptItemsByIdResponse;
  /** Update any row on the 'receipts' collection using the 'id' key */
  updateReceiptsById: UpdateReceiptsByIdResponse;
  /** Update any row on the 'users' collection using the 'email' key */
  updateUsersByEmail: UpdateUsersByEmailResponse;
  /** Update any row on the 'users' collection using the 'id' key */
  updateUsersById: UpdateUsersByIdResponse;
};


export type MutationDeleteCompaniesByIdArgs = {
  keyId: Scalars['Uuid']['input'];
  preCheck?: InputMaybe<CompaniesBoolExp>;
};


export type MutationDeleteReceiptItemsByIdArgs = {
  keyId: Scalars['Uuid']['input'];
  preCheck?: InputMaybe<ReceiptItemsBoolExp>;
};


export type MutationDeleteReceiptsByIdArgs = {
  keyId: Scalars['Uuid']['input'];
  preCheck?: InputMaybe<ReceiptsBoolExp>;
};


export type MutationDeleteUsersByEmailArgs = {
  keyEmail: Scalars['String1']['input'];
  preCheck?: InputMaybe<UsersBoolExp>;
};


export type MutationDeleteUsersByIdArgs = {
  keyId: Scalars['Uuid']['input'];
  preCheck?: InputMaybe<UsersBoolExp>;
};


export type MutationInsertCompaniesArgs = {
  objects: Array<InsertCompaniesObjectInput>;
  postCheck?: InputMaybe<CompaniesBoolExp>;
};


export type MutationInsertReceiptItemsArgs = {
  objects: Array<InsertReceiptItemsObjectInput>;
  postCheck?: InputMaybe<ReceiptItemsBoolExp>;
};


export type MutationInsertReceiptsArgs = {
  objects: Array<InsertReceiptsObjectInput>;
  postCheck?: InputMaybe<ReceiptsBoolExp>;
};


export type MutationInsertUsersArgs = {
  objects: Array<InsertUsersObjectInput>;
  postCheck?: InputMaybe<UsersBoolExp>;
};


export type MutationUpdateCompaniesByIdArgs = {
  keyId: Scalars['Uuid']['input'];
  postCheck?: InputMaybe<CompaniesBoolExp>;
  preCheck?: InputMaybe<CompaniesBoolExp>;
  updateColumns: UpdateCompaniesByIdUpdateColumnsInput;
};


export type MutationUpdateReceiptItemsByIdArgs = {
  keyId: Scalars['Uuid']['input'];
  postCheck?: InputMaybe<ReceiptItemsBoolExp>;
  preCheck?: InputMaybe<ReceiptItemsBoolExp>;
  updateColumns: UpdateReceiptItemsByIdUpdateColumnsInput;
};


export type MutationUpdateReceiptsByIdArgs = {
  keyId: Scalars['Uuid']['input'];
  postCheck?: InputMaybe<ReceiptsBoolExp>;
  preCheck?: InputMaybe<ReceiptsBoolExp>;
  updateColumns: UpdateReceiptsByIdUpdateColumnsInput;
};


export type MutationUpdateUsersByEmailArgs = {
  keyEmail: Scalars['String1']['input'];
  postCheck?: InputMaybe<UsersBoolExp>;
  preCheck?: InputMaybe<UsersBoolExp>;
  updateColumns: UpdateUsersByEmailUpdateColumnsInput;
};


export type MutationUpdateUsersByIdArgs = {
  keyId: Scalars['Uuid']['input'];
  postCheck?: InputMaybe<UsersBoolExp>;
  preCheck?: InputMaybe<UsersBoolExp>;
  updateColumns: UpdateUsersByIdUpdateColumnsInput;
};

export type NumericAggExp = {
  __typename?: 'NumericAggExp';
  _count: Scalars['Int64']['output'];
  _count_distinct: Scalars['Int64']['output'];
  avg?: Maybe<Scalars['Bigdecimal']['output']>;
  max?: Maybe<Scalars['Bigdecimal']['output']>;
  min?: Maybe<Scalars['Bigdecimal']['output']>;
  stddev?: Maybe<Scalars['Bigdecimal']['output']>;
  stddev_pop?: Maybe<Scalars['Bigdecimal']['output']>;
  stddev_samp?: Maybe<Scalars['Bigdecimal']['output']>;
  sum?: Maybe<Scalars['Bigdecimal']['output']>;
  var_pop?: Maybe<Scalars['Bigdecimal']['output']>;
  var_samp?: Maybe<Scalars['Bigdecimal']['output']>;
  variance?: Maybe<Scalars['Bigdecimal']['output']>;
};

export type NumericBoolExp = {
  _and?: InputMaybe<Array<NumericBoolExp>>;
  _eq?: InputMaybe<Scalars['Bigdecimal']['input']>;
  _gt?: InputMaybe<Scalars['Bigdecimal']['input']>;
  _gte?: InputMaybe<Scalars['Bigdecimal']['input']>;
  _in?: InputMaybe<Array<Scalars['Bigdecimal']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Bigdecimal']['input']>;
  _lte?: InputMaybe<Scalars['Bigdecimal']['input']>;
  _neq?: InputMaybe<Scalars['Bigdecimal']['input']>;
  _not?: InputMaybe<NumericBoolExp>;
  _or?: InputMaybe<Array<NumericBoolExp>>;
};

export enum OrderBy {
  /** Sorts the data in ascending order */
  Asc = 'Asc',
  /** Sorts the data in descending order */
  Desc = 'Desc'
}

export type Query = {
  __typename?: 'Query';
  companies?: Maybe<Array<Companies>>;
  companiesAggregate?: Maybe<CompaniesAggExp>;
  companiesById?: Maybe<Companies>;
  receiptItems?: Maybe<Array<ReceiptItems>>;
  receiptItemsAggregate?: Maybe<ReceiptItemsAggExp>;
  receiptItemsById?: Maybe<ReceiptItems>;
  receipts?: Maybe<Array<Receipts>>;
  receiptsAggregate?: Maybe<ReceiptsAggExp>;
  receiptsById?: Maybe<Receipts>;
  users?: Maybe<Array<Users>>;
  usersAggregate?: Maybe<UsersAggExp>;
  usersByEmail?: Maybe<Users>;
  usersById?: Maybe<Users>;
};


export type QueryCompaniesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<CompaniesOrderByExp>>;
  where?: InputMaybe<CompaniesBoolExp>;
};


export type QueryCompaniesAggregateArgs = {
  filter_input?: InputMaybe<CompaniesFilterInput>;
};


export type QueryCompaniesByIdArgs = {
  id: Scalars['Uuid']['input'];
};


export type QueryReceiptItemsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<ReceiptItemsOrderByExp>>;
  where?: InputMaybe<ReceiptItemsBoolExp>;
};


export type QueryReceiptItemsAggregateArgs = {
  filter_input?: InputMaybe<ReceiptItemsFilterInput>;
};


export type QueryReceiptItemsByIdArgs = {
  id: Scalars['Uuid']['input'];
};


export type QueryReceiptsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<ReceiptsOrderByExp>>;
  where?: InputMaybe<ReceiptsBoolExp>;
};


export type QueryReceiptsAggregateArgs = {
  filter_input?: InputMaybe<ReceiptsFilterInput>;
};


export type QueryReceiptsByIdArgs = {
  id: Scalars['Uuid']['input'];
};


export type QueryUsersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<UsersOrderByExp>>;
  where?: InputMaybe<UsersBoolExp>;
};


export type QueryUsersAggregateArgs = {
  filter_input?: InputMaybe<UsersFilterInput>;
};


export type QueryUsersByEmailArgs = {
  email: Scalars['String1']['input'];
};


export type QueryUsersByIdArgs = {
  id: Scalars['Uuid']['input'];
};

export type ReceiptItems = {
  __typename?: 'ReceiptItems';
  category?: Maybe<Scalars['String1']['output']>;
  createdAt?: Maybe<Scalars['Timestamptz']['output']>;
  description: Scalars['String1']['output'];
  id: Scalars['Uuid']['output'];
  isPriceAnomaly?: Maybe<Scalars['Boolean1']['output']>;
  quantity?: Maybe<Scalars['Bigdecimal']['output']>;
  receipt?: Maybe<Receipts>;
  receiptId: Scalars['Uuid']['output'];
  totalPrice: Scalars['Bigdecimal']['output'];
  unitPrice: Scalars['Bigdecimal']['output'];
};

export type ReceiptItemsAggExp = {
  __typename?: 'ReceiptItemsAggExp';
  _count: Scalars['Int64']['output'];
  category: TextAggExp;
  createdAt: TimestamptzAggExp;
  description: TextAggExp;
  id: UuidAggExp;
  isPriceAnomaly: BoolAggExp;
  quantity: NumericAggExp;
  receiptId: UuidAggExp;
  totalPrice: NumericAggExp;
  unitPrice: NumericAggExp;
};

export type ReceiptItemsBoolExp = {
  _and?: InputMaybe<Array<ReceiptItemsBoolExp>>;
  _not?: InputMaybe<ReceiptItemsBoolExp>;
  _or?: InputMaybe<Array<ReceiptItemsBoolExp>>;
  category?: InputMaybe<TextBoolExp>;
  createdAt?: InputMaybe<TimestamptzBoolExp>;
  description?: InputMaybe<TextBoolExp>;
  id?: InputMaybe<UuidBoolExp>;
  isPriceAnomaly?: InputMaybe<BoolBoolExp>;
  quantity?: InputMaybe<NumericBoolExp>;
  receipt?: InputMaybe<ReceiptsBoolExp>;
  receiptId?: InputMaybe<UuidBoolExp>;
  totalPrice?: InputMaybe<NumericBoolExp>;
  unitPrice?: InputMaybe<NumericBoolExp>;
};

export type ReceiptItemsFilterInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<ReceiptItemsOrderByExp>>;
  where?: InputMaybe<ReceiptItemsBoolExp>;
};

export type ReceiptItemsOrderByExp = {
  category?: InputMaybe<OrderBy>;
  createdAt?: InputMaybe<OrderBy>;
  description?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  isPriceAnomaly?: InputMaybe<OrderBy>;
  quantity?: InputMaybe<OrderBy>;
  receipt?: InputMaybe<ReceiptsOrderByExp>;
  receiptId?: InputMaybe<OrderBy>;
  totalPrice?: InputMaybe<OrderBy>;
  unitPrice?: InputMaybe<OrderBy>;
};

export type Receipts = {
  __typename?: 'Receipts';
  company?: Maybe<Companies>;
  companyId: Scalars['Uuid']['output'];
  createdAt?: Maybe<Scalars['Timestamptz']['output']>;
  id: Scalars['Uuid']['output'];
  imageUrl?: Maybe<Scalars['String1']['output']>;
  receiptDate: Scalars['Date']['output'];
  receiptItems?: Maybe<Array<ReceiptItems>>;
  receiptItemsAggregate: ReceiptItemsAggExp;
  status?: Maybe<Scalars['String1']['output']>;
  totalAmount: Scalars['Bigdecimal']['output'];
  user?: Maybe<Users>;
  userId: Scalars['Uuid']['output'];
  vendorName: Scalars['String1']['output'];
};


export type ReceiptsReceiptItemsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<ReceiptItemsOrderByExp>>;
  where?: InputMaybe<ReceiptItemsBoolExp>;
};


export type ReceiptsReceiptItemsAggregateArgs = {
  filter_input?: InputMaybe<ReceiptItemsFilterInput>;
};

export type ReceiptsAggExp = {
  __typename?: 'ReceiptsAggExp';
  _count: Scalars['Int64']['output'];
  companyId: UuidAggExp;
  createdAt: TimestamptzAggExp;
  id: UuidAggExp;
  imageUrl: TextAggExp;
  receiptDate: DateAggExp;
  status: TextAggExp;
  totalAmount: NumericAggExp;
  userId: UuidAggExp;
  vendorName: TextAggExp;
};

export type ReceiptsBoolExp = {
  _and?: InputMaybe<Array<ReceiptsBoolExp>>;
  _not?: InputMaybe<ReceiptsBoolExp>;
  _or?: InputMaybe<Array<ReceiptsBoolExp>>;
  company?: InputMaybe<CompaniesBoolExp>;
  companyId?: InputMaybe<UuidBoolExp>;
  createdAt?: InputMaybe<TimestamptzBoolExp>;
  id?: InputMaybe<UuidBoolExp>;
  imageUrl?: InputMaybe<TextBoolExp>;
  receiptDate?: InputMaybe<DateBoolExp>;
  receiptItems?: InputMaybe<ReceiptItemsBoolExp>;
  status?: InputMaybe<TextBoolExp>;
  totalAmount?: InputMaybe<NumericBoolExp>;
  user?: InputMaybe<UsersBoolExp>;
  userId?: InputMaybe<UuidBoolExp>;
  vendorName?: InputMaybe<TextBoolExp>;
};

export type ReceiptsFilterInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<ReceiptsOrderByExp>>;
  where?: InputMaybe<ReceiptsBoolExp>;
};

export type ReceiptsOrderByExp = {
  company?: InputMaybe<CompaniesOrderByExp>;
  companyId?: InputMaybe<OrderBy>;
  createdAt?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  imageUrl?: InputMaybe<OrderBy>;
  receiptDate?: InputMaybe<OrderBy>;
  status?: InputMaybe<OrderBy>;
  totalAmount?: InputMaybe<OrderBy>;
  user?: InputMaybe<UsersOrderByExp>;
  userId?: InputMaybe<OrderBy>;
  vendorName?: InputMaybe<OrderBy>;
};

export type Subscription = {
  __typename?: 'Subscription';
  companies?: Maybe<Array<Companies>>;
  companiesAggregate?: Maybe<CompaniesAggExp>;
  companiesById?: Maybe<Companies>;
  receiptItems?: Maybe<Array<ReceiptItems>>;
  receiptItemsAggregate?: Maybe<ReceiptItemsAggExp>;
  receiptItemsById?: Maybe<ReceiptItems>;
  receipts?: Maybe<Array<Receipts>>;
  receiptsAggregate?: Maybe<ReceiptsAggExp>;
  receiptsById?: Maybe<Receipts>;
  users?: Maybe<Array<Users>>;
  usersAggregate?: Maybe<UsersAggExp>;
  usersByEmail?: Maybe<Users>;
  usersById?: Maybe<Users>;
};


export type SubscriptionCompaniesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<CompaniesOrderByExp>>;
  where?: InputMaybe<CompaniesBoolExp>;
};


export type SubscriptionCompaniesAggregateArgs = {
  filter_input?: InputMaybe<CompaniesFilterInput>;
};


export type SubscriptionCompaniesByIdArgs = {
  id: Scalars['Uuid']['input'];
};


export type SubscriptionReceiptItemsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<ReceiptItemsOrderByExp>>;
  where?: InputMaybe<ReceiptItemsBoolExp>;
};


export type SubscriptionReceiptItemsAggregateArgs = {
  filter_input?: InputMaybe<ReceiptItemsFilterInput>;
};


export type SubscriptionReceiptItemsByIdArgs = {
  id: Scalars['Uuid']['input'];
};


export type SubscriptionReceiptsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<ReceiptsOrderByExp>>;
  where?: InputMaybe<ReceiptsBoolExp>;
};


export type SubscriptionReceiptsAggregateArgs = {
  filter_input?: InputMaybe<ReceiptsFilterInput>;
};


export type SubscriptionReceiptsByIdArgs = {
  id: Scalars['Uuid']['input'];
};


export type SubscriptionUsersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<UsersOrderByExp>>;
  where?: InputMaybe<UsersBoolExp>;
};


export type SubscriptionUsersAggregateArgs = {
  filter_input?: InputMaybe<UsersFilterInput>;
};


export type SubscriptionUsersByEmailArgs = {
  email: Scalars['String1']['input'];
};


export type SubscriptionUsersByIdArgs = {
  id: Scalars['Uuid']['input'];
};

export type TextAggExp = {
  __typename?: 'TextAggExp';
  _count: Scalars['Int64']['output'];
  _count_distinct: Scalars['Int64']['output'];
  max?: Maybe<Scalars['String1']['output']>;
  min?: Maybe<Scalars['String1']['output']>;
};

export type TextBoolExp = {
  _and?: InputMaybe<Array<TextBoolExp>>;
  _eq?: InputMaybe<Scalars['String1']['input']>;
  _gt?: InputMaybe<Scalars['String1']['input']>;
  _gte?: InputMaybe<Scalars['String1']['input']>;
  _ilike?: InputMaybe<Scalars['String1']['input']>;
  _in?: InputMaybe<Array<Scalars['String1']['input']>>;
  _iregex?: InputMaybe<Scalars['String1']['input']>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _like?: InputMaybe<Scalars['String1']['input']>;
  _lt?: InputMaybe<Scalars['String1']['input']>;
  _lte?: InputMaybe<Scalars['String1']['input']>;
  _neq?: InputMaybe<Scalars['String1']['input']>;
  _nilike?: InputMaybe<Scalars['String1']['input']>;
  _niregex?: InputMaybe<Scalars['String1']['input']>;
  _nlike?: InputMaybe<Scalars['String1']['input']>;
  _not?: InputMaybe<TextBoolExp>;
  _nregex?: InputMaybe<Scalars['String1']['input']>;
  _or?: InputMaybe<Array<TextBoolExp>>;
  _regex?: InputMaybe<Scalars['String1']['input']>;
  starts_with?: InputMaybe<Scalars['String1']['input']>;
  ts_match_tt?: InputMaybe<Scalars['String1']['input']>;
};

export type TimestamptzAggExp = {
  __typename?: 'TimestamptzAggExp';
  _count: Scalars['Int64']['output'];
  _count_distinct: Scalars['Int64']['output'];
  max?: Maybe<Scalars['Timestamptz']['output']>;
  min?: Maybe<Scalars['Timestamptz']['output']>;
};

export type TimestamptzBoolExp = {
  _and?: InputMaybe<Array<TimestamptzBoolExp>>;
  _eq?: InputMaybe<Scalars['Timestamptz']['input']>;
  _gt?: InputMaybe<Scalars['Timestamptz']['input']>;
  _gte?: InputMaybe<Scalars['Timestamptz']['input']>;
  _in?: InputMaybe<Array<Scalars['Timestamptz']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Timestamptz']['input']>;
  _lte?: InputMaybe<Scalars['Timestamptz']['input']>;
  _neq?: InputMaybe<Scalars['Timestamptz']['input']>;
  _not?: InputMaybe<TimestamptzBoolExp>;
  _or?: InputMaybe<Array<TimestamptzBoolExp>>;
};

/** Update the 'created_at' column in the 'companies' collection */
export type UpdateColumnCompaniesCreatedAtInput = {
  /** Set the column to this value */
  set?: InputMaybe<Scalars['Timestamptz']['input']>;
};

/** Update the 'id' column in the 'companies' collection */
export type UpdateColumnCompaniesIdInput = {
  /** Set the column to this value */
  set: Scalars['Uuid']['input'];
};

/** Update the 'name' column in the 'companies' collection */
export type UpdateColumnCompaniesNameInput = {
  /** Set the column to this value */
  set: Scalars['String1']['input'];
};

/** Update the 'category' column in the 'receipt_items' collection */
export type UpdateColumnReceiptItemsCategoryInput = {
  /** Set the column to this value */
  set?: InputMaybe<Scalars['String1']['input']>;
};

/** Update the 'created_at' column in the 'receipt_items' collection */
export type UpdateColumnReceiptItemsCreatedAtInput = {
  /** Set the column to this value */
  set?: InputMaybe<Scalars['Timestamptz']['input']>;
};

/** Update the 'description' column in the 'receipt_items' collection */
export type UpdateColumnReceiptItemsDescriptionInput = {
  /** Set the column to this value */
  set: Scalars['String1']['input'];
};

/** Update the 'id' column in the 'receipt_items' collection */
export type UpdateColumnReceiptItemsIdInput = {
  /** Set the column to this value */
  set: Scalars['Uuid']['input'];
};

/** Update the 'is_price_anomaly' column in the 'receipt_items' collection */
export type UpdateColumnReceiptItemsIsPriceAnomalyInput = {
  /** Set the column to this value */
  set?: InputMaybe<Scalars['Boolean1']['input']>;
};

/** Update the 'quantity' column in the 'receipt_items' collection */
export type UpdateColumnReceiptItemsQuantityInput = {
  /** Set the column to this value */
  set?: InputMaybe<Scalars['Bigdecimal']['input']>;
};

/** Update the 'receipt_id' column in the 'receipt_items' collection */
export type UpdateColumnReceiptItemsReceiptIdInput = {
  /** Set the column to this value */
  set: Scalars['Uuid']['input'];
};

/** Update the 'total_price' column in the 'receipt_items' collection */
export type UpdateColumnReceiptItemsTotalPriceInput = {
  /** Set the column to this value */
  set: Scalars['Bigdecimal']['input'];
};

/** Update the 'unit_price' column in the 'receipt_items' collection */
export type UpdateColumnReceiptItemsUnitPriceInput = {
  /** Set the column to this value */
  set: Scalars['Bigdecimal']['input'];
};

/** Update the 'company_id' column in the 'receipts' collection */
export type UpdateColumnReceiptsCompanyIdInput = {
  /** Set the column to this value */
  set: Scalars['Uuid']['input'];
};

/** Update the 'created_at' column in the 'receipts' collection */
export type UpdateColumnReceiptsCreatedAtInput = {
  /** Set the column to this value */
  set?: InputMaybe<Scalars['Timestamptz']['input']>;
};

/** Update the 'id' column in the 'receipts' collection */
export type UpdateColumnReceiptsIdInput = {
  /** Set the column to this value */
  set: Scalars['Uuid']['input'];
};

/** Update the 'image_url' column in the 'receipts' collection */
export type UpdateColumnReceiptsImageUrlInput = {
  /** Set the column to this value */
  set?: InputMaybe<Scalars['String1']['input']>;
};

/** Update the 'receipt_date' column in the 'receipts' collection */
export type UpdateColumnReceiptsReceiptDateInput = {
  /** Set the column to this value */
  set: Scalars['Date']['input'];
};

/** Update the 'status' column in the 'receipts' collection */
export type UpdateColumnReceiptsStatusInput = {
  /** Set the column to this value */
  set?: InputMaybe<Scalars['String1']['input']>;
};

/** Update the 'total_amount' column in the 'receipts' collection */
export type UpdateColumnReceiptsTotalAmountInput = {
  /** Set the column to this value */
  set: Scalars['Bigdecimal']['input'];
};

/** Update the 'user_id' column in the 'receipts' collection */
export type UpdateColumnReceiptsUserIdInput = {
  /** Set the column to this value */
  set: Scalars['Uuid']['input'];
};

/** Update the 'vendor_name' column in the 'receipts' collection */
export type UpdateColumnReceiptsVendorNameInput = {
  /** Set the column to this value */
  set: Scalars['String1']['input'];
};

/** Update the 'company_id' column in the 'users' collection */
export type UpdateColumnUsersCompanyIdInput = {
  /** Set the column to this value */
  set: Scalars['Uuid']['input'];
};

/** Update the 'created_at' column in the 'users' collection */
export type UpdateColumnUsersCreatedAtInput = {
  /** Set the column to this value */
  set?: InputMaybe<Scalars['Timestamptz']['input']>;
};

/** Update the 'email' column in the 'users' collection */
export type UpdateColumnUsersEmailInput = {
  /** Set the column to this value */
  set: Scalars['String1']['input'];
};

/** Update the 'full_name' column in the 'users' collection */
export type UpdateColumnUsersFullNameInput = {
  /** Set the column to this value */
  set: Scalars['String1']['input'];
};

/** Update the 'id' column in the 'users' collection */
export type UpdateColumnUsersIdInput = {
  /** Set the column to this value */
  set: Scalars['Uuid']['input'];
};

/** Update the 'role' column in the 'users' collection */
export type UpdateColumnUsersRoleInput = {
  /** Set the column to this value */
  set: Scalars['Enum']['input'];
};

/** Responses from the 'update_companies_by_id' procedure */
export type UpdateCompaniesByIdResponse = {
  __typename?: 'UpdateCompaniesByIdResponse';
  /** The number of rows affected by the mutation */
  affectedRows: Scalars['Int32']['output'];
  /** Data from rows affected by the mutation */
  returning: Array<Companies>;
};

/** Update the columns of the 'companies' collection */
export type UpdateCompaniesByIdUpdateColumnsInput = {
  /** Update the 'created_at' column in the 'companies' collection. */
  createdAt?: InputMaybe<UpdateColumnCompaniesCreatedAtInput>;
  /** Update the 'id' column in the 'companies' collection. */
  id?: InputMaybe<UpdateColumnCompaniesIdInput>;
  /** Update the 'name' column in the 'companies' collection. */
  name?: InputMaybe<UpdateColumnCompaniesNameInput>;
};

/** Responses from the 'update_receipt_items_by_id' procedure */
export type UpdateReceiptItemsByIdResponse = {
  __typename?: 'UpdateReceiptItemsByIdResponse';
  /** The number of rows affected by the mutation */
  affectedRows: Scalars['Int32']['output'];
  /** Data from rows affected by the mutation */
  returning: Array<ReceiptItems>;
};

/** Update the columns of the 'receipt_items' collection */
export type UpdateReceiptItemsByIdUpdateColumnsInput = {
  /** Update the 'category' column in the 'receipt_items' collection. */
  category?: InputMaybe<UpdateColumnReceiptItemsCategoryInput>;
  /** Update the 'created_at' column in the 'receipt_items' collection. */
  createdAt?: InputMaybe<UpdateColumnReceiptItemsCreatedAtInput>;
  /** Update the 'description' column in the 'receipt_items' collection. */
  description?: InputMaybe<UpdateColumnReceiptItemsDescriptionInput>;
  /** Update the 'id' column in the 'receipt_items' collection. */
  id?: InputMaybe<UpdateColumnReceiptItemsIdInput>;
  /** Update the 'is_price_anomaly' column in the 'receipt_items' collection. */
  isPriceAnomaly?: InputMaybe<UpdateColumnReceiptItemsIsPriceAnomalyInput>;
  /** Update the 'quantity' column in the 'receipt_items' collection. */
  quantity?: InputMaybe<UpdateColumnReceiptItemsQuantityInput>;
  /** Update the 'receipt_id' column in the 'receipt_items' collection. */
  receiptId?: InputMaybe<UpdateColumnReceiptItemsReceiptIdInput>;
  /** Update the 'total_price' column in the 'receipt_items' collection. */
  totalPrice?: InputMaybe<UpdateColumnReceiptItemsTotalPriceInput>;
  /** Update the 'unit_price' column in the 'receipt_items' collection. */
  unitPrice?: InputMaybe<UpdateColumnReceiptItemsUnitPriceInput>;
};

/** Responses from the 'update_receipts_by_id' procedure */
export type UpdateReceiptsByIdResponse = {
  __typename?: 'UpdateReceiptsByIdResponse';
  /** The number of rows affected by the mutation */
  affectedRows: Scalars['Int32']['output'];
  /** Data from rows affected by the mutation */
  returning: Array<Receipts>;
};

/** Update the columns of the 'receipts' collection */
export type UpdateReceiptsByIdUpdateColumnsInput = {
  /** Update the 'company_id' column in the 'receipts' collection. */
  companyId?: InputMaybe<UpdateColumnReceiptsCompanyIdInput>;
  /** Update the 'created_at' column in the 'receipts' collection. */
  createdAt?: InputMaybe<UpdateColumnReceiptsCreatedAtInput>;
  /** Update the 'id' column in the 'receipts' collection. */
  id?: InputMaybe<UpdateColumnReceiptsIdInput>;
  /** Update the 'image_url' column in the 'receipts' collection. */
  imageUrl?: InputMaybe<UpdateColumnReceiptsImageUrlInput>;
  /** Update the 'receipt_date' column in the 'receipts' collection. */
  receiptDate?: InputMaybe<UpdateColumnReceiptsReceiptDateInput>;
  /** Update the 'status' column in the 'receipts' collection. */
  status?: InputMaybe<UpdateColumnReceiptsStatusInput>;
  /** Update the 'total_amount' column in the 'receipts' collection. */
  totalAmount?: InputMaybe<UpdateColumnReceiptsTotalAmountInput>;
  /** Update the 'user_id' column in the 'receipts' collection. */
  userId?: InputMaybe<UpdateColumnReceiptsUserIdInput>;
  /** Update the 'vendor_name' column in the 'receipts' collection. */
  vendorName?: InputMaybe<UpdateColumnReceiptsVendorNameInput>;
};

/** Responses from the 'update_users_by_email' procedure */
export type UpdateUsersByEmailResponse = {
  __typename?: 'UpdateUsersByEmailResponse';
  /** The number of rows affected by the mutation */
  affectedRows: Scalars['Int32']['output'];
  /** Data from rows affected by the mutation */
  returning: Array<Users>;
};

/** Update the columns of the 'users' collection */
export type UpdateUsersByEmailUpdateColumnsInput = {
  /** Update the 'company_id' column in the 'users' collection. */
  companyId?: InputMaybe<UpdateColumnUsersCompanyIdInput>;
  /** Update the 'created_at' column in the 'users' collection. */
  createdAt?: InputMaybe<UpdateColumnUsersCreatedAtInput>;
  /** Update the 'email' column in the 'users' collection. */
  email?: InputMaybe<UpdateColumnUsersEmailInput>;
  /** Update the 'full_name' column in the 'users' collection. */
  fullName?: InputMaybe<UpdateColumnUsersFullNameInput>;
  /** Update the 'id' column in the 'users' collection. */
  id?: InputMaybe<UpdateColumnUsersIdInput>;
  /** Update the 'role' column in the 'users' collection. */
  role?: InputMaybe<UpdateColumnUsersRoleInput>;
};

/** Responses from the 'update_users_by_id' procedure */
export type UpdateUsersByIdResponse = {
  __typename?: 'UpdateUsersByIdResponse';
  /** The number of rows affected by the mutation */
  affectedRows: Scalars['Int32']['output'];
  /** Data from rows affected by the mutation */
  returning: Array<Users>;
};

/** Update the columns of the 'users' collection */
export type UpdateUsersByIdUpdateColumnsInput = {
  /** Update the 'company_id' column in the 'users' collection. */
  companyId?: InputMaybe<UpdateColumnUsersCompanyIdInput>;
  /** Update the 'created_at' column in the 'users' collection. */
  createdAt?: InputMaybe<UpdateColumnUsersCreatedAtInput>;
  /** Update the 'email' column in the 'users' collection. */
  email?: InputMaybe<UpdateColumnUsersEmailInput>;
  /** Update the 'full_name' column in the 'users' collection. */
  fullName?: InputMaybe<UpdateColumnUsersFullNameInput>;
  /** Update the 'id' column in the 'users' collection. */
  id?: InputMaybe<UpdateColumnUsersIdInput>;
  /** Update the 'role' column in the 'users' collection. */
  role?: InputMaybe<UpdateColumnUsersRoleInput>;
};

export type UserRoleAggExp = {
  __typename?: 'UserRoleAggExp';
  _count: Scalars['Int64']['output'];
  _count_distinct: Scalars['Int64']['output'];
  max?: Maybe<Scalars['Enum']['output']>;
  min?: Maybe<Scalars['Enum']['output']>;
};

export type UserRoleBoolExp = {
  _and?: InputMaybe<Array<UserRoleBoolExp>>;
  _eq?: InputMaybe<Scalars['Enum']['input']>;
  _gt?: InputMaybe<Scalars['Enum']['input']>;
  _gte?: InputMaybe<Scalars['Enum']['input']>;
  _in?: InputMaybe<Array<Scalars['Enum']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Enum']['input']>;
  _lte?: InputMaybe<Scalars['Enum']['input']>;
  _neq?: InputMaybe<Scalars['Enum']['input']>;
  _not?: InputMaybe<UserRoleBoolExp>;
  _or?: InputMaybe<Array<UserRoleBoolExp>>;
};

export type Users = {
  __typename?: 'Users';
  company?: Maybe<Companies>;
  companyId: Scalars['Uuid']['output'];
  createdAt?: Maybe<Scalars['Timestamptz']['output']>;
  email: Scalars['String1']['output'];
  fullName: Scalars['String1']['output'];
  id: Scalars['Uuid']['output'];
  receipts?: Maybe<Array<Receipts>>;
  receiptsAggregate: ReceiptsAggExp;
  role: Scalars['Enum']['output'];
};


export type UsersReceiptsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<ReceiptsOrderByExp>>;
  where?: InputMaybe<ReceiptsBoolExp>;
};


export type UsersReceiptsAggregateArgs = {
  filter_input?: InputMaybe<ReceiptsFilterInput>;
};

export type UsersAggExp = {
  __typename?: 'UsersAggExp';
  _count: Scalars['Int64']['output'];
  companyId: UuidAggExp;
  createdAt: TimestamptzAggExp;
  email: TextAggExp;
  fullName: TextAggExp;
  id: UuidAggExp;
  role: UserRoleAggExp;
};

export type UsersBoolExp = {
  _and?: InputMaybe<Array<UsersBoolExp>>;
  _not?: InputMaybe<UsersBoolExp>;
  _or?: InputMaybe<Array<UsersBoolExp>>;
  company?: InputMaybe<CompaniesBoolExp>;
  companyId?: InputMaybe<UuidBoolExp>;
  createdAt?: InputMaybe<TimestamptzBoolExp>;
  email?: InputMaybe<TextBoolExp>;
  fullName?: InputMaybe<TextBoolExp>;
  id?: InputMaybe<UuidBoolExp>;
  receipts?: InputMaybe<ReceiptsBoolExp>;
  role?: InputMaybe<UserRoleBoolExp>;
};

export type UsersFilterInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<UsersOrderByExp>>;
  where?: InputMaybe<UsersBoolExp>;
};

export type UsersOrderByExp = {
  company?: InputMaybe<CompaniesOrderByExp>;
  companyId?: InputMaybe<OrderBy>;
  createdAt?: InputMaybe<OrderBy>;
  email?: InputMaybe<OrderBy>;
  fullName?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  role?: InputMaybe<OrderBy>;
};

export type UuidAggExp = {
  __typename?: 'UuidAggExp';
  _count: Scalars['Int64']['output'];
  _count_distinct: Scalars['Int64']['output'];
};

export type UuidBoolExp = {
  _and?: InputMaybe<Array<UuidBoolExp>>;
  _eq?: InputMaybe<Scalars['Uuid']['input']>;
  _gt?: InputMaybe<Scalars['Uuid']['input']>;
  _gte?: InputMaybe<Scalars['Uuid']['input']>;
  _in?: InputMaybe<Array<Scalars['Uuid']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Uuid']['input']>;
  _lte?: InputMaybe<Scalars['Uuid']['input']>;
  _neq?: InputMaybe<Scalars['Uuid']['input']>;
  _not?: InputMaybe<UuidBoolExp>;
  _or?: InputMaybe<Array<UuidBoolExp>>;
};

export type ReceiptsQueryVariables = Exact<{ [key: string]: never; }>;


export type ReceiptsQuery = { __typename?: 'Query', receipts?: Array<{ __typename?: 'Receipts', id: any, vendorName: any, receiptDate: any, user?: { __typename?: 'Users', fullName: any } | null }> | null };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const ReceiptsDocument = new TypedDocumentString(`
    query Receipts {
  receipts {
    id
    vendorName
    user {
      fullName
    }
    receiptDate
  }
}
    `) as unknown as TypedDocumentString<ReceiptsQuery, ReceiptsQueryVariables>;