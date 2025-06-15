const output = document.getElementById("output");
let data = null;
const categories = document.getElementById("categories");
const toggle = document.getElementById("toggle");
const toggleicon = document.getElementById("toggleicon");
const toggletext = document.getElementById("toggletext");
const btns = document.getElementById("btns");

document.getElementById('fileInput').addEventListener('change', (event) => {
    const fileInput = event.target;
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const parsedData = JSON.parse(e.target.result);
            if (!parsedData) {
                alert("Invalid or Corrupted JSON file!");
                return;
            }
            data = parsedData;
            output.innerHTML = "";
            createCategories();
        } catch {
            alert("Invalid or Corrupted JSON file!");
        }
    };
    reader.readAsText(file);
    fileInput.value = "";
});

function createCategories() {
    categories.innerHTML = "";

    for (const category in data) {
        const div = document.createElement("div");
        div.className = "category";

        // Create label wrapper for custom checkbox
        const labelWrapper = document.createElement("label");
        labelWrapper.className = "cc";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = true;
        checkbox.id = `cat_${category}`;

        const checkmark = document.createElement("span");
        checkmark.className = "cm material-symbols-rounded msrup";
        checkmark.textContent = "check";

        labelWrapper.appendChild(checkbox);
        labelWrapper.appendChild(checkmark);

        // Create text label (category name)
        const textNode = document.createTextNode(` ${category} `);

        // Create remove button
        const removec = document.createElement("div");
        removec.classList = "remove inline";
        removec.textContent = "Remove Category";

        removec.addEventListener("click", () => {
            categories.removeChild(div);
            delete data[category];
        });

        // Append everything to div
        div.appendChild(labelWrapper);
        div.appendChild(textNode);
        div.appendChild(removec);

        const addaspect = document.createElement("div");
        addaspect.className = "buttonSmall";
        addaspect.textContent = "add aspect";
        addaspect.onclick = () => addAspectFn(category, div);

        let values = data[category];
        if (values.values) {
            values = values.values;
        }

        for (const option in values) {
            const weight = values[option].weight || 0;
            createOptionSlider(div, category, option, weight);
        }

        div.appendChild(addaspect);
        categories.append(div);
        categories.classList.remove("hidden");
        btns.classList.remove("hidden");
        toggletext.textContent = "Hide Categories";
        toggleicon.textContent = "arrow_drop_up";
    }
}


function createOptionSlider(container, category, optionName, weight) {
    const slider = document.createElement("div");
    slider.className = "slider";

    const sliderLabel = document.createElement("label");
    sliderLabel.textContent = `${optionName} `;

    const slide = document.createElement("input");
    slide.type = "range";
    slide.min = 0;
    slide.max = 20;
    slide.value = weight;
    slide.dataset.defaultWeight = weight;
    slide.dataset.option = optionName;

    const valueDisplay = document.createElement("code");
    valueDisplay.className = "cd";
    valueDisplay.textContent = weight;

    slide.addEventListener("input", () => {
        valueDisplay.textContent = slide.value;
    });

    const remove = document.createElement("div");
    remove.className = "remove";
    remove.textContent = "X";

    remove.addEventListener("click", () => {
        container.removeChild(slider);

        let values = data[category];
        if (values.values) values = values.values;

        delete values[optionName];
    });

    slider.appendChild(sliderLabel);
    slider.appendChild(slide);
    slider.appendChild(valueDisplay);
    slider.appendChild(remove);

    const addAspectButton = container.querySelector(".buttonSmall");
    container.insertBefore(slider, addAspectButton);
}


toggle.addEventListener("click", () => {
    if(data) {
        if (categories.classList.contains("hidden")) {
            categories.classList.remove("hidden");
            btns.classList.remove("hidden");
            toggletext.textContent = "Hide Categories";
            toggleicon.textContent = "arrow_drop_up";
        } else {
            btns.classList.add("hidden");
            categories.classList.add("hidden");
            toggletext.textContent = "Show Categories";
            toggleicon.textContent = "arrow_drop_down";
        }
    }
    else {
        alert("Please upload a valid JSON file first.");
    }
    });

