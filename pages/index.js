import Head from "next/head";
import { useState } from "react";
import * as queries from "../src/graphql/queries";
import { API, graphqlOperation } from "aws-amplify";

function HighlightedTextDiv({ text, highlitedText }) {
  const startIdx = text.indexOf(highlitedText);
  const endIdx = startIdx + highlitedText.length - 1;

  return (
    <div>
      {text.split("").map((c, idx) => (
        <span
          key={idx}
          className={startIdx <= idx && idx <= endIdx ? `text-red-500` : ``}
        >
          {c}
        </span>
      ))}
    </div>
  );
}

function SuggestedText({ company, searchText }) {
  return (
    <li
      className="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9"
      id="listbox-option-0"
      role="option"
    >
      <div className="flex">
        {/* Selected: "font-semibold", Not Selected: "font-normal" */}
        <span className="font-normal truncate">
          <HighlightedTextDiv
            text={company.companyName}
            highlitedText={searchText.trim()}
          />
        </span>
        {/* Highlighted: "text-indigo-200", Not Highlighted: "text-gray-500" */}
        <span className="text-gray-500 ml-2 truncate">
          {company.streetAddress ? company.streetAddress : company.address}
        </span>
      </div>
    </li>
  );
}

function Home() {
  const [query, setQuery] = useState("");
  const [searchedCompanies, setSearchedCompanies] = useState([]);

  const handleSearchBtnClick = (e) => {
    sendSearchQuery();
  };

  const sendSearchQuery = async (q) => {
    console.log("sending query = ", q);
    const res = await API.graphql(
      graphqlOperation(queries.searchCompanys, {
        filter: { companyName: { matchPhrase: q } },
      })
    );

    setSearchedCompanies(res.data.searchCompanys.items);
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    sendSearchQuery(e.target.value);
  };

  const handleSuggestedCompanyClick = (company) => {
    console.log("clicked = ", company);
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
                {searchedCompanies.length > 0 && (
                  <div className="mx-auto w-2/4">
                    <ul
                      className="mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                      tabIndex={-1}
                      role="listbox"
                      aria-labelledby="listbox-label"
                      aria-activedescendant="listbox-option-3"
                    >
                      {searchedCompanies.map((c) => (
                        <div
                          key={`${c.companyName}#${c.streetAddress}`}
                          onClick={() => handleSuggestedCompanyClick(c)}
                        >
                          <SuggestedText company={c} searchText={query} />
                        </div>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={handleSearchBtnClick}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Search Companies
                  </button>
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
