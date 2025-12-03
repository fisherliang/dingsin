// src/scripts/estate-deduction.js

// 114 年度（2025）適用金額
const ED_EXEMPTION = 13330000;   // 免稅額 1,333 萬
const ED_SPOUSE = 5530000;       // 配偶
const ED_DESC = 560000;          // 直系血親卑親屬（每人）
const ED_PARENT = 1380000;       // 父母（每人）
const ED_DISABLED = 6930000;     // 重度以上身心障礙特別扣除（每人）
const ED_SIB_GP = 560000;        // 受扶養兄弟姊妹／祖父母（每人）
const ED_FUNERAL = 1380000;      // 喪葬費

// 不計入遺產總額
const ED_HOUSEHOLD = 1000000;    // 日常生活必需器具及用具
const ED_TOOLS = 560000;         // 職業上工具

function edParseInt(value) {
  const n = parseInt(value, 10);
  if (isNaN(n) || n < 0) return 0;
  return n;
}

function edParseMinorYears(value) {
  if (value === "" || value === null || value === undefined) return 0;
  const n = parseFloat(value);
  if (isNaN(n) || n <= 0) return 0;
  // 不滿 1 年以 1 年計
  return Math.ceil(n);
}

function edFormatAmount(value) {
  return value.toLocaleString("zh-TW", {
    maximumFractionDigits: 0
  }) + " 元";
}

function calculateEstateDeduction() {
  const errorEl = document.getElementById("ed-error");
  const resultEl = document.getElementById("ed-result");

  errorEl.style.display = "none";
  errorEl.textContent = "";
  resultEl.style.display = "none";

  const spouseRadios = document.querySelectorAll('input[name="ed-spouse"]');
  let hasSpouse = true;
  spouseRadios.forEach(r => {
    if (r.checked && r.value === "no") {
      hasSpouse = false;
    }
  });

  const funeralRadios = document.querySelectorAll('input[name="ed-funeral"]');
  let includeFuneral = true;
  funeralRadios.forEach(r => {
    if (r.checked && r.value === "no") {
      includeFuneral = false;
    }
  });

  const descendants = edParseInt(document.getElementById("ed-descendants").value);
  const minorYears = edParseMinorYears(document.getElementById("ed-minor-years").value);
  const parents = edParseInt(document.getElementById("ed-parents").value);
  const sibgp = edParseInt(document.getElementById("ed-sibgp").value);
  const disabled = edParseInt(document.getElementById("ed-disabled").value);

  if (descendants < 0 || parents < 0 || sibgp < 0 || disabled < 0) {
    errorEl.style.display = "block";
    errorEl.textContent = "人數欄位請輸入 0 以上的數字。";
    return;
  }

  // 基本 sanity check：若全部皆 0 且無配偶、無喪葬費，其實也可計算，只是提示一下
  if (!hasSpouse && descendants === 0 && parents === 0 && sibgp === 0 && disabled === 0 && !includeFuneral) {
    errorEl.style.display = "block";
    errorEl.textContent = "目前各項扣除人數皆為 0，且無配偶與喪葬費，無可計算扣除額。";
    return;
  }

  // 個別扣除額計算
  const spouseAmount = hasSpouse ? ED_SPOUSE : 0;
  const descBasic = descendants * ED_DESC;
  const descMinorExtra = minorYears * ED_DESC; // 合計年數 × 每年 56 萬
  const descTotal = descBasic + descMinorExtra;

  const parentAmount = parents * ED_PARENT;
  const sibgpAmount = sibgp * ED_SIB_GP;
  const disabledAmount = disabled * ED_DISABLED;
  const funeralAmount = includeFuneral ? ED_FUNERAL : 0;

  const deductionTotal = spouseAmount + descTotal + parentAmount + sibgpAmount + disabledAmount + funeralAmount;
  const exemptPlus = ED_EXEMPTION + deductionTotal;

  const nonIncluded = ED_HOUSEHOLD + ED_TOOLS;

  // 輸出結果
  document.getElementById("ed-exempt").textContent = edFormatAmount(ED_EXEMPTION);
  document.getElementById("ed-deduction-total").textContent = edFormatAmount(deductionTotal);
  document.getElementById("ed-exempt-plus").textContent = edFormatAmount(exemptPlus);

  document.getElementById("ed-spouse-amount").textContent = edFormatAmount(spouseAmount);
  document.getElementById("ed-desc-amount").textContent = edFormatAmount(descTotal);
  document.getElementById("ed-parents-amount").textContent = edFormatAmount(parentAmount);
  document.getElementById("ed-sibgp-amount").textContent = edFormatAmount(sibgpAmount);
  document.getElementById("ed-disabled-amount").textContent = edFormatAmount(disabledAmount);
  document.getElementById("ed-funeral-amount").textContent = edFormatAmount(funeralAmount);

  document.getElementById("ed-nonincluded").textContent = edFormatAmount(nonIncluded);

  document.getElementById("ed-result-main").textContent =
    `依目前輸入條件，扣除額加總約 ${edFormatAmount(deductionTotal)}，免稅額與扣除額合計 ${edFormatAmount(exemptPlus)}。`;

  document.getElementById("ed-result-sub").textContent =
    `以上金額係依 114 年度公告之免稅額與扣除額估算，實際申報仍以申報年度法規與國稅局認定為準。`;

  resultEl.style.display = "block";
}

function resetEstateDeduction() {
  // reset inputs
  document.getElementById("ed-descendants").value = "";
  document.getElementById("ed-minor-years").value = "";
  document.getElementById("ed-parents").value = "";
  document.getElementById("ed-sibgp").value = "";
  document.getElementById("ed-disabled").value = "";

  // radio 重設
  const spouseRadios = document.querySelectorAll('input[name="ed-spouse"]');
  spouseRadios.forEach(r => {
    r.checked = (r.value === "yes");
  });

  const funeralRadios = document.querySelectorAll('input[name="ed-funeral"]');
  funeralRadios.forEach(r => {
    r.checked = (r.value === "yes");
  });

  document.getElementById("ed-error").style.display = "none";
  document.getElementById("ed-error").textContent = "";
  document.getElementById("ed-result").style.display = "none";
}

function toggleDeductTable() {
  const wrapper = document.getElementById("deduct-table-wrapper");
  const btn = document.querySelector(".deduct-toggle");

  const isCollapsed = wrapper.classList.contains("deduct-collapsed");

  if (isCollapsed) {
    wrapper.classList.remove("deduct-collapsed");
    wrapper.classList.add("deduct-expanded");
    btn.innerHTML = "➖ 收起扣除額標準";
  } else {
    wrapper.classList.remove("deduct-expanded");
    wrapper.classList.add("deduct-collapsed");
    btn.innerHTML = "➕ 展開扣除額標準";
  }
}
