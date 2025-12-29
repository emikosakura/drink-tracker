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
                updateStats();
            }
        });
    });

    // Drink form handling
    const drinkForm = document.getElementById('drink-form');
    drinkForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const drinkType = document.getElementById('drink-type').value;
        const drinkSize = document.getElementById('drink-size').value;

        if (drinkType && drinkSize) {
            addDrink(drinkType, drinkSize);
            drinkForm.reset();
        }
    });

    // Load drinks on page load
    loadDrinks();
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

function addDrink(type, size) {
    const drinks = getDrinks();
    const newDrink = {
        id: Date.now(),
        type: type,
        size: size,
        timestamp: new Date().toISOString()
    };
    drinks.unshift(newDrink);
    saveDrinks(drinks);
    loadDrinks();
    updateStats();
    
    // Switch to history tab to show the new drink
    const historyTab = document.querySelector('[data-tab="history"]');
    if (historyTab) {
        historyTab.click();
    }
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

    drinksList.innerHTML = drinks.map(drink => {
        const date = new Date(drink.timestamp);
        const timeString = formatTime(date);
        const dateString = formatDate(date);
        
        const drinkEmojis = {
            coffee: '☕',
            matcha: '🍵',
            boba: '🧋',
            tea: '🫖'
        };

        const sizeLabels = {
            small: 'Small',
            medium: 'Medium',
            large: 'Large',
            xlarge: 'Extra Large'
        };

        return `
            <div class="drink-item">
                <div class="drink-info">
                    <div class="drink-type">${drinkEmojis[drink.type]} ${drink.type.charAt(0).toUpperCase() + drink.type.slice(1)} - ${sizeLabels[drink.size]}</div>
                    <div class="drink-details">${dateString}</div>
                </div>
                <div class="drink-time">${timeString}</div>
            </div>
        `;
    }).join('');
}

function updateStats() {
    const drinks = getDrinks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayDrinks = drinks.filter(drink => {
        const drinkDate = new Date(drink.timestamp);
        drinkDate.setHours(0, 0, 0, 0);
        return drinkDate.getTime() === today.getTime();
    });

    document.getElementById('today-count').textContent = todayDrinks.length;
    document.getElementById('total-count').textContent = drinks.length;
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
    today.setHours(0, 0, 0, 0);
    const drinkDate = new Date(date);
    drinkDate.setHours(0, 0, 0, 0);

    if (drinkDate.getTime() === today.getTime()) {
        return 'Today';
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (drinkDate.getTime() === yesterday.getTime()) {
        return 'Yesterday';
    }

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
}

