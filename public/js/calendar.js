/**
 * Calendar View for Intervals.icu Workouts
 * Displays synced workouts in month, week, and list views
 */

// State
let currentDate = new Date();
let currentView = 'month';
let workouts = [];
let intervalsConfig = null;

// Icons for workout types
const workoutIcons = {
    run: '🏃',
    bike: '🚴',
    swim: '🏊',
    brick: '🧱',
    strength: '💪',
    rest: '😴',
    recovery: '🧘',
    climbing: '🧗',
    hike: '🥾',
    ski: '⛷️',
    basketball: '🏀'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadIntervalsConfig();
    await loadWorkouts();
    renderCalendar();
});

/**
 * Load intervals.icu configuration
 */
async function loadIntervalsConfig() {
    try {
        const res = await fetch('/api/intervals-icu/config');
        if (res.ok) {
            intervalsConfig = await res.json();
            updateSyncButton();
        }
    } catch (e) {
        console.error('Error loading config:', e);
    }
}

/**
 * Load workouts from API
 */
async function loadWorkouts() {
    try {
        // Get first and last day of current month view
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        // Add buffer days for calendar grid (Monday-Sunday weeks)
        const startDate = new Date(firstDay);
        // Subtract days to get to Monday (0 = Sunday, 1 = Monday, so Monday is day 1)
        const dayOfWeek = startDate.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days, else go back dayOfWeek-1
        startDate.setDate(startDate.getDate() - daysToSubtract);
        
        const endDate = new Date(lastDay);
        // Add days to get to Sunday (next week's Sunday)
        const endDayOfWeek = endDate.getDay();
        const daysToAdd = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek; // If Sunday, no days needed, else 7-dayOfWeek
        endDate.setDate(endDate.getDate() + daysToAdd);

        // Use local date strings to avoid timezone issues
        const startDateStr = formatDateForAPI(startDate);
        const endDateStr = formatDateForAPI(endDate);

        const res = await fetch(`/api/intervals-icu/workouts?startDate=${startDateStr}&endDate=${endDateStr}`);
        if (res.ok) {
            workouts = await res.json();
            updateStats();
        } else {
            workouts = [];
        }
    } catch (e) {
        console.error('Error loading workouts:', e);
        workouts = [];
    }
}

/**
 * Format date for API without timezone conversion
 */
