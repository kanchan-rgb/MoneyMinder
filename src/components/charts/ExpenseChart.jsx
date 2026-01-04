import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function ExpenseChart({ type, data, title }) {
  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
        },
      },
    },
  };

  return (
    <div className="p-4 bg-card rounded-lg border">
      {type === 'bar' ? (
        <Bar data={data} options={barOptions} />
      ) : (
        <Doughnut data={data} options={doughnutOptions} />
      )}
    </div>
  );
}

// Function to create properly formatted chart data with colors
export function createExpenseChartData(categories, amounts) {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DDA0DD',
    '#FFB347',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
  ];

  return {
    labels: categories,
    datasets: [
      {
        label: 'Expenses',
        data: amounts,
        backgroundColor: colors.slice(0, categories.length),
        borderColor: colors
          .slice(0, categories.length)
          .map((color) => color + 'CC'),
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };
}

// Example usage component
export function ExpenseChartDemo() {
  const categories = ['Food', 'Transportation', 'Housing'];
  const amounts = [500, 300, 800];
  const chartData = createExpenseChartData(categories, amounts);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExpenseChart
          type="bar"
          data={chartData}
          title="Expenses by Category - Bar Chart"
        />
        <ExpenseChart
          type="doughnut"
          data={chartData}
          title="Expenses by Category"
        />
      </div>
    </div>
  );
}

// Chart using real expense data
export function ExpenseChartsFromData({ expenses }) {
  const categoryData = expenses.reduce((acc, expense) => {
    const category = expense.category || 'Other';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += expense.amount;
    return acc;
  }, {});

  const categories = Object.keys(categoryData);
  const amounts = Object.values(categoryData);

  const chartData = createExpenseChartData(categories, amounts);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ExpenseChart
        type="doughnut"
        data={chartData}
        title="Expenses by Category"
      />
      <ExpenseChart
        type="bar"
        data={chartData}
        title="Category Breakdown"
      />
    </div>
  );
}
