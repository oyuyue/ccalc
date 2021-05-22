const numMap = ((m) => {
  m[(m[1] = "壹")] = 1;
  m[(m[2] = "贰")] = 2;
  m[(m[3] = "叁")] = 3;
  m[(m[4] = "肆")] = 4;
  m[(m[5] = "伍")] = 5;
  m[(m[6] = "陆")] = 6;
  m[(m[7] = "柒")] = 7;
  m[(m[8] = "捌")] = 8;
  m[(m[9] = "玖")] = 9;
  m[(m[10] = "零")] = 0;
  m["拾"] = 10;
  m["佰"] = 100;
  m["仟"] = 1000;
  m["万"] = 10000;
  m["亿"] = 100000000;
  return m;
})({});

const unitMap = {
  拾: 1,
  佰: 2,
  仟: 3,
  万: 4,
  亿: 5
};

function isUnit(ch) {
  return "拾佰仟万亿".includes(ch);
}

export function chineseToArabic(str) {
  if (!isNaN(Number(str))) return Number(str)
  let value = str.replace(/^零*/, "");
  const ch1 = value[0];
  if (!ch1) return 0;
  if ("佰仟万亿".includes(ch1)) return numMap[ch1];
  if (ch1 === "拾") return 10 + (numMap[value[1]] || 0);

  const getUnitNum = (ch) => {
    let ret = 1;
    while (ch) {
      if (isUnit(ch)) {
        ret *= numMap[ch];
      } else {
        return ret;
      }
      ch = value[++pos];
    }
    return ret;
  };

  let nums = [numMap[ch1]];
  let pos = 1;
  let ch = value[pos];
  while (ch) {
    if (isUnit(ch)) {
      nums.push(nums.pop() * getUnitNum(ch));
      ch = value[pos];
      continue;
    }
    nums.push(numMap[ch]);
    ch = value[++pos];
  }

  let ret = "";
  let hasUnit = false;
  let hasZero = false;
  nums.forEach((n) => {
    if (hasUnit && n === 0) {
      hasZero = true;
      return;
    }
    if (hasUnit) {
      ret = parseInt(ret, 10);
      if (hasZero || n >= 10) {
        ret += n;
      } else {
        let ret1 = String(ret);
        let ret2 = ret1.replace(/0(?=0*$)/, n);
        if (ret1 === ret2) {
          ret = ret1 + n;
        } else {
          ret = ret2;
        }
      }
    } else {
      ret += n;
    }
    if (n >= 10) hasUnit = true;
  });
  return parseInt(ret, 10);
}

export function arabicToChinese(num) {
  if (num === 0) return '零';
  if (isNaN(num)) return '不是数字'
  if (!isFinite(num)) return '无限'
  num = Math.round(num);
  if (isNaN(num) || !num) return "不是数字";
  let isNeg = false;
  if (num < 0) {
    isNeg = true;
    num *= -1;
  }

  const atc = (str) => {
    let addZero = false;
    if (str.startsWith("0")) {
      addZero = true;
      str = str.replace(/^0+/, "");
    }
    const l = str.length;
    if (!l) return "";
    let ret = addZero ? "零" : "";
    let i = 0;
    let unit = "";
    if (l > 8) {
      i = l - 8;
      unit = "亿";
    } else if (l > 4) {
      i = l - 4;
      unit = "万";
    } else if (l > 3) {
      i = l - 3;
      unit = "仟";
    } else if (l > 2) {
      i = l - 2;
      unit = "佰";
    } else if (l > 1) {
      i = l - 1;
      unit = "拾";
    } else {
      return ret + numMap[str];
    }
    return ret + atc(str.slice(0, i)) + unit + atc(str.slice(i));
  };

  let ret = atc(String(num));
  if ((ret[0] === "壹") & (ret[1] === "拾")) ret = ret.slice(1);
  const l = ret.length;

  if (
    isUnit(ret[l - 1]) &&
    isUnit(ret[l - 3]) &&
    unitMap[ret[l - 3]] - unitMap[ret[l - 1]] === 1
  ) {
    ret = ret.slice(0, -1);
  }

  return (isNeg ? "负" : "") + ret;
}
