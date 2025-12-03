// src/scripts/tools/compound.js

function formatNumber(value) {
  return value.toLocaleString("zh-TW", {
    maximumFractionDigits: 0
  });
}

function calculateFV(yearRatePercent, years, initial, monthly, freqPerYear) {
  const r = yearRatePercent / 100;         // 年化報酬率（小數）
  const m = freqPerYear;                   // 每年計息次數
  const months = Math.round(years * 12);   // 總月數

  if (months <= 0) {
    return {
      finalAmount: initial,
      totalContribution: initial,
      interest: 0
    };
  }

  // 名目期利率
  const rp = r / m;
  // 等效月利率： (1 + rp)^(m/12) - 1
  const rm = (r === 0)
    ? 0
    : Math.pow(1 + rp, m / 12) - 1;

  let fvPrincipal, fvContribution;

  if (rm === 0) {
    fvPrincipal = initial;
    fvContribution = monthly * months;
  } else {
    fvPrincipal = initial * Math.pow(1 + rm, months);
    fvContribution = monthly * (Math.pow(1 + rm, months) - 1) / rm;
  }

  const finalAmount = fvPrincipal + fvContribution;
  const totalContribution = initial + monthly * months;
  const interest = finalAmount - totalContribution;

  return {
    finalAmount,
    totalContribution,
    interest
  };
}

let savingsChart = null;

function updateChart(years, rate, variance, initial, monthly, freq) {
  const canvas = document.getElementById("savingsChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const yearsInt = Math.floor(years);
  const labels = [];
  const baseData = [];
  const aboveData = [];
  const belowData = [];

  for (let i = 0; i <= yearsInt; i++) {
    labels.push(`${i}`); // 年
    const base = calculateFV(rate, i, initial, monthly, freq);
    baseData.push(Math.round(base.finalAmount));

    if (!isNaN(variance) && variance > 0) {
      const rAbove = rate + variance;
      const rBelow = rate - variance;

      if (rAbove > -99) {
        const above = calculateFV(rAbove, i, initial, monthly, freq);
        aboveData.push(Math.round(above.finalAmount));
      } else {
        aboveData.push(null);
      }

      if (rBelow > -99) {
        const below = calculateFV(rBelow, i, initial, monthly, freq);
        belowData.push(Math.round(below.finalAmount));
      } else {
        belowData.push(null);
      }
    }
  }

  const datasets = [];

  if (!isNaN(variance) && variance > 0) {
    datasets.push({
      label: `高預估 (${(rate + variance).toFixed(2)}%)`,
      data: aboveData,
      borderColor: "#0b1d4a",
      backgroundColor: "#0b1d4a",
      tension: 0.2,
      pointRadius: 3,
      pointHoverRadius: 4
    });
  }

  datasets.push({
    label: `基準報酬 (${rate.toFixed(2)}%)`,
    data: baseData,
    borderColor: "#d9480f",
    backgroundColor: "#d9480f",
    tension: 0.2,
    pointRadius: 3,
    pointHoverRadius: 4
  });

  if (!isNaN(variance) && variance > 0) {
    datasets.push({
      label: `低預估 (${(rate - variance).toFixed(2)}%)`,
      data: belowData,
      borderColor: "#198f8f",
      backgroundColor: "#198f8f",
      tension: 0.2,
      pointRadius: 3,
      pointHoverRadius: 4
    });
  }

  if (savingsChart) {
    savingsChart.destroy();
  }

  savingsChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom"
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.parsed.y || 0;
              return `${context.dataset.label}: ${formatNumber(value)} 元`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "年份"
          }
        },
        y: {
          title: {
            display: true,
            text: "累積金額（元）"
          },
          ticks: {
            callback: function (value) {
              return formatNumber(value);
            }
          }
        }
      }
    }
  });
}

function calculateCompound() {
  const initial = parseFloat(document.getElementById("initial").value || "0");
  const monthly = parseFloat(document.getElementById("monthly").value || "0");
  const years = parseFloat(document.getElementById("years").value || "0");
  const rate = parseFloat(document.getElementById("rate").value || "0");
  const variance = parseFloat(document.getElementById("variance").value || "0");
  const freq = parseInt(document.getElementById("frequency").value, 10);

  const errorEl = document.getElementById("error-msg");
  const resultEl = document.getElementById("result");
  const rangeWrapper = document.getElementById("range-wrapper");
  const rangeTbody = document.getElementById("range-tbody");

  errorEl.style.display = "none";
  errorEl.textContent = "";
  rangeWrapper.style.display = "none";
  rangeTbody.innerHTML = "";

  // 基本檢查
  if (isNaN(initial) || isNaN(monthly) || isNaN(years) || isNaN(rate)) {
    errorEl.style.display = "block";
    errorEl.textContent = "請確認所有必填欄位都有輸入數字。";
    resultEl.style.display = "none";
    return;
  }

  if (years <= 0) {
    errorEl.style.display = "block";
    errorEl.textContent = "累積期間請至少大於 0 年。";
    resultEl.style.display = "none";
    return;
  }

  if (rate < -99) {
    errorEl.style.display = "block";
    errorEl.textContent = "年化報酬率不建議小於 -99%。";
    resultEl.style.display = "none";
    return;
  }

  // 基準情境
  const base = calculateFV(rate, years, initial, monthly, freq);

  document.getElementById("result-main").textContent =
    `約可累積至 ${formatNumber(Math.round(base.finalAmount))} 元`;
  document.getElementById("result-sub").textContent =
    `假設年化報酬率 ${rate.toFixed(2)}%，期間 ${years} 年，每月投入 ${formatNumber(Math.round(monthly))} 元。`;

  document.getElementById("result-final").textContent =
    `${formatNumber(Math.round(base.finalAmount))} 元`;
  document.getElementById("result-total").textContent =
    `${formatNumber(Math.round(base.totalContribution))} 元`;
  document.getElementById("result-interest").textContent =
    `${formatNumber(Math.round(base.interest))} 元`;

  // 區間情境（有輸入波動範圍才顯示）
  if (!isNaN(variance) && variance > 0) {
    const scenarios = [
      { label: `年化 ${(rate + variance).toFixed(2)}%（高預估）`, r: rate + variance },
      { label: `年化 ${rate.toFixed(2)}%（基準值）`, r: rate },
      { label: `年化 ${(rate - variance).toFixed(2)}%（低預估）`, r: rate - variance }
    ].filter(s => s.r > -99);

    scenarios.forEach(s => {
      const r = s.r;
      const data = calculateFV(r, years, initial, monthly, freq);
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${s.label}</td>
        <td>${formatNumber(Math.round(data.finalAmount))} 元</td>
        <td>${formatNumber(Math.round(data.totalContribution))} 元</td>
        <td>${formatNumber(Math.round(data.interest))} 元</td>
      `;

      rangeTbody.appendChild(tr);
    });

    if (scenarios.length > 0) {
      rangeWrapper.style.display = "block";
    }
  }

  resultEl.style.display = "block";

  // 更新圖表
  updateChart(years, rate, variance, initial, monthly, freq);
}

function resetCompound() {
  document.getElementById("initial").value = "";
  document.getElementById("monthly").value = "";
  document.getElementById("years").value = "";
  document.getElementById("rate").value = "";
  document.getElementById("variance").value = "";
  document.getElementById("frequency").value = "12";

  document.getElementById("error-msg").style.display = "none";
  document.getElementById("error-msg").textContent = "";
  document.getElementById("result").style.display = "none";

  if (savingsChart) {
    savingsChart.destroy();
    savingsChart = null;
  }
}
