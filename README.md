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
$ yarn add --dev tailwindcss@latest postcss@latest autoprefixer@latest @tailwindcss/forms
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

`amplify push` 명령어로 변경사항 (`add hosting`) 을 적용해봅니다.

```sh
$ amplify push
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

`amplify push` 명령어로 변경사항 (`add api`) 을 적용해봅니다.

```sh
$ amplify push
```

완료후, Amplify 웹 콘솔로 들어가면 Backend 에 API (AppSync)가 추가된것을 확인할수 있습니다.

## Korean Company 데이터 추가

[공공데이터 포털](https://www.data.go.kr)에 있는 데이터를 이용하도록 하겠습니다.

### 데이터 다운로드

**국민연금공단\_국민연금 가입 사업장 내역**(https://www.data.go.kr/data/3046071/fileData.do) 페이지로 들어가 파일을 다운로드 합니다.

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
$ tail -n +2 ~/Downloads/KoreaNationalPensionData_20210420_UTF.csv > ~/Downloads/all_data.csv
```

### 원본 데이터 관련 몇가지 Note

데이터를 확인해본 결과, 50만건 이상의 레코드가 있습니다. 동일한 회사명 혹은 동일한 사업자 등록번호들이 존재합니다. 따라서 회사명이나 사업자 등록번호를 데이터베이스의 키로 사용할수 없습니다. 회사명과 사업자등록번호를 조합하여 키로 사용하는것을 고려해볼수는 있으나, uniqueness 를 확인하지는 못했습니다.

## csv -> json 형식으로 변환

원본 데이터를 csv 에서 json 형식으로 변환하기 위해 아래와 같은 스크립트를 작성해주세요.

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
$ ruby csv_to_json.rb ~/Downloads/all_data.csv > ~/Downloads/all_data.json
```

json 형식으로 변환이 잘 되었는지 확인해봅시다.

```sh
$ head -n 10 ~/Downloads/all_data.json
```

개발/테스트를 위해 일부 데이터만 추출해봅니다. 처음 200개만 추출해보도록 하겠습니다.

```sh
$ head -n 200 ~/Downloads/all_data.json > ~/Downloads/sample_data.json
```

## DynamoDB 로 데이터 넣기

json 원본 json 데이터를 DynamoDB 로 넣도록 하겠습니다. 일단 **aws-sdk-dynamodb** gem 을 설치해주세요.

```sh
$ gem install aws-sdk-dynamodb
```

> permission error 가 나는 경우 `sudo gem install aws-sdk-dynamodb` 명령어로 설치해주세요.

dynamodb 로 데이터를 넣기 위해 다음과 같이 스크립트를 만들어 주세요.

**_bulk_insert_to_dynamodb.rb_**

넣어야 하는 레코드의 수가 많기 때문에 batch write 을 이용하여 한번요청에 여러건의 데이터를 넣어도록 하겠습니다.

> batch_write_item api 문서 (https://docs.aws.amazon.com/sdk-for-ruby/v3/api/Aws/DynamoDB/Client.html#batch_write_item-instance_method)

- `REGION` 의 값은 amplify 초기화할때 선택했던 region 으로 해주세요. (ap-northeast-2)
- `TABLE_NAME` 은 dynamoDB 의 테이블 이름입니다. Amplicy Console 로 들어가 Backend -> API -> View in AppSync -> Data Sources 에서 확인 가능합니다.

```rb
#!/usr/bin/ruby

require 'aws-sdk-dynamodb'
require 'json'
require 'date'
require 'securerandom'

REGION = 'ap-northeast-2' # amplify 초기화한 region
TABLE_NAME = 'your-dynamodb-tablename' # dynamodb 테이블이름 - AppSync console 에서 확인 가능합니다.

def create_batch_write_request(lines, table_name)
  {
    request_items: {
      "#{table_name}" => lines.map { |line| create_put_request(line) }
    }
  }
end

def fix_company_data(company)
  addr = company["address"]
  str_addr = company["streetAddress"]
  id = "#{company["registrationNum"]}##{company["companyName"]}"

	now = DateTime.now.iso8601(3)
  return company.merge("streetAddress" => str_addr.strip,
                        "address" => addr.strip,
                        "createdAt" => now,
                        "updatedAt" => now,
                        "id" => id)
end

# {"yyyymm":"2021-03","companyName":"세영세무법인","registrationNum":"215862","industryName":"기타 엔지니어링 서비스업","registered":true,"postalCode":"11757","address":"경기도 의정부시 금오동","streetAddress":"경기도 의정부시 청사로47번길","totalEmployeeCount":3,"newEmployeeCount":0,"quitEmployeeCount":0,"nationalPensionPaidTotal":505780,"nationalPensionPaidPerEmployee":168593,"registered_int":1,"avgMonthlySalary":1873255}
def create_put_request(line)
  company = JSON.parse(line)
  company = fix_company_data(company)
  {
    put_request: {
      item: company
    }
  }
end

