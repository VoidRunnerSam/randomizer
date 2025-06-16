const output = document.getElementById("output");
let data = null;
const categories = document.getElementById("categories");
const toggle = document.getElementById("toggle");
const toggleicon = document.getElementById("toggleicon");
const toggletext = document.getElementById("toggletext");
const settings = document.getElementById("settings");
const settingscontainer = document.getElementById("settingscontainer");

// Elements
const themeToggle = document.getElementById('themeToggle');
const accentRadios = document.querySelectorAll('input[name="accent"]');

// Load saved theme on page load
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const savedAccent = localStorage.getItem('accent');

    if (savedTheme === 'light') {
        document.body.classList.remove('dark');
    } else {
        document.body.classList.add('dark');
    }

    if (savedAccent) {
        document.body.classList.add(savedAccent);
        const selectedRadio = document.querySelector(`input[name="accent"][value="${savedAccent}"]`);
        if (selectedRadio) selectedRadio.checked = true;
    }
    else {
        document.body.classList.add('accent-purple');
    }
});

// Theme toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const newTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
});

// Accent color selection
accentRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        document.body.classList.remove(
            'accent-red',
            'accent-yellow',
            'accent-green',
            'accent-blue',
            'accent-purple'
        );
        document.body.classList.add(radio.value);
        localStorage.setItem('accent', radio.value);
    });
});

const maxWeightInput = document.getElementById("maxweight");

let maxWeight = 20; // default

function loadMaxWeight() {
    const storedValue = localStorage.getItem("maxweight");
    maxWeight = storedValue !== null ? parseInt(storedValue) : 20;
    maxWeightInput.value = maxWeight;
};

// Save value to localStorage when changed
maxWeightInput.addEventListener("input", () => {
    const value = parseInt(maxWeightInput.value);
    if (!isNaN(value) && value > 0) {
        localStorage.setItem("maxweight", value);
    }
});

maxWeightInput.addEventListener("input", () => {
    const value = parseInt(maxWeightInput.value);
    if (!isNaN(value) && value > 0) {
        maxWeight = value;
        localStorage.setItem("maxweight", value);
        updateAllSliders(); // update existing sliders too
    }
});

function updateAllSliders() {
    const allSliders = document.querySelectorAll('input[type="range"]');
    allSliders.forEach(slider => {
        slider.max = maxWeight;
        const numInput = slider.parentElement.querySelector('input[type="number"]');
        if (parseInt(slider.value) > maxWeight) {
            slider.value = maxWeight;
            numInput.value = maxWeight;
            slider.dispatchEvent(new Event("input"));
        }
        numInput.max = maxWeight;
    });
    createCategories();
};

loadMaxWeight();

document.getElementById('fileInput').addEventListener('change', (event) => {
    const fileInput = event.target;
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const parsedData = JSON.parse(e.target.result);
            if (!parsedData || !isValidData(parsedData)) {
                alert("Invalid or Corrupted JSON file!");
                return;
            }
            data = parsedData;
            output.textContent = "";
            createCategories();
        } catch {
            alert("Invalid or Corrupted JSON file!");
        }
    };

    reader.readAsText(file);
    fileInput.value = "";
});

function isValidData(parsedData) {
    if (typeof parsedData !== 'object' || parsedData === null) return false;

    for (const category in parsedData) {
        const values = parsedData[category];
        if (typeof values !== 'object' || values === null) return false;

        for (const option in values) {
            const opt = values[option];
            if (typeof opt !== 'object' || typeof opt.weight !== 'number') {
                return false;
            }
        }
    }
    return true;
};

function sanitizeWeight(value, defaultValue = 1) {
    const weight = parseInt(value);
    if (isNaN(weight) || weight < 0 || weight > maxWeight) {
        return defaultValue;
    }
    return weight;
};

function createCategories() {
    categories.textContent = "";

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
        const removespan = document.createElement("span");
        removespan.classList = "material-symbols-rounded";
        removespan.textContent = "close";
        removec.appendChild(removespan);

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
        const addspan = document.createElement("span");
        addspan.textContent = "add";
        addspan.classList = "material-symbols-rounded";
        addaspect.appendChild(addspan);
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
        toggletext.textContent = "Hide Categories";
        toggleicon.textContent = "arrow_drop_up";
    }
};

function createOptionSlider(container, category, optionName, weight) {
    weight = sanitizeWeight(weight);
    const slider = document.createElement("div");
    slider.className = "slider";

    const sliderLabel = document.createElement("label");
    sliderLabel.textContent = `${optionName} `;

    const slide = document.createElement("input");
    slide.type = "range";
    slide.min = 0;
    slide.max = maxWeight;
    slide.value = weight;
    slide.dataset.defaultWeight = weight;
    slide.dataset.option = optionName;


    const numericInput = document.createElement("input");
    numericInput.type = "number";
    numericInput.min = 0;
    numericInput.max = maxWeight;
    numericInput.value = weight;
    numericInput.style.marginLeft = "8px"; // optional

    // Sync slider → numeric input
    slide.addEventListener("input", () => {
        numericInput.value = slide.value;
    });

    // Sync numeric input → slider
    numericInput.addEventListener("input", () => {
        let val = parseInt(numericInput.value);
        if (isNaN(val)) val = 0;
        if (val > maxWeight) val = maxWeight;
        if (val < 0) val = 0;
        slide.value = val;
    });

    const remove = document.createElement("div");
    remove.className = "remove";
    const removespan = document.createElement("span");
    removespan.classList = "material-symbols-rounded";
    removespan.textContent = "close";
    remove.appendChild(removespan);

    remove.addEventListener("click", () => {
        container.removeChild(slider);
        let values = data[category];
        if (values.values) values = values.values;
        delete values[optionName];
    });

    slider.appendChild(sliderLabel);
    slider.appendChild(slide);
    slider.appendChild(numericInput);
    slider.appendChild(remove);

    const addAspectButton = container.querySelector(".buttonSmall");
    container.insertBefore(slider, addAspectButton);
};

settings.addEventListener("click", () => {
    if (settingscontainer.classList.contains("hidden")) {
        settingscontainer.classList.remove("hidden");
        settings.classList.add("accent");
    } 
    else {
        settingscontainer.classList.add("hidden");
        settings.classList.remove("accent");
    }
});

toggle.addEventListener("click", () => {
        if (categories.classList.contains("hidden")) {
            categories.classList.remove("hidden");
            toggletext.textContent = "Hide Categories";
            toggleicon.textContent = "arrow_drop_up";
        } else {
            categories.classList.add("hidden");
            toggletext.textContent = "Show Categories";
            toggleicon.textContent = "arrow_drop_down";
        }
    });

function generate() {
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
            );

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
};

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
};

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
};

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
};

function copyresults() {
    if (!output.hasChildNodes()) {
        alert("No results to copy!");
        return;
    }

    const rows = output.querySelectorAll(".row");
    if (rows.length === 0) {
        alert("No results to copy!");
        return;
    }

    const lines = Array.from(rows).map(row => {
        const lbl = row.querySelector("div");
        const code = row.querySelector("code");
        const labelText = lbl ? lbl.textContent.trim() : "";
        const codeText = code ? code.textContent.trim() : "";
        return `${labelText} ${codeText}`;
    });

    const textToCopy = lines.join("\n");

    // Copy to clipboard (with fallback)
    if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert("Results copied to clipboard!");
        }).catch(() => {
            alert("Failed to copy results.");
        });
    } else {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand("copy");
            alert("Results copied to clipboard!");
        } catch {
            alert("Failed to copy results.");
        }
        document.body.removeChild(textarea);
    }
};
