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
