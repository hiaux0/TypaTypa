// AaĂăÂâEeÊêIiOoÔôƠơUuƯưYyÁáẮắẤấÉéẾếÍíÓóỐốỚớÚúỨứÝýÀàẰằẦầÈèỀềÌìÒòỒồỜờÙùỪừỲỳẢảẲẳẨẩẺẻỂểỈỉỎỏỔổỞởỦủỬửỶỷÃãẴẵẪẫẼẽỄễĨĩÕõỖỗỠỡŨũỮữỸỹẠạẶặẬậẸẹỆệỊịỌọỘộỢợỤụỰựỴỵ

/**
AaĂăÂâEeÊêIiOoÔôƠơUuƯưYy     unmarked        không dấu
ÁáẮắẤấÉéẾếÍíÓóỐốỚớÚúỨứÝý     acute accent    sắc
ÀàẰằẦầÈèỀềÌìÒòỒồỜờÙùỪừỲỳ     grave accent    huyền
ẢảẲẳẨẩẺẻỂểỈỉỎỏỔổỞởỦủỬửỶỷ     hook above      hỏi
ÃãẴẵẪẫẼẽỄễĨĩÕõỖỗỠỡŨũỮữỸỹ     tilde           ngã
ẠạẶặẬậẸẹỆệỊịỌọỘộỢợỤụỰựỴỵ     dot below       nặng
*/

function replaceWithTelex(input: string): string {
  if (input === "aa") return "â";
  return input;
}

function assert(input, expected) {
  const result = input === expected;
  return result;
}

console.log(assert(replaceWithTelex("aa"), "â"));
console.log("hi");
