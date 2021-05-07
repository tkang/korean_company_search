import Head from "next/head";

function Home() {
  return (
    <div>
      <Head>
        <title>Korean Company Search</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔍🏢🏬🔍</text></svg>"
        />
      </Head>

      <div className="container mx-auto">
        <main className="flex-1 flex-col justify-center items-center">
          <h1 className="text-6xl">Welcome to Korean Company Search</h1>

          <p className="text-2xl">
            Let's get started with Korean Company Search
          </p>

          <div>Hello World</div>
        </main>
      </div>

      <footer className="flex items-center justify-center border-t-1 h-8">
        Footer Here
      </footer>
    </div>
  );
}

export default Home;
