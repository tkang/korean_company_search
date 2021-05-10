/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createCompany = /* GraphQL */ `
  mutation CreateCompany(
    $input: CreateCompanyInput!
    $condition: ModelCompanyConditionInput
  ) {
    createCompany(input: $input, condition: $condition) {
      id
      yyyymm
      companyName
      registrationNum
      registered
      postalCode
      address
      streetAddress
      companyType
      industryCode
      industryName
      createdAt
      updatedAt
    }
  }
`;
export const updateCompany = /* GraphQL */ `
  mutation UpdateCompany(
    $input: UpdateCompanyInput!
    $condition: ModelCompanyConditionInput
  ) {
    updateCompany(input: $input, condition: $condition) {
      id
      yyyymm
      companyName
      registrationNum
      registered
      postalCode
      address
      streetAddress
      companyType
      industryCode
      industryName
      createdAt
      updatedAt
    }
  }
`;
export const deleteCompany = /* GraphQL */ `
  mutation DeleteCompany(
    $input: DeleteCompanyInput!
    $condition: ModelCompanyConditionInput
  ) {
    deleteCompany(input: $input, condition: $condition) {
      id
      yyyymm
      companyName
      registrationNum
      registered
      postalCode
      address
      streetAddress
      companyType
      industryCode
      industryName
      createdAt
      updatedAt
    }
  }
`;
