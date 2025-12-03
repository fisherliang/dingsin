   // 頁面載入時，自動把評估日期設為今天
    (function setDefaultRefDate() {
      const refInput = document.getElementById('refDate');
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      refInput.value = `${yyyy}-${mm}-${dd}`;
    })();

    // 保險年齡計算
    function calculateInsuranceAge(birthDateStr, refDateStr) {
      if (!birthDateStr) return null;
      const birthDate = new Date(birthDateStr);
      const refDate = refDateStr ? new Date(refDateStr) : new Date();

      if (isNaN(birthDate.getTime()) || isNaN(refDate.getTime())) return null;

      let birthYear = birthDate.getFullYear();
      let birthMonth = birthDate.getMonth(); // 0-11
      let birthDay = birthDate.getDate();

      let refYear = refDate.getFullYear();
      let refMonth = refDate.getMonth();
      let refDay = refDate.getDate();

      // 實足年齡
      let age = refYear - birthYear;
      if (refMonth < birthMonth || (refMonth === birthMonth && refDay < birthDay)) {
        age -= 1;
      }

      // 計算下一次生日
      let nextBirthday = new Date(refYear, birthMonth, birthDay);
      if (nextBirthday < refDate) {
        nextBirthday = new Date(refYear + 1, birthMonth, birthDay);
      }

      const msPerDay = 1000 * 60 * 60 * 24;
      const daysToNext = Math.round((nextBirthday - refDate) / msPerDay);

      let insuranceAge = age;
      if (daysToNext <= 183) {
        insuranceAge = age + 1;
      }

      return {
        age,
        insuranceAge,
        daysToNext
      };
    }

    document.getElementById('calcInsuranceAgeBtn').addEventListener('click', function() {
      const birthDateStr = document.getElementById('birthDate').value;
      const refDateStr = document.getElementById('refDate').value;
      const resultDiv = document.getElementById('insuranceAgeResult');

      const result = calculateInsuranceAge(birthDateStr, refDateStr);

      if (!result) {
        resultDiv.innerHTML = '<span class="highlight">請先正確輸入出生日期。</span>';
        return;
      }

      const { age, insuranceAge, daysToNext } = result;

      resultDiv.innerHTML = `
        <div>實足年齡：約 <strong>${age}</strong> 歲</div>
        <div>距離下一次生日：約 <strong>${daysToNext}</strong> 天</div>
        <div class="result-strong">保險年齡：<span class="highlight">${insuranceAge}</span> 歲</div>
        <div class="muted">實際承保仍以各保險公司認定為準，本結果僅供參考。</div>
      `;
    });

    // 數字工具：安全取值
    function getNumberValue(id) {
      const val = parseFloat(document.getElementById(id).value);
      return isNaN(val) ? 0 : val;
    }