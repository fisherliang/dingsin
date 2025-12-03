// src/scripts/life-coverage.js

function lcParse(value) {
  const n = parseFloat(value || "0");
  if (isNaN(n) || n < 0) return 0;
  return n;
}

function lcFormat(value) {
  return value.toLocaleString("zh-TW", {
    maximumFractionDigits: 0
  }) + " 元";
}

function lcRoundToTenThousand(value) {
  // 四捨五入到萬元
  const unit = 10000;
  return Math.round(value / unit) * unit;
}

function calculateLifeCoverage() {
  const annual = lcParse(document.getElementById("lc-annual").value);
  const years = lcParse(document.getElementById("lc-years").value);
  const debts = lcParse(document.getElementById("lc-debts").value);
  const education = lcParse(document.getElementById("lc-education").value);
  const assets = lcParse(document.getElementById("lc-assets").value);
  const existing = lcParse(document.getElementById("lc-existing").value);

  const errorEl = document.getElementById("lc-error");
  const resultEl = document.getElementById("lc-result");

  errorEl.style.display = "none";
  errorEl.textContent = "";
  resultEl.style.display = "none";

  if (annual <= 0 || years <= 0) {
    errorEl.style.display = "block";
    errorEl.textContent = "請至少填寫「每年家庭支出」與「保障年數」，且須大於 0。";
    return;
  }

  const livingTotal = annual * years;
  const debtEduTotal = debts + education;
  const offsetTotal = assets + existing;

  let need = livingTotal + debtEduTotal - offsetTotal;
  if (need < 0) need = 0;

  const needRounded = lcRoundToTenThousand(need);
  const additional = needRounded - existing;
  const additionalNeed = additional > 0 ? additional : 0;
  const lowRange = lcRoundToTenThousand(needRounded * 0.8);
  const highRange = lcRoundToTenThousand(needRounded * 1.2);

  // 輸出明細
  document.getElementById("lc-living-total").textContent = lcFormat(livingTotal);
  document.getElementById("lc-debt-edu-total").textContent = lcFormat(debtEduTotal);
  document.getElementById("lc-offset-total").textContent = lcFormat(offsetTotal);

  document.getElementById("lc-recommend").textContent = lcFormat(needRounded);
  document.getElementById("lc-additional").textContent = lcFormat(additionalNeed);

  if (needRounded === 0) {
    document.getElementById("lc-result-main").textContent =
      "依照目前輸入條件，壽險保額大致足夠，無明顯缺口。";
  } else {
    document.getElementById("lc-result-main").textContent =
      `建議壽險保額約 ${lcFormat(needRounded)}（概算值）`;
  }

  document.getElementById("lc-range").textContent =
    `${lcFormat(lowRange)} ～ ${lcFormat(highRange)}`;

  document.getElementById("lc-result-sub").textContent =
    `假設家人每年需要約 ${lcFormat(annual)} 的生活費，維持 ${years} 年，加上負債與教育金，再扣除可用資產與既有壽險保額後推估。`;

  resultEl.style.display = "block";
}

function resetLifeCoverage() {
  document.getElementById("lc-annual").value = "";
  document.getElementById("lc-years").value = "";
  document.getElementById("lc-debts").value = "";
  document.getElementById("lc-education").value = "";
  document.getElementById("lc-assets").value = "";
  document.getElementById("lc-existing").value = "";

  document.getElementById("lc-error").style.display = "none";
  document.getElementById("lc-error").textContent = "";
  document.getElementById("lc-result").style.display = "none";
}
