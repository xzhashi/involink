
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TopClientsChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
    }[];
  };
}

const TopClientsChart: React.FC<TopClientsChartProps> = ({ data }) => {
  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top Clients by Revenue',
        font: { size: 16 }
      },
    },
     scales: {
        x: {
            beginAtZero: true
        }
    }
  };

  return <Bar options={options} data={data} />;
};

export default TopClientsChart;
