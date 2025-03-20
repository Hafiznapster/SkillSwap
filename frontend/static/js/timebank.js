document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/login';
        return;
    }
    
    // Load time bank data
    loadTimeBankData();
    
    // Setup filter button
    document.getElementById('filterTransactionsBtn').addEventListener('click', filterTransactions);
});

let allTransactions = [];

function loadTimeBankData() {
    const token = localStorage.getItem('authToken');
    
    fetch(`${API_URL}/timebank`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to load time bank data');
        }
    })
    .then(data => {
        // Update balance summary
        document.getElementById('totalBalance').textContent = data.balance.toFixed(1);
        
        // Calculate earned and spent hours
        let earned = 0;
        let spent = 0;
        
        data.transactions.forEach(transaction => {
            if (transaction.hours > 0) {
                earned += transaction.hours;
            } else {
                spent += Math.abs(transaction.hours);
            }
        });
        
        document.getElementById('earnedHours').textContent = earned.toFixed(1);
        document.getElementById('spentHours').textContent = spent.toFixed(1);
        
        // Store transactions for filtering
        allTransactions = data.transactions;
        
        // Display transactions
        displayTransactions(data.transactions);
    })
    .catch(error => {
        console.error('Error loading time bank data:', error);
        document.getElementById('totalBalance').textContent = '0.0';
        document.getElementById('earnedHours').textContent = '0.0';
        document.getElementById('spentHours').textContent = '0.0';
        document.getElementById('transactionsContainer').innerHTML = `
            <div class="alert alert-danger">
                Failed to load time bank data. Please try again later.
            </div>
        `;
    });
}

function displayTransactions(transactions) {
    const container = document.getElementById('transactionsContainer');
    container.innerHTML = '';
    
    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                No transactions found. Start teaching or learning to earn and spend hours!
            </div>
        `;
        return;
    }
    
    // Create transactions table
    const table = document.createElement('table');
    table.className = 'table table-hover';
    
    // Create table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Hours</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${formatDate(transaction.created_at)}</td>
            <td>${transaction.description}</td>
            <td class="text-${transaction.hours > 0 ? 'success' : 'danger'}">${transaction.hours > 0 ? '+' : ''}${transaction.hours.toFixed(1)}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
}

function filterTransactions() {
    const startDate = document.getElementById('dateRangeStart').value;
    const endDate = document.getElementById('dateRangeEnd').value;
    
    const earnedChecked = document.getElementById('earnedType').checked;
    const spentChecked = document.getElementById('spentType').checked;
    
    let filteredTransactions = [...allTransactions];
    
    // Filter by date
    if (startDate) {
        const startDateTime = new Date(startDate);
        filteredTransactions = filteredTransactions.filter(transaction => 
            new Date(transaction.created_at) >= startDateTime
        );
    }
    
    if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59); // End of day
        filteredTransactions = filteredTransactions.filter(transaction => 
            new Date(transaction.created_at) <= endDateTime
        );
    }
    
    // Filter by transaction type
    if (earnedChecked && !spentChecked) {
        filteredTransactions = filteredTransactions.filter(transaction => transaction.hours > 0);
    } else if (!earnedChecked && spentChecked) {
        filteredTransactions = filteredTransactions.filter(transaction => transaction.hours < 0);
    }
    
    // Display filtered transactions
    displayTransactions(filteredTransactions);
}

function showAlert(message, type) {
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertContainer.setAttribute('role', 'alert');
    alertContainer.style.zIndex = '9999';
    
    alertContainer.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(alertContainer);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alertContainer.remove();
    }, 5000);
} 