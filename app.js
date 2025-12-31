// Tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');

            // Refresh stats when switching to stats tab
            if (targetTab === 'stats') {
                // Small delay to ensure tab is visible before rendering charts
                setTimeout(() => {
                    initializeYearSelector();
                    updateStats();
                }, 100);
            }
        });
    });

    // Progressive form disclosure based on drink type
    const drinkTypeSelect = document.getElementById('drink-type');
    const placeField = document.getElementById('place-field');
    const itemField = document.getElementById('item-field');
    const brandField = document.getElementById('brand-field');
    const flavorField = document.getElementById('flavor-field');
    const submitBtn = document.getElementById('submit-btn');
    const drinkPlaceInput = document.getElementById('drink-place');
    const drinkItemInput = document.getElementById('drink-item');
    const drinkBrandInput = document.getElementById('drink-brand');
    const drinkFlavorInput = document.getElementById('drink-flavor');

    drinkTypeSelect.addEventListener('change', function() {
        const selectedType = this.value;
        
        // Hide all conditional fields first
        placeField.style.display = 'none';
        itemField.style.display = 'none';
        brandField.style.display = 'none';
        flavorField.style.display = 'none';
        submitBtn.style.display = 'none';
        
        // Remove required attributes
        drinkPlaceInput.removeAttribute('required');
        drinkItemInput.removeAttribute('required');
        drinkBrandInput.removeAttribute('required');
        drinkFlavorInput.removeAttribute('required');
        
        if (selectedType) {
            if (selectedType === 'energy-drink') {
                // Show brand and flavor fields for energy drinks
                brandField.style.display = 'block';
                flavorField.style.display = 'block';
                drinkBrandInput.setAttribute('required', 'required');
                drinkFlavorInput.setAttribute('required', 'required');
                
                // Focus on brand input
                setTimeout(() => {
                    drinkBrandInput.focus();
                }, 100);
            } else {
                // Show place and drink fields for boba, matcha, coffee, other
                placeField.style.display = 'block';
                itemField.style.display = 'block';
                drinkPlaceInput.setAttribute('required', 'required');
                drinkItemInput.setAttribute('required', 'required');
                
                // Focus on place input
                setTimeout(() => {
                    drinkPlaceInput.focus();
                }, 100);
            }
            
            submitBtn.style.display = 'block';
        }
    });

    // Drink form handling
    const drinkForm = document.getElementById('drink-form');
    drinkForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const drinkType = document.getElementById('drink-type').value;
        
        if (drinkType === 'energy-drink') {
            const drinkBrand = drinkBrandInput.value.trim();
            const drinkFlavor = drinkFlavorInput.value.trim();
            
            if (drinkType && drinkBrand && drinkFlavor) {
                addDrink(drinkType, null, null, drinkBrand, drinkFlavor);
                drinkForm.reset();
                // Hide conditional fields after reset
                brandField.style.display = 'none';
                flavorField.style.display = 'none';
                submitBtn.style.display = 'none';
                drinkBrandInput.removeAttribute('required');
                drinkFlavorInput.removeAttribute('required');
                updateBrandsList();
                updateFlavorsList();
            }
        } else {
            const drinkPlace = drinkPlaceInput.value.trim();
            const drinkItem = drinkItemInput.value.trim();
            
            if (drinkType && drinkPlace && drinkItem) {
                addDrink(drinkType, drinkPlace, drinkItem, null, null);
                drinkForm.reset();
                // Hide conditional fields after reset
                placeField.style.display = 'none';
                itemField.style.display = 'none';
                submitBtn.style.display = 'none';
                drinkPlaceInput.removeAttribute('required');
                drinkItemInput.removeAttribute('required');
                updatePlacesList();
                updateItemsList();
            }
        }
    });

    // Update all autocomplete lists on page load
    updatePlacesList();
    updateItemsList();
    updateBrandsList();
    updateFlavorsList();

    // Load drinks on page load
    loadDrinks();
    
    // Initialize year selector
    initializeYearSelector();
    
    updateStats();
});

// Drink data management
function getDrinks() {
    const drinks = localStorage.getItem('drinks');
    return drinks ? JSON.parse(drinks) : [];
}

function saveDrinks(drinks) {
    localStorage.setItem('drinks', JSON.stringify(drinks));
}

