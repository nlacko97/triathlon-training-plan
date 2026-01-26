/**
 * Comprehensive Workout Details Renderer
 * Displays intervals.icu workout data in an informative, visually appealing way
 */

/**
 * Render complete workout details
 */
function renderWorkoutDetails(w) {
    // Safely parse date
    const [year, month, day] = w.date.split('-');
    const dateObj = new Date(year, month - 1, day);
    const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const timeStr = w.start_time ? new Date(w.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    
    const icon = {
        run: '🏃', bike: '🚴', swim: '🏊', strength: '💪', hike: '🥾',
        ski: '⛷️', climbing: '🧗', basketball: '🏀', recovery: '🧘', rest: '😴'
    }[w.type] || '📋';
    
    let html = `<div class="space-y-3">`;
    
    // ============ HEADER STATS (Quick Overview) ============
    html += renderHeaderStats(w);
    
    // ============ MAIN METRICS (Heart Rate, Power, Speed) ============
    html += renderMainMetrics(w);
    
    // ============ SPORT-SPECIFIC SECTIONS ============
    if (w.type === 'run') {
        html += renderRunDetails(w);
    } else if (w.type === 'bike') {
        html += renderBikeDetails(w);
    } else if (w.type === 'swim') {
        html += renderSwimDetails(w);
    }
    
    // ============ TRAINING LOAD & PROGRESSION ============
    html += renderTrainingLoad(w);
    
     // ============ HR ZONES (7-Zone Display) ============
     html += renderHRZones(w);
     
     // ============ POWER ZONES (Cycling/Running if available) ============
     html += renderPowerZones(w);
     
     // ============ INTERVALS & STRUCTURE ============
     if (w.interval_summary && w.interval_summary.length > 0) {
         html += renderIntervals(w);
     }
    
    // ============ DEVICE & SOURCE ============
    html += renderDeviceInfo(w);
    
    html += `</div>`;
    return html;
}

/**
 * Render header stats - Quick overview cards
 */
function renderHeaderStats(w) {
    const duration = w.moving_time ? formatDuration(w.moving_time) : formatDuration(w.elapsed_time);
    const distance = w.distance ? formatDistance(w.distance) : '—';
    const pace = w.avg_pace ? formatPace(w.avg_pace) : w.avg_speed ? formatSpeed(w.avg_speed) : '—';
    
    return `
        <div class="grid grid-cols-4 gap-2 mb-3">
            <div class="bg-surface-700/40 rounded-lg p-3 border border-surface-600/30">
                <div class="text-xs text-surface-500">Duration</div>
                <div class="text-sm font-bold text-surface-100">${duration}</div>
            </div>
            <div class="bg-surface-700/40 rounded-lg p-3 border border-surface-600/30">
                <div class="text-xs text-surface-500">Distance</div>
                <div class="text-sm font-bold text-surface-100">${distance}</div>
            </div>
            <div class="bg-surface-700/40 rounded-lg p-3 border border-surface-600/30">
                <div class="text-xs text-surface-500">Avg Pace</div>
                <div class="text-sm font-bold text-surface-100">${pace}</div>
            </div>
            <div class="bg-surface-700/40 rounded-lg p-3 border border-surface-600/30">
                <div class="text-xs text-surface-500">Calories</div>
                <div class="text-sm font-bold text-surface-100">${w.calories ? w.calories : '—'}</div>
            </div>
        </div>
    `;
}

/**
 * Render main metrics - Heart rate, effort, intensity
 */
function renderMainMetrics(w) {
    let html = `<div class="bg-surface-800/50 rounded-lg p-4 border border-surface-700/50">
        <h3 class="text-sm font-bold text-surface-100 mb-3">Performance Overview</h3>
        <div class="grid grid-cols-2 gap-4">
    `;
    
    // Heart Rate Section
    if (w.avg_heart_rate) {
        const hrPercent = Math.round((w.avg_heart_rate / w.athlete_max_hr) * 100);
        html += `
            <div>
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-semibold text-surface-300">❤️ Heart Rate</span>
                    <span class="text-xs text-surface-400">${Math.round(w.avg_heart_rate)} bpm (${hrPercent}%)</span>
                </div>
                <div class="h-2 bg-surface-900 rounded-full overflow-hidden">
                    <div class="h-full bg-red-500/60" style="width: ${Math.min(hrPercent, 100)}%"></div>
                </div>
                <div class="text-xs text-surface-500 mt-1">Max: ${w.max_heart_rate} bpm</div>
            </div>
        `;
    }
    
    // Training Load
    if (w.icu_training_load) {
        html += `
            <div>
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-semibold text-surface-300">📈 Training Load</span>
                    <span class="text-xs text-surface-400">${w.icu_training_load}</span>
                </div>
                <div class="h-2 bg-surface-900 rounded-full overflow-hidden">
                    <div class="h-full bg-yellow-500/60" style="width: ${Math.min(w.icu_training_load / 50 * 100, 100)}%"></div>
                </div>
                ${w.icu_intensity ? `<div class="text-xs text-surface-500 mt-1">Intensity: ${Math.round(w.icu_intensity)}%</div>` : ''}
            </div>
        `;
    }
    
    // Estimated Effort (TRIMP)
    if (w.trimp) {
        html += `
            <div>
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-semibold text-surface-300">🔥 TRIMP</span>
                    <span class="text-xs text-surface-400">${w.trimp.toFixed(1)}</span>
                </div>
                <div class="h-2 bg-surface-900 rounded-full overflow-hidden">
                    <div class="h-full bg-orange-500/60" style="width: ${Math.min(w.trimp / 50 * 100, 100)}%"></div>
                </div>
            </div>
        `;
    }
    
    // HR Load (HRSS equivalent)
    if (w.hr_load) {
        html += `
            <div>
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-semibold text-surface-300">💪 HR Load</span>
                    <span class="text-xs text-surface-400">${Math.round(w.hr_load)}</span>
                </div>
                <div class="h-2 bg-surface-900 rounded-full overflow-hidden">
                    <div class="h-full bg-pink-500/60" style="width: ${Math.min(w.hr_load / 100 * 100, 100)}%"></div>
                </div>
            </div>
        `;
    }
    
    html += `</div></div>`;
    return html;
}

/**
 * Render running-specific details
 */
function renderRunDetails(w) {
    if (!w.avg_pace && !w.average_stride) return '';
    
    let html = `<div class="bg-surface-800/40 rounded-lg p-4 border border-orange-900/40">
        <h3 class="text-sm font-bold text-orange-300 mb-3">🏃 Running Metrics</h3>
        <div class="grid grid-cols-2 gap-3 text-sm">
    `;
    
    if (w.avg_pace) {
        html += `
            <div>
                <div class="text-surface-500 text-xs">⏱️ Avg Pace</div>
                <div class="text-surface-100 font-bold">${formatPace(w.avg_pace)}</div>
            </div>
        `;
    }
    
    if (w.gap) {
        html += `
            <div>
                <div class="text-surface-500 text-xs">📉 Grade Adj Pace</div>
                <div class="text-surface-100 font-bold">${formatSpeed(w.gap)}</div>
            </div>
        `;
    }
    
    if (w.elevation_gain) {
        html += `
            <div>
                <div class="text-surface-500 text-xs">⛰️ Elevation Gain</div>
                <div class="text-surface-100 font-bold">${Math.round(w.elevation_gain)}m</div>
            </div>
        `;
    }
    
    if (w.average_stride) {
        html += `
            <div>
                <div class="text-surface-500 text-xs">👣 Avg Stride</div>
                <div class="text-surface-100 font-bold">${(w.average_stride * 100).toFixed(0)}cm</div>
            </div>
        `;
    }
    
    if (w.avg_cadence) {
        html += `
            <div>
                <div class="text-surface-500 text-xs">🔄 Cadence</div>
                <div class="text-surface-100 font-bold">${Math.round(w.avg_cadence)} spm</div>
            </div>
        `;
    }
    
    html += `</div></div>`;
    return html;
}

/**
 * Render cycling-specific details
 */
function renderBikeDetails(w) {
    if (!w.elevation_gain && !w.avg_cadence) return '';
    
    let html = `<div class="bg-surface-800/40 rounded-lg p-4 border border-green-900/40">
        <h3 class="text-sm font-bold text-green-300 mb-3">🚴 Cycling Metrics</h3>
        <div class="grid grid-cols-2 gap-3 text-sm">
    `;
    
    if (w.elevation_gain) {
        html += `
            <div>
                <div class="text-surface-500 text-xs">⛰️ Elevation Gain</div>
                <div class="text-surface-100 font-bold">${Math.round(w.elevation_gain)}m</div>
            </div>
        `;
    }
    
    if (w.elevation_loss) {
        html += `
            <div>
                <div class="text-surface-500 text-xs">📉 Elevation Loss</div>
                <div class="text-surface-100 font-bold">${Math.round(w.elevation_loss)}m</div>
            </div>
        `;
    }
    
    if (w.avg_cadence) {
        html += `
            <div>
                <div class="text-surface-500 text-xs">🔄 Avg Cadence</div>
                <div class="text-surface-100 font-bold">${Math.round(w.avg_cadence)} rpm</div>
            </div>
        `;
    }
    
    if (w.avg_speed) {
        html += `
            <div>
                <div class="text-surface-500 text-xs">🚀 Avg Speed</div>
                <div class="text-surface-100 font-bold">${formatSpeed(w.avg_speed)}</div>
            </div>
        `;
    }
    
    if (w.max_speed) {
        html += `
            <div>
                <div class="text-surface-500 text-xs">🚀 Max Speed</div>
                <div class="text-surface-100 font-bold">${formatSpeed(w.max_speed)}</div>
            </div>
        `;
    }
    
    html += `</div></div>`;
    return html;
}

/**
 * Render swimming-specific details
 */
function renderSwimDetails(w) {
    if (!w.pool_length && !w.avg_cadence) return '';
    
    let html = `<div class="bg-surface-800/40 rounded-lg p-4 border border-blue-900/40">
        <h3 class="text-sm font-bold text-blue-300 mb-3">🏊 Swimming Metrics</h3>
        <div class="grid grid-cols-2 gap-3 text-sm">
    `;
    
    if (w.pool_length) {
        html += `
            <div>
                <div class="text-surface-500 text-xs">🏊 Pool Length</div>
                <div class="text-surface-100 font-bold">${w.pool_length}m</div>
            </div>
        `;
    }
    
    if (w.lengths) {
        html += `
            <div>
                <div class="text-surface-500 text-xs">🔢 Total Lengths</div>
                <div class="text-surface-100 font-bold">${w.lengths}</div>
            </div>
        `;
    }
    
    if (w.avg_cadence) {
        html += `
            <div>
                <div class="text-surface-500 text-xs">🔄 Stroke Rate</div>
                <div class="text-surface-100 font-bold">${Math.round(w.avg_cadence)} spm</div>
            </div>
        `;
    }
    
    if (w.avg_pace) {
        html += `
            <div>
                <div class="text-surface-500 text-xs">⏱️ Avg Pace</div>
                <div class="text-surface-100 font-bold">${formatPace(w.avg_pace)}/100m</div>
            </div>
        `;
    }
    
    html += `</div></div>`;
    return html;
}

/**
 * Render training load & fitness progression
 */
function renderTrainingLoad(w) {
    if (!w.icu_atl && !w.icu_ctl && !w.icu_tsb) return '';
    
    let html = `<div class="bg-surface-800/50 rounded-lg p-4 border border-surface-700/50">
        <h3 class="text-sm font-bold text-surface-100 mb-3">📊 Fitness Progression</h3>
        <div class="grid grid-cols-3 gap-3 text-sm">
    `;
    
    if (w.icu_atl) {
        html += `
            <div class="bg-surface-900/60 rounded p-3">
                <div class="text-xs text-surface-500 mb-1">ATL (6d)</div>
                <div class="text-sm font-bold text-surface-100">${w.icu_atl.toFixed(1)}</div>
                <div class="text-xs text-surface-600">Acute Load</div>
            </div>
        `;
    }
    
    if (w.icu_ctl) {
        html += `
            <div class="bg-surface-900/60 rounded p-3">
                <div class="text-xs text-surface-500 mb-1">CTL (42d)</div>
                <div class="text-sm font-bold text-surface-100">${w.icu_ctl.toFixed(1)}</div>
                <div class="text-xs text-surface-600">Chronic Load</div>
            </div>
        `;
    }
    
    if (w.icu_tsb) {
        const tsbColor = w.icu_tsb > 0 ? 'text-green-400' : w.icu_tsb < -30 ? 'text-red-400' : 'text-yellow-400';
        html += `
            <div class="bg-surface-900/60 rounded p-3">
                <div class="text-xs text-surface-500 mb-1">TSB</div>
                <div class="text-sm font-bold ${tsbColor}">${w.icu_tsb.toFixed(1)}</div>
                <div class="text-xs text-surface-600">Balance</div>
            </div>
        `;
    }
    
    html += `</div></div>`;
    return html;
}

/**
 * Render HR Zones - 7-zone detailed breakdown
 */
function renderHRZones(w) {
    if (!w.icu_hr_zone_times || w.icu_hr_zone_times.length === 0) return '';
    
    const zoneNames = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5', 'Z6', 'Z7'];
    const zoneDescriptions = ['Recovery', 'Easy', 'Moderate', 'Hard', 'VO2Max', 'Anaerobic', 'Maximum'];
    const zoneColors = [
        'bg-blue-500/60',
        'bg-green-500/60',
        'bg-yellow-500/60',
        'bg-orange-500/60',
        'bg-red-500/60',
        'bg-purple-500/60',
        'bg-red-700/60'
    ];
    
    const totalTime = w.icu_hr_zone_times.reduce((a, b) => a + b, 0);
    
    let html = `<div class="bg-surface-800/50 rounded-lg p-4 border border-surface-700/50">
        <h3 class="text-sm font-bold text-surface-100 mb-3">❤️ Heart Rate Zones (${formatDuration(totalTime)} total)</h3>
        <div class="space-y-2">
    `;
    
    w.icu_hr_zone_times.forEach((time, idx) => {
        const percent = totalTime > 0 ? (time / totalTime * 100) : 0;
        const threshold = w.icu_hr_zones[idx];
        
        html += `
            <div>
                <div class="flex justify-between items-center mb-1">
                    <div>
                        <span class="text-xs font-bold text-surface-200">${zoneNames[idx]} ${zoneDescriptions[idx]}</span>
                        ${threshold ? `<span class="text-xs text-surface-500 ml-2">≤${threshold}bpm</span>` : ''}
                    </div>
                    <span class="text-xs text-surface-400">${formatDuration(time)} (${percent.toFixed(0)}%)</span>
                </div>
                <div class="w-full bg-surface-900 rounded-full h-2 overflow-hidden border border-surface-700">
                    <div class="h-full ${zoneColors[idx]}" style="width: ${percent}%"></div>
                </div>
            </div>
        `;
    });
    
     html += `</div></div>`;
     return html;
}

/**
 * Render Power Zones - for cycling and running activities
 */
function renderPowerZones(w) {
     // Only show if we have power zone thresholds
     if (!w.icu_power_zones || w.icu_power_zones.length === 0) {
         return '';
     }
     
     const zoneNames = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5', 'Z6', 'Z7'];
     const zoneDescriptions = ['Active Recovery', 'Endurance', 'Tempo', 'Threshold', 'VO2 Max', 'Anaerobic', 'Neuromuscular'];
     const zoneColors = [
         'bg-blue-500/60',
         'bg-green-500/60',
         'bg-yellow-500/60',
         'bg-orange-500/60',
         'bg-red-500/60',
         'bg-purple-500/60',
         'bg-red-700/60'
     ];
     
     // Calculate total time in all zones if available
     let totalZoneTime = 0;
     if (w.icu_power_zone_times) {
         totalZoneTime = w.icu_power_zone_times.reduce((a, b) => a + b, 0);
     }
     
     let html = `<div class="bg-surface-800/50 rounded-lg p-4 border border-surface-700/50">
         <div class="flex items-center justify-between mb-3">
             <h3 class="text-sm font-bold text-surface-100">⚡ Power Zones</h3>
             <div class="text-xs text-surface-400">
                 ${w.icu_average_watts ? `Avg: <span class="text-surface-200 font-semibold">${Math.round(w.icu_average_watts)}W</span>` : ''}
                 ${w.icu_weighted_avg_watts ? ` / NP: <span class="text-surface-200 font-semibold">${Math.round(w.icu_weighted_avg_watts)}W</span>` : ''}
             </div>
         </div>
         <div class="space-y-2">
     `;
     
     w.icu_power_zones.forEach((threshold, idx) => {
         // Get time spent in this zone if available
         const timeInZone = w.icu_power_zone_times ? w.icu_power_zone_times[idx] : null;
         const timeStr = timeInZone ? formatDuration(timeInZone) : '—';
         const percent = totalZoneTime > 0 && timeInZone ? (timeInZone / totalZoneTime * 100) : 0;
         
         html += `
             <div>
                 <div class="flex justify-between items-center mb-1">
                     <div>
                         <span class="text-xs font-bold text-surface-200">${zoneNames[idx]} ${zoneDescriptions[idx]}</span>
                         <span class="text-xs text-surface-500 ml-2">≤${threshold}W</span>
                     </div>
                     <span class="text-xs text-surface-400">${timeStr}${percent > 0 ? ` (${percent.toFixed(0)}%)` : ''}</span>
                 </div>
                 <div class="w-full bg-surface-900 rounded-full h-2 overflow-hidden border border-surface-700">
                     <div class="h-full ${zoneColors[idx]}" style="width: ${percent}%"></div>
                 </div>
             </div>
         `;
     });
     
     html += `</div></div>`;
     return html;
}

/**
 * Render intervals/lap structure
 */
function renderIntervals(w) {
    let html = `<div class="bg-surface-800/40 rounded-lg p-4 border border-purple-900/40">
        <h3 class="text-sm font-bold text-purple-300 mb-3">🔄 Workout Structure</h3>
        <div class="space-y-2">
    `;
    
    w.interval_summary.forEach(interval => {
        html += `<div class="text-xs bg-surface-900/60 rounded px-3 py-2 text-surface-300">${interval}</div>`;
    });
    
    html += `</div></div>`;
    return html;
}

/**
 * Render device and source information
 */
function renderDeviceInfo(w) {
    let html = `<div class="bg-surface-800/40 rounded-lg p-4 border border-surface-700/30 text-xs">
        <div class="grid grid-cols-2 gap-3">
            <div>
                <div class="text-surface-500">Device</div>
                <div class="text-surface-200 font-medium">${w.device_name || 'Unknown'}</div>
            </div>
            <div>
                <div class="text-surface-500">Source</div>
                <div class="text-surface-200 font-medium">${w.source_app || 'Unknown'}</div>
            </div>
            <div>
                <div class="text-surface-500">File Type</div>
                <div class="text-surface-200 font-medium">${w.file_type?.toUpperCase() || 'N/A'}</div>
            </div>
            <div>
                <div class="text-surface-500">Synced</div>
                <div class="text-surface-200 font-medium">intervals.icu</div>
            </div>
        </div>
    </div>`;
    return html;
}

/**
 * Helper: Format duration in seconds to readable string
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
 * Helper: Format distance in meters to readable string
 */
function formatDistance(meters) {
    if (!meters) return '';
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)}km`;
    }
    return `${Math.round(meters)}m`;
}

/**
 * Helper: Format pace - handles both seconds/km and m/s formats
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
 * Helper: Format speed to km/h
 */
function formatSpeed(meterPerSecond) {
    if (!meterPerSecond) return '';
    return `${(meterPerSecond * 3.6).toFixed(1)} km/h`;
}
