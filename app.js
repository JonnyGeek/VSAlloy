const alloySelect = document.getElementById('alloy-select');
const alloyTableBody = document.getElementById('alloy-tbody');
const ingotTableBody = document.getElementById('ingot-tbody');

alloys.forEach(alloy => {
  const option = document.createElement('option');
  option.value = alloy.name;
  option.textContent = alloy.name;
  alloySelect.appendChild(option);
});

function generateAlloyTable() {
  const selectedAlloy = alloySelect.value;
  const alloy = alloys.find(alloy => alloy.name === selectedAlloy);

  if (alloy) {
    let rowsHtml = '';
    alloy.metalls.forEach((metal, index) => {
      const initialValue = Math.round((alloy.prs[index][0] + alloy.prs[index][1]) / 2);
      const disabledClass = index === alloy.metalls.length - 1 ? 'disabled-slider' : '';
      const imagePath = `img/Nugget-${metal}.png`;
      rowsHtml += `
        <tr>
          <td>
            <img src="${imagePath}" alt="${metal}" class="metal-image">
          </td>
          <td>
            <span>${metal} - </span><span id="${metal}-percentage">${initialValue}%</span>
            <br>
            <input type="range" id="${metal}-slider" class="slider ${disabledClass}" min="${alloy.prs[index][0]}" max="${alloy.prs[index][1]}" value="${initialValue}" ${index === alloy.metalls.length - 1 ? 'disabled' : ''}>
          </td>
        </tr>
      `;
    });

    alloyTableBody.innerHTML = rowsHtml;

    // Add event listeners to the sliders
    const slider1 = document.getElementById(`${alloy.metalls[0]}-slider`);
    const slider2 = document.getElementById(`${alloy.metalls[1]}-slider`);
    const slider3 = document.getElementById(`${alloy.metalls[2]}-slider`);
    const percentage1 = document.getElementById(`${alloy.metalls[0]}-percentage`);
    const percentage2 = document.getElementById(`${alloy.metalls[1]}-percentage`);
    const percentage3 = document.getElementById(`${alloy.metalls[2]}-percentage`);

    slider1.addEventListener('input', () => {
      const value1 = parseInt(slider1.value);
      percentage1.textContent = `${value1}%`;

      if (alloy.metalls.length === 2) {
        const value2 = 100 - value1;
        slider2.value = value2;
        percentage2.textContent = `${value2}%`;
      } else {
        const value2 = parseInt(slider2.value);
        const value3 = 100 - value1 - value2;
        slider3.value = value3;
        percentage3.textContent = `${value3}%`;
      }
      updateIngotTable(alloy);
    });

    slider2.addEventListener('input', () => {
      const value1 = parseInt(slider1.value);
      const value2 = parseInt(slider2.value);
      percentage2.textContent = `${value2}%`;

      if (alloy.metalls.length === 3) {
        const value3 = 100 - value1 - value2;
        slider3.value = value3;
        percentage3.textContent = `${value3}%`;
      }
      updateIngotTable(alloy);
    });

    // Set initial values for sliders and percentages
    const initialValues = alloy.metalls.map((_, index) => Math.round((alloy.prs[index][0] + alloy.prs[index][1]) / 2));
    const totalInitialValue = initialValues.reduce((sum, value) => sum + value, 0);
    const adjustedInitialValues = initialValues.map(value => Math.round(value * 100 / totalInitialValue));

    alloy.metalls.forEach((metal, index) => {
      const slider = document.getElementById(`${metal}-slider`);
      const percentage = document.getElementById(`${metal}-percentage`);
      slider.value = adjustedInitialValues[index];
      percentage.textContent = `${adjustedInitialValues[index]}%`;
    });
  } else {
    alloyTableBody.innerHTML = '';
  }
}

function generateIngotTable() {
  const selectedAlloy = alloySelect.value;
  const alloy = alloys.find(alloy => alloy.name === selectedAlloy);

  if (alloy) {
    const maxIngots = calculateMaxIngots(alloy);
    const ingotImagePath = `img/Ingot-${alloy.name}.png`;
    const ingotRowHtml = `
      <tr>
        <td>
          <img src="${ingotImagePath}" alt="${alloy.name}" class="metal-image">
        </td>
        <td>
          <span>ingots - <span id="ingot-count">1</span> (<span id="max-ingots">${maxIngots}</span> max)</span>
          <br>
          <input type="range" id="ingot-slider" class="slider" min="1" max="${maxIngots}" value="1">
        </td>
      </tr>
    `;

    ingotTableBody.innerHTML = ingotRowHtml;

    const ingotSlider = document.getElementById('ingot-slider');
    const ingotCount = document.getElementById('ingot-count');
    const maxIngotsSpan = document.getElementById('max-ingots');

    ingotSlider.addEventListener('input', () => {
      ingotCount.textContent = ingotSlider.value;
      generateCrucibleTable(alloy); // Add this line to update the crucible table
    });
  } else {
    ingotTableBody.innerHTML = '';
  }
}

function generateCrucibleTable(alloy) {
  const crucibleTableBody = document.getElementById('crucible-tbody');
  const maxIngots = calculateMaxIngots(alloy);
  const ingotSlider = document.getElementById('ingot-slider');
  const ingotCount = ingotSlider ? parseInt(ingotSlider.value) : 1;

  const slots = [];
  const metalls = [];
  const nug = [];
  const ppp = ingotCount;

  const totalNuggets = ppp * 20;
  let remainingNuggets = totalNuggets;

  for (let m = 0; m < alloy.metalls.length - 1; m++) {
    const slider = document.getElementById(`${alloy.metalls[m]}-slider`);
    const percentage = parseInt(slider.value);
    const nuggetValue = Math.floor(totalNuggets * percentage / 100);
    nug.push(nuggetValue);
    remainingNuggets -= nuggetValue;
  }

  const lastNuggetValue = remainingNuggets;
  nug.push(lastNuggetValue);

  for (let n = 0; n < nug.length; n++) {
    const step = Math.floor(nug[n] / 128);
    let total = nug[n];
    for (let x = 0; x < step; x++) {
      slots.push(128);
      metalls.push(alloy.metalls[n]);
      total -= 128;
    }
    if (total !== 0 || step === 0) {
      slots.push(total);
      metalls.push(alloy.metalls[n]);
    }
  }

  let rowHtml = '<tr>';
  for (let i = 0; i < 4; i++) {
    if (i < slots.length) {
      const imagePath = `img/Nugget-${metalls[i]}.png`;
      rowHtml += `
        <td><img src="${imagePath}" alt="${metalls[i]}" class="metal-image"></td>
      `;
    } else {
      rowHtml += '<td></td>';
    }
  }
  rowHtml += '</tr>';

  rowHtml += '<tr>';
  for (let i = 0; i < 4; i++) {
    if (i < slots.length) {
      rowHtml += `
        <td>${slots[i]}</td>
      `;
    } else {
      rowHtml += '<td></td>';
    }
  }
  rowHtml += '</tr>';

  crucibleTableBody.innerHTML = rowHtml;
}

function calculateMaxIngots(selectedAlloy) {
  if (selectedAlloy) {
    let maxIngots = 1;
    let isFullCrucible = false;

    while (!isFullCrucible) {
      const slots = [];
      const metalls = [];
      const nug = [];
      const ppp = maxIngots;
      const totalNuggets = ppp * 20;

      let remainingNuggets = totalNuggets;
      for (let m = 0; m < selectedAlloy.metalls.length - 1; m++) {
        const slider = document.getElementById(`${selectedAlloy.metalls[m]}-slider`);
        const percentage = parseInt(slider.value);
        const nuggetValue = Math.floor(totalNuggets * percentage / 100);
        nug.push(nuggetValue);
        remainingNuggets -= nuggetValue;
      }

      const lastNuggetValue = remainingNuggets;
      nug.push(lastNuggetValue);
      for (let n = 0; n < nug.length; n++) {
        const step = Math.floor(nug[n] / 128);
        let total = nug[n];
        for (let x = 0; x < step; x++) {
          slots.push(128);
          metalls.push(selectedAlloy.metalls[n]);
          total -= 128;
        }
        if (total !== 0 || step === 0) {
          slots.push(total);
          metalls.push(selectedAlloy.metalls[n]);
        }
      }

      if (slots.length <= 4) {
        maxIngots++;
      } else {
        isFullCrucible = true;
      }
    }
    return maxIngots - 1;
  }
  return 0;
}

function updateIngotTable(alloy) {
  const maxIngots = calculateMaxIngots(alloy);
  const ingotSlider = document.getElementById('ingot-slider');
  const ingotCount = document.getElementById('ingot-count');
  const maxIngotsSpan = document.getElementById('max-ingots');

  const currentIngotValue = parseInt(ingotSlider.value);

  if (currentIngotValue > maxIngots) {
    ingotSlider.value = maxIngots;
    ingotCount.textContent = maxIngots;
  }

  ingotSlider.max = maxIngots;
  maxIngotsSpan.textContent = maxIngots;

  generateCrucibleTable(alloy);
}


function updateUI() {
  generateAlloyTable();
  generateIngotTable();
  const selectedAlloy = alloySelect.value;
  const alloy = alloys.find(alloy => alloy.name === selectedAlloy);
  generateCrucibleTable(alloy);
}

alloySelect.addEventListener('change', updateUI);
updateUI();
