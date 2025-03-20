// Setup default date range for filters (current month)
function setupDefaultDateRange() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const formatDate = date => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    // Set date inputs to current month range
    document.getElementById('dateRangeStart').value = formatDate(firstDay);
    document.getElementById('dateRangeEnd').value = formatDate(lastDay);
}

// Fetch time bank data from API
function fetchTimeBankData() {
    // In a real application, you would fetch this data from your API
    // For now, we'll simulate a response
    
    setTimeout(() => {
        // Simulate API data
        const data = {
            total: 12.5,
            earned: 20.0,
            spent: 7.5,
            sessions: 15,
            ratio: 0.63, // Percentage of teaching to total hours as decimal
            teaching_sessions: 8,
            learning_sessions: 7,
            monthly: {
                earned: 4.5,
                spent: 2.0,
                balance: 2.5
            }
        };
        
        // Update UI with data
        updateTimeBankUI(data);
    }, 300);
}

// Update UI with time bank data
function updateTimeBankUI(data) {
    // Update main balance card
    document.getElementById('totalBalance').textContent = data.total.toFixed(1);
    document.getElementById('earnedHours').textContent = data.earned.toFixed(1);
    document.getElementById('spentHours').textContent = data.spent.toFixed(1);
    document.getElementById('sessionCount').textContent = data.sessions;
    
    // Update statistics cards
    const teachingStats = document.querySelector('.stats-card:nth-child(1) .stats-value');
    const learningStats = document.querySelector('.stats-card:nth-child(2) .stats-value');
    
    if (teachingStats) teachingStats.textContent = data.teaching_sessions;
    if (learningStats) learningStats.textContent = data.learning_sessions;
    
    // Update circular progress
    updateCircularProgress(data.ratio * 100);
    
    // Add animation to the numbers
    animateNumbers();
}

// Animate numbers for visual appeal
function animateNumbers() {
    const elements = document.querySelectorAll('.balance-value, .balance-detail-value, .stats-value');
    
    elements.forEach(element => {
        // Add a subtle pulse animation
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = 'pulse 0.5s ease-in-out';
    });
}

