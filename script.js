// ===============================
// EXPENSE TRACKER
// ===============================

// HTML Elements
const transactionForm = document.getElementById("transactionForm");

const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const transactionList = document.getElementById("transactionList");

const balanceDisplay = document.getElementById("balance");
const incomeDisplay = document.getElementById("income");
const expenseDisplay = document.getElementById("expense");

const filterType = document.getElementById("filterType");
const searchInput = document.getElementById("searchInput");
const submitBtn = document.getElementById("submitBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const sortType = document.getElementById("sortType");
const monthFilter = document.getElementById("monthFilter");


// ===============================
// VARIABLES
// ===============================

let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];

let editingId = null;


// ===============================
// ADD / UPDATE TRANSACTION
// ===============================

transactionForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;


    // Validation
    if (description === "" || amount <= 0 || date === "") {

        alert("Please enter all transaction details.");
        return;
    }


    // Create Transaction
    const transaction = {

        id: Date.now(),
        description: description,
        amount: amount,
        type: type,
        category: category,
        date: date

    };


    // UPDATE TRANSACTION
    if (editingId !== null) {

        const index =
            transactions.findIndex(function (item) {

                return item.id === editingId;

            });


        if (index !== -1) {

            transaction.id = editingId;

            transactions[index] = transaction;

        }


        editingId = null;


        submitBtn.innerHTML =
            '<i class="bi bi-plus-circle"></i> Add Transaction';


    } else {

        // ADD NEW TRANSACTION

        transactions.push(transaction);

    }


    saveTransactions();

    displayTransactions();

    transactionForm.reset();

    setTodayDate();

});


// ===============================
// FILTER
// ===============================

filterType.addEventListener("change", function () {

    displayTransactions();

});


// ===============================
// SEARCH
// ===============================

searchInput.addEventListener("input", function () {

    displayTransactions();

});


// ===============================
// SORT
// ===============================

sortType.addEventListener("change", function () {

    displayTransactions();

});


// ===============================
// MONTH FILTER
// ===============================

monthFilter.addEventListener("change", function () {

    displayTransactions();

});


// ===============================
// DISPLAY TRANSACTIONS
// ===============================

