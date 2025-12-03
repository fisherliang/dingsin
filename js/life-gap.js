// 壽險保障缺口計算
    document.getElementById('calcGapBtn').addEventListener('click', function() {
      const familyMonthlyExpense = getNumberValue('familyMonthlyExpense');
      const supportYears = getNumberValue('supportYears');
      const debts = getNumberValue('debts');
      const educationFund = getNumberValue('educationFund');
      const otherNeeds = getNumberValue('otherNeeds');
      const currentLifeCoverage = getNumberValue('currentLifeCoverage');
      const liquidAssets = getNumberValue('liquidAssets');

      const resultDiv = document.getElementById('gapResult');

      if (familyMonthlyExpense <= 0 || supportYears <= 0) {
        resultDiv.innerHTML = '<span class="highlight">請至少填寫「每月支出」與「需支撐年數」。</span>';
        return;
      }

      const annualExpense = familyMonthlyExpense * 12;
      const livingCapital = annualExpense * supportYears;
      const totalNeeds = livingCapital + debts + educationFund + otherNeeds;
      const availableResources = currentLifeCoverage + liquidAssets;
      const gapRaw = totalNeeds - availableResources;
      const gap = gapRaw > 0 ? gapRaw : 0;

      const formatMoney = (num) => num.toLocaleString('zh-TW', { maximumFractionDigits: 0 });

      let interpretation = '';

      if (gap === 0 && availableResources >= totalNeeds) {
        interpretation = '理論上無明顯缺口，甚至略有餘裕，但仍建議檢視保單結構與資金流動性。';
      } else if (gap > 0 && gap <= totalNeeds * 0.3) {
        interpretation = '保障略有不足，可視風險承受度與預算分階段補強。';
      } else if (gap > totalNeeds * 0.3) {
        interpretation = '保障缺口明顯，建議儘快進行完整的保單健檢與家庭風險規劃。';
      }

      resultDiv.innerHTML = `
        <div>生活費資本需求：約 <strong>${formatMoney(livingCapital)}</strong> 元</div>
        <div>總資金需求（生活費＋負債＋教育金＋其他）：<strong>${formatMoney(totalNeeds)}</strong> 元</div>
        <div>可用資源（現有壽險＋金融資產）：<strong>${formatMoney(availableResources)}</strong> 元</div>
        <div class="result-strong">
          預估壽險保障缺口：
          <span class="highlight">${formatMoney(gap)}</span> 元
        </div>
        <div class="muted">${interpretation}</div>
        <div class="muted">本試算僅為概略估算，實際規劃仍需依個別家庭財務狀況與商品條款調整。</div>
      `;
    });