# Build a Search Service (Korean Company Registration Info Directory/Search) with Next.js and AWS Amplify

본 워크샾에서는, [Amplify](https://docs.amplify.aws/), Next.js, GraphQL 을 이용하여 AWS 위에 full-stack serverless application 을 만들어보려 합니다.

### Overview

[Create Next App](https://nextjs.org/docs/api-reference/create-next-app) 을 이용하여 새로운 next.js 프로젝트를 생성합니다. 그리고 [Amplify CLI](https://github.com/aws-amplify/amplify-cli) 를 이용하여 AWS Cloud 환경을 설정하고 [Amplify JS Libraries](https://github.com/aws-amplify/amplify-js) 를 이용하여 우리가 만든 next.js 앱을 AWS Cloud 와 연결해보려 합니다.

이 앱은 우편번호 검색과 같은 매우 기본적인 검색 서비스입니다.
검색 창이 있고, 회사이름, 사업자등록번호, 주소, 우편번호와 같은 정보를 입력하면 그에 매치되는 회사들의 목록을 보여줍니다.

본 워크샾은 2~5시간 정도 걸릴것으로 예상됩니다.

### 개발 환경 Environment

시작하기전에, 아래 패키지들을 설치해주세요.

- Node.js v10.x or later
- npm v5.x or later
- git v2.14.1 or later

터미널에서 [Bash shell](<https://en.wikipedia.org/wiki/Bash_(Unix_shell)>) 상에서 Amplify CLI 를 실행해서 infra를 생성하고, Next.js application 을 로컬에서 띄우고 브라우져 상에서 테스트 하려 합니다.

### Required Background / Level

본 워크샾은 full stack serverless 개발에 대해 알고 싶은 front-end 와 back-end 개발자들을 위해 만들어졌습니다.

React 와 GraphQL 에대한 지식이 있다면 도움이 되지만, 필수는 아닙니다.

### 본 가이드에서 다루어질 토픽들:

- Web application Hosting
- GraphQL API with AWS AppSync
- Search with ElasticSearch
- Deleting the resources

## 시작하기 - Next Application 생성

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

## Amplify CLI 설치 & AWS Amplify Project 초기화

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

- Enter a name for the project: koreancompanysearch
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

## Hosting

Amplify Console 은 배포와 CI 를 위한 hosting 서비스 입니다.

우선 build 스크립트 변경을 위해 **package.json** 안의 내용중 `scripts` 부분을 다음과 같이 변경해주세요.

```diff
"scripts": {
  "dev": "next dev",
-  "build": "next build",
+  "build": "next build && next export",
  "start": "next start"
},
```

> `next export` 는 next.js app 을 static HTML 파일로 변환해줍니다. 따라서 Node 서버가 필요 없이 app 을 로딩할수 있습니다.

> Amplify hosting 에서는 2021년 4월 현재 static file 만 서빙 가능합니다. 하지만 곧 server-side rendering 을 지원할 예정입니다.

Hosting 을 추가하기 위해, 다음 명령어를 실행합니다.

```sh
$ amplify add hosting

? Select the plugin module to execute: Hosting with Amplify Console (Managed hosting with custom domains, Continuous deployment)
? Choose a type: Manual deployment
```

`amplify publish` 명령어로 hosting 으로 배포를 해봅니다.

```sh
$ amplify publish
```

배포가 완료되면, 브라우져에서 터미널에 출력된 url 로 들어가보셔서 next.js 앱이 정상적으로 로딩되는 것을 확인해주세요.

## AppSync GraphQL API 추가

GraphQL API 를 추가하기 위해선, 다음 명령어를 실행합니다.
일단 api key 를 가지고 있는 클라이언트들은 접근할수 있는 public api 로 만들겠습니다.

```sh
$ amplify add api

? Please select from one of the above mentioned services: GraphQL
? Provide API name: koreancompanysearch
? Choose the default authorization type for the API: API key
? Enter a description for the API key: public
? After how many days from now the API key should expire (1-365): 365 (or your preferred expiration)
? Do you want to configure advanced settings for the GraphQL API: No
? Do you have an annotated GraphQL schema? N
? Choose a schema template: Single object with fields
? Do you want to edit the schema now? (Y/n) Y
```

실행된 CLI 는 GraphQL schema 를 텍스트 에디터로 수정할수 있게 로딩됩니다.

**amplify/backend/api/petstagram/schema.graphql**

schema 내용을 다음과 같이 바꿔봅시다.

```graphql
type Company @model {
  id: ID!
  yyyymm: String!
  companyName: String!
  registrationNum: String!
  industryName: String
  registered: Boolean!
  postalCode: String
  address: String
  streetAddress: String
}
```

schema 내용을 바꾼후, CLI 로 돌아가 enter 를 눌러 마무리해줍니다.

## Company 데이터 추가하기

[공공데이터 포털](https://www.data.go.kr)에 있는 데이터를 이용하도록 하겠습니다.

### 데이터 다운로드

**국민연금공단\_국민연금 가입 사업장 내역**[Link](https://www.data.go.kr/data/3046071/fileData.do) 페이지로 들어가 파일을 다운로드 합니다.

다운로드후 파일명은 영문으로 변경해주세요. 파일은 `~/Downloads` 폴더에 저장되어있다고 가정하겠습니다.

```sh
$ mv ~/Downloads/국민연금공단_국민연금 가입 사업장 내역_20210420.csv ~/Downloads/KoreaNationalPensionData_20210420.csv
```

utf-8 으로 인코딩 변환이 필요합니다.

```sh
$ iconv -f cp949 -t UTF-8 ~/Downloads/KoreaNationalPensionData_20210420.csv > ~/Downloads/KoreaNationalPensionData_20210420_UTF8.csv
```

첫번째 라인은 header 이기 때문에 첫번째 라인을 빼줍니다.

```sh
$ tail -n +2 ~/Downloads/KoreaNationalPensionData_20210420_UTF.csv > ~/Downloads/data.csv
```

## json 형식으로 변환

csv 에서 json 형식으로 변환하기 위해 아래와 같은 스크립트를 작성해주세요.

**_csv_to_json.rb_**

```rb
#!/usr/bin/ruby

require 'json'

input_filename = ARGV[0]
if input_filename.strip.to_s === ""
  puts "please provide input filename"
  exit(-1)
end

File.readlines(input_filename).each do |line|
  splits = line.strip.split(",")
  n = splits.length
  yyyymm = splits[0]
  company_name = splits[1]
  registration_num = splits[2]
  registered = splits[3] == 1
  postal_code = splits[4]
  address = splits[5]
  street_address = splits[6]
  industry_name= splits[n-8]
  h = { yyyymm: yyyymm,
        companyName: company_name,
        registrationNum: registration_num,
        industryName: industry_name,
        registered: registered,
        postalCode: postal_code,
        address: address,
        streetAddress: street_address
      }
  puts h.to_json
end
```

위 스크립트를 이용하여 csv 를 json 으로 변환해봅니다.

```sh
$ ruby csv_to_json.rb ~/Downloads/data.csv > ~/Downloads/data.json
```

json 형식으로 변환이 잘 되었는지 확인해봅시다.

```sh
$ head -n 10 ~/Downloads/data.json
```
