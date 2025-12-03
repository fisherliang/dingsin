// src/scripts/insurance-age.js

function iaFormatYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function iaDiffYMD(from, to) {
  // from <= to
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    // 借一個月
    const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
    days += prevMonth.getDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return { years, months, days };
}

function calculateInsuranceAge() {
  const birthInput = document.getElementById("ia-birthdate");
  const evalInput = document.getElementById("ia-eval-date");
  const errorEl = document.getElementById("ia-error");
  const resultEl = document.getElementById("ia-result");

  errorEl.style.display = "none";
  errorEl.textContent = "";
  resultEl.style.display = "none";

  if (!birthInput.value) {
    errorEl.style.display = "block";
    errorEl.textContent = "請先輸入出生日期。";
    return;
  }

  let birthDate = new Date(birthInput.value);
  if (isNaN(birthDate.getTime())) {
    errorEl.style.display = "block";
    errorEl.textContent = "出生日期格式不正確。";
    return;
  }

  let evalDate;
  if (evalInput.value) {
    evalDate = new Date(evalInput.value);
  } else {
    // 沒填評價日就用今天
    const today = new Date();
    evalDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    evalInput.value = iaFormatYMD(evalDate);
  }

  if (isNaN(evalDate.getTime())) {
    errorEl.style.display = "block";
    errorEl.textContent = "評估日期格式不正確。";
    return;
  }

  if (evalDate < birthDate) {
    errorEl.style.display = "block";
    errorEl.textContent = "評估日不得早於出生日期。";
    return;
  }

  // 足歲年齡
  let chronoAge = evalDate.getFullYear() - birthDate.getFullYear();
  const hasBirthdayPassed =
    evalDate.getMonth() > birthDate.getMonth() ||
    (evalDate.getMonth() === birthDate.getMonth() &&
      evalDate.getDate() >= birthDate.getDate());
  if (!hasBirthdayPassed) {
    chronoAge -= 1;
  }
  if (chronoAge < 0) chronoAge = 0;

  // 上次生日
  let lastBirthday = new Date(
    evalDate.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );
  if (lastBirthday > evalDate) {
    lastBirthday.setFullYear(lastBirthday.getFullYear() - 1);
  }

  // 下次生日
  let nextBirthday = new Date(
    lastBirthday.getFullYear() + 1,
    lastBirthday.getMonth(),
    lastBirthday.getDate()
  );

  const sinceLast = iaDiffYMD(lastBirthday, evalDate);
  const toNext = iaDiffYMD(evalDate, nextBirthday);

  // 距離下次生日是否小於 6 個月？
  let monthsToNext = (toNext.years * 12) + toNext.months;
  // 只要「未滿 6 個月」就視為小於 6 個月
  const isNearNext = monthsToNext < 6 || (monthsToNext === 6 && toNext.days === 0 ? false : monthsToNext < 6);

  let insuranceAge = chronoAge;
  if (isNearNext) {
    insuranceAge += 1;
  }

  // 輸出
  document.getElementById("ia-result-main").textContent =
    `試算保險年齡為 ${insuranceAge} 歲`;

  document.getElementById("ia-result-sub").textContent =
    `評估日 ${iaFormatYMD(evalDate)}，實際足歲約 ${chronoAge} 歲。`;

  document.getElementById("ia-chron-age").textContent =
    `${chronoAge} 歲`;

  document.getElementById("ia-since-last-birthday").textContent =
    `${sinceLast.years} 年 ${sinceLast.months} 個月 ${sinceLast.days} 天`;

  document.getElementById("ia-to-next-birthday").textContent =
    `${toNext.years} 年 ${toNext.months} 個月 ${toNext.days} 天`;

  resultEl.style.display = "block";
}

function resetInsuranceAge() {
  document.getElementById("ia-birthdate").value = "";
  document.getElementById("ia-eval-date").value = "";
  document.getElementById("ia-error").style.display = "none";
  document.getElementById("ia-error").textContent = "";
  document.getElementById("ia-result").style.display = "none";
}

// 預設把評價日填今天（UX 小補強）
document.addEventListener("DOMContentLoaded", () => {
  const evalInput = document.getElementById("ia-eval-date");
  if (!evalInput) return;
  const today = new Date();
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  evalInput.value = iaFormatYMD(d);
});
