import React, { useEffect, useRef } from 'react';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { useFinTrack } from '../../context/FinTrackContext';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const AccountBarChart = ({ txList = [] }) => {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const { formatCurrency, theme } = useFinTrack();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    // Aggregate income & expenses by unique date
    const dateMap = {};
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

    if (labels.length === 0) {
      labels = ['No Transactions'];
      incomeData = [0];
      expenseData = [0];
    }

    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(241, 245, 249, 0.9)';
    const textColor = isDark ? '#94A3B8' : '#64748B';

    chartInstanceRef.current = new Chart(canvas, {
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
          },
        ],
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
            ticks: { color: textColor, font: { size: 11, family: 'Inter' } },
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { size: 10, family: 'Inter' },
              callback: function (val) {
                return formatCurrency(val);
              },
            },
          },
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
              font: { size: 11, weight: '600' },
            },
          },
          tooltip: {
            backgroundColor: '#0F172A',
            padding: 10,
            cornerRadius: 8,
            titleFont: { size: 12, weight: 'bold' },
            callbacks: {
              label: function (ctx) {
                return ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`;
              },
            },
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
  }, [txList, formatCurrency, theme]);

  return (
    <div className="relative w-full h-56 sm:h-72">
      <canvas ref={canvasRef} id="accountBarChart" />
    </div>
  );
};

export default AccountBarChart;
