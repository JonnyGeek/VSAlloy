// Get the select element and alloy table body
const alloySelect = document.getElementById('alloy-select');
const alloyTableBody = document.getElementById('alloy-tbody');

// Populate the select options with alloy names
alloys.forEach(alloy => {
  const option = document.createElement('option');
  option.value = alloy.name;
  option.textContent = alloy.name;
  alloySelect.appendChild(option);
});

// Function to generate rows for the selected alloy
function generateAlloyRows() {
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
            <span>${metal}</span>
            <br>
            <input type="range" id="${metal}-slider" class="slider ${disabledClass}" min="${alloy.prs[index][0]}" max="${alloy.prs[index][1]}" value="${initialValue}" ${index === alloy.metalls.length - 1 ? 'disabled' : ''}>
            <br>
            <span id="${metal}-percentage">${initialValue}%</span>
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

// Event listener for alloy selection change
alloySelect.addEventListener('change', generateAlloyRows);

// Generate rows for the initially selected alloy
generateAlloyRows();