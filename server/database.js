/**
 * Simple JSON File-based Database for Triathlon Training Plan
 * Lightweight and portable - no native dependencies
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'training-data.json');

// Default data structure
const defaultData = {
  profile: {
    name: 'Athlete',
    age: 28,
    weight_kg: 75,
    max_hr: 192
  },
  metrics: {
    ftp_watts: 212,
    ftp_test_date: null,
    ftp_test_type: 'ramp',
    ftp_weight_kg: 75,
    css_seconds_per_100m: 125,
    css_test_date: null,
    run_5k_seconds: 1656,
    run_5k_test_date: null,
    run_10k_seconds: 3612,
    run_10k_test_date: null,
    threshold_pace_per_km_seconds: 315,
    easy_pace_per_km_seconds: 360,
    updated_at: new Date().toISOString()
  },
  testingHistory: [],
  sessionLogs: {},
  weeklyCheckins: {},
  raceResults: [],
  sessionScheduleOverrides: {},
  customWorkouts: {},
  intervalsIcu: {
    connected: false,
    athleteId: null,
    apiKey: null,
    lastSync: null,
    syncStatus: 'disconnected', // disconnected, connected, syncing, error
    syncError: null,
    athleteInfo: null,
    workouts: [], // Cached workouts from intervals.icu
    syncSettings: {
      autoSync: false,
      syncInterval: 24, // hours
      importNewWorkouts: true,
      updateExistingWorkouts: true,
      dateRange: 30, // days to sync (when using relative dates)
      useCustomDates: false, // whether to use custom date range
      customStartDate: null // custom start date (YYYY-MM-DD)
    }
  }
};

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load data from file
function loadData() {
  ensureDataDir();
  try {
    if (fs.existsSync(dbPath)) {
      const raw = fs.readFileSync(dbPath, 'utf8');
      return { ...defaultData, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Error loading data:', err);
  }
  return { ...defaultData };
}

// Save data to file
function saveData(data) {
  ensureDataDir();
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Initialize
let data = loadData();

function initializeDatabase() {
  data = loadData();
  console.log('Database initialized (JSON file storage)');
}

// Database helper functions
const dbHelpers = {
  // Session logs
  getSessionLog: (sessionId, weekNumber) => {
    const key = `${sessionId}_${weekNumber}`;
    return data.sessionLogs[key] || null;
  },

  upsertSessionLog: (logData) => {
    const key = `${logData.session_id}_${logData.week_number}`;
    data.sessionLogs[key] = {
      ...logData,
      updated_at: new Date().toISOString()
    };
    saveData(data);
    return { lastInsertRowid: 1 };
  },

  deleteSessionLog: (sessionId, weekNumber) => {
    const key = `${sessionId}_${weekNumber}`;
    if (data.sessionLogs[key]) {
      delete data.sessionLogs[key];
      saveData(data);
      return { success: true };
    }
    return { success: false };
  },

  getWeekSessions: (weekNumber) => {
    return Object.values(data.sessionLogs).filter(s => s.week_number === weekNumber);
  },

  getAllSessionLogs: () => {
    return Object.values(data.sessionLogs).sort((a, b) => {
      if (a.week_number !== b.week_number) return a.week_number - b.week_number;
      return (a.session_date || '').localeCompare(b.session_date || '');
    });
  },

  // Current metrics
  getCurrentMetrics: () => {
    return data.metrics;
  },

  updateCurrentMetrics: (updates) => {
    data.metrics = {
      ...data.metrics,
      ...updates,
      updated_at: new Date().toISOString()
    };
    saveData(data);
    return { changes: 1 };
  },

  // Testing history
  addTestingValue: (testData) => {
    const entry = {
      id: Date.now(),
      ...testData,
      created_at: new Date().toISOString()
    };
    data.testingHistory.unshift(entry);
    saveData(data);
    return { lastInsertRowid: entry.id };
  },

  getTestingHistory: (testType) => {
    if (testType) {
      return data.testingHistory.filter(t => t.test_type === testType);
    }
    return data.testingHistory;
  },

  // Weekly check-ins
  upsertWeeklyCheckin: (checkinData) => {
    data.weeklyCheckins[checkinData.week_number] = {
      ...checkinData,
      checkin_date: new Date().toISOString()
    };
    saveData(data);
    return { changes: 1 };
  },

  getWeeklyCheckin: (weekNumber) => {
    return data.weeklyCheckins[weekNumber] || null;
  },

  getAllWeeklyCheckins: () => {
    return Object.values(data.weeklyCheckins).sort((a, b) => a.week_number - b.week_number);
  },

  // Athlete profile
  getAthleteProfile: () => {
    return data.profile;
  },

  updateAthleteProfile: (updates) => {
    data.profile = {
      ...data.profile,
      ...updates,
      updated_at: new Date().toISOString()
    };
    saveData(data);
    return { changes: 1 };
  },

  // Race results
  addRaceResult: (raceData) => {
    const entry = {
      id: Date.now(),
      ...raceData,
      created_at: new Date().toISOString()
    };
    data.raceResults.push(entry);
    saveData(data);
    return { lastInsertRowid: entry.id };
  },

  getRaceResults: () => {
    return data.raceResults.sort((a, b) => (a.race_date || '').localeCompare(b.race_date || ''));
  },

  // Statistics
  getCompletionStats: () => {
    const logs = Object.values(data.sessionLogs);
    const byWeek = {};
    
    logs.forEach(log => {
      if (!byWeek[log.week_number]) {
        byWeek[log.week_number] = {
          week_number: log.week_number,
          total_sessions: 0,
          completed_sessions: 0,
          skipped_sessions: 0,
          rpe_sum: 0,
          rpe_count: 0
        };
      }
      byWeek[log.week_number].total_sessions++;
      if (log.completed) byWeek[log.week_number].completed_sessions++;
      if (log.skipped) byWeek[log.week_number].skipped_sessions++;
      if (log.rpe) {
        byWeek[log.week_number].rpe_sum += log.rpe;
        byWeek[log.week_number].rpe_count++;
      }
    });
    
    return Object.values(byWeek)
      .map(w => ({
        ...w,
        avg_rpe: w.rpe_count > 0 ? w.rpe_sum / w.rpe_count : null
      }))
      .sort((a, b) => a.week_number - b.week_number);
  },

  getSessionTypeStats: () => {
    const logs = Object.values(data.sessionLogs);
    const byType = {};
    
    logs.forEach(log => {
      const type = log.session_type || 'unknown';
      if (!byType[type]) {
        byType[type] = {
          session_type: type,
          total: 0,
          completed: 0,
          duration_sum: 0,
          duration_count: 0,
          rpe_sum: 0,
          rpe_count: 0
        };
      }
      byType[type].total++;
      if (log.completed) byType[type].completed++;
      if (log.actual_duration_min) {
        byType[type].duration_sum += log.actual_duration_min;
        byType[type].duration_count++;
      }
      if (log.rpe) {
        byType[type].rpe_sum += log.rpe;
        byType[type].rpe_count++;
      }
    });
    
    return Object.values(byType).map(t => ({
      ...t,
      avg_duration: t.duration_count > 0 ? t.duration_sum / t.duration_count : null,
      avg_rpe: t.rpe_count > 0 ? t.rpe_sum / t.rpe_count : null
    }));
  },

  // Session schedule overrides
  setSessionScheduleOverride: (sessionId, weekNumber, newDate) => {
    const key = `${sessionId}_${weekNumber}`;
    data.sessionScheduleOverrides[key] = {
      session_id: sessionId,
      week_number: weekNumber,
      new_date: newDate,
      updated_at: new Date().toISOString()
    };
    saveData(data);
    return { success: true };
  },

  getSessionScheduleOverride: (sessionId, weekNumber) => {
    const key = `${sessionId}_${weekNumber}`;
    return data.sessionScheduleOverrides[key] || null;
  },

  getAllSessionScheduleOverrides: () => {
    return data.sessionScheduleOverrides;
  },

  deleteSessionScheduleOverride: (sessionId, weekNumber) => {
    const key = `${sessionId}_${weekNumber}`;
    if (data.sessionScheduleOverrides[key]) {
      delete data.sessionScheduleOverrides[key];
      saveData(data);
      return { success: true };
    }
    return { success: false };
  },

  // Custom workouts - allow users to override or add new workouts
  upsertCustomWorkout: (workoutData) => {
    const key = `${workoutData.session_id}_${workoutData.week_number}`;
    data.customWorkouts[key] = {
      ...workoutData,
      updated_at: new Date().toISOString()
    };
    saveData(data);
    return { success: true };
  },

  getCustomWorkout: (sessionId, weekNumber) => {
    const key = `${sessionId}_${weekNumber}`;
    return data.customWorkouts[key] || null;
  },

  getAllCustomWorkouts: () => {
    return data.customWorkouts;
  },

  deleteCustomWorkout: (sessionId, weekNumber) => {
    const key = `${sessionId}_${weekNumber}`;
    if (data.customWorkouts[key]) {
      delete data.customWorkouts[key];
      saveData(data);
      return { success: true };
    }
    return { success: false };
  },

  // Intervals.icu integration
  getIntervalsIcuConfig: () => {
    return data.intervalsIcu;
  },

  updateIntervalsIcuConfig: (config) => {
    data.intervalsIcu = {
      ...data.intervalsIcu,
      ...config,
      updated_at: new Date().toISOString()
    };
    saveData(data);
    return { success: true };
  },

  setIntervalsIcuCredentials: (athleteId, apiKey) => {
    data.intervalsIcu.athleteId = athleteId;
    data.intervalsIcu.apiKey = apiKey;
    data.intervalsIcu.connected = !!(athleteId && apiKey);
    data.intervalsIcu.syncStatus = data.intervalsIcu.connected ? 'connected' : 'disconnected';
    data.intervalsIcu.updated_at = new Date().toISOString();
    saveData(data);
    return { success: true };
  },

  updateIntervalsIcuSyncStatus: (status, error = null) => {
    data.intervalsIcu.syncStatus = status;
    data.intervalsIcu.syncError = error;
    data.intervalsIcu.lastSync = status === 'connected' ? new Date().toISOString() : data.intervalsIcu.lastSync;
    data.intervalsIcu.updated_at = new Date().toISOString();
    saveData(data);
    return { success: true };
  },

  setIntervalsIcuAthleteInfo: (athleteInfo) => {
    data.intervalsIcu.athleteInfo = athleteInfo;
    data.intervalsIcu.updated_at = new Date().toISOString();
    saveData(data);
    return { success: true };
  },

  setIntervalsIcuWorkouts: (workouts) => {
    data.intervalsIcu.workouts = workouts;
    data.intervalsIcu.updated_at = new Date().toISOString();
    saveData(data);
    return { success: true };
  },

  getIntervalsIcuWorkouts: (startDate = null, endDate = null) => {
    let workouts = data.intervalsIcu.workouts || [];
    
    if (startDate || endDate) {
      workouts = workouts.filter(w => {
        const workoutDate = w.date;
        if (startDate && workoutDate < startDate) return false;
        if (endDate && workoutDate > endDate) return false;
        return true;
      });
    }
    
    return workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  getIntervalsIcuWorkout: (workoutId) => {
    return data.intervalsIcu.workouts?.find(w => w.id === workoutId || w.external_id === workoutId) || null;
  },

   updateIntervalsIcuSyncSettings: (settings) => {
     data.intervalsIcu.syncSettings = {
       ...data.intervalsIcu.syncSettings,
       ...settings
     };
     data.intervalsIcu.updated_at = new Date().toISOString();
     saveData(data);
     return { success: true };
   },

   /**
    * Merge new workouts from intervals.icu with existing workouts
    * - Compares by external_id to avoid duplicates
    * - Updates existing workouts if data changed
    * - Never deletes old workouts
    * @param {Array} newWorkouts - Workouts from intervals.icu API
    * @returns {Object} Merge result { added, updated, total }
    */
   mergeIntervalsIcuWorkouts: (newWorkouts) => {
     const existing = data.intervalsIcu.workouts || [];
     const existingMap = new Map();
     
     // Create map of existing workouts by external_id for quick lookup
     existing.forEach(w => {
       if (w.external_id) {
         existingMap.set(w.external_id, w);
       }
     });
     
     let added = 0;
     let updated = 0;
     const merged = [...existing]; // Start with existing workouts
     
     // Process new workouts
     newWorkouts.forEach(newWorkout => {
       const existingWorkout = existingMap.get(newWorkout.external_id);
       
       if (existingWorkout) {
         // Update existing workout (compare JSON strings to detect changes)
         const newJson = JSON.stringify(newWorkout);
         const oldJson = JSON.stringify(existingWorkout);
         
         if (newJson !== oldJson) {
           // Find index and update
           const idx = merged.findIndex(w => w.external_id === newWorkout.external_id);
           if (idx >= 0) {
             merged[idx] = {
               ...newWorkout,
               syncedAt: new Date().toISOString()
             };
             updated++;
           }
         }
       } else {
         // Add new workout
         merged.push({
           ...newWorkout,
           syncedAt: new Date().toISOString()
         });
         added++;
       }
     });
     
     // Save merged workouts
     data.intervalsIcu.workouts = merged.sort((a, b) => new Date(b.date) - new Date(a.date));
     data.intervalsIcu.lastSync = new Date().toISOString();
     data.intervalsIcu.updated_at = new Date().toISOString();
     saveData(data);
     
     return {
       added,
       updated,
       total: merged.length
     };
   },

   /**
    * Clear all intervals.icu workouts and reset sync timestamps
    * @returns {Object} Success confirmation
    */
   clearAllIntervalsIcuWorkouts: () => {
     data.intervalsIcu.workouts = [];
     data.intervalsIcu.lastSync = null;
     data.intervalsIcu.syncSettings = {
       ...data.intervalsIcu.syncSettings,
       lastFullSync: null,
       lastIncrementalSync: null
     };
     data.intervalsIcu.updated_at = new Date().toISOString();
     saveData(data);
     return { success: true, cleared: true };
   },

   /**
    * Get last sync timestamp to determine incremental sync date range
    * @returns {string|null} ISO timestamp or null if never synced
    */
   getLastSyncDate: () => {
     const settings = data.intervalsIcu.syncSettings || {};
     return settings.lastFullSync || data.intervalsIcu.lastSync || null;
   }
};

module.exports = { initializeDatabase, dbHelpers };
