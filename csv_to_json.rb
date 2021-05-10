#!/usr/bin/ruby

require 'json'

input_filename = ARGV[0]
if input_filename.to_s.strip === ""
  puts "please provide input filename"
  exit(-1)
end

# 0 자료생성년월(자격마감일(사유발생일이 속하는 달의 다음달 15일)까지 신고분 반영) : 2021-03
# 1 사업장명 : 우성기전(주)
# 2 사업자등록번호 : 126811
# 3 사업장가입상태코드 1:등록2:탈퇴 : 1
# 4 우편번호 : 12816
# 5 사업장지번상세주소 : 경기도 광주시 도척면
# 6 사업장도로명상세주소 : 경기도 광주시 도척면 도척윗로
# 7 고객법정동주소코드 : 4161033025
# 8 고객행정동주소코드 : 4161033025
# 9 법정동주소광역시도코드 : 41
# 10 법정동주소광역시시군구코드 : 610
# 11 법정동주소광역시시군구읍면동코드 : 330
# 12 사업장형태구분코드 1:법인2:개인 : 1
# 13 사업장업종코드 : 292201
# 14 사업장업종코드명 : 동력식 수지 공구 제조업
# 15 적용일자 : 1988-01-01
# 16 재등록일자 : 0001-01-01
# 17 탈퇴일자 : 0001-01-01
# 18 가입자수(고지인원 수 포함) 5
# 19 당월고지금액(※ 국민연금법 시행령 제5조에 의거 기준소득월액 상한액 적용으로 실제소득과 고지금액은 상이할 수 있음 : 상한액 2019.7.~2020.6. 4860000원(2019.7.1.기준) 상한액 2020.7.~2021.6. 5030000원(2020.7.1.기준)) : 792720
# 20 신규취득자수(납부재개 포함 : ※ 전달 고지대상자와 비교하므로 실제 취득자와 상이할 수 있음(초일취득 고지 초일이 아닌경우. 미고지(다음달 취득자수에 반영)) : 0
# 21 상실가입자수(납부예외 포함 : ※ 전달 고지대상자와 비교하므로 실제 퇴사자와 상이할 수 있음(초일이 아닌 상실자는 다음달 상실자수에 반영) 국민연금법 제6조 8조 동법 시행령 제18조에 의거 60세 도달하거나 퇴직연금수급자 조기노령연금 수급권을 취득한 자는 가입대상에서 제외되며 18세미만 기초수급자는 본인희망에 의해 제외될 수 있음) : 0
File.readlines(input_filename).each do |line|
  splits = line.strip.split(",")
  n = splits.length
  yyyymm = splits[0]
  company_name = splits[1]
  registration_num = splits[2]
  registered = splits[3] === 1
  postal_code = splits[4]
  address = splits[5]
  street_address = splits[6]
  address_code = splits[7]
  company_type = splits[12]
  industry_code = splits[13]
  industry_name = splits[14]
  h = { yyyymm: yyyymm,
				companyName: company_name,
				registrationNum: registration_num,
        registered: registered,
				postalCode: postal_code,
				address: address,
        streetAddress: street_address,
        addressCode: address_code,
        companyType: company_type,
        industryCode: industry_code,
        industryName: industry_name
			}
  puts h.to_json
end
