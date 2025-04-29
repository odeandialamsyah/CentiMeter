// Check authentication
if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = 'login.html';
}

// DOM Elements
const navLinks = document.querySelectorAll('nav a');
const sections = document.querySelectorAll('.section');
const emosiForm = document.getElementById('emosi-form');
const riwayatTable = document.getElementById('riwayat-table').querySelector('tbody');
const logoutBtn = document.getElementById('logout-btn');
const starRating = document.querySelector('.star-rating');
const emosiInputs = document.querySelectorAll('input[name="jenis-emosi"]');

// Handle emotion change for star colors
emosiInputs.forEach(input => {
    input.addEventListener('change', (e) => {
        starRating.dataset.emotion = e.target.value;
    });
});

// Set initial emotion color
starRating.dataset.emotion = 'senang';

// State
let emosiData = getEmotions();

// Initialize data
const user = getUser();
if (!user) {
    window.location.href = 'login.html';
}

// Charts
let emosiChart;
let intensitasChart;

// Download functions
function downloadCSV() {
    const emotions = getEmotions();
    let csvContent = 'Tanggal,Jenis Emosi,Intensitas,Catatan\n';
    
    emotions.forEach(entry => {
        const row = [
            entry.date,
            entry.type,
            entry.intensity,
            entry.notes?.replace(/"/g, '""') || ''
        ].map(field => `"${field}"`).join(',');
        csvContent += row + '\n';
    });
    
    downloadFile(csvContent, 'statistik_emosi.csv', 'text/csv');
}

function downloadJSON() {
    const emotions = getEmotions();
    const jsonContent = JSON.stringify(emotions, null, 2);
    downloadFile(jsonContent, 'statistik_emosi.json', 'application/json');
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type: type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.id === 'logout-btn') {
            removeUser();
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'login.html';
            return;
        }
        e.preventDefault();
        updateActiveSection(e.target.getAttribute('href').substring(1));
    });
});

function updateActiveSection(sectionId) {
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });

    sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId) {
            section.classList.add('active');
        }
    });
}



// Emosi Form Handler
emosiForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newEmosi = {
        date: new Date().toISOString().split('T')[0],
        type: document.querySelector('input[name="jenis-emosi"]:checked').value,
        intensity: parseInt(document.querySelector('input[name="intensitas"]:checked').value),
        notes: document.getElementById('catatan').value
    };

    if (saveEmotion(newEmosi)) {
        emosiData = getEmotions(); // Refresh data from localStorage
        updateRiwayat();
        updateStatistik();
        emosiForm.reset();
        alert('Data emosi berhasil disimpan!');
    } else {
        alert('Gagal menyimpan data. Silakan login kembali.');
        window.location.href = 'login.html';
    }
});

// Update Riwayat Table
function updateRiwayat() {
    riwayatTable.innerHTML = '';
    emosiData.forEach(data => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.date}</td>
            <td>${data.type}</td>
            <td>${data.intensity}</td>
            <td>${data.notes || '-'}</td>
        `;
        riwayatTable.appendChild(row);
    });
}

// Update Statistik with Charts
function updateStatistik() {
    // Prepare data for charts
    const emosiCount = {};
    emosiData.forEach(data => {
        emosiCount[data.type] = (emosiCount[data.type] || 0) + 1;
    });

    // Prepare data for line chart (last 7 entries)
    const lastSevenEntries = [...emosiData]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 7)
        .reverse();

    // Update or create Emosi Distribution Chart
    if (emosiChart) emosiChart.destroy();
    const emosiCtx = document.getElementById('emosiChart').getContext('2d');
    emosiChart = new Chart(emosiCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(emosiCount).map(type => type.charAt(0).toUpperCase() + type.slice(1)),
            datasets: [{
                data: Object.values(emosiCount),
                backgroundColor: [
                    'rgba(76, 175, 80, 0.8)',  // Senang - Green
                    'rgba(255, 87, 34, 0.8)',  // Stres - Orange
                    'rgba(33, 150, 243, 0.8)'  // Sedih - Blue
                ],
                borderColor: [
                    'rgba(76, 175, 80, 1)',
                    'rgba(255, 87, 34, 1)',
                    'rgba(33, 150, 243, 1)'
                ],
                borderWidth: 2,
                hoverBackgroundColor: [
                    'rgba(76, 175, 80, 1)',
                    'rgba(255, 87, 34, 1)',
                    'rgba(33, 150, 243, 1)'
                ],
                hoverBorderColor: '#fff',
                hoverBorderWidth: 4
            }]
        },
        options: {
            responsive: true,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14,
                            family: '"Poppins", sans-serif'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        family: '"Poppins", sans-serif'
                    },
                    bodyFont: {
                        size: 13,
                        family: '"Poppins", sans-serif'
                    },
                    displayColors: true,
                    callbacks: {
                        label: (context) => {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    });

    // Update or create Intensitas Trend Chart
    if (intensitasChart) intensitasChart.destroy();
    const intensitasCtx = document.getElementById('intensitasChart').getContext('2d');
    const gradientFill = intensitasCtx.createLinearGradient(0, 0, 0, 400);
    gradientFill.addColorStop(0, 'rgba(76, 175, 80, 0.6)');
    gradientFill.addColorStop(1, 'rgba(76, 175, 80, 0.1)');

    intensitasChart = new Chart(intensitasCtx, {
        type: 'line',
        data: {
            labels: lastSevenEntries.map(entry => {
                const date = new Date(entry.date);
                return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            }),
            datasets: [{
                label: 'Intensitas Emosi',
                data: lastSevenEntries.map(entry => entry.intensity),
                borderColor: '#4CAF50',
                borderWidth: 3,
                pointBackgroundColor: '#4CAF50',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHoverBorderWidth: 3,
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#4CAF50',
                tension: 0.4,
                fill: true,
                backgroundColor: gradientFill
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            family: '"Poppins", sans-serif'
                        },
                        stepSize: 1
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            family: '"Poppins", sans-serif'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 14,
                        family: '"Poppins", sans-serif'
                    },
                    bodyFont: {
                        size: 13,
                        family: '"Poppins", sans-serif'
                    },
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        title: (items) => {
                            return `Tanggal: ${items[0].label}`;
                        },
                        label: (item) => {
                            return `Intensitas: ${item.raw}`;
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Initialize everything when the page loads
window.addEventListener('load', () => {
    updateRiwayat();
    updateStatistik();

    // Download buttons
    document.getElementById('download-csv').addEventListener('click', downloadCSV);
    document.getElementById('download-json').addEventListener('click', downloadJSON);
});
