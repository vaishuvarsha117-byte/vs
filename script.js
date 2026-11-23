
const categorySelect = document.getElementById("category");
const recipeSelect = document.getElementById("recipe");
const servingsInput = document.getElementById("servings");
const calculateBtn = document.getElementById("calculateBtn");

const message = document.getElementById("message");
const resultSection = document.getElementById("resultSection");
const ingredientList = document.getElementById("ingredientList");
const recipeInfo = document.getElementById("recipeInfo");


// Filter recipes by category
categorySelect.addEventListener("change", function () {

    const selectedCategory = this.value;

    recipeSelect.value = "";

    const options = recipeSelect.querySelectorAll("option");

    options.forEach(function (option, index) {

        if (index === 0) {
            option.hidden = false;
            return;
        }

        const recipeCategory = option.dataset.category;

        if (
            selectedCategory === "All" ||
            recipeCategory === selectedCategory
        ) {
            option.hidden = false;
        } else {
            option.hidden = true;
        }

    });

    resetResults();
});


// Reset previous results
function resetResults() {

    resultSection.style.display = "none";

    ingredientList.innerHTML = `
        <tr>
            <td colspan="4">Select a recipe to see ingredients.</td>
        </tr>
    `;

    message.textContent = "";
    message.className = "";
}


// Calculate ingredients
calculateBtn.addEventListener("click", async function () {

    const recipeId = recipeSelect.value;
    const servings = Number(servingsInput.value);

    message.textContent = "";
    message.className = "";

    if (!recipeId) {
        message.textContent = "Please select a recipe.";
        message.className = "error";
        return;
    }

    if (
        !Number.isInteger(servings) ||
        servings < 1 ||
        servings > 1000
    ) {
        message.textContent = "Please enter servings between 1 and 1000.";
        message.className = "error";
        return;
    }

    calculateBtn.disabled = true;
    calculateBtn.textContent = "Calculating...";

    try {

        const response = await fetch("/calculate", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                recipe_id: recipeId,
                servings: servings
            })

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Calculation failed.");
        }

        displayResults(data);

        message.textContent = "Ingredients calculated successfully!";
        message.className = "success";

    } catch (error) {

        message.textContent = error.message;
        message.className = "error";

        resultSection.style.display = "none";

    } finally {

        calculateBtn.disabled = false;
        calculateBtn.textContent = "Calculate Ingredients";

    }

});


// Display calculated ingredients
function displayResults(data) {

    resultSection.style.display = "block";

    recipeInfo.innerHTML = `
        <strong>Recipe:</strong> ${escapeHTML(data.recipe)}<br>
        <strong>Category:</strong> ${escapeHTML(data.category)}<br>
        <strong>Servings:</strong> ${data.servings}
    `;

    ingredientList.innerHTML = "";

    data.ingredients.forEach(function (item, index) {

        const row = document.createElement("tr");

        const serialCell = document.createElement("td");
        serialCell.textContent = index + 1;

        const nameCell = document.createElement("td");
        nameCell.textContent = item.name;

        const quantityCell = document.createElement("td");
        quantityCell.textContent = item.quantity;

        const unitCell = document.createElement("td");
        unitCell.textContent = item.unit;

        row.appendChild(serialCell);
        row.appendChild(nameCell);
        row.appendChild(quantityCell);
        row.appendChild(unitCell);

        ingredientList.appendChild(row);

    });

    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// Safely display recipe information
function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function (char) {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[char];

    });

}
