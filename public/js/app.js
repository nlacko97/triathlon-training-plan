/**
 * TriPlan - Triathlon Training Application
 * Clean, focused session tracking
 */

let currentWeek = 1;
let sessionLogs = {};
let currentMetrics = null;
let scheduleOverrides = {};

document.addEventListener("DOMContentLoaded", async () => {
  initWeekNavigation();
  await loadCurrentMetrics();
  await loadSessionLogs();
  await loadScheduleOverrides();
  loadWeek(1);
});

// ============================================
// DATA LOADING
// ============================================

async function loadCurrentMetrics() {
  try {
    const response = await fetch("/api/metrics");
    if (response.ok) {
      currentMetrics = await response.json();
    }
  } catch (err) {
    currentMetrics = {
      ftp_watts: 212,
      css_seconds_per_100m: 125,
      threshold_pace_per_km_seconds: 315,
    };
  }
}

async function loadSessionLogs() {
  try {
    const response = await fetch("/api/sessions");
    if (response.ok) {
      const logs = await response.json();
      sessionLogs = {};
      logs.forEach((log) => {
        sessionLogs[`${log.session_id}_${log.week_number}`] = log;
      });
    }
  } catch (err) {
    console.log("Offline mode");
  }
}

async function loadScheduleOverrides() {
  try {
    const response = await fetch("/api/schedule-overrides");
    if (response.ok) {
      scheduleOverrides = await response.json();
    }
  } catch (err) {
    console.log("Offline mode - no schedule overrides");
  }
}

function updateWeeklyTargets(week) {
  const activeSessions = week.sessions.filter(
    (s) => !["rest", "prep", "recovery"].includes(s.type)
  );
  const targetHours =
    week.weeklyHours ||
    (
      activeSessions.reduce(
        (sum, s) => sum + (s.duration || s.totalDuration || 0),
        0
      ) / 60
    ).toFixed(1);

  const loggedHours = activeSessions.reduce((sum, s) => {
    const log = sessionLogs[`${s.id}_${week.weekNumber}`];
    if (!log?.completed) return sum;

    const duration =
      log.actual_duration_min ||
      log.bike_duration_min + log.run_duration_min ||
      s.duration ||
      s.totalDuration ||
      0;
    return sum + duration / 60;
  }, 0);

  const completedSessions = activeSessions.filter(
    (s) => sessionLogs[`${s.id}_${week.weekNumber}`]?.completed
  ).length;
  const totalSessions = activeSessions.length;
  const completionRate =
    totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0;

  document.getElementById("weeklyHours").textContent = `${loggedHours.toFixed(
    1
  )}/${targetHours}h`;
  document.getElementById(
    "weeklySessions"
  ).textContent = `${completedSessions}/${totalSessions}`;
  document.getElementById(
    "weeklyCompletion"
  ).textContent = `${completionRate}%`;

  const hoursEl = document.getElementById("weeklyHours");
  const completionEl = document.getElementById("weeklyCompletion");

  hoursEl.className = hoursEl.className.replace(/text-\w+-\w+/g, "");
  completionEl.className = completionEl.className.replace(/text-\w+-\w+/g, "");

  if (loggedHours >= targetHours * 0.9) {
    hoursEl.classList.add("text-green-400");
  } else if (loggedHours >= targetHours * 0.5) {
    hoursEl.classList.add("text-amber-400");
  } else {
    hoursEl.classList.add("text-brick-light");
  }

  if (completionRate === 100 && totalSessions > 0) {
    completionEl.classList.add("text-green-400");
  } else if (completionRate >= 50) {
    completionEl.classList.add("text-amber-400");
  } else {
    completionEl.classList.add("text-brick-light");
  }
}

// ============================================
// WEEK NAVIGATION
// ============================================

