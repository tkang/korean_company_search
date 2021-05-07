import Head from "next/head";

function Home() {
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
                  회사이름, 주소, 사업자등록번호, 우편번호로
                  <br />
                  한국에 등록된 회사들을 검색해보세요.
                </p>
                <div className="mt-5 mx-auto text-xl w-2/4">
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      🔍
                    </div>
                    <input
                      type="text"
                      name="email"
                      id="email"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="mt-5">
                  <button
                    type="button"
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