// Fetch transaction history
function fetchTransactionHistory(page = 1, filter = 'all') {
    // In a real application, you would fetch this data from your API
    // For now, we'll simulate a response
    
    // Show loading state
    const transactionList = document.querySelector('.transaction-list');
    if (transactionList) {
        transactionList.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading transactions...</p>
            </div>
        `;
    }
    
    setTimeout(() => {
        // Generate sample transactions based on page
        const transactions = generateSampleTransactions(page, filter);
        
        // Update UI with transactions
        updateTransactionList(transactions);
        
        // Update pagination
        updatePagination(page, 3); // Assuming 3 total pages
    }, 500);
}

// Generate sample transactions for demo
function generateSampleTransactions(page, filter) {
    // Sample data for different pages
    const allTransactions = [
        // Page 1
        [
            {
                type: 'credit',
                title: 'JavaScript Fundamentals Session',
                date: 'Oct 15, 2023, 3:00 PM',
                with: 'Sarah Johnson',
                amount: 1.5
            },
            {
                type: 'debit',
                title: 'Web Design Basics Session',
                date: 'Oct 10, 2023, 2:00 PM',
                with: 'Emily Chen',
                amount: 1.5
            },
            {
                type: 'credit',
                title: 'Python Programming Tutorial',
                date: 'Oct 8, 2023, 4:30 PM',
                with: 'Michael Brown',
                amount: 2.0
            },
            {
                type: 'adjustment',
                title: 'New User Bonus',
                date: 'Oct 5, 2023, 10:00 AM',
                with: 'System Adjustment',
                amount: 2.0
            },
            {
                type: 'debit',
                title: 'Spanish Language Practice',
                date: 'Oct 3, 2023, 1:00 PM',
                with: 'Carlos Rodriguez',
                amount: 1.0
            },
            {
                type: 'credit',
                title: 'Calculus Tutoring Session',
                date: 'Oct 1, 2023, 5:00 PM',
                with: 'David Wilson',
                amount: 2.0
            }
        ],
        // Page 2
        [
            {
                type: 'credit',
                title: 'Data Structures Workshop',
                date: 'Sep 25, 2023, 2:00 PM',
                with: 'Jessica Lee',
                amount: 2.5
            },
            {
                type: 'debit',
                title: 'Guitar Basics Lesson',
                date: 'Sep 22, 2023, 6:00 PM',
                with: 'Ryan Cooper',
                amount: 1.0
            },
            {
                type: 'credit',
                title: 'Photoshop Techniques Session',
                date: 'Sep 18, 2023, 3:30 PM',
                with: 'Olivia Martinez',
                amount: 1.5
            },
            {
                type: 'debit',
                title: 'French Conversation Practice',
                date: 'Sep 15, 2023, 4:00 PM',
                with: 'Sophie Bernard',
                amount: 1.0
            },
            {
                type: 'credit',
                title: 'Physics Problem Solving',
                date: 'Sep 12, 2023, 5:30 PM',
                with: 'James Parker',
                amount: 2.0
            }
        ],
        // Page 3
        [
            {
                type: 'adjustment',
                title: 'Session Cancellation Refund',
                date: 'Sep 8, 2023, 9:15 AM',
                with: 'System Adjustment',
                amount: 1.0
            },
            {
                type: 'credit',
                title: 'Excel Advanced Functions',
                date: 'Sep 5, 2023, 2:00 PM',
                with: 'Andrew Thompson',
                amount: 1.5
            },
            {
                type: 'debit',
                title: 'Public Speaking Practice',
                date: 'Sep 2, 2023, 11:00 AM',
                with: 'Grace Williams',
                amount: 1.5
            },
            {
                type: 'credit',
                title: 'Essay Writing Workshop',
                date: 'Aug 28, 2023, 4:00 PM',
                with: 'Nathan Brooks',
                amount: 2.0
            }
        ]
    ];
    
    // Get transactions for the requested page
    const pageIndex = page - 1;
    if (pageIndex >= allTransactions.length) return [];
    
    let transactions = allTransactions[pageIndex];
    
    // Apply filter if not 'all'
    if (filter !== 'all') {
        transactions = transactions.filter(t => {
            if (filter === 'earned' && t.type === 'credit') return true;
            if (filter === 'spent' && t.type === 'debit') return true;
            if (filter === 'adjustment' && t.type === 'adjustment') return true;
            return false;
        });
    }
    
    return transactions;
}

// Update transaction list in the UI
function updateTransactionList(transactions) {
    const transactionList = document.querySelector('.transaction-list');
    if (!transactionList) return;
    
    if (transactions.length === 0) {
        transactionList.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h5>No transactions found</h5>
                <p class="text-muted">Try changing your filter settings.</p>
            </div>
        `;
        return;
    }
    
    // Build transaction HTML
    let html = '';
    
    transactions.forEach(transaction => {
        const isCredit = transaction.type === 'credit';
        const isDebit = transaction.type === 'debit';
        const isAdjustment = transaction.type === 'adjustment';
        
        const iconClass = isCredit ? 'credit-icon' : isDebit ? 'debit-icon' : 'adjustment-icon';
        const iconHtml = isCredit ? '<i class="fas fa-arrow-up"></i>' : 
                        isDebit ? '<i class="fas fa-arrow-down"></i>' : 
                        '<i class="fas fa-sync-alt"></i>';
        
        const amountClass = isCredit || isAdjustment ? 'credit-amount' : 'debit-amount';
        const amountPrefix = isCredit || isAdjustment ? '+' : '-';
        
        html += `
            <div class="transaction-item" data-aos="fade-up" data-aos-delay="${transactions.indexOf(transaction) * 50}">
                <div class="transaction-icon ${iconClass}">
                    ${iconHtml}
                </div>
                <div class="transaction-info">
                    <h6 class="transaction-title">${transaction.title}</h6>
                    <p class="transaction-details">
                        <i class="far fa-clock me-1"></i> ${transaction.date}
                        <i class="fas fa-user ms-2 me-1"></i> With: ${transaction.with}
                    </p>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${amountPrefix}${transaction.amount.toFixed(1)}h
                </div>
            </div>
        `;
    });
    
    transactionList.innerHTML = html;
    
    // Reinitialize AOS for the new elements
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

// Update pagination controls
function updatePagination(currentPage, totalPages) {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    
    // Generate pagination HTML
    let html = '';
    
    // Previous button
    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}" ${currentPage === 1 ? 'tabindex="-1" aria-disabled="true"' : ''}>Previous</a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        html += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }
    
    // Next button
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'tabindex="-1" aria-disabled="true"' : ''}>Next</a>
        </li>
    `;
    
    pagination.innerHTML = html;
    
    // Add event listeners to pagination links
    pagination.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = parseInt(this.getAttribute('data-page'));
            if (isNaN(page)) return;
            
            // Get current filter
            const activeFilter = document.querySelector('.filter-btn.active');
            const filter = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
            
            // Load the requested page
            fetchTransactionHistory(page, filter);
        });
    });
}

// Apply advanced filter
function applyAdvancedFilter() {
    // Get filter values
    const startDate = document.getElementById('dateRangeStart').value;
    const endDate = document.getElementById('dateRangeEnd').value;
    const earnedChecked = document.getElementById('earnedType').checked;
    const spentChecked = document.getElementById('spentType').checked;
    const adjustmentChecked = document.getElementById('adjustmentType').checked;
    
    // Validate date range
    if (!startDate || !endDate) {
        showAlert('Please select both start and end dates', 'warning');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        showAlert('Start date cannot be after end date', 'warning');
        return;
    }
    
    // Validate at least one type is selected
    if (!earnedChecked && !spentChecked && !adjustmentChecked) {
        showAlert('Please select at least one transaction type', 'warning');
        return;
    }
    
    // In a real application, you would send this to your API
    console.log('Advanced filter applied with:', {
        startDate,
        endDate,
        types: {
            earned: earnedChecked,
            spent: spentChecked,
            adjustment: adjustmentChecked
        }
    });
    
    // For demo purposes, simulate filtered results
    // In a real app, you would pass these parameters to your API call
    const filterTypes = [];
    if (earnedChecked) filterTypes.push('credit');
    if (spentChecked) filterTypes.push('debit');
    if (adjustmentChecked) filterTypes.push('adjustment');
    
    // Show loading state
    const transactionList = document.querySelector('.transaction-list');
    if (transactionList) {
        transactionList.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Filtering transactions...</p>
            </div>
        `;
    }
    
    // Simulate API call delay
    setTimeout(() => {
        // Generate filtered sample data
        const filteredTransactions = generateFilteredTransactions(startDate, endDate, filterTypes);
        
        // Update UI with filtered data
        updateTransactionList(filteredTransactions);
        
        // Update pagination (simplified for demo)
        const pagination = document.querySelector('.pagination');
        if (pagination) {
            pagination.innerHTML = `
                <li class="page-item disabled">
                    <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Previous</a>
                </li>
                <li class="page-item active"><a class="page-link" href="#">1</a></li>
                <li class="page-item disabled">
                    <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Next</a>
                </li>
            `;
        }
        
        // Show success message
        showAlert('Filters applied successfully!', 'success');
    }, 500);
}