function addDrink(type, place, item, brand, flavor) {
    const drinks = getDrinks();
    const newDrink = {
        id: Date.now(),
        type: type,
        timestamp: new Date().toISOString()
    };
    
    // Add fields based on drink type
    if (type === 'energy-drink') {
        newDrink.brand = brand ? brand.trim() : brand;
        newDrink.flavor = flavor ? flavor.trim() : flavor;
    } else {
        // Normalize place and item to title case for consistency
        newDrink.place = place ? toTitleCase(place.trim()) : place;
        newDrink.item = item ? item.trim() : item;
    }
    
    drinks.unshift(newDrink);
    saveDrinks(drinks);
    loadDrinks();
    updateStats();
    updatePlacesList();
    updateItemsList();
    updateBrandsList();
    updateFlavorsList();
    
    // Switch to history tab to show the new drink
    const historyTab = document.querySelector('[data-tab="history"]');
    if (historyTab) {
        historyTab.click();
    }
}

// Helper function to convert text to title case
function toTitleCase(str) {
    return str.toLowerCase().split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

// Helper function to capitalize first letter only
function capitalize(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Get unique places from all drinks
function getUniquePlaces() {
    const drinks = getDrinks();
    const placesMap = new Map();
    
    drinks.forEach(drink => {
        // Handle both old data (size) and new data (place)
        if (drink.place) {
            const normalizedPlace = toTitleCase(drink.place.trim());
            placesMap.set(normalizedPlace.toLowerCase(), normalizedPlace);
        }
    });
    
    return Array.from(placesMap.values()).sort();
}

// Update the autocomplete datalist with unique places
function updatePlacesList() {
    const placesList = document.getElementById('places-list');
    if (!placesList) return;
    
    const uniquePlaces = getUniquePlaces();
    
    placesList.innerHTML = uniquePlaces.map(place => 
        `<option value="${place}">`
    ).join('');
}

// Get unique items from all drinks
function getUniqueItems() {
    const drinks = getDrinks();
    const items = new Set();
    
    drinks.forEach(drink => {
        if (drink.item) {
            items.add(drink.item.trim());
        }
    });
    
    return Array.from(items).sort();
}

// Update the autocomplete datalist with unique items
function updateItemsList() {
    const itemsList = document.getElementById('items-list');
    if (!itemsList) return;
    
    const uniqueItems = getUniqueItems();
    
    itemsList.innerHTML = uniqueItems.map(item => 
        `<option value="${item}">`
    ).join('');
}

// Get unique brands from all drinks
function getUniqueBrands() {
    const drinks = getDrinks();
    const brands = new Set();
    
    drinks.forEach(drink => {
        if (drink.brand) {
            brands.add(drink.brand.trim());
        }
    });
    
    return Array.from(brands).sort();
}

// Update the autocomplete datalist with unique brands
function updateBrandsList() {
    const brandsList = document.getElementById('brands-list');
    if (!brandsList) return;
    
    const uniqueBrands = getUniqueBrands();
    
    brandsList.innerHTML = uniqueBrands.map(brand => 
        `<option value="${brand}">`
    ).join('');
}

// Get unique flavors from all drinks
function getUniqueFlavors() {
    const drinks = getDrinks();
    const flavors = new Set();
    
    drinks.forEach(drink => {
        if (drink.flavor) {
            flavors.add(drink.flavor.trim());
        }
    });
    
    return Array.from(flavors).sort();
}

// Update the autocomplete datalist with unique flavors
function updateFlavorsList() {
    const flavorsList = document.getElementById('flavors-list');
    if (!flavorsList) return;
    
    const uniqueFlavors = getUniqueFlavors();
    
    flavorsList.innerHTML = uniqueFlavors.map(flavor => 
        `<option value="${flavor}">`
    ).join('');
}

function deleteDrink(id) {
    const drinks = getDrinks();
    const filteredDrinks = drinks.filter(drink => drink.id !== id);
    saveDrinks(filteredDrinks);
    loadDrinks();
    updateStats();
}

function loadDrinks() {
    const drinks = getDrinks();
    const drinksList = document.getElementById('drinks-list');

    if (drinks.length === 0) {
        drinksList.innerHTML = '<p class="empty-state">No drinks logged yet. Add your first drink above!</p>';
        return;
    }

    // Group drinks by month
    const drinksByMonth = {};
    
    drinks.forEach(drink => {
        const date = new Date(drink.timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        if (!drinksByMonth[monthKey]) {
            drinksByMonth[monthKey] = {
                label: monthLabel,
                drinks: []
            };
        }
        
        drinksByMonth[monthKey].drinks.push(drink);
    });
    
    // Sort months chronologically (newest first)
    const sortedMonths = Object.keys(drinksByMonth).sort().reverse();
    
    const drinkEmojis = {
        coffee: '☕',
        matcha: '🍵',
        boba: '🧋',
        tea: '🫖',
        'energy-drink': '⚡️',
        other: '🍹'
    };
    
    // Build HTML with month headers
    let html = '';
    
    sortedMonths.forEach(monthKey => {
        const monthData = drinksByMonth[monthKey];
        
        // Add month header
        html += `<div class="month-header-section">
            <h3 class="month-header-title">${monthData.label}</h3>
        </div>`;
        
        // Add drinks for this month
        monthData.drinks.forEach(drink => {
            const date = new Date(drink.timestamp);
            const timeString = formatTime(date);
            const dateString = formatDate(date);
            
            const emoji = drinkEmojis[drink.type] || '🍹';
            const typeLabel = drink.type === 'energy-drink' ? 'Energy Drink' : drink.type.charAt(0).toUpperCase() + drink.type.slice(1);
            
            // Build display based on drink type
            let mainTitle = `${emoji} ${typeLabel}`;
            let placeOrBrand = '';
            let drinkName = '';
            
            if (drink.type === 'energy-drink') {
                // For energy drinks, show brand (bold) and flavor below
                placeOrBrand = drink.brand ? toTitleCase(drink.brand) : '';
                drinkName = drink.flavor ? toTitleCase(drink.flavor) : '';
            } else {
                // For other drinks, show place (bold) and drink item below
                placeOrBrand = drink.place ? toTitleCase(drink.place) : '';
                drinkName = drink.item ? toTitleCase(drink.item) : '';
                // Handle legacy data
                if (!drink.item && !drink.place && drink.size) {
                    drinkName = `Size: ${drink.size}`;
                }
            }

            html += `
                <div class="drink-item" data-drink-id="${drink.id}">
                    <div class="drink-info">
                        <div class="drink-type">${mainTitle}</div>
                        ${placeOrBrand ? `<div class="drink-place-brand"><strong>${placeOrBrand}</strong></div>` : ''}
                        ${drinkName ? `<div class="drink-name">${drinkName}</div>` : ''}
                        <div class="drink-details">${dateString}</div>
                    </div>
                    <div class="drink-meta">
                        <div class="drink-time">${timeString}</div>
                        <button class="delete-btn" data-drink-id="${drink.id}" aria-label="Delete drink">
                            <span class="delete-icon">🗑️</span>
                        </button>
                    </div>
                </div>
            `;
        });
    });
    
    drinksList.innerHTML = html;

    // Add event listeners to delete buttons
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const drinkId = parseInt(this.getAttribute('data-drink-id'));
            if (confirm('Are you sure you want to delete this drink?')) {
                deleteDrink(drinkId);
            }
        });
    });
}

