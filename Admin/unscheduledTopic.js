document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const modal = document.getElementById('unscheduledModal');
    const openBtn = document.getElementById('viewUnscheduledBtn');
    const closeBtn = document.querySelector('.close');
    const batchSelect = document.getElementById('batchSelect');
    const loadingState = document.getElementById('loadingState');
    const unscheduledList = document.getElementById('unscheduledList');
    const topicsContent = document.getElementById('topicsContent');
    const noTopicsMessage = document.getElementById('noTopicsMessage');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    // Open modal
    openBtn.addEventListener('click', function() {
        modal.style.display = 'block';
        loadBatches();
    });

    // Close modal
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Handle batch selection change
    batchSelect.addEventListener('change', function() {
        const batchId = this.value;
        if (batchId) {
            loadUnscheduledTopics(batchId);
        } else {
            hideAllStates();
        }
    });

    // Load batches from API
    async function loadBatches() {
        try {
            const response = await fetch('course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Batches/all-batches', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch batches');
            }

            const result = await response.json();
            const batches = result.data || [];

            // Populate batch dropdown
            batchSelect.innerHTML = '<option value="">Select a batch...</option>';
            
            if (batches.length === 0) {
                batchSelect.innerHTML = '<option value="">No batches available</option>';
                return;
            }

            batches.forEach(batch => {
                const option = document.createElement('option');
                option.value = batch.id;
                option.textContent = `${batch.name} (${batch.year})`;
                batchSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Error loading batches:', error);
            batchSelect.innerHTML = '<option value="">Error loading batches</option>';
            showError('Failed to load batches. Please refresh and try again.');
        }
    }

    // Load unscheduled topics for selected batch
    async function loadUnscheduledTopics(batchId) {
        hideAllStates();
        loadingState.style.display = 'block';

        try {
            // Call the unscheduled topics API
            const response = await fetch(`course-scheduler-f2h9b0esfafrdtfx.canadacentral-01.azurewebsites.net/api/Topic/unscheduled/${batchId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch unscheduled topics');
            }

            const result = await response.json();
            console.log('API Response:', result); // Debug log to see the structure
            
            if (!result.status) {
                throw new Error(result.message || 'Failed to get scheduling information');
            }

            // Check if data is directly the array or nested
            let unscheduledTopics;
            if (Array.isArray(result.data)) {
                unscheduledTopics = result.data;
            } else if (result.data && Array.isArray(result.data.unscheduledTopics)) {
                unscheduledTopics = result.data.unscheduledTopics;
            } else {
                unscheduledTopics = [];
            }

            loadingState.style.display = 'none';

            if (unscheduledTopics.length === 0) {
                noTopicsMessage.style.display = 'block';
            } else {
                displayUnscheduledTopics(unscheduledTopics);
                unscheduledList.style.display = 'block';
            }

        } catch (error) {
            console.error('Error loading unscheduled topics:', error);
            loadingState.style.display = 'none';
            showError(error.message || 'Failed to load unscheduled topics. Please try again.');
        }
    }

    // Display unscheduled topics
    function displayUnscheduledTopics(topics) {
        topicsContent.innerHTML = '';

        topics.forEach(topic => {
            const topicCard = document.createElement('div');
            topicCard.className = 'topic-card';

            // Handle both object and string formats
            let title, reason;
            
            if (typeof topic === 'object' && topic !== null) {
                title = topic.title || topic.name || topic.topicTitle || 'Unknown Topic';
                reason = topic.reason || topic.unscheduledReason || 'No reason provided';
            } else {
                title = topic;
                reason = 'No reason provided';
            }

            topicCard.innerHTML = `
                <div class="topic-title">${escapeHtml(title)}</div>
                <div class="topic-reason">
                    <strong>Reason:</strong> ${escapeHtml(reason)}
                </div>
            `;

            topicsContent.appendChild(topicCard);
        });
    }

    // Show error message
    function showError(message) {
        hideAllStates();
        errorText.textContent = message;
        errorMessage.style.display = 'block';
    }

    // Hide all state elements
    function hideAllStates() {
        loadingState.style.display = 'none';
        unscheduledList.style.display = 'none';
        noTopicsMessage.style.display = 'none';
        errorMessage.style.display = 'none';
    }

    // Utility function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Keyboard support - close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
});