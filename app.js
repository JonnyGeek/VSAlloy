const alloySelect = document.getElementById('alloy-select');
const alloyTableBody = document.getElementById('alloy-tbody');
const ingotTableBody = document.getElementById('ingot-tbody');

alloys.forEach(alloy => {
  const option = document.createElement('option');
  option.value = alloy.id;
  option.textContent = alloy.title;
  alloySelect.appendChild(option);
});

function generateAlloyTable() {
  const selectedAlloyId = alloySelect.value;
  const alloy = alloys.find(alloy => alloy.id === selectedAlloyId);

  if (alloy) {
    let rowsHtml = '';
    alloy.ingredients.forEach((ingredient, index) => {
      const initialValue = Math.round((ingredient.ratio.min + ingredient.ratio.max) / 2);
      const disabledClass = index === alloy.ingredients.length - 1 ? 'disabled-slider' : '';
      const imagePath = `img/Nugget-${ingredient.id}.png`;
      rowsHtml += `
        <tr>
          <td class="cell-image">
            <img src="${imagePath}" alt="${ingredient.id}" class="image-metal">
          </td>
          <td>
            <span class="ml5">${ingredient.id} - </span><span id="${ingredient.id}-percentage" class="bold">${initialValue}%</span>
            <br>
            <input type="range" id="${ingredient.id}-slider" class="slider ${disabledClass}" min="${ingredient.ratio.min}" max="${ingredient.ratio.max}" value="${initialValue}" ${index === alloy.ingredients.length - 1 ? 'disabled' : ''}>
          </td>
        </tr>
      `;
    });

    alloyTableBody.innerHTML = rowsHtml;

    // Add event listeners to the sliders
    alloy.ingredients.forEach((ingredient, index) => {
      const slider = document.getElementById(`${ingredient.id}-slider`);
      const percentage = document.getElementById(`${ingredient.id}-percentage`);

      slider.addEventListener('input', () => {
        const value = parseInt(slider.value);
        percentage.textContent = `${value}%`;

        if (index < alloy.ingredients.length - 1) {
          const remainingPercentage = 100 - alloy.ingredients.slice(0, -1).reduce((sum, ingredient) => {
            const sliderValue = parseInt(document.getElementById(`${ingredient.id}-slider`).value);
            return sum + sliderValue;
          }, 0);

          const lastIngredient = alloy.ingredients[alloy.ingredients.length - 1];
          const lastSlider = document.getElementById(`${lastIngredient.id}-slider`);
          const lastPercentage = document.getElementById(`${lastIngredient.id}-percentage`);

          lastSlider.value = remainingPercentage;
          lastPercentage.textContent = `${remainingPercentage}%`;
        }

        updateIngotTable(alloy);
      });
    });

    // Set initial values for sliders and percentages
    const initialValues = alloy.ingredients.map(ingredient => Math.round((ingredient.ratio.min + ingredient.ratio.max) / 2));
    const totalInitialValue = initialValues.reduce((sum, value) => sum + value, 0);
    const adjustedInitialValues = initialValues.map(value => Math.round(value * 100 / totalInitialValue));

    alloy.ingredients.forEach((ingredient, index) => {
      const slider = document.getElementById(`${ingredient.id}-slider`);
      const percentage = document.getElementById(`${ingredient.id}-percentage`);
      slider.value = adjustedInitialValues[index];
      percentage.textContent = `${adjustedInitialValues[index]}%`;
    });
  } else {
    alloyTableBody.innerHTML = '';
  }
}

function generateIngotTable() {
  const selectedAlloyId = alloySelect.value;
  const alloy = alloys.find(alloy => alloy.id === selectedAlloyId);

  if (alloy) {
    const maxIngots = calculateMaxIngots(alloy);
    const ingotImagePath = `img/Ingot-${alloy.id}.png`;
    const ingotRowHtml = `
      <tr>
        <td class="cell-image">
          <img src="${ingotImagePath}" alt="${alloy.title}" class="image-metal">
        </td>
        <td>
          <span class="ingot-info ml5">
            <span class="ingot-count">ingots - <span id="ingot-count" class="bold">1</span></span>
            <span class="max-ingots"><span id="max-ingots">${maxIngots}</span> max</span>
          </span>
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
      generateCrucibleTable(alloy);
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
  const ingredients = [];
  const nug = [];
  const ppp = ingotCount;

  const totalNuggets = ppp * 20;
  let remainingNuggets = totalNuggets;

  for (let i = 0; i < alloy.ingredients.length - 1; i++) {
    const ingredient = alloy.ingredients[i];
    const slider = document.getElementById(`${ingredient.id}-slider`);
    const percentage = parseInt(slider.value);
    const nuggetValue = Math.floor(totalNuggets * percentage / 100);
    nug.push(nuggetValue);
    remainingNuggets -= nuggetValue;
  }

  const lastNuggetValue = remainingNuggets;
  nug.push(lastNuggetValue);

  for (let i = 0; i < nug.length; i++) {
    const step = Math.floor(nug[i] / 128);
    let total = nug[i];
    for (let j = 0; j < step; j++) {
      slots.push(128);
      ingredients.push(alloy.ingredients[i].id);
      total -= 128;
    }
    if (total !== 0 || step === 0) {
      slots.push(total);
      ingredients.push(alloy.ingredients[i].id);
    }
  }

  let rowHtml = '<tr>';
  for (let i = 0; i < 4; i++) {
    if (i < slots.length) {
      const imagePath = `img/Nugget-${ingredients[i]}.png`;
      rowHtml += `
        <td class="cell-image">
          <img src="${imagePath}" alt="${ingredients[i]}" class="image-metal">
        </td>
      `;
    } else {
      rowHtml += '<td class="cell-image"></td>';
    }
  }
  rowHtml += '</tr>';

  rowHtml += '<tr>';
  for (let i = 0; i < 4; i++) {
    if (i < slots.length) {
      rowHtml += `
        <td class="bold">${slots[i]}</td>
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
      const ingredients = [];
      const nug = [];
      const ppp = maxIngots;
      const totalNuggets = ppp * 20;

      let remainingNuggets = totalNuggets;
      for (let i = 0; i < selectedAlloy.ingredients.length - 1; i++) {
        const ingredient = selectedAlloy.ingredients[i];
        const slider = document.getElementById(`${ingredient.id}-slider`);
        const percentage = parseInt(slider.value);
        const nuggetValue = Math.floor(totalNuggets * percentage / 100);
        nug.push(nuggetValue);
        remainingNuggets -= nuggetValue;
      }

      const lastNuggetValue = remainingNuggets;
      nug.push(lastNuggetValue);
      for (let i = 0; i < nug.length; i++) {
        const step = Math.floor(nug[i] / 128);
        let total = nug[i];
        for (let j = 0; j < step; j++) {
          slots.push(128);
          ingredients.push(selectedAlloy.ingredients[i].id);
          total -= 128;
        }
        if (total !== 0 || step === 0) {
          slots.push(total);
          ingredients.push(selectedAlloy.ingredients[i].id);
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
  const selectedAlloyId = alloySelect.value;
  const alloy = alloys.find(alloy => alloy.id === selectedAlloyId);
  generateCrucibleTable(alloy);
}

alloySelect.addEventListener('change', updateUI);
updateUI();