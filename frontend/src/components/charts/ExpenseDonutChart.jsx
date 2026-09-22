import React, { useEffect, useRef } from 'react';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { useFinTrack, CATEGORY_STYLES } from '../../context/FinTrackContext';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

const ExpenseDonutChart = ({ filterAccountId = 'all' }) => {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const { getMetrics, formatCurrency } = useFinTrack();

  const metrics = getMetrics(filterAccountId);
  const breakdown = metrics.categoryBreakdown;
  const categories = Object.keys(breakdown);
  const amounts = Object.values(breakdown);
  const totalExpense = metrics.totalExpense;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    if (categories.length === 0 || totalExpense === 0) {
      chartInstanceRef.current = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: ['No Data'],
          datasets: [{
            data: [1],
            backgroundColor: ['#F1F5F9'],
            borderWidth: 0,
            hoverOffset: 0,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
          },
        },
      });
      return;
    }

    const bgColors = categories.map(cat => (CATEGORY_STYLES[cat] ? CATEGORY_STYLES[cat].color : '#94A3B8'));

    chartInstanceRef.current = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{
          data: amounts,
          backgroundColor: bgColors,
          borderWidth: 2,
          borderColor: document.documentElement.classList.contains('dark') ? '#1E293B' : '#FFFFFF',
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        animation: {
          animateRotate: true,
          duration: 400,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                const val = context.parsed;
                const pct = totalExpense > 0 ? ((val / totalExpense) * 100).toFixed(0) : 0;
                return ` ${context.label}: ${formatCurrency(val)} (${pct}%)`;
              },
            },
            backgroundColor: '#0F172A',
            padding: 8,
            titleFont: { size: 11, weight: 'bold' },
            bodyFont: { size: 11 },
            cornerRadius: 8,
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [categories.join(','), amounts.join(','), totalExpense, formatCurrency]);

  return (
    <div className="tilt-card md:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-card p-4 sm:p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-900">Annual Expense Breakdown</h2>
      </div>

      {/* Chart Area */}
      <div className="relative w-full flex items-center justify-center h-48 sm:h-56 my-2">
        <canvas ref={canvasRef} className="max-h-56"></canvas>

        {/* Donut Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span id="donut-total" className="text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(totalExpense)}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total</span>
        </div>
      </div>

      {/* Donut Legend */}
      <div id="donut-legend" className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
        {categories.length === 0 ? (
          <div className="col-span-3 text-center text-slate-400 text-xs py-2">
            No expenses recorded yet.
          </div>
        ) : (
          categories.map((cat, i) => {
            const color = CATEGORY_STYLES[cat]?.color || '#94A3B8';
            const amt = amounts[i];
            const pct = totalExpense > 0 ? ((amt / totalExpense) * 100).toFixed(0) : 0;
            return (
              <div key={cat} className="flex items-center gap-1.5 truncate" title={`${cat}: ${formatCurrency(amt)} (${pct}%)`}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></span>
                <span className="truncate">{cat}</span>
                <span className="text-slate-400 font-normal ml-auto text-[10px]">{pct}%</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExpenseDonutChart;
