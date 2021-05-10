/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getCompany = /* GraphQL */ `
  query GetCompany($id: ID!) {
    getCompany(id: $id) {
      id
      yyyymm
      companyName
      registrationNum
      industryName
      registered
      postalCode
      address
      streetAddress
      createdAt
      updatedAt
    }
  }
`;
export const listCompanys = /* GraphQL */ `
  query ListCompanys(
    $filter: ModelCompanyFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCompanys(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        yyyymm
        companyName
        registrationNum
        industryName
        registered
        postalCode
        address
        streetAddress
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
