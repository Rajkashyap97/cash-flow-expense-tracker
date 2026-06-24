let salary = 0;
let expenses = []; // [{id, name, amount}]
let pieChart = null;
let currentRate = 1;
let currentCurrency = 'INR';
let currencySymbol = '₹';

const SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' };

// ─── INIT ────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  renderAll();
  fetchRate('INR');
});

// ─── STORAGE ─────────────────────────────────────────────────────────────────
function saveToStorage() {
  localStorage.setItem('cf_salary', JSON.stringify(salary));
  localStorage.setItem('cf_expenses', JSON.stringify(expenses));
}

function loadFromStorage() {
  const s = localStorage.getItem('cf_salary');
  const e = localStorage.getItem('cf_expenses');
  if (s) salary = JSON.parse(s);
  if (e) expenses = JSON.parse(e);
}

// ─── SALARY ──────────────────────────────────────────────────────────────────
function setSalary() {
  clearErrors();
  const val = parseFloat(document.getElementById('salary-input').value);
  if (isNaN(val) || val <= 0) {
    showError('err-salary', 'salary-input');
    return;
  }
  salary = val;
  saveToStorage();
  renderAll();
  document.getElementById('salary-input').value = '';
}

// ─── ADD EXPENSE ──────────────────────────────────────────────────────────────
function addExpense() {
  clearErrors();
  const name = document.getElementById('exp-name').value.trim();
  const amount = parseFloat(document.getElementById('exp-amount').value);
  let valid = true;

  if (!name) { showError('err-name', 'exp-name'); valid = false; }
  if (isNaN(amount) || amount <= 0) { showError('err-amount', 'exp-amount'); valid = false; }
  if (!valid) return;
  if (salary === 0) { alert('Please set your salary first!'); return; }

  expenses.push({ id: Date.now(), name, amount });
  saveToStorage();
  renderAll();
  document.getElementById('exp-name').value = '';
  document.getElementById('exp-amount').value = '';
}

// ─── DELETE EXPENSE ───────────────────────────────────────────────────────────
function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  saveToStorage();
  renderAll();
}

// ─── CLEAR ALL ────────────────────────────────────────────────────────────────
function clearAll() {
  if (!confirm('Clear salary and all expenses?')) return;
  salary = 0;
  expenses = [];
  saveToStorage();
  renderAll();
}

// ─── RENDER ───────────────────────────────────────────────────────────────────
function renderAll() {
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const balance = salary - totalExp;
  const converted = (v) => (v * currentRate).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  const fmt = (v) => `${currencySymbol}${converted(v)}`;

  // Stats
  document.getElementById('stat-salary').textContent  = salary   ? fmt(salary)   : '—';
  document.getElementById('stat-expense').textContent = totalExp ? fmt(totalExp) : '—';
  document.getElementById('stat-balance').textContent = salary   ? fmt(balance)  : '—';

  // Danger threshold (Phase 3)
  const balEl = document.getElementById('stat-balance');
  const alertBanner = document.getElementById('alert-banner');
  if (salary > 0 && balance < salary * 0.1) {
    balEl.classList.add('danger');
    alertBanner.classList.add('show');
  } else {
    balEl.classList.remove('danger');
    alertBanner.classList.remove('show');
  }

  // Expense list
  const ul = document.getElementById('expense-list');
  ul.innerHTML = '';
  if (expenses.length === 0) {
    ul.innerHTML = '<li class="empty-state">No expenses yet. Add one →</li>';
  } else {
    expenses.forEach(exp => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="exp-name">${escHtml(exp.name)}</span>
        <span class="exp-amount">${fmt(exp.amount)}</span>
        <button class="btn-delete" onclick="deleteExpense(${exp.id})" title="Delete">🗑</button>`;
      ul.appendChild(li);
    });
  }

  renderChart(totalExp, balance);
}

// ─── CHART ────────────────────────────────────────────────────────────────────
function renderChart(totalExp, balance) {
  const ctx = document.getElementById('pie-chart').getContext('2d');
  const data = {
    labels: ['Expenses', 'Remaining'],
    datasets: [{
      data: totalExp > 0 || salary > 0
        ? [Math.max(totalExp, 0), Math.max(balance, 0)]
        : [1, 0],
      backgroundColor: ['#ff6584cc', '#00e5a0cc'],
      borderColor: ['#ff6584', '#00e5a0'],
      borderWidth: 2,
      hoverOffset: 8
    }]
  };

  if (pieChart) {
    pieChart.data = data;
    pieChart.update();
  } else {
    pieChart = new Chart(ctx, {
      type: 'doughnut',
      data,
      options: {
        responsive: false,
        plugins: {
          legend: {
            labels: { color: '#e8eaf0', font: { family: 'Inter', size: 13 } }
          },
          tooltip: {
            callbacks: {
              label: (c) =>
                ` ${currencySymbol}${(c.parsed * currentRate).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
            }
          }
        },
        cutout: '62%'
      }
    });
  }
}

// ─── CURRENCY (Phase 3) ───────────────────────────────────────────────────────
async function changeCurrency() {
  const sel = document.getElementById('currency-select').value;
  currentCurrency = sel;
  currencySymbol = SYMBOLS[sel] || sel + ' ';
  document.getElementById('currency-rate').textContent = 'Fetching…';
  await fetchRate(sel);
  renderAll();
}

async function fetchRate(to) {
  if (to === 'INR') {
    currentRate = 1;
    document.getElementById('currency-rate').textContent = '';
    return;
  }
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=INR&to=${to}`);
    const data = await res.json();
    currentRate = data.rates[to];
    document.getElementById('currency-rate').textContent =
      `1 INR = ${currentRate.toFixed(5)} ${to}`;
  } catch {
    document.getElementById('currency-rate').textContent = 'Rate unavailable';
    currentRate = 1;
  }
}

// ─── PDF (Phase 3) ────────────────────────────────────────────────────────────
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const totalExp = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const balance = salary - totalExp;

  doc.setFontSize(20);
  doc.text("Cash Flow Expense Report", 20, 20);

  doc.setFontSize(10);
  doc.text("Generated: " + new Date().toLocaleString(), 20, 30);

  doc.setFontSize(14);
  doc.text("Summary", 20, 45);

  doc.setFontSize(12);
  doc.text(`Total Salary: ${salary}`, 20, 55);
  doc.text(`Total Expenses: ${totalExp}`, 20, 65);
  doc.text(`Remaining Balance: ${balance}`, 20, 75);

  doc.setFontSize(14);
  doc.text("Expense Breakdown", 20, 95);

  let y = 110;

  expenses.forEach((expense, index) => {
    doc.text(
      `${index + 1}. ${expense.name} - ${expense.amount}`,
      20,
      y
    );
    y += 10;
  });

  doc.save("cashflow-report.pdf");
}
// ─── HELPERS ──────────────────────────────────────────────────────────────────
function showError(errId, inputId) {
  document.getElementById(errId).classList.add('show');
  document.getElementById(inputId).classList.add('error');
}

function clearErrors() {
  document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('show'));
  document.querySelectorAll('input').forEach(el => el.classList.remove('error'));
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}