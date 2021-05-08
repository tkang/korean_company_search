import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import * as queries from "../../src/graphql/queries";
import { API } from "aws-amplify";

function Company({ company }) {
  const {
    companyName,
    address,
    streetAddress,
    industryName,
    registrationNum,
    postalCode,
    createdAt,
    updatedAt,
    yyyymm,
    registered,
  } = company;
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {companyName}
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {streetAddress ? streetAddress : address}
        </p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">업종</dt>
            <dd className="mt-1 text-sm text-gray-900">{industryName} </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">
              사업자등록번호
            </dt>
            <dd className="mt-1 text-sm text-gray-900">{registrationNum} </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">최종 업데이트</dt>
            <dd className="mt-1 text-sm text-gray-900">{yyyymm}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">등록유효여부</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {registered ? "Y" : "N"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
function CompanyPage() {
  const router = useRouter();
  const { id } = router.query;
  const [company, setCompany] = useState();

  useEffect(() => {
    if (id) {
      console.log("fetching with id = ", id);
      fetchCompany();
    }
  }, [id]);

  const fetchCompany = async () => {
    const data = await API.graphql({
      query: queries.getCompany,
      variables: { id: id },
    });
    setCompany(data.data.getCompany);
  };

  return (
    <div>
      <Head>
        <title>Korean Company Search</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔍</text></svg>"
        />
      </Head>

      <div className="container mx-auto">
        <main>
          <div className="bg-white">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
              <div className="text-center">
                <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                  {!company && "Loading..."}
                  {company && company.companyName}
                </p>
              </div>
            </div>
            {company && (
              <div className="mt-1">
                <Company company={company} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default CompanyPage;
