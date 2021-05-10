import Head from "next/head";
import { useState } from "react";
import * as queries from "../src/graphql/queries";
import { API, graphqlOperation } from "aws-amplify";
import Link from "next/link";

function Home() {
  const [query, setQuery] = useState("");
  const [searchedCompanies, setSearchedCompanies] = useState([]);
  const [nextToken, setNextToken] = useState(null);
  const [queryingInProgress, setQueryingInProgress] = useState(false);

  const handleSearchBtnClick = (e) => {
    setSearchedCompanies([]);
    sendSearchQuery(query, null);
  };

  const sendSearchQuery = async (q, nt) => {
    if (queryingInProgress) {
      return;
    }

    console.log("sending query = ", q);
    setQueryingInProgress(true);
    const res = await API.graphql(
      graphqlOperation(queries.searchCompanys, {
        filter: { companyName: { matchPhrase: q } },
        limit: 20,
        nextToken: nt,
      })
    );
    setSearchedCompanies((searchedCompanies) => [
      ...searchedCompanies,
      ...res.data.searchCompanys.items,
    ]);
    setNextToken(res.data.searchCompanys.nextToken);
    setQueryingInProgress(false);
  };

  const loadMore = (e) => {
    e.preventDefault();
    sendSearchQuery(query, nextToken);
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  console.log("nextToken = ", nextToken);
  console.log("searchedCompanies = ", searchedCompanies);

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
                  Korean Company Search
                </p>
                <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
                  50만개 이상의 한국 회사들을 검색해보세요.
                </p>
                <div className="mt-5 mx-auto text-xl w-2/4">
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      🔍
                    </div>
                    <input
                      type="text"
                      name="searchQuery"
                      id="searchQuery"
                      value={query}
                      onChange={handleQueryChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="mt-5">
                  {queryingInProgress ? (
                    <div>Searching...</div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSearchBtnClick}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Search Companies
                    </button>
                  )}
                </div>
                <div className="mx-auto w-2/4 mt-5">
                  <div className="flow-root mt-6">
                    <ul className="-my-5 divide-y divide-gray-200">
                      {searchedCompanies.map((c, idx) => (
                        <li key={c.id} className="py-5">
                          <div className="relative focus-within:ring-2 focus-within:ring-indigo-500">
                            <h3 className="text-sm font-semibold text-gray-800">
                              <Link href={`/company/${c.id}`}>
                                <a className="hover:underline focus:outline-none">
                                  {/* Extend touch target to entire panel */}
                                  <span
                                    className="absolute inset-0"
                                    aria-hidden="true"
                                  />
                                  {c.companyName}
                                </a>
                              </Link>
                            </h3>
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                              {c.streetAddress ? c.streetAddress : c.address}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {nextToken !== null && (
                    <div className="mt-6">
                      <button
                        onClick={loadMore}
                        className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        {queryingInProgress ? "Loading..." : "Load More"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;