// Chart instances
let drinkTypeChart = null;
let monthlyChart = null;

// Get available years from drinks
function getAvailableYears(drinks) {
    const years = new Set();
    drinks.forEach(drink => {
        const date = new Date(drink.timestamp);
        years.add(date.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a); // Sort descending (newest first)
}

// Filter drinks by year
function filterDrinksByYear(drinks, year) {
    if (!year) return drinks;
    return drinks.filter(drink => {
        const drinkYear = new Date(drink.timestamp).getFullYear();
        return drinkYear === parseInt(year);
    });
}

// Initialize year selector
function initializeYearSelector() {
    const drinks = getDrinks();
    const years = getAvailableYears(drinks);
    const yearSelect = document.getElementById('year-select');
    
    if (!yearSelect) return;
    
    // Clear existing options
    yearSelect.innerHTML = '';
    
    // Add "All Years" option
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = 'All Years';
    yearSelect.appendChild(allOption);
    
    // Add year options
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
    
    // Set default to current year if available, otherwise "All Years"
    const currentYear = new Date().getFullYear();
    if (years.includes(currentYear)) {
        yearSelect.value = currentYear;
    } else {
        yearSelect.value = '';
    }
    
    // Add event listener for year change
    yearSelect.addEventListener('change', function() {
        updateStats();
    });
}

function updateStats() {
    const drinks = getDrinks();
    const yearSelect = document.getElementById('year-select');
    const selectedYear = yearSelect ? yearSelect.value : '';
    
    // Filter drinks by selected year
    const filteredDrinks = filterDrinksByYear(drinks, selectedYear);
    
    // Count drinks by type
    const typeCounts = {
        'boba': 0,
        'coffee': 0,
        'matcha': 0,
        'energy-drink': 0,
        'other': 0
    };
    
    filteredDrinks.forEach(drink => {
        const type = drink.type;
        if (typeCounts.hasOwnProperty(type)) {
            typeCounts[type]++;
        } else {
            typeCounts['other']++;
        }
    });
    
    // Update stat cards
    document.getElementById('boba-count').textContent = typeCounts['boba'];
    document.getElementById('coffee-count').textContent = typeCounts['coffee'];
    document.getElementById('matcha-count').textContent = typeCounts['matcha'];
    document.getElementById('energy-drink-count').textContent = typeCounts['energy-drink'];
    document.getElementById('other-count').textContent = typeCounts['other'];
    
    // Update most visited place
    updateMostVisitedPlace(filteredDrinks);
    
    // Update charts
    updateDrinkTypeChart(filteredDrinks);
    updateMonthlyChart(filteredDrinks);
    updateMonthlyBreakdown(filteredDrinks);
    updateTopPlaces(filteredDrinks);
}

// Analyze drinks by type
function getDrinksByType(drinks) {
    const typeCounts = {};
    
    drinks.forEach(drink => {
        const type = drink.type === 'energy-drink' ? 'Energy Drink' : 
                     drink.type.charAt(0).toUpperCase() + drink.type.slice(1);
        typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    return typeCounts;
}

// Get places visited (excluding energy drinks which have brands)
function getPlacesVisited(drinks) {
    const placeCounts = {};
    
    drinks.forEach(drink => {
        // Only count drinks with places (not energy drinks)
        if (drink.place && drink.type !== 'energy-drink') {
            const normalizedPlace = toTitleCase(drink.place.trim());
            placeCounts[normalizedPlace] = (placeCounts[normalizedPlace] || 0) + 1;
        }
    });
    
    return placeCounts;
}

// Get most visited place
function getMostVisitedPlace(drinks) {
    const placeCounts = getPlacesVisited(drinks);
    
    if (Object.keys(placeCounts).length === 0) {
        return null;
    }
    
    // Find place with highest count
    let maxCount = 0;
    let mostVisited = null;
    
    for (const [place, count] of Object.entries(placeCounts)) {
        if (count > maxCount) {
            maxCount = count;
            mostVisited = place;
        }
    }
    
    return { place: mostVisited, count: maxCount };
}

// Update most visited place card
function updateMostVisitedPlace(drinks) {
    const mostVisited = getMostVisitedPlace(drinks);
    const card = document.getElementById('most-visited-card');
    const countEl = document.getElementById('most-visited-count');
    const labelEl = document.getElementById('most-visited-label');
    
    if (!card || !countEl || !labelEl) return;
    
    if (mostVisited) {
        card.style.display = 'block';
        countEl.textContent = mostVisited.count;
        labelEl.textContent = mostVisited.place;
    } else {
        card.style.display = 'none';
    }
}

// Get top places (sorted by visit count)
function getTopPlaces(drinks, limit = 5) {
    const placeCounts = getPlacesVisited(drinks);
    
    // Convert to array and sort by count (descending)
    const placesArray = Object.entries(placeCounts)
        .map(([place, count]) => ({ place, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    
    return placesArray;
}

// Update top places list
function updateTopPlaces(drinks) {
    const topPlaces = getTopPlaces(drinks, 5);
    const container = document.getElementById('top-places-container');
    const list = document.getElementById('top-places-list');
    
    if (!container || !list) return;
    
    if (topPlaces.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    
    list.innerHTML = topPlaces.map((item, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📍';
        return `
            <div class="place-item">
                <span class="place-rank">${medal}</span>
                <span class="place-name">${item.place}</span>
                <span class="place-count">${item.count} ${item.count === 1 ? 'visit' : 'visits'}</span>
            </div>
        `;
    }).join('');
}

// Analyze drinks by month (boba only)
function getDrinksByMonth(drinks) {
    const monthData = {};
    
    // Filter for boba drinks only
    const bobaDrinks = drinks.filter(drink => drink.type === 'boba');
    
    bobaDrinks.forEach(drink => {
        const date = new Date(drink.timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        if (!monthData[monthKey]) {
            monthData[monthKey] = {
                label: monthLabel,
                count: 0,
                types: {}
            };
        }
        
        monthData[monthKey].count++;
        
        const type = drink.type === 'energy-drink' ? 'Energy Drink' : 
                     drink.type.charAt(0).toUpperCase() + drink.type.slice(1);
        monthData[monthKey].types[type] = (monthData[monthKey].types[type] || 0) + 1;
    });
    
    return monthData;
}

// Analyze ALL drinks by month (for monthly details section)
function getAllDrinksByMonth(drinks) {
    const monthData = {};
    
    drinks.forEach(drink => {
        const date = new Date(drink.timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        if (!monthData[monthKey]) {
            monthData[monthKey] = {
                label: monthLabel,
                count: 0,
                types: {}
            };
        }
        
        monthData[monthKey].count++;
        
        const type = drink.type === 'energy-drink' ? 'Energy Drink' : 
                     drink.type.charAt(0).toUpperCase() + drink.type.slice(1);
        monthData[monthKey].types[type] = (monthData[monthKey].types[type] || 0) + 1;
    });
    
    return monthData;
}

// Create/update drink type pie chart
function updateDrinkTypeChart(drinks) {
    const typeCounts = getDrinksByType(drinks);
    const ctx = document.getElementById('drink-type-chart');
    
    if (!ctx) return;
    
    const labels = Object.keys(typeCounts);
    const data = Object.values(typeCounts);
    
    // Color palette - brown/neutral tones
    const colors = {
        'Coffee': '#8B7355',
        'Boba': '#A0826D',
        'Matcha': '#6B5444',
        'Energy Drink': '#C9A882',
        'Other': '#B8956A'
    };
    
    const backgroundColors = labels.map(label => colors[label] || '#cbd5e1');
    
    if (drinkTypeChart) {
        drinkTypeChart.destroy();
    }
    
    drinkTypeChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Create/update monthly bar chart
function updateMonthlyChart(drinks) {
    const selectedYear = parseInt(document.getElementById('year-select').value);
    const monthData = getDrinksByMonth(drinks);
    const ctx = document.getElementById('monthly-chart');
    
    if (!ctx) return;
    
    // Sort months chronologically
    const sortedMonths = Object.keys(monthData).sort();
    
    // Filter for selected year only
    const yearMonths = sortedMonths.filter(monthKey => {
        const year = parseInt(monthKey.split('-')[0]);
        return year === selectedYear;
    });
    
    // Get last 12 months (or all months if less than 12)
    const last12Months = yearMonths.slice(-12);
    const labels = last12Months.map(key => monthData[key].label);
    const data = last12Months.map(key => monthData[key].count);
    
    if (monthlyChart) {
        monthlyChart.destroy();
    }
    
    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Drinks',
                data: data,
                backgroundColor: '#8B7355',
                borderColor: '#6B5444',
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y', // This makes the bar chart horizontal
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.x} drinks`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                },
                y: {
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// Create monthly breakdown cards
function updateMonthlyBreakdown(drinks) {
    const selectedYear = parseInt(document.getElementById('year-select').value);
    const monthData = getAllDrinksByMonth(drinks); // Use all drinks
    const container = document.getElementById('monthly-breakdown');
    
    if (!container) return;
    
    if (Object.keys(monthData).length === 0) {
        container.innerHTML = '<p class="empty-state">No monthly data available yet.</p>';
        return;
    }
    
    // Sort months chronologically (newest first)
    const sortedMonths = Object.keys(monthData).sort().reverse();
    
    // Filter for selected year only
    const filteredMonths = sortedMonths.filter(monthKey => {
        const year = parseInt(monthKey.split('-')[0]);
        return year === selectedYear;
    });
    
    if (filteredMonths.length === 0) {
        container.innerHTML = '<p class="empty-state">No data for this year.</p>';
        return;
    }
    
    container.innerHTML = filteredMonths.map(monthKey => {
        const month = monthData[monthKey];
        const typeDetails = Object.entries(month.types)
            .map(([type, count]) => `<span class="month-stat-item"><strong>${type}:</strong> ${count}</span>`)
            .join('');
        
        return `
            <div class="month-card">
                <div class="month-header">${month.label}</div>
                <div class="month-details">
                    <span class="month-stat-item"><strong>Total:</strong> ${month.count}</span>
                    ${typeDetails}
                </div>
            </div>
        `;
    }).join('');
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function formatDate(date) {
    const today = new Date();
    
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
}