function formatDateForAPI(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Update stats summary
 */
function updateStats() {
    const total = workouts.length;
    const byType = {
        swim: 0,
        bike: 0,
        run: 0
    };

    workouts.forEach(w => {
        const type = w.type?.toLowerCase();
        if (type === 'swim' || type === 'swimming') byType.swim++;
        else if (type === 'bike' || type === 'cycling') byType.bike++;
        else if (type === 'run' || type === 'running') byType.run++;
    });

    document.getElementById('totalWorkouts').textContent = total;
    document.getElementById('swimCount').textContent = byType.swim;
    document.getElementById('bikeCount').textContent = byType.bike;
    document.getElementById('runCount').textContent = byType.run;
}

/**
 * Update sync button status
 */
function updateSyncButton() {
    const btn = document.getElementById('syncBtn');
    if (!intervalsConfig?.connected) {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
        btn.title = 'Connect to intervals.icu first';
    } else {
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
        btn.title = 'Sync workouts from intervals.icu';
    }
}

/**
 * Sync workouts from intervals.icu
 */
async function syncWorkouts() {
    if (!intervalsConfig?.connected) {
        alert('Please connect to intervals.icu in your Profile first');
        window.location.href = '/profile';
        return;
    }

    const btn = document.getElementById('syncBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Syncing...</span>';
    btn.disabled = true;

    try {
        const res = await fetch('/api/intervals-icu/sync', {
            method: 'POST'
        });

        const data = await res.json();

        if (res.ok) {
            await loadWorkouts();
            renderCalendar();
            
            // Format sync result message
            let message = 'Sync complete!';
            if (data.added !== undefined && data.updated !== undefined) {
                message = `Added ${data.added} new, updated ${data.updated} workouts (${data.total} total)`;
            } else if (data.syncedWorkouts) {
                message = `Successfully synced ${data.syncedWorkouts} workouts`;
            }
            
            alert(message);
        } else {
            alert(`Sync failed: ${data.error || 'Unknown error'}`);
        }
    } catch (e) {
        console.error('Error syncing:', e);
        alert('Network error. Please try again.');
    } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

/**
 * Render calendar based on current view
 */
function renderCalendar() {
    updateMonthHeader();
    
    if (currentView === 'month') {
        renderMonthView();
    } else if (currentView === 'list') {
        renderListView();
    }
}

/**
 * Update month header
 */
function updateMonthHeader() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    
    document.getElementById('currentMonth').textContent = `${month} ${year}`;
    
    // Update date range
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    document.getElementById('dateRange').textContent = 
        `${firstDay.toLocaleDateString()} - ${lastDay.toLocaleDateString()}`;
}

/**
 * Render month view
 */
function renderMonthView() {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    // Get to Monday (0 = Sunday, 1 = Monday, so Monday is day 1)
    const dayOfWeek = startDate.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generate 42 days (6 weeks, Monday-Sunday)
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        
        // Check if date is in current month
        if (date.getMonth() !== month) {
            dayDiv.classList.add('other-month');
        }
        
        // Check if today
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        if (checkDate.getTime() === today.getTime()) {
            dayDiv.classList.add('today');
        }
        
        // Day header with number
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        
        const dayNum = document.createElement('div');
        dayNum.className = 'text-xs font-semibold text-surface-300';
        dayNum.textContent = date.getDate();
        dayHeader.appendChild(dayNum);
        dayDiv.appendChild(dayHeader);
        
        // Get workouts for this day (use local date formatting to avoid timezone issues)
        const dateStr = formatDateForAPI(date);
        const dayWorkouts = workouts.filter(w => w.date === dateStr);
        
        // Scrollable workouts container
        const workoutsContainer = document.createElement('div');
        workoutsContainer.className = 'calendar-day-workouts space-y-1';
        
        dayWorkouts.forEach(workout => {
            const workoutDiv = document.createElement('div');
            workoutDiv.className = `workout-card p-2 rounded text-xs workout-${workout.type}`;
            workoutDiv.onclick = () => openWorkoutModal(workout);
            
            const icon = workoutIcons[workout.type] || '📋';
            const duration = workout.duration ? formatDuration(workout.duration) : '';
            const distance = workout.distance ? formatDistance(workout.distance) : '';
            
            workoutDiv.innerHTML = `
                <div class="font-medium text-surface-100 truncate" title="${workout.title}">${icon} ${workout.title}</div>
                ${duration || distance ? `<div class="text-surface-400 text-[10px] mt-0.5 truncate">${duration}${distance ? ' • ' + distance : ''}</div>` : ''}
            `;
            
            workoutsContainer.appendChild(workoutDiv);
        });
        
        dayDiv.appendChild(workoutsContainer);
        grid.appendChild(dayDiv);
    }
}



/**
 * Render list view
 */
function renderListView() {
    const container = document.getElementById('listView');
    container.innerHTML = '';
    
    if (workouts.length === 0) {
        container.innerHTML = `
            <div class="card rounded-xl p-8 text-center">
                <p class="text-surface-400">No workouts found for this period</p>
                <p class="text-xs text-surface-500 mt-2">Connect to intervals.icu and sync your workouts to see them here</p>
            </div>
        `;
        return;
    }
    
    // Sort workouts by date (newest first)
    const sortedWorkouts = [...workouts].sort((a, b) => {
        const dateA = new Date(a.date + 'T' + (a.start_time || '00:00:00'));
        const dateB = new Date(b.date + 'T' + (b.start_time || '00:00:00'));
        return dateB - dateA;
    });
    
    // Group by date
    const byDate = {};
    sortedWorkouts.forEach(w => {
        const dateKey = w.date;
        if (!byDate[dateKey]) {
            byDate[dateKey] = [];
        }
        byDate[dateKey].push(w);
    });
    
    // Render each date group
    Object.keys(byDate).sort().reverse().forEach(dateStr => {
        const dateWorkouts = byDate[dateStr];
        const [year, month, day] = dateStr.split('-');
        const dateObj = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isToday = dateObj.getTime() === today.getTime();
        
        const dateCard = document.createElement('div');
        dateCard.className = 'card rounded-xl p-4 border-l-4 border-surface-700';
        
        dateCard.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h3 class="font-semibold text-surface-100">${dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                    ${isToday ? '<p class="text-xs text-blue-400 font-medium mt-0.5">Today</p>' : '<p class="text-xs text-surface-500 mt-0.5">${dateObj.getFullYear()}</p>'}
                </div>
                <div class="text-right text-sm text-surface-400">
                    <div class="font-semibold text-surface-100">${dateWorkouts.length}</div>
                    <div class="text-xs">workout${dateWorkouts.length !== 1 ? 's' : ''}</div>
                </div>
            </div>
            <div class="space-y-2" id="date-${dateStr.replace(/-/g, '_')}"></div>
        `;
        
        container.appendChild(dateCard);
        
        const workoutsContainer = document.getElementById(`date-${dateStr.replace(/-/g, '_')}`);
        
        dateWorkouts.forEach(workout => {
            const workoutDiv = document.createElement('div');
            workoutDiv.className = `workout-card p-4 rounded-lg workout-${workout.type} cursor-pointer hover:shadow-lg transition-all`;
            workoutDiv.onclick = () => openWorkoutModal(workout);
            
            const icon = workoutIcons[workout.type] || '📋';
            const duration = workout.duration ? formatDuration(workout.duration) : '';
            const distance = workout.distance ? formatDistance(workout.distance) : '';
            const time = workout.start_time ? new Date(workout.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
            
            // Build metrics row
            let metricsHtml = '';
            if (duration) metricsHtml += `<span class="inline-flex items-center gap-1">⏱️ ${duration}</span>`;
            if (distance) metricsHtml += `<span class="inline-flex items-center gap-1">📏 ${distance}</span>`;
            if (workout.avg_power) metricsHtml += `<span class="inline-flex items-center gap-1">⚡ ${Math.round(workout.avg_power)}W</span>`;
            if (workout.icu_weighted_avg_watts) metricsHtml += `<span class="inline-flex items-center gap-1">🔋 ${Math.round(workout.icu_weighted_avg_watts)}W</span>`;
            if (workout.avg_heart_rate) metricsHtml += `<span class="inline-flex items-center gap-1">❤️ ${Math.round(workout.avg_heart_rate)} bpm</span>`;
            if (workout.icu_training_load) metricsHtml += `<span class="inline-flex items-center gap-1">📊 ${Math.round(workout.icu_training_load)}</span>`;
            
            workoutDiv.innerHTML = `
                <div class="flex items-start justify-between gap-3">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-3 mb-2">
                            <span class="text-2xl flex-shrink-0">${icon}</span>
                            <div class="flex-1 min-w-0">
                                <div class="font-semibold text-surface-100 truncate">${workout.title}</div>
                                ${time ? `<div class="text-xs text-surface-500">${time}</div>` : ''}
                            </div>
                        </div>
                        ${workout.description ? `<p class="text-xs text-surface-400 mb-2 line-clamp-2">${workout.description}</p>` : ''}
                        ${metricsHtml ? `<div class="flex flex-wrap gap-2 text-xs text-surface-500">
                            ${metricsHtml}
                        </div>` : ''}
                    </div>
                    <div class="text-surface-500 hover:text-surface-300 transition flex-shrink-0 mt-1">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </div>
                </div>
            `;
            
            workoutsContainer.appendChild(workoutDiv);
        });
    });
}

/**
 * Open workout detail modal
 */
function openWorkoutModal(workout) {
    const modal = document.getElementById('workoutModal');
    const icon = workoutIcons[workout.type] || '📋';
    
    document.getElementById('modalIcon').textContent = icon;
    document.getElementById('modalTitle').textContent = workout.title;
    
    const content = document.getElementById('modalContent');
    content.innerHTML = renderWorkoutDetails(workout);
    
    modal.classList.remove('hidden');
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

/**
 * Close workout modal
 */
function closeWorkoutModal() {
    document.getElementById('workoutModal').classList.add('hidden');
    
    // Re-enable body scroll
    document.body.style.overflow = '';
}
/**
 * Render workout details
 * Note: The actual implementation is in /public/js/workout-details.js
 * That file provides a comprehensive renderer with all intervals.icu data fields
 */
function formatDuration(seconds) {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

/**
 * Format distance in meters to readable string
 */
function formatDistance(meters) {
    if (!meters) return '';
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)}km`;
    }
    return `${Math.round(meters)}m`;
}

/**
 * Format pace - handles both seconds/km and m/s formats
 */
function formatPace(paceValue, isMeterPerSecond = false) {
    if (!paceValue) return '';
    
    let secondsPerKm;
    
    // If value is very small (< 100), it's likely m/s, convert to s/km
    if (paceValue < 100) {
        secondsPerKm = 1000 / paceValue; // Convert m/s to s/km
    } else {
        secondsPerKm = paceValue; // Assume it's already in s/km
    }
    
    // Only proceed if value is reasonable (between 180s and 900s per km, i.e., 2:00 to 15:00/km)
    if (secondsPerKm < 120 || secondsPerKm > 1200) {
        // Value seems invalid
        return `${secondsPerKm.toFixed(0)}s/km (invalid?)`;
    }
    
    const minutes = Math.floor(secondsPerKm / 60);
    const seconds = Math.round(secondsPerKm % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
}

/**
 * Format speed to km/h
 */
function formatSpeed(meterPerSecond) {
    if (!meterPerSecond) return '';
    return `${(meterPerSecond * 3.6).toFixed(1)} km/h`;
}

/**
 * Navigation functions
 */
function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    loadWorkouts().then(() => renderCalendar());
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    loadWorkouts().then(() => renderCalendar());
}

function goToToday() {
    currentDate = new Date();
    loadWorkouts().then(() => renderCalendar());
}

/**
 * View switching
 */
function setView(view) {
    currentView = view;
    
    // Update button states
    document.getElementById('viewMonth').className = view === 'month' ? 
        'px-3 py-1.5 text-xs font-medium rounded-md bg-surface-700 text-surface-100 transition' :
        'px-3 py-1.5 text-xs font-medium rounded-md text-surface-400 hover:bg-surface-800/50 transition';
    document.getElementById('viewList').className = view === 'list' ? 
        'px-3 py-1.5 text-xs font-medium rounded-md bg-surface-700 text-surface-100 transition' :
        'px-3 py-1.5 text-xs font-medium rounded-md text-surface-400 hover:bg-surface-800/50 transition';
    
    // Show/hide views
    document.getElementById('monthView').className = view === 'month' ? 'card rounded-xl overflow-hidden' : 'hidden';
    document.getElementById('listView').className = view === 'list' ? 'space-y-3' : 'hidden space-y-3';
    
    renderCalendar();
}
