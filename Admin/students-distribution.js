// Configuration
const API_BASE_URL = 'course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Distribution'; 

// Chart instances
let distributionChart = null;
let batchChart = null;

// Data storage
let coursesData = [];

// Color schemes for charts
const CHART_COLORS = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
    '#4BC0C0', '#FF9F40', '#36A2EB', '#FFCE56'
];

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    loadData();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    const courseSelect = document.getElementById('course-select');
    courseSelect.addEventListener('change', function() {
        const selectedCourse = this.value;
        if (selectedCourse) {
            loadBatchData(selectedCourse);
        } else {
            clearBatchChart();
        }
    });
}

// Initialize Chart.js charts
function initializeCharts() {
    initializeDistributionChart();
    initializeBatchChart();
}

// Initialize the main distribution chart
function initializeDistributionChart() {
    const distributionCtx = document.getElementById('distributionChart').getContext('2d');
    
    distributionChart = new Chart(distributionCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Students per Course',
                data: [],
                backgroundColor: CHART_COLORS,
                borderWidth: 1,
                borderRadius: 8,
                borderSkipped: false,
                maxBarThickness: 80, // Limit bar width
                categoryPercentage: 0.6, // Reduce bar width relative to category
                barPercentage: 0.8 // Reduce bar width within category
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Student Distribution by Course',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return `Students: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10, // Fixed maximum of 10 for small numbers
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 12
                        },
                        // Force showing integer values only
                        callback: function(value, index, values) {
                            return Number.isInteger(value) ? value : '';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 12
                        },
                        maxRotation: 45
                    },
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Initialize the batch distribution chart
function initializeBatchChart() {
    const batchCtx = document.getElementById('batchChart').getContext('2d');
    
    batchChart = new Chart(batchCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: CHART_COLORS,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Students per Batch',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed * 100) / total).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

// Load course distribution data from API
async function loadData() {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/by-course`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        coursesData = await response.json();
        
        updateDistributionChart();
        updateStats();
        populateCourseSelect();
        hideError();
        hideLoading();
        
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load student distribution data. Please check your connection and try again.');
        hideLoading();
    }
}

// Load batch data for selected course
async function loadBatchData(courseId) {
    try {
        const response = await fetch(`${API_BASE_URL}/by-batch/${courseId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const batchData = await response.json();
        updateBatchChart(batchData);
        
    } catch (error) {
        console.error('Error loading batch data:', error);
        showError('Failed to load batch distribution data.');
    }
}

// Update the main distribution chart with new data
function updateDistributionChart() {
    const labels = coursesData.map(course => course.courseName);
    const data = coursesData.map(course => course.studentCount);
    
    // Calculate appropriate max value for better visual scaling
    const maxValue = Math.max(...data);
    let chartMax;
    
    if (maxValue <= 10) {
        chartMax = 10; // Show scale 0-10 for small numbers
    } else if (maxValue <= 50) {
        chartMax = Math.ceil(maxValue / 10) * 10; // Round to nearest 10
    } else {
        chartMax = Math.ceil(maxValue * 1.2); // Add 20% padding for large numbers
    }
    
    // Update chart data
    distributionChart.data.labels = labels;
    distributionChart.data.datasets[0].data = data;
    
    // Update y-axis max for better visual representation
    distributionChart.options.scales.y.max = chartMax;
    
    distributionChart.update('show');
}

// Update batch chart with new data
function updateBatchChart(batchData) {
    const labels = batchData.map(batch => batch.batchName);
    const data = batchData.map(batch => batch.studentCount);
    
    batchChart.data.labels = labels;
    batchChart.data.datasets[0].data = data;
    batchChart.update('show');
}

// Clear batch chart data
function clearBatchChart() {
    batchChart.data.labels = [];
    batchChart.data.datasets[0].data = [];
    batchChart.update();
}

// Update statistics display
function updateStats() {
    const totalStudents = coursesData.reduce((sum, course) => sum + course.studentCount, 0);
    const totalCourses = coursesData.length;
    const totalBatches = coursesData.reduce((sum, course) => sum + course.batches.length, 0);
    
    // Animate number changes
    animateNumber('total-students', totalStudents);
    animateNumber('total-courses', totalCourses);
    animateNumber('total-batches', totalBatches);
}

// Animate number counting effect
function animateNumber(elementId, targetNumber) {
    const element = document.getElementById(elementId);
    const currentNumber = parseInt(element.textContent) || 0;
    const increment = Math.max(1, Math.ceil((targetNumber - currentNumber) / 20));
    
    if (currentNumber < targetNumber) {
        element.textContent = Math.min(currentNumber + increment, targetNumber);
        setTimeout(() => animateNumber(elementId, targetNumber), 50);
    } else {
        element.textContent = targetNumber;
    }
}

// Populate course selection dropdown
function populateCourseSelect() {
    const select = document.getElementById('course-select');
    
    // Clear existing options except "All Courses"
    select.innerHTML = '<option value="">All Courses</option>';
    
    coursesData.forEach(course => {
        const option = document.createElement('option');
        option.value = course.courseId;
        option.textContent = course.courseName;
        select.appendChild(option);
    });
}

// Refresh all data
function refreshData() {
    // Reset course selection
    document.getElementById('course-select').value = '';
    clearBatchChart();
    
    // Reload data
    loadData();
}

// Export chart as image
function exportChart() {
    const canvas = document.getElementById('distributionChart');
    const url = canvas.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    link.download = `student-distribution-chart-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = url;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Utility functions for UI feedback
function showLoading() {
    // You can implement a loading spinner here
    console.log('Loading data...');
}

function hideLoading() {
    // Hide loading spinner
    console.log('Data loaded successfully');
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    const errorDiv = document.getElementById('error-message');
    errorDiv.style.display = 'none';
}

// Additional helper functions
function formatNumber(num) {
    return num.toLocaleString();
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Export functions for global access
window.refreshData = refreshData;
window.exportChart = exportChart;