function generate() {
    if (!data) {
        alert("Please upload a valid JSON file first.");
        return;
    }
    else {
        output.textContent = "";
        let anySelected = false;

        for (const category in data) {
            const checkbox = document.getElementById(`cat_${category}`);
            if (!checkbox || !checkbox.checked) continue;
            anySelected = true;
            let values = data[category];
            if (values.values) {
                values = values.values;
            }

            const currentCategory = checkbox.closest(".category");
            const sliders = currentCategory.querySelectorAll("input[type=range]");
            sliders.forEach(slider => {
                const optionName = slider.dataset.option;
                if (values[optionName]) {
                    values[optionName].weight = parseInt(slider.value);
                }
            });

            const row = document.createElement("div");
            row.className = "row";
            const result = weightedRandom(values);
            const lbl = document.createElement("div");
            lbl.textContent = `${category}:`;
            const code = document.createElement("code");
            code.textContent = result === null ? "0 valid weights" : result;

            row.appendChild(lbl),
            row.appendChild(code);

            output.appendChild(row);

        }
        if (!anySelected) {
            alert("Please select at least one category.");
            return;
        }
    }

}

function weightedRandom(obj) {
  let totalWeight = 0;
  for (const key in obj) {
    totalWeight += obj[key].weight || 0;
  }
  if (totalWeight === 0) return null;

  let rand = Math.random() * totalWeight;
  for (const key in obj) {
    const w = obj[key].weight || 0;
    if (rand < w) {
      return key;
    }
    rand -= w;
  }
  return null;
}

document.getElementById("addCategoryBtn").addEventListener("click", () => {
    const newCategoryName = prompt("Enter Category Name:");

    if (!newCategoryName) return;

    const trimmedCategory = newCategoryName.trim();
    if (!trimmedCategory) {
        alert("Category Name can't be empty.");
        return;
    }

    if (data.hasOwnProperty(trimmedCategory)) {
        alert("Category already exists.");
        return;
    }

    // Add new category with empty values
    data[trimmedCategory] = {};

    // Re-create the options UI (this will include new category)
    createCategories();
});

function addAspectFn(category, categoryDiv) {
  // Prompt user for the new value name
  const newValueName = prompt("Enter name for new value:");

  if (!newValueName) return;

  // Sanitize input (trim and disallow empty or duplicate)
  const trimmedName = newValueName.trim();
  if (!trimmedName) {
    alert("Name cannot be empty.");
    return;
  }

  // Check for duplicates
  let values = data[category];
  if (values.values) values = values.values;

  if (values.hasOwnProperty(trimmedName)) {
    alert("Value already exists.");
    return;
  }

  // Add new value with default weight (e.g. 1)
  values[trimmedName] = { weight: 1 };

  // Find the sub-options container and add new slider
  const container = categories.querySelector(".category");
  console.log(container)
  createOptionSlider(container, category, trimmedName, 1);
  createCategories(); // bad practice, reload somewhere else
}

function download() {
  if (!data) {
    alert("No data to save. Please upload a JSON file first.");
    return;
  }

  // Build the preset object based on current sliders and checkboxes
  const preset = {};

  for (const category in data) {
    const checkbox = document.getElementById(`cat_${category}`);
    if (!checkbox) continue;

    // Include category only if checkbox exists, regardless of checked or not, so user can save full preset
    preset[category] = {};

    let values = data[category];
    if (values.values) {
      values = values.values;
    }

    const categoryDiv = checkbox.closest(".category");
    const sliders = categoryDiv.querySelectorAll("input[type='range']");

    sliders.forEach(slider => {
      // Get option name by removing slider and value text from parent label text content
      // Safer way: we stored option name in label text earlier, but here let's get slider's parent label text minus slider's text content
      // Since slider's parentNode is label, and label textContent includes option name plus slider + value
      // Instead, we can store option name in a data attribute while generating, or parse it from label

      // Better: when creating sliders, set data-option attribute with option name
      const optionName = slider.getAttribute("data-option");
      if (optionName) {
        preset[category][optionName] = {
          weight: parseInt(slider.value, 10)
        };
      }
    });
  }

  // Convert preset to JSON string
  const jsonStr = JSON.stringify(preset, null, 2);

  // Create a blob and a download link
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "preset.json";
  document.body.appendChild(a);
  a.click();

  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}