// Generate filtered transactions for demo
function generateFilteredTransactions(startDate, endDate, types) {
    // For demo purposes, we'll return a subset of transactions
    // In a real app, the server would handle this filtering
    
    // Convert dates to timestamps for comparison
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime() + (24 * 60 * 60 * 1000); // Include end date
    
    // Create sample transactions for the date range
    const transactions = [
        {
            type: 'credit',
            title: 'JavaScript Advanced Concepts',
            date: 'Sep 18, 2023, 3:00 PM',
            with: 'Sarah Johnson',
            amount: 2.0,
            timestamp: new Date('2023-09-18T15:00:00').getTime()
        },
        {
            type: 'debit',
            title: 'Graphic Design Workshop',
            date: 'Sep 22, 2023, 2:00 PM',
            with: 'Emily Chen',
            amount: 1.5,
            timestamp: new Date('2023-09-22T14:00:00').getTime()
        },
        {
            type: 'adjustment',
            title: 'Rating Bonus',
            date: 'Sep 25, 2023, 10:00 AM',
            with: 'System Adjustment',
            amount: 0.5,
            timestamp: new Date('2023-09-25T10:00:00').getTime()
        },
        {
            type: 'credit',
            title: 'SQL Database Tutorial',
            date: 'Oct 5, 2023, 4:00 PM',
            with: 'Daniel Smith',
            amount: 1.5,
            timestamp: new Date('2023-10-05T16:00:00').getTime()
        },
        {
            type: 'debit',
            title: 'Piano Lesson',
            date: 'Oct 8, 2023, 6:30 PM',
            with: 'Lisa Wang',
            amount: 1.0,
            timestamp: new Date('2023-10-08T18:30:00').getTime()
        },
        {
            type: 'credit',
            title: 'Chemistry Problem Solving',
            date: 'Oct 12, 2023, 3:30 PM',
            with: 'Robert Davis',
            amount: 2.0,
            timestamp: new Date('2023-10-12T15:30:00').getTime()
        }
    ];
    
    // Filter by date range and types
    return transactions.filter(transaction => {
        const dateInRange = transaction.timestamp >= startTimestamp && transaction.timestamp <= endTimestamp;
        const typeMatches = types.includes(transaction.type);
        return dateInRange && typeMatches;
    });
}

// Export PDF report of time bank transactions
function exportPdfReport() {
    showAlert('Generating PDF report...', 'info');
    
    // Simulate PDF generation delay
    setTimeout(() => {
        showAlert('PDF report generated successfully!', 'success');
        
        // In a real application, you would trigger a download here
        // For demo purposes, we'll just log to console
        console.log('PDF report would be downloaded here');
    }, 1500);
}

// Utility function to format dates
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

// Add this function at the end of the timebank.js file
// Make sure this is included in your project for the export functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add export button event listener
    const exportReportBtn = document.createElement('button');
    exportReportBtn.className = 'btn btn-outline-primary btn-sm';
    exportReportBtn.innerHTML = '<i class="fas fa-file-pdf me-2"></i> Export PDF Report';
    exportReportBtn.style.marginLeft = '10px';
    
    const paginationContainer = document.querySelector('.pagination');
    if (paginationContainer) {
        paginationContainer.parentNode.appendChild(exportReportBtn);
    }
    
    exportReportBtn.addEventListener('click', exportPdfReport);
}); 