data_file = ARGV[0]
if data_file.to_s.strip === ""
  puts "please provide input filename"
  exit(-1)
end

region = REGION
table_name = TABLE_NAME
dynamodb_client = Aws::DynamoDB::Client.new(region: region)

puts "Adding companies from file '#{data_file}' into table '#{table_name}'"

header_lines = 0
batch_size = 25

File.open(data_file) do |file|
  file.lazy.drop(header_lines).each_slice(batch_size) do |lines|
    batch_write_request = create_batch_write_request(lines, table_name)
    puts batch_write_request
    # batch_write_item api : https://docs.aws.amazon.com/sdk-for-ruby/v3/api/Aws/DynamoDB/Client.html#batch_write_item-instance_method
    dynamodb_client.batch_write_item(batch_write_request)
  end
end

puts 'Done.'
```

### 데이터 넣기

스크립트에서 사용하는 aws-sdk client 에서는 credential 이 필요합니다. 스크립트/코드 안에 credential 정보를 넣는것은 위험하니 시스템에서 credential 을 읽어오도록 합시다.

aws-sdk client 에서는 기본적으로는 `~/.aws/credentials` 파일안의 `[default]` 에서 정보를 읽어옵니다.

`~/.aws/credentials` 파일을 열어 amplify configure 과정에서 생성된 profile 의 credential 을 넣어줍시다.

```
$ vim ~/.aws/credentials
```

```
[default]]
aws_access_key_id=your-access-key-id
aws_secret_access_key=your-secret-key

[amplify-user]
aws_access_key_id=your-access-key-id
aws_secret_access_key=your-secret-key
```

이제, 작성한 스크립트를 실행해봅시다.

```sh
$ ruby bulk_insert_to_dynamodb.rb ~/Downloads/sample_data.json
```

콘솔로 들어가 데이터가 잘 들어갔는지 확인해봅시다. Amplicy Console 로 들어가 Backend -> API -> View in AppSync -> Data Sources 에서 확인 가능합니다.

## 검색 기능 추가

검색을 가능하게 하기위해 **schema.graphql** 파일을 다음과 같이 수정합니다.

```graphql
type Company @model @searchable {
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

모델 정의에 `@searchable` 을 추가해주는 것만으로 해당 데이터 모델이 검색 가능하게 됩니다.

> @searchable directive 문서 (https://docs.amplify.aws/cli/graphql-transformer/searchable)

`amplify push` 명령어로 변경사항을 적용해봅시다.

```sh
$ amplify push
```

> 이전보다 시간이 오래걸립니다. 모델에 처음으로 searchable 을 추가하고 `amplify push` 를 하면 ElasticSearch 를 셋업하게 됩니다. **Amazon ElasticSearch 의 비용이 발생하게 됩니다.** 따라서 본 데모가 끝나면 프로젝트를 삭제하는게 필요합니다.

### Backfill Elasticsearch index from DynamoDB table

DynamoDB 에 데이터를 넣은후 검색기능을 추가했기때문에 아직 Elasticsearch 에는 데이터 인덱싱이 되지 않은 상황입니다. 따라서 elasticsarch 에서 indexing 작업을 해줘야 합니다. (backfill)

> 관련문서 (https://docs.amplify.aws/cli/graphql-transformer/searchable#backfill-your-elasticsearch-index-from-your-dynamodb-table)

**ddb_to_es.py** 파일을 생성하고 다음 스크립트 (https://github.com/aws-amplify/amplify-cli/blob/master/packages/graphql-elasticsearch-transformer/scripts/ddb_to_es.py) 의 내용을 넣어주세요.

ddb_to_es.py 를 실행할 sh 스크립트를 **backfill.sh** 에 만들어봅시다.

- --rn 에는 사용중인 region 을 넣어주세요.
- --tn 에는 dynamoDB 의 테이블 이름을 넣어주세요.
- --lf 에는 Lambda function ARN. Lambda funcion 목록에서 DdbToEsFn 가 포함된 lambda 를 찾은후, ARN 을 복붙해 주세요.
- --esarn 에는 DynamoDB 콘솔에서 "DynamoDB stream details" => "Latest stream ARN" 값을 넣어주세요.

```sh
#/bin/sh

python3 ddb_to_es.py \
  --rn 'ap-northeast-2' \
  --tn 'Company-xxxxxxxx-dev' \
  --lf 'arn:aws:lambda:ap-northeast-2:youraccountid:function:DdbToEsFn-xxxxxx-dev' \
  --esarn 'arn:aws:dynamodb:ap-northeast-2:youraccountid:table/Company-xxxxxx-dev/stream/2021-05-07T05:09:45.698'
```

```sh
$ chmod +x backfill.sh
$ ./backfill.sh
```

> boto3 가 설치되어 있지 않아 에러가 난다면 설치해주세요. [문서](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html)

### 검색 API 테스트

AppSync dashboard 내 GraphQL editor 로 들어가면, API 를 테스트 할수 있습니다. AppSync dashboard 를 오픈하려면, 다음 명령어를 실행합니다.

```sh
$ amplify console api

> Choose GraphQL
```

AppSync dashboard 에서 **Queries** 를 클릭해서 GraphQL editor 를 열고, 다음 mutation 으로 새로운 글을 생성합니다.

`listCompanys` 쿼리로 companys 목록을 조회해봅니다.

```graphql
query MyQuery {
  listCompanys {
    items {
      address
      companyName
      createdAt
      id
      registered
      postalCode
      industryName
      registrationNum
      streetAddress
      yyyymm
      updatedAt
    }
  }
}
```

`searchCompanys` 를 통해 streetAddress로 검색이 잘 되는지 확인해봅니다.

```graphql
query MyQuery {
  searchCompanys(filter: { streetAddress: { match: "서울특별시" } }) {
    items {
      address
      companyName
      createdAt
      industryName
      id
      postalCode
      registered
      registrationNum
      streetAddress
      updatedAt
      yyyymm
    }
  }
}
```

`searchCompanys` 를 통해 streetAddress와 companyName 으로 검색이 잘 되는지 확인해봅니다.

```graphql
query MyQuery {
  searchCompanys(
    filter: {
      streetAddress: { match: "서울특별시" }
      companyName: { matchPhrase: "주식회사" }
    }
  ) {
    items {
      address
      companyName
      createdAt
      industryName
      id
      postalCode
      registered
      registrationNum
      streetAddress
      updatedAt
      yyyymm
    }
  }
}
```

## Configuring the Next applicaion

API 가 생성되고 준비되었으니, app 을 통해 테스트 해봅시다.

우선 해야할일은, 우리가 만들고 있는 app 에서 Amplify project 에 대해 인식하도록 설정하는 것입니다. src 폴더 안에 자동생성된 `aws-exports.js` 파일을 참조하도록 추가해봅시다.

설정을 하기위해 **pages/\_app.js** 파일을 열고, 다음 코드를 추가합니다.

```diff
  import '../styles/globals.css'
+ import Amplify from "aws-amplify";
+ import config from "../src/aws-exports";
+ Amplify.configure(config);

  function MyApp({ Component, pageProps }) {
    return <Component {...pageProps} />
  }

  export default MyApp
```

위 코드가 추가되면, app 에서 AWS service 를 이용할 준비가 됩니다.

## 검색 페이지

검색 쿼리를 입력받아 결과를 보여주는 화면을 만들어봅시다.

**pages/index.js** 를 다음과 같이 변경합니다.

```js
import Head from "next/head";
import { useState } from "react";
import * as queries from "../src/graphql/queries";
import { API, graphqlOperation } from "aws-amplify";
import { useRouter } from "next/router";

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

function SuggestedText({ company, searchText, highlighted }) {
  return (
    <li
      className={`${
        highlighted ? "text-white bg-indigo-600" : "text-gray-900"
      } cursor-default select-none relative py-2 pl-3 pr-9`}
      id="listbox-option-0"
      role="option"
    >
      <div className="flex">
        {/* Selected: "font-semibold", Not Selected: "font-normal" */}
        <span
          className={`${
            highlighted ? "font-semibold" : "font-normal"
          } truncate`}
        >
          <HighlightedTextDiv
            text={company.companyName}
            highlitedText={searchText.trim()}
          />
        </span>
        {/* Highlighted: "text-indigo-200", Not Highlighted: "text-gray-500" */}
        <span
          className={`${
            highlighted ? "text-indigo-200" : "text-gray-500"
          } ml-2 truncate`}
        >
          {company.streetAddress ? company.streetAddress : company.address}
        </span>
      </div>
    </li>
  );
}

function Home() {
  const [query, setQuery] = useState("");
  const [searchedCompanies, setSearchedCompanies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const router = useRouter();

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
    router.push(`/company/${company.id}`);
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 38 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (
      e.keyCode === 40 &&
      currentIndex < searchedCompanies.length - 1
    ) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  console.log("currentIndex = ", currentIndex);

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
                      onKeyDown={handleKeyDown}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                {searchedCompanies.length > 0 && (
                  <div className="mx-auto w-2/4">
                    <ul
                      className="mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                      tabIndex={currentIndex}
                      role="listbox"
                      aria-labelledby="listbox-label"
                      aria-activedescendant="listbox-option-3"
                    >
                      {searchedCompanies.map((c, idx) => (
                        <div
                          key={`${c.companyName}#${c.streetAddress}`}
                          onClick={() => handleSuggestedCompanyClick(c)}
                          onMouseOver={() => setCurrentIndex(idx)}
                        >
                          <SuggestedText
                            company={c}
                            searchText={query}
                            highlighted={idx === currentIndex}
                          />
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
```

## 상세 페이지

회사 상세 정보를 보여주는 페이지를 다음과 같이 만들어줍시다.

**pages/company/[id].js** 를 다음과 같이 생성합니다.

```javascript
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
```
