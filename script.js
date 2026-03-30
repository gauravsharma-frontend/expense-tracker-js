// ================== GLOBAL DATA ==================
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

let monthlyIncome = 0;
let monthlyExpenses = 0;
let isLogin = true;

// ================== NAVBAR ==================
function renderNavbar() {
    const navRight = document.getElementById("navRight");

    if (!currentUser) {
        navRight.innerHTML = `
            <button class="nav-btn" onclick="openLogin()">Login</button>
            <button class="nav-btn primary" onclick="openSignup()">Sign Up</button>
        `;
    } else {
        navRight.innerHTML = `
            <span class="user-name">👤 ${currentUser.name}</span>
            <button class="nav-btn" onclick="logout()">Logout</button>
        `;
    }
}

// ================== MODAL OPEN ==================
function openIncomeModel() {
    document.getElementById("incomeModel").style.display = "block";
}

function openExpenseModel() {
    document.getElementById("expenseModal").style.display = "block";
}

// ================== AUTH MODAL ==================
function openLogin() {
    isLogin = true;
    document.getElementById("authModal").style.display = "block";

    document.getElementById("authTitle").textContent = "Login";
    document.getElementById("nameField").style.display = "none";
    document.getElementById("cardField").style.display = "none";
    document.getElementById("limitField").style.display = "none";
}

function openSignup() {
    isLogin = false;
    document.getElementById("authModal").style.display = "block";

    document.getElementById("authTitle").textContent = "Sign Up";
    document.getElementById("nameField").style.display = "block";
    document.getElementById("cardField").style.display = "block";
    document.getElementById("limitField").style.display = "block";
}

function toggleAuth() {
    isLogin ? openSignup() : openLogin();
}

// ================== AUTH ==================
function handleAuth() {
    const email = document.getElementById("authEmail").value;
    const password = document.getElementById("authPassword").value;

    if (!email || !password) {
        alert("Fill all fields");
        return;
    }

    if (!isLogin) {
        // SIGNUP
        const exists = users.find(u => u.email === email);
        if (exists) {
            alert("Email already exists");
            return;
        }

        const name = document.getElementById("authName").value;
        const card = document.getElementById("authCard").value;
        const limit = document.getElementById("authLimit").value;

        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            card,
            limit
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        alert("Signup successful! Please login");
        openLogin();

    } else {
        // LOGIN
        const user = users.find(
            u => u.email === email && u.password === password
        );

        if (!user) {
            alert("Invalid credentials");
            return;
        }

        currentUser = user;
        localStorage.setItem("currentUser", JSON.stringify(user));

        closeModal("authModal");
        renderNavbar();
        loadUserData();
        showNotification("Login successful");
    }
}

// ================== LOGOUT ==================
function logout() {
    localStorage.removeItem("currentUser");

    currentUser = null;
    transactions = [];
    localStorage.removeItem("transactions");

    resetUI();
    renderNavbar();

    showNotification("Logged out");
}

// ================== RESET UI ==================
function resetUI() {
    document.querySelector(".card-holder").textContent = "Guest";
    document.querySelector(".card-number").textContent = "XXXX XXXX XXXX XXXX";
    document.querySelector(".income-amount").textContent = "₹0";
    document.querySelector(".expense-amount").textContent = "₹0";
    document.querySelector(".progress-fill").style.width = "0%";
    document.querySelector(".transactions-table tbody").innerHTML = "";
}

// ================== LOAD USER ==================
function loadUserData() {
    if (!currentUser) return;

    document.querySelector(".card-holder").textContent = currentUser.name;
    document.querySelector(".card-number").textContent = currentUser.card;

    updateDashboard();
}

// ================== SAVE ==================
function saveData() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// ================== ADD INCOME ==================
function addIncome() {
    if (!currentUser) {
        showNotification("Login required");
        return;
    }

    const amount = +document.getElementById("incomeAmount").value;
    const category = document.getElementById("incomeCategory").value;
    const date = document.getElementById("incomeDate").value;

    if (!amount || !category || !date) {
        alert("Fill all fields");
        return;
    }

    transactions.unshift({
        id: Date.now(),
        date,
        category,
        amount,
        type: "income",
        status: "success"
    });

    saveData();
    updateDashboard();
    updateTransactionTable();
    closeModal("incomeModel");
}

// ================== ADD EXPENSE ==================
function addExpense() {
    if (!currentUser) {
        showNotification("Login required");
        return;
    }

    const amount = +document.getElementById("expenseAmount").value;
    const category = document.getElementById("expenseCategory").value;
    const date = document.getElementById("expenseDate").value;

    if (!amount || !category || !date) {
        alert("Fill all fields");
        return;
    }

    transactions.unshift({
        id: Date.now(),
        date,
        category,
        amount: -amount,
        type: "expense",
        status: "success"
    });

    saveData();
    updateDashboard();
    updateTransactionTable();
    closeModal("expenseModal");
}

// ================== DASHBOARD ==================
function updateDashboard() {
    monthlyIncome = 0;
    monthlyExpenses = 0;

    transactions.forEach(t => {
        if (t.amount > 0) monthlyIncome += t.amount;
        else monthlyExpenses += Math.abs(t.amount);
    });

    document.querySelector(".income-amount").textContent = `₹${monthlyIncome}`;
    document.querySelector(".expense-amount").textContent = `₹${monthlyExpenses}`;

    let limit = currentUser?.limit || 20000;
    let percent = (monthlyExpenses / limit) * 100;

    document.querySelector(".spending-limit").textContent = `₹${limit - monthlyExpenses}`;
    document.querySelector(".progress-fill").style.width =
        `${Math.min(percent, 100)}%`;
}

// ================== TABLE ==================
function updateTransactionTable() {
    const tbody = document.querySelector(".transactions-table tbody");
    tbody.innerHTML = "";

    transactions.slice(0, 10).forEach(t => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${t.date}</td>
            <td>${t.category}</td>
            <td style="color:${t.amount > 0 ? 'green' : 'red'}">
                ₹${t.amount}
            </td>
            <td>${t.status}</td>
            <td>
                <button onclick="deleteTransaction(${t.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// ================== DELETE ==================
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveData();
    updateDashboard();
    updateTransactionTable();
}

// ================== NOTIFICATION ==================
function showNotification(msg) {
    alert(msg);
}

// ================== MODAL CLOSE ==================
function closeModal(id) {
    document.getElementById(id).style.display = "none";
}

// ================== INIT ==================
renderNavbar();
loadUserData();
updateDashboard();
updateTransactionTable();