# Build a Search Service (Korean Company Registration Info Directory/Search) with Next.js and AWS Amplify

본 워크샾에서는, [Amplify](https://docs.amplify.aws/), Next.js, GraphQL 을 이용하여 AWS 위에 full-stack serverless application 을 만들어보려 합니다.

### Overview

[Create Next App](https://nextjs.org/docs/api-reference/create-next-app) 을 이용하여 새로운 next.js 프로젝트를 생성합니다. 그리고 [Amplify CLI](https://github.com/aws-amplify/amplify-cli) 를 이용하여 AWS Cloud 환경을 설정하고 [Amplify JS Libraries](https://github.com/aws-amplify/amplify-js) 를 이용하여 우리가 만든 next.js 앱을 AWS Cloud 와 연결해보려 합니다.

이 앱은 우편번호 검색과 같은 매우 기본적인 검색 서비스입니다.
검색 창이 있고, 회사이름, 사업자등록번호, 주소, 우편번호와 같은 정보를 입력하면 그에 매치되는 회사들의 목록을 보여줍니다.

본 워크샾은 2~5시간 정도 걸릴것으로 예상됩니다.

### Environment

시작하기전에, 아래 패키지들을 설치해주세요.

- Node.js v10.x or later
- npm v5.x or later
- git v2.14.1 or later

터미널에서 [Bash shell](<https://en.wikipedia.org/wiki/Bash_(Unix_shell)>) 상에서 Amplify CLI 를 실행해서 infra를 생성하고, Next.js application 을 로컬에서 띄우고 브라우져 상에서 테스트 하려 합니다.

### Required Background / Level

본 워크샾은 full stack serverless 개발에 대해 알고 싶은 front-end 와 back-end 개발자들을 위해 만들어졌습니다.

React 와 GraphQL 에대한 지식이 있다면 도움이 되지만, 필수는 아닙니다.

### Topics we'll be covering:

- Web application Hosting
- GraphQL API with AWS AppSync
- Search with ElasticSearch
- Deleting the resources

## Getting Started - Creating a Next Application

[Create Next App](https://nextjs.org/docs/api-reference/create-next-app) 을 이용하여 새로운 프로젝트를 생성해봅시다.

```sh
$ npx create-next-app korean-company-search
```

생성된 디렉토리로 이동해서, aws-amplify 연관 패키지들을 설치해봅시다.

```sh
$ cd korean-company-search
$ yarn add aws-amplify @aws-amplify/ui-react
```

### Styling with TailwindCSS

본 앱에서는 TailwindCSS 를 이용하여 스타일링을 해보려 합니다.

Tailwind CSS 관련 패키지를 설치합시다. devDependencies 에만 들어가도록 설치합니다.

```sh
$ yarn add --dev tailwindcss@npm:@tailwindcss/postcss7-compat @tailwindcss/postcss7-compat postcss@^7 autoprefixer@^9
```

Tailwind 관련 설정 파일들 (`tailwind.config.js` `postcss.config.js`) 생성을 위해 다음 명령어를 실행합니다.

```sh
$ npx tailwindcss init -p
```

`tailwind.config.js` 의 내용을 다음과 같이 변경합니다. (production builds 에서 사용되지 않는 스타일링을 tree-shake 하기 위해서입니다.)

```diff
// tailwind.config.js
module.exports = {
-  purge: [],
+  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
```

Tailwind 의 base, component, utilties 스타일이 사용되도록 next.js 에서 생성된 `./styles/globals.css` 파일을 다음과 같이 변경합니다.

```
/* ./styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

> TailwindCSS 설치에 대한 자세한 내용은, 다음 링크를 확인하세요. [here](https://tailwindcss.com/docs/guides/nextjs)

기본으로 생성된 **pages/index.js** 를 변경합니다.

```js
/* pages/index.js */
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
```

문제없이 로딩이 되는지, `yarn dev` 명령어로 로컬에서 서버를 띄우고, 브라우져에서 확인해봅니다.

```sh
$ yarn dev
```

## git repostory 초기화

본 프로젝트를 위한 git repository를 하나 만들어주세요. (https://github.com/new)
repository 생성을 하였으면, 로컬에서 git 을 초기화 하고, 생성된 repository 의 url 을 추가해주세요.

```sh
$ git init
$ git remote add origin git@github.com:username/project-name.git
$ git add .
$ git commit -m 'initial commit'
$ git push origin main
```

## Installing the Amplify CLI & Initializing a new AWS Amplify Project

### Amplify CLI 설치

Amplify CLI 를 설치해봅시다.

```sh
$ npm install -g @aws-amplify/cli
```

다음은 CLI 에서 AWS credential 을 사용하도록 설정해봅시다.

> 이 과정에 대한 자세한 설명을 보고 싶으면, 비디오를 확인하세요. [here](https://www.youtube.com/watch?v=fWbM5DLh25U)

```sh
$ amplify configure

- Specify the AWS Region: ap-northeast-2
- Specify the username of the new IAM user: amplify-cli-user
> In the AWS Console, click Next: Permissions, Next: Tags, Next: Review, & Create User to create the new IAM user. Then return to the command line & press Enter.
- Enter the access key of the newly created user:
? accessKeyId: (<YOUR_ACCESS_KEY_ID>)
? secretAccessKey: (<YOUR_SECRET_ACCESS_KEY>)
- Profile Name: amplify-cli-user
```

### Amplify Project 초기화

amplify 프로젝트를 초기화 해봅시다.

```sh
$ amplify init

- Enter a name for the project: petstagram
- Enter a name for the environment: dev
- Choose your default editor: Visual Studio Code (or your default editor)
- Please choose the type of app that youre building: javascript
- What javascript framework are you using: react
- Source Directory Path: src
- Distribution Directory Path: out
- Build Command: npm run-script build
- Start Command: npm run-script start
- Do you want to use an AWS profile? Y
- Please choose the profile you want to use: amplify-cli-user
```

> **Distribution Directory Path 는 꼭 `out` 으로 변경해주세요.** (next.js 에서 build 후 export 를 하면 out 디렉토리로 결과물이 들어갑니다.)

Amplify CLI 로 새로운 프로젝트를 초기화가 되면, **amplify** 폴더와 **src** 폴더아래 `aws-exports.js` 파일을 확인할수 있습니다. 이 파일이 amplify 프로젝트의 설정값들을 저장하고 있습니다.

amplify 프로젝트의 상태를 보고 싶다면 `amplify status` 명령어로 확인하실수 있습니다.

```sh
$ amplify status
```

amplify 프로젝트 상태를 Amplify console 로 확인하고 싶다면, `amplify console` 명령어로 확인할수 있습니다.

```sh
$ amplify console
```
