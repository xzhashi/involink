
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface RevenueChartCardProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
    }[];
    currencyCode: string;
  };
}

const RevenueChartCard: React.FC<RevenueChartCardProps> = ({ data }) => {

    const chartData = {
        labels: data.labels,
        datasets: [{
            fill: true,
            label: data.datasets[0].label,
            data: data.datasets[0].data,
            borderColor: 'rgba(167, 139, 250, 1)', // A nice purple
            backgroundColor: (context: any) => {
                const ctx = context.chart.ctx;
                if (!ctx) return 'rgba(167, 139, 250, 0)';
                const gradient = ctx.createLinearGradient(0, 0, 0, 250);
                gradient.addColorStop(0, 'rgba(167, 139, 250, 0.4)');
                gradient.addColorStop(1, 'rgba(167, 139, 250, 0)');
                return gradient;
            },
            tension: 0.4, // For smooth curves
            pointBackgroundColor: 'rgba(167, 139, 250, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(167, 139, 250, 1)',
            pointRadius: 4,
            pointHoverRadius: 6,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
                mode: 'index' as const,
                intersect: false,
                backgroundColor: 'rgba(17, 24, 39, 0.85)', // bg-gray-900
                titleColor: '#fff',
                bodyColor: '#fff',
                titleFont: { size: 14, weight: 'bold' as const },
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: function(context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: data.currencyCode || 'USD' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#94a3b8', // slate-400
                },
                border: {
                    display: false,
                },
            },
            y: {
                grid: {
                    color: '#e2e8f0', // slate-200
                    borderDash: [5, 5],
                    drawBorder: false,
                },
                ticks: {
                    color: '#94a3b8',
                    callback: function(value: any) {
                        if (Number(value) >= 1000) {
                            return (Number(value) / 1000) + 'k';
                        }
                        return value;
                    }
                },
                beginAtZero: true,
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 h-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Revenue Overview (Last 12 Months)</h3>
            <div className="h-72">
                <Line options={options} data={chartData} />
            </div>
        </div>
    );
};

export default RevenueChartCard;