function displayTransactions() {

    transactionList.innerHTML = "";


    // Selected Type
    const selectedFilter =
        filterType.value;


    // Search Text
    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    // Selected Month
    const selectedMonth =
        monthFilter.value;


    // ===============================
    // FILTER + SEARCH + MONTH
    // ===============================

    const filteredTransactions =
        transactions.filter(function (transaction) {


            // Type Filter
            const matchesType =
                selectedFilter === "all" ||
                transaction.type === selectedFilter;


            // Search
            const matchesSearch =
                transaction.description
                    .toLowerCase()
                    .includes(searchText) ||

                transaction.category
                    .toLowerCase()
                    .includes(searchText);


            // Month Filter
            const matchesMonth =
                selectedMonth === "" ||
                (
                    transaction.date &&
                    transaction.date.startsWith(selectedMonth)
                );


            return (
                matchesType &&
                matchesSearch &&
                matchesMonth
            );

        });


    // ===============================
    // SORT BY DATE
    // ===============================

    filteredTransactions.sort(function (a, b) {

        if (sortType.value === "newest") {

            return new Date(b.date) - new Date(a.date);

        } else {

            return new Date(a.date) - new Date(b.date);

        }

    });


    // ===============================
    // EMPTY STATE
    // ===============================

    if (filteredTransactions.length === 0) {

        transactionList.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="text-center text-muted py-4"
                >

                    <i class="bi bi-inbox"></i>
                    No transactions found.

                </td>

            </tr>

        `;


        updateSummary();

        return;

    }


    // ===============================
    // DISPLAY TRANSACTIONS
    // ===============================

    filteredTransactions.forEach(function (transaction) {

        const row =
            document.createElement("tr");


        // Income Green / Expense Red
        const amountClass =
            transaction.type === "income"
                ? "income-amount"
                : "expense-amount";


        // + or -
        const sign =
            transaction.type === "income"
                ? "+"
                : "-";


        // ===============================
        // FORMAT DATE
        // ===============================

        let formattedDate = "-";


        if (transaction.date) {

            const parts =
                transaction.date.split("-");


            formattedDate =
                `${parts[2]}-${parts[1]}-${parts[0]}`;

        }


        // ===============================
        // TABLE ROW
        // ===============================

        row.innerHTML = `

            <td>
                ${escapeHTML(transaction.description)}
            </td>

            <td>
                ${escapeHTML(transaction.category)}
            </td>

            <td>

                ${transaction.type === "income"
                    ? "Income"
                    : "Expense"}

            </td>

            <td>
                ${formattedDate}
            </td>

            <td class="${amountClass}">

                ${sign} ₹${transaction.amount.toFixed(2)}

            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="editTransaction(${transaction.id})"
                    title="Edit Transaction"
                >

                    <i class="bi bi-pencil"></i>

                </button>


                <button
                    class="delete-btn"
                    onclick="deleteTransaction(${transaction.id})"
                    title="Delete Transaction"
                >

                    <i class="bi bi-trash"></i>

                </button>

            </td>

        `;


        transactionList.appendChild(row);

    });


    updateSummary();

}


// ===============================
// UPDATE TOTALS
// ===============================

function updateSummary() {

    let totalIncome = 0;

    let totalExpense = 0;


    transactions.forEach(function (transaction) {

        if (transaction.type === "income") {

            totalIncome += transaction.amount;

        } else {

            totalExpense += transaction.amount;

        }

    });


    // Calculate Balance
    const balance =
        totalIncome - totalExpense;


    // Display Values
    incomeDisplay.textContent =
        `₹${totalIncome.toFixed(2)}`;


    expenseDisplay.textContent =
        `₹${totalExpense.toFixed(2)}`;


    balanceDisplay.textContent =
        `₹${balance.toFixed(2)}`;

}


// ===============================
// EDIT TRANSACTION
// ===============================

function editTransaction(id) {

    const transaction =
        transactions.find(function (item) {

            return item.id === id;

        });


    if (!transaction) {

        return;

    }


    // Fill Form

    descriptionInput.value =
        transaction.description;


    amountInput.value =
        transaction.amount;


    typeInput.value =
        transaction.type;


    categoryInput.value =
        transaction.category;


    dateInput.value =
        transaction.date;


    // Remember Transaction ID

    editingId = id;


    // Change Button

    submitBtn.innerHTML =
        '<i class="bi bi-pencil"></i> Update Transaction';


    // Scroll to Form

    transactionForm.scrollIntoView({

        behavior: "smooth",
        block: "center"

    });

}


// ===============================
// DELETE TRANSACTION
// ===============================

function deleteTransaction(id) {

    transactions =
        transactions.filter(function (transaction) {

            return transaction.id !== id;

        });


    // Reset Edit Mode if Needed

    if (editingId === id) {

        editingId = null;

        transactionForm.reset();

        setTodayDate();

        submitBtn.innerHTML =
            '<i class="bi bi-plus-circle"></i> Add Transaction';

    }


    saveTransactions();

    displayTransactions();

}


// ===============================
// CLEAR ALL TRANSACTIONS
// ===============================

clearAllBtn.addEventListener("click", function () {


    // Check if Empty

    if (transactions.length === 0) {

        alert("There are no transactions to clear.");

        return;

    }


    // Confirmation

    const confirmClear =
        confirm(
            "Are you sure you want to delete all transactions?"
        );


    if (confirmClear) {


        // Delete All

        transactions = [];


        // Exit Edit Mode

        editingId = null;


        // Reset Form

        transactionForm.reset();

        setTodayDate();


        // Reset Button

        submitBtn.innerHTML =
            '<i class="bi bi-plus-circle"></i> Add Transaction';


        // Save

        saveTransactions();


        // Refresh

        displayTransactions();


        alert(
            "All transactions have been deleted."
        );

    }

});


// ===============================
// SAVE TO LOCAL STORAGE
// ===============================

function saveTransactions() {

    localStorage.setItem(

        "transactions",

        JSON.stringify(transactions)

    );

}


// ===============================
// SET TODAY'S DATE
// ===============================

function setTodayDate() {

    const now = new Date();


    const localDate =
        new Date(
            now.getTime() -
            now.getTimezoneOffset() * 60000
        )
        .toISOString()
        .split("T")[0];


    dateInput.value = localDate;

}


// ===============================
// SECURITY
// ===============================

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent = text;


    return div.innerHTML;

}


// ===============================
// START APP
// ===============================

setTodayDate();

displayTransactions();