function initWeekNavigation() {
  const quickNav = document.getElementById("weekQuickNav");
  const raceWeeks = [9, 19, 32];

  for (let i = 1; i <= 32; i++) {
    const btn = document.createElement("button");
    btn.id = `weekBtn${i}`;
    
    const isRace = raceWeeks.includes(i);
    
    btn.className = `flex-shrink-0 w-10 h-12 rounded-xl text-[13px] font-bold transition-all duration-300 flex flex-col items-center justify-center border shadow-sm ${
        isRace 
            ? 'bg-orange-500/10 text-orange-500/70 border-orange-500/20 hover:bg-orange-500/20'
            : 'bg-surface-800/40 text-surface-500 border-surface-700/30 hover:bg-surface-700/60 hover:text-surface-300'
    }`;

    btn.innerHTML = `
        <span class="text-[9px] uppercase tracking-tighter opacity-70 mb-0.5">${isRace ? 'RACE' : 'W'}</span>
        <span>${i}</span>
    `;

    btn.onclick = () => loadWeek(i);
    quickNav.appendChild(btn);
  }
}

function loadWeek(weekNum) {
  weekNum = parseInt(weekNum);
  if (weekNum < 1 || weekNum > 32) return;

  currentWeek = weekNum;
  const week = TrainingPlanAPI.getWeek(weekNum);
  if (!week) return;

  // Update nav buttons
  document.querySelectorAll("#weekQuickNav button").forEach((btn, idx) => {
    const wNum = idx + 1;
    const isSelected = wNum === weekNum;
    const isRace = [9, 19, 32].includes(wNum);
    
    if (isSelected) {
        btn.className = `flex-shrink-0 w-11 h-14 rounded-xl text-base font-black transition-all duration-300 flex flex-col items-center justify-center border-2 z-10 shadow-lg scale-110 ${
            isRace 
                ? 'bg-orange-500 text-white border-orange-400 shadow-orange-500/20' 
                : 'bg-surface-100 text-surface-950 border-white shadow-white/10'
        }`;
    } else {
        btn.className = `flex-shrink-0 w-10 h-12 rounded-xl text-[13px] font-bold transition-all duration-300 flex flex-col items-center justify-center border shadow-sm ${
            isRace 
                ? 'bg-orange-500/10 text-orange-500/70 border-orange-500/20 hover:bg-orange-500/20'
                : 'bg-surface-800/40 text-surface-500 border-surface-700/30 hover:bg-surface-700/60 hover:text-surface-300'
        }`;
    }
  });

  // Smooth scroll to active week
  const activeBtn = document.getElementById(`weekBtn${weekNum}`);
  if (activeBtn) {
    activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  document.getElementById("currentWeekBadge").textContent = weekNum;

  // Update header
  document.getElementById("weekTitle").textContent = `Week ${weekNum}`;
  document.getElementById("weekDates").textContent = formatDateRange(week.dates);
  document.getElementById("phaseBadge").textContent = week.phase;

  // Update progress
  const progress = Math.round((weekNum / 32) * 100);
  document.getElementById("progressPercent").textContent = `${progress}%`;
  document.getElementById("progressBar").style.width = `${progress}%`;

  // Update weekly targets
  updateWeeklyTargets(week);

  // Update week focus section
  const navHeader = document.getElementById("weekNavHeader");
  const notesEl = document.getElementById("weekNotes");
  const notesText = document.getElementById("weekNotesText");
  const focusIcon = document.getElementById("weekFocusIcon");
  const weekLoadEl = document.getElementById("weekLoad");

  if (week.isRaceWeek) {
    navHeader.classList.add("bg-pink-500/5");
    notesEl.className = "flex-1 md:flex-none flex items-center gap-4 p-3.5 bg-pink-500/10 rounded-xl border border-pink-500/20 backdrop-blur-sm relative overflow-hidden group";
    notesText.innerHTML = `<span class="text-pink-300 font-bold">${week.raceName}</span>`;
    focusIcon.textContent = "🏆";
    focusIcon.className = "w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-xl shadow-inner relative z-10";
    weekLoadEl.textContent = "Race Week";
    weekLoadEl.className = "text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow-sm";
  } else {
    navHeader.classList.remove("bg-pink-500/5");
    notesEl.className = "flex-1 md:flex-none flex items-center gap-4 p-3.5 bg-surface-800/40 rounded-xl border border-surface-700/30 backdrop-blur-sm relative overflow-hidden group";
    notesText.textContent = week.notes || week.focus;
    focusIcon.textContent = "🎯";
    focusIcon.className = "w-10 h-10 rounded-xl bg-surface-800/80 flex items-center justify-center text-xl shadow-inner relative z-10";
    
    // Set load indicator
    const loadText = week.load || "Medium";
    const loadColors = {
      "Recovery": "text-green-400 bg-green-500/10 border-green-500/20",
      "Low": "text-blue-400 bg-blue-500/10 border-blue-500/20", 
      "Medium": "text-surface-400 bg-surface-500/10 border-surface-500/20",
      "High": "text-orange-400 bg-orange-500/10 border-orange-500/20",
      "Peak": "text-red-400 bg-red-500/10 border-red-500/20"
    };
    weekLoadEl.textContent = `${loadText} Load`;
    weekLoadEl.className = `text-[10px] font-bold px-1.5 py-0.5 rounded ${loadColors[loadText] || 'text-surface-400 bg-surface-800'} border shadow-sm`;
  }

  renderCalendar(week);
}

function prevWeek() {
  if (currentWeek > 1) loadWeek(currentWeek - 1);
}
function nextWeek() {
  if (currentWeek < 32) loadWeek(currentWeek + 1);
}

// ============================================
// CALENDAR
// ============================================

function renderCalendar(week) {
  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";

  week.dates.days.forEach((day) => {
    // Get sessions for this day, considering schedule overrides
    const sessions = week.sessions.filter((s) => {
      const overrideKey = `${s.id}_${week.weekNumber}`;
      const override = scheduleOverrides[overrideKey];
      
      // If there's an override, check if the new date matches this day
      if (override) {
        return override.new_date === day.date;
      }
      
      // Otherwise, use the original day assignment
      return s.day === day.dayName;
    });

    const el = document.createElement("div");
    el.className = "card rounded-lg overflow-hidden day-container";
    el.dataset.date = day.date;
    el.dataset.dayName = day.dayName;
    
    // Enable drop zone
    el.addEventListener('dragover', handleDragOver);
    el.addEventListener('drop', handleDrop);
    el.addEventListener('dragleave', handleDragLeave);
    
    const sessionsContainer = document.createElement('div');
    sessionsContainer.className = 'p-2 space-y-1.5 min-h-[100px]';
    sessionsContainer.innerHTML = sessions
      .map((s) => renderSession(s, week.weekNumber))
      .join("");
    
    el.innerHTML = `
            <div class="bg-surface-800/50 px-3 py-2 border-b border-surface-800/50">
                <div class="font-medium text-surface-200 text-sm">${day.dayName.slice(
                  0,
                  3
                )}</div>
                <div class="text-xs text-surface-500">${day.displayDate}</div>
            </div>
        `;
    el.appendChild(sessionsContainer);
    grid.appendChild(el);
  });
}

function renderSession(session, weekNum) {
    // Use solid colors with white text for good contrast
    const sportConfig = {
        run: { css: 'session-run', icon: '🏃' },
        bike: { css: 'session-bike', icon: '🚴' },
        swim: { css: 'session-swim', icon: '🏊' },
        strength: { css: 'session-strength', icon: '💪' },
        climbing: { css: 'session-strength', icon: '🧗' },
        rest: { css: 'session-rest', icon: '😴' },
        race: { css: 'session-run', icon: '🏆' },
        prep: { css: 'session-rest', icon: '📋' },
        recovery: { css: 'session-rest', icon: '🧘' },
        brick: { css: 'session-brick', icon: '🧱' }
    };
    
    // Handle brick sessions - show appropriate icon based on content
    if (session.type === 'brick') {
        const hasBike = session.bike && session.bike.duration > 0;
        const hasRun = session.run && session.run.duration > 0;
        
        if (hasBike && hasRun) {
            sportConfig.brick.icon = '🧱';
        } else if (hasBike && !hasRun) {
            sportConfig.brick = { css: 'session-bike', icon: '🚴' };
        } else if (hasRun && !hasBike) {
            sportConfig.brick = { css: 'session-run', icon: '🏃' };
        }
    }
    
    const config = sportConfig[session.type] || { css: 'session-rest', icon: '📋' };
    
    const log = sessionLogs[`${session.id}_${weekNum}`];
    const done = log?.completed;
    const skipped = log?.skipped;
    
    const duration = session.duration || session.totalDuration || 0;
    
    // Check if this session has been rescheduled
    const overrideKey = `${session.id}_${weekNum}`;
    const isRescheduled = scheduleOverrides[overrideKey] !== undefined;
    
    return `
        <div class="session-card ${config.css} border rounded-md p-2.5 cursor-move ${done ? 'done' : ''} ${isRescheduled ? 'rescheduled' : ''}"
             draggable="true"
             data-session-id="${session.id}"
             data-week-num="${weekNum}"
             ondragstart="handleDragStart(event)"
             ondragend="handleDragEnd(event)"
             onclick="event.stopPropagation(); openModal('${session.id}', ${weekNum})">
            <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                    <span class="text-sm flex-shrink-0 drag-handle" title="Drag to reschedule">${config.icon}</span>
                    <div class="min-w-0">
                        <div class="font-medium text-xs truncate">${session.title}</div>
                        ${duration > 0 ? `<div class="text-xs opacity-80">${formatDuration(duration)}</div>` : ''}
                    </div>
                </div>
                <div class="flex items-center gap-1 flex-shrink-0">
                    ${isRescheduled ? '<span class="text-xs opacity-60" title="Rescheduled">↻</span>' : ''}
                    ${done ? '<span class="text-xs opacity-80">✓</span>' : ''}
                    ${skipped ? '<span class="text-xs opacity-80">✕</span>' : ''}
                </div>
            </div>
        </div>
    `;
}

// ============================================
// MODAL
// ============================================

function openModal(sessionId, weekNum) {
  const week = TrainingPlanAPI.getWeek(weekNum);
  const session = week.sessions.find((s) => s.id === sessionId);
  if (!session) return;

  const log = sessionLogs[`${sessionId}_${weekNum}`] || {};
  const modal = document.getElementById("sessionModal");
  const title = document.getElementById("modalTitle");
  const content = document.getElementById("modalContent");

  title.textContent = session.title;

  let icons = {
    run: "🏃",
    bike: "🚴",
    swim: "🏊",
    brick: "🧱",
    strength: "💪",
    climbing: "🧗",
    rest: "😴",
    race: "🏆",
  };

  // Determine the display type for brick sessions
  let displayType = session.type;
  let displayIcon = icons[session.type] || "📋";
  
  if (session.type === "brick") {
    const hasBike = session.bike && session.bike.duration > 0;
    const hasRun = session.run && session.run.duration > 0;

    if (hasBike && hasRun) {
      displayType = "brick";
      displayIcon = "🧱";
    } else if (hasBike && !hasRun) {
      displayType = "bike";
      displayIcon = "🚴";
    } else if (hasRun && !hasBike) {
      displayType = "run";
      displayIcon = "🏃";
    }
  }

  // Check if session has been rescheduled
  const overrideKey = `${sessionId}_${weekNum}`;
  const override = scheduleOverrides[overrideKey];
  const isRescheduled = override !== undefined;

  content.innerHTML = `
        <div class="space-y-4">
            <!-- Type & Date -->
            <div class="flex items-center gap-2 flex-wrap">
                <span class="px-2.5 py-1 rounded-md text-sm font-medium bg-surface-800 text-surface-300 capitalize">
                    ${displayIcon} ${displayType}
                </span>
                <span class="text-sm text-surface-500">${session.date}</span>
                ${
                  log.completed
                    ? '<span class="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">Completed</span>'
                    : ""
                }
                ${
                  isRescheduled
                    ? '<span class="px-2 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400">Rescheduled</span>'
                    : ""
                }
            </div>
            ${
              isRescheduled
                ? `<div class="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3">
                     <div class="flex items-center justify-between gap-2">
                       <div class="text-xs text-yellow-400">
                         <span class="font-medium">Moved from original day (${session.day})</span>
                       </div>
                       <button onclick="restoreOriginalSchedule('${sessionId}', ${weekNum})" 
                               class="text-xs px-2 py-1 rounded bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 transition">
                         Restore
                       </button>
                     </div>
                   </div>`
                : ""
            }
            
            <!-- Description -->
            <p class="text-surface-300 text-sm leading-relaxed">${
              session.description || "No description"
            }</p>
            
            <!-- Targets -->
            ${renderTargets(session)}
            
            <!-- Log Form -->
            <div class="border-t border-surface-700/50 pt-4 space-y-4">
                <h4 class="font-medium text-surface-100 text-sm">Log Session</h4>
                
                ${renderTypeFields(session, log)}
                
                <!-- Common -->
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs text-surface-400 mb-1">Duration (min)</label>
                        <input type="number" id="fDuration" value="${
                          log.actual_duration_min || session.duration || ""
                        }" 
                               class="w-full rounded-md text-sm px-3 py-2 border">
                    </div>
                    <div>
                        <label class="block text-xs text-surface-400 mb-1">RPE (1-10)</label>
                        <input type="number" id="fRpe" min="1" max="10" value="${
                          log.rpe || ""
                        }" 
                               class="w-full rounded-md text-sm px-3 py-2 border">
                    </div>
                </div>
                
                <!-- Completion Rate Slider -->
                <div>
                    <div class="flex items-center justify-between mb-2">
                        <label class="block text-xs text-surface-400">Completion Rate</label>
                        <span class="text-sm font-semibold text-surface-200" id="completionRateValue">${
                          log.completion_rate || 100
                        }%</span>
                    </div>
                    <input type="range" id="fCompletionRate" min="0" max="100" step="5" value="${
                      log.completion_rate || 100
                    }" 
                           class="w-full h-2 rounded-lg appearance-none cursor-pointer slider-custom"
                           oninput="document.getElementById('completionRateValue').textContent = this.value + '%'">
                    <div class="flex justify-between text-xs text-surface-500 mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                    </div>
                </div>
                
                <div>
                    <label class="block text-xs text-surface-400 mb-1">Notes</label>
                    <textarea id="fNotes" rows="2" class="w-full rounded-md text-sm px-3 py-2 border" placeholder="How did it go?">${
                      log.notes || ""
                    }</textarea>
                </div>
                
                <!-- Actions -->
                <div class="flex flex-col gap-2 pt-2">
                    <div class="flex gap-2">
                        <button onclick="saveSession('${sessionId}', ${weekNum}, true)" 
                                class="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-md text-sm font-medium transition">
                            ✓ Complete
                        </button>
                        <button onclick="saveSession('${sessionId}', ${weekNum}, false, true)" 
                                class="flex-1 px-4 py-2 rounded-md text-sm font-medium border border-surface-600 text-surface-300 hover:bg-surface-800 transition">
                            Skip
                        </button>
                    </div>
                    ${
                      log.completed || log.skipped
                        ? `
                        <button onclick="resetSession('${sessionId}', ${weekNum})" 
                                class="w-full py-2 rounded-md text-sm font-medium border border-red-500/30 text-red-500/70 hover:bg-red-500/10 transition">
                            Undo / Reset Progress
                        </button>
                    `
                        : ""
                    }
                </div>
            </div>
        </div>
    `;

  modal.classList.remove("hidden");
}

async function resetSession(sessionId, weekNum) {
  if (!confirm("Remove progress for this session?")) return;

  try {
    await fetch(`/api/sessions/${sessionId}/${weekNum}`, {
      method: "DELETE",
    });
    delete sessionLogs[`${sessionId}_${weekNum}`];
    closeModal();
    loadWeek(weekNum);
  } catch (err) {
    console.error("Failed to reset session", err);
  }
}

function renderTargets(session) {
  const targets = [];

  if (session.target) {
    if (session.target.duration)
      targets.push(["Duration", `${session.target.duration}min`]);
    if (session.target.distance)
      targets.push(["Distance", `${session.target.distance}km`]);
    if (session.target.pace) targets.push(["Pace", session.target.pace]);
    if (session.target.power) targets.push(["Power", session.target.power]);
  }
  if (session.bike)
    targets.push([
      "Bike",
      `${session.bike.duration}min @ ${session.bike.power}`,
    ]);
  if (session.run)
    targets.push(["Run", `${session.run.duration}min @ ${session.run.pace}`]);

  if (targets.length === 0) return "";

  return `
        <div class="bg-surface-800/30 rounded-md p-3">
            <div class="text-xs font-medium text-surface-400 mb-2">TARGETS</div>
            <div class="grid grid-cols-2 gap-2 text-sm">
                ${targets
                  .map(
                    ([k, v]) =>
                      `<div class="text-surface-500">${k}</div><div class="text-surface-200 font-medium">${v}</div>`
                  )
                  .join("")}
            </div>
        </div>
    `;
}

function renderTypeFields(session, log) {
  if (session.type === "run") {
    return `
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs text-surface-400 mb-1">Distance (km)</label>
                    <input type="number" step="0.1" id="fDistance" value="${
                      log.actual_distance_km || ""
                    }" class="w-full rounded-md text-sm px-3 py-2 border">
                </div>
                <div>
                    <label class="block text-xs text-surface-400 mb-1">Avg HR</label>
                    <input type="number" id="fAvgHr" value="${
                      log.actual_avg_hr || ""
                    }" class="w-full rounded-md text-sm px-3 py-2 border">
                </div>
            </div>
        `;
  }

  if (session.type === "bike") {
    return `
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs text-surface-400 mb-1">Avg Power (W)</label>
                    <input type="number" id="fAvgPower" value="${
                      log.actual_avg_power || ""
                    }" class="w-full rounded-md text-sm px-3 py-2 border">
                </div>
                <div>
                    <label class="block text-xs text-surface-400 mb-1">NP (W)</label>
                    <input type="number" id="fNpPower" value="${
                      log.actual_np_power || ""
                    }" class="w-full rounded-md text-sm px-3 py-2 border">
                </div>
            </div>
        `;
  }

  if (session.type === "swim") {
    return `
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs text-surface-400 mb-1">Distance (m)</label>
                    <input type="number" id="fSwimDist" value="${
                      log.actual_distance_m || ""
                    }" class="w-full rounded-md text-sm px-3 py-2 border">
                </div>
                <div>
                    <label class="block text-xs text-surface-400 mb-1">Avg HR</label>
                    <input type="number" id="fAvgHr" value="${
                      log.actual_avg_hr || ""
                    }" class="w-full rounded-md text-sm px-3 py-2 border">
                </div>
            </div>
        `;
  }

  if (session.type === "brick") {
    return `
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs text-surface-400 mb-1">Bike (min)</label>
                    <input type="number" id="fBikeDur" value="${
                      log.bike_duration_min || ""
                    }" class="w-full rounded-md text-sm px-3 py-2 border">
                </div>
                <div>
                    <label class="block text-xs text-surface-400 mb-1">Run (min)</label>
                    <input type="number" id="fRunDur" value="${
                      log.run_duration_min || ""
                    }" class="w-full rounded-md text-sm px-3 py-2 border">
                </div>
            </div>
        `;
  }

  return "";
}

async function saveSession(sessionId, weekNum, completed, skipped = false) {
  const week = TrainingPlanAPI.getWeek(weekNum);
  const session = week.sessions.find((s) => s.id === sessionId);

  const data = {
    session_id: sessionId,
    week_number: weekNum,
    session_date: session.date,
    session_type: session.type,
    completed: completed ? 1 : 0,
    skipped: skipped ? 1 : 0,
    actual_duration_min:
      parseInt(document.getElementById("fDuration")?.value) || null,
    rpe: parseInt(document.getElementById("fRpe")?.value) || null,
    notes: document.getElementById("fNotes")?.value || null,
    actual_distance_km:
      parseFloat(document.getElementById("fDistance")?.value) || null,
    actual_avg_hr: parseInt(document.getElementById("fAvgHr")?.value) || null,
    actual_avg_power:
      parseInt(document.getElementById("fAvgPower")?.value) || null,
    actual_np_power:
      parseInt(document.getElementById("fNpPower")?.value) || null,
    actual_distance_m:
      parseInt(document.getElementById("fSwimDist")?.value) || null,
    bike_duration_min:
      parseInt(document.getElementById("fBikeDur")?.value) || null,
    run_duration_min:
      parseInt(document.getElementById("fRunDur")?.value) || null,
    completion_rate:
      parseInt(document.getElementById("fCompletionRate")?.value) || null,
  };

  try {
    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (err) {
    /* offline */
  }

  sessionLogs[`${sessionId}_${weekNum}`] = data;
  closeModal();
  loadWeek(weekNum);
}

function closeModal() {
  document.getElementById("sessionModal").classList.add("hidden");
}

// ============================================
// UTILS
// ============================================

function formatDuration(min) {
  if (!min) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
}

function formatDateRange(dates) {
  if (!dates?.days?.length) return "";
  return `${dates.days[0].displayDate} - ${dates.days[6].displayDate}`;
}

// Keyboard
document.addEventListener("keydown", (e) => {
  if (
    e.key === "ArrowLeft" &&
    !document.getElementById("sessionModal").classList.contains("hidden") ===
      false
  )
    prevWeek();
  if (
    e.key === "ArrowRight" &&
    !document.getElementById("sessionModal").classList.contains("hidden") ===
      false
  )
    nextWeek();
  if (e.key === "Escape") closeModal();
});

// ============================================
// DRAG AND DROP
// ============================================

let draggedSession = null;

function handleDragStart(event) {
  draggedSession = {
    sessionId: event.target.dataset.sessionId,
    weekNum: parseInt(event.target.dataset.weekNum)
  };
  event.target.style.opacity = '0.4';
  event.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(event) {
  event.target.style.opacity = '1';
  
  // Remove all drag-over highlighting
  document.querySelectorAll('.day-container').forEach(el => {
    el.classList.remove('drag-over');
  });
}

function handleDragOver(event) {
  if (event.preventDefault) {
    event.preventDefault();
  }
  
  event.dataTransfer.dropEffect = 'move';
  
  // Add visual feedback
  const dayContainer = event.currentTarget;
  if (dayContainer.classList.contains('day-container')) {
    dayContainer.classList.add('drag-over');
  }
  
  return false;
}

function handleDragLeave(event) {
  const dayContainer = event.currentTarget;
  if (dayContainer.classList.contains('day-container')) {
    dayContainer.classList.remove('drag-over');
  }
}

async function handleDrop(event) {
  if (event.stopPropagation) {
    event.stopPropagation();
  }
  
  const dayContainer = event.currentTarget;
  dayContainer.classList.remove('drag-over');
  
  if (!draggedSession) return false;
  
  const newDate = dayContainer.dataset.date;
  const { sessionId, weekNum } = draggedSession;
  
  // Get the original session to check its original date
  const week = TrainingPlanAPI.getWeek(weekNum);
  const session = week.sessions.find(s => s.id === sessionId);
  
  if (!session) {
    draggedSession = null;
    return false;
  }
  
  // Check if we're moving back to the original day
  const isMovingBackToOriginal = session.date === newDate;
  
  try {
    if (isMovingBackToOriginal) {
      // Delete the override to restore original schedule
      await fetch(`/api/schedule-overrides/${sessionId}/${weekNum}`, {
        method: 'DELETE'
      });
      
      // Remove from local state
      const key = `${sessionId}_${weekNum}`;
      delete scheduleOverrides[key];
    } else {
      // Save the schedule override to the backend
      await fetch('/api/schedule-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          week_number: weekNum,
          new_date: newDate
        })
      });
      
      // Update local state
      const key = `${sessionId}_${weekNum}`;
      scheduleOverrides[key] = {
        session_id: sessionId,
        week_number: weekNum,
        new_date: newDate
      };
    }
    
    // Re-render the calendar
    loadWeek(currentWeek);
  } catch (err) {
    console.error('Failed to save schedule override', err);
    alert('Failed to reschedule workout. Please try again.');
  }
  
  draggedSession = null;
  return false;
}

async function restoreOriginalSchedule(sessionId, weekNum) {
  try {
    await fetch(`/api/schedule-overrides/${sessionId}/${weekNum}`, {
      method: 'DELETE'
    });
    
    // Remove from local state
    const key = `${sessionId}_${weekNum}`;
    delete scheduleOverrides[key];
    
    // Close modal and re-render
    closeModal();
    loadWeek(currentWeek);
  } catch (err) {
    console.error('Failed to restore original schedule', err);
    alert('Failed to restore original schedule. Please try again.');
  }
}
