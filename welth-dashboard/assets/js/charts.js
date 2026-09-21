/**
 * charts.js — FinTrack Charts
 * Renders the Annual Expense Breakdown Donut Chart and its dynamic legend.
 */

const CATEGORY_STYLES = {
  Groceries:     { color: '#2563EB', icon: '🛒' },
  Housing:       { color: '#EC4899', icon: '🏠' },
  Transport:     { color: '#F59E0B', icon: '🚗' },
  Subscriptions: { color: '#10B981', icon: '📱' },
  Shopping:      { color: '#06B6D4', icon: '🛍️' },
  Dining:        { color: '#FB923C', icon: '🍽️' },
  Utilities:     { color: '#8B5CF6', icon: '⚡' },
  Other:         { color: '#94A3B8', icon: '📦' },
};

let accountBarChartInstance = null;

function renderExpenseDonutChart(filterAccountId = 'all') {
  const canvas = document.getElementById('expenseDonutChart');
  const totalDisplay = document.getElementById('donut-total');
  const legendContainer = document.getElementById('donut-legend');

  if (!canvas) return;

  const metrics = FinTrackDB.getMetrics(filterAccountId);
  const breakdown = metrics.categoryBreakdown;
  const categories = Object.keys(breakdown);
  const amounts = Object.values(breakdown);
  const totalExpense = metrics.totalExpense;

  // Update center total label
  if (totalDisplay) {
    totalDisplay.textContent = formatUSD(totalExpense);
  }

  // Destroy previous chart instance if exists
  if (donutChartInstance) {
    donutChartInstance.destroy();
    donutChartInstance = null;
  }

  // If no expense data yet
  if (categories.length === 0 || totalExpense === 0) {
    donutChartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['No Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['#F1F5F9'],
          borderWidth: 0,
          hoverOffset: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    });

    if (legendContainer) {
      legendContainer.innerHTML = `
        <div class="col-span-3 text-center text-slate-400 text-xs py-2">
          No expenses recorded yet.
        </div>
      `;
    }
    return;
  }

  // Dynamic colors based on categories
  const bgColors = categories.map(cat => (CATEGORY_STYLES[cat] ? CATEGORY_STYLES[cat].color : '#94A3B8'));

  donutChartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: categories,
      datasets: [{
        data: amounts,
        backgroundColor: bgColors,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      animation: {
        animateRotate: true,
        duration: 500
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              const val = context.parsed;
              const pct = totalExpense > 0 ? ((val / totalExpense) * 100).toFixed(0) : 0;
              return ` ${context.label}: ${formatUSD(val)} (${pct}%)`;
            }
          },
          backgroundColor: '#0F172A',
          padding: 8,
          titleFont: { size: 11, weight: 'bold' },
          bodyFont: { size: 11 },
          cornerRadius: 8,
        }
      }
    }
  });

  // Render Legend
  if (legendContainer) {
    legendContainer.innerHTML = categories.map((cat, i) => {
      const color = bgColors[i];
      const amt = amounts[i];
      const pct = totalExpense > 0 ? ((amt / totalExpense) * 100).toFixed(0) : 0;
      return `
        <div class="flex items-center gap-1.5 truncate" title="${cat}: ${formatUSD(amt)} (${pct}%)">
          <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: ${color}"></span>
          <span class="text-slate-600 truncate">${cat}</span>
          <span class="text-slate-400 font-normal ml-auto text-[10px]">${pct}%</span>
        </div>
      `;
    }).join('');
  }
}

/* ═══════════════════════ ACCOUNT TRANSACTION OVERVIEW BAR CHART ═══════════════════════ */

function renderAccountBarChart(canvasId, txList = []) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  if (accountBarChartInstance) {
    accountBarChartInstance.destroy();
    accountBarChartInstance = null;
  }

  // Aggregate income & expenses by unique date
  const dateMap = {};
  
  // Sort transactions chronologically
  const sorted = [...txList].sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  sorted.forEach(t => {
    let dateLabel = t.date;
    try {
      const parts = t.date.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch {}

    if (!dateMap[dateLabel]) {
      dateMap[dateLabel] = { income: 0, expense: 0 };
    }
    const amt = Math.abs(Number(t.amount)) || 0;
    if (t.type === 'income') {
      dateMap[dateLabel].income += amt;
    } else {
      dateMap[dateLabel].expense += amt;
    }
  });

  let labels = Object.keys(dateMap);
  let incomeData = labels.map(l => dateMap[l].income);
  let expenseData = labels.map(l => dateMap[l].expense);

  // If empty, supply placeholder dates
  if (labels.length === 0) {
    labels = ['No Transactions'];
    incomeData = [0];
    expenseData = [0];
  }

  const isDark = document.documentElement.classList.contains('dark');
  const gridColor = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(241, 245, 249, 0.9)';
  const textColor = isDark ? '#94A3B8' : '#64748B';

  accountBarChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: '#10B981',
          borderRadius: 6,
          barPercentage: 0.5,
          categoryPercentage: 0.6,
        },
        {
          label: 'Expense',
          data: expenseData,
          backgroundColor: '#EF4444',
          borderRadius: 6,
          barPercentage: 0.5,
          categoryPercentage: 0.6,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textColor, font: { size: 11, family: 'Inter' } }
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            font: { size: 10, family: 'Inter' },
            callback: function (val) {
              return formatUSD(val);
            }
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            boxWidth: 12,
            usePointStyle: true,
            pointStyle: 'circle',
            color: textColor,
            font: { size: 11, weight: '600' }
          }
        },
        tooltip: {
          backgroundColor: '#0F172A',
          padding: 10,
          cornerRadius: 8,
          titleFont: { size: 12, weight: 'bold' },
          callbacks: {
            label: function (ctx) {
              return ` ${ctx.dataset.label}: ${formatUSD(ctx.parsed.y)}`;
            }
          }
        }
      }
    }
  });
}

// Format number using active Currency symbol from FinTrackDB
function formatUSD(val) {
  const num = Number(val) || 0;
  const curr = (typeof FinTrackDB !== 'undefined' && FinTrackDB.getCurrency) 
    ? FinTrackDB.getCurrency() 
    : { symbol: '$' };

  return curr.symbol + num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
