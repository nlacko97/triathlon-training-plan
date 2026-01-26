/**
 * Triathlon Training Plan Server
 * Express.js backend with SQLite database
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase, dbHelpers } = require('./database');
const IntervalsIcuService = require('./intervals-icu');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize intervals.icu service
const intervalsService = new IntervalsIcuService();

// Auto-sync state
let autoSyncInterval = null;

// Middleware
app.use(cors());
app.use(express.json());

// HTML template injection middleware
const fs = require('fs');
const navbarTemplate = fs.readFileSync(path.join(__dirname, '..', 'public', 'components', 'navbar.html'), 'utf8');

// Custom static file serving with template injection
app.use((req, res, next) => {
  // Only intercept HTML file requests (with or without .html extension)
  let filePath;
  
  if (req.path === '/') {
    filePath = path.join(__dirname, '..', 'public', 'index.html');
  } else if (req.path.endsWith('.html')) {
    filePath = path.join(__dirname, '..', 'public', req.path);
  } else {
    // Check if there's a .html file for this path (e.g., /calendar -> /calendar.html)
    filePath = path.join(__dirname, '..', 'public', req.path + '.html');
  }
  
  try {
    if (fs.existsSync(filePath) && filePath.endsWith('.html')) {
      let content = fs.readFileSync(filePath, 'utf8');
      // Replace the nav-placeholder with actual navbar
      content = content.replace('<!-- NAV_PLACEHOLDER -->', navbarTemplate);
      res.type('html').send(content);
      return;
    }
  } catch (err) {
    console.error('Error processing HTML file:', err);
  }
  next();
});

app.use(express.static(path.join(__dirname, '..', 'public')));

// Initialize database
initializeDatabase();

// Initialize auto-sync on startup
initializeAutoSync();

// ============================================
// API ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// ATHLETE PROFILE & METRICS
// ============================================

// Get athlete profile
app.get('/api/profile', (req, res) => {
  try {
    const profile = dbHelpers.getAthleteProfile();
    const metrics = dbHelpers.getCurrentMetrics();
    res.json({ profile, metrics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update athlete profile
app.put('/api/profile', (req, res) => {
  try {
    dbHelpers.updateAthleteProfile(req.body);
    const profile = dbHelpers.getAthleteProfile();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current metrics
app.get('/api/metrics', (req, res) => {
  try {
    const metrics = dbHelpers.getCurrentMetrics();
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update current metrics (after a test)
app.put('/api/metrics', (req, res) => {
  try {
    dbHelpers.updateCurrentMetrics(req.body);
    
    // Also log the test in testing_values history
    if (req.body.test_type) {
      dbHelpers.addTestingValue({
        test_type: req.body.test_type,
        value: req.body.value,
        unit: req.body.unit || '',
        test_date: req.body.test_date || new Date().toISOString().split('T')[0],
        notes: req.body.notes || null
      });
    }
    
    const metrics = dbHelpers.getCurrentMetrics();
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get testing history
app.get('/api/testing-history', (req, res) => {
  try {
    const history = dbHelpers.getTestingHistory(req.query.type);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new test result
app.post('/api/testing-history', (req, res) => {
  try {
    const result = dbHelpers.addTestingValue(req.body);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// SESSION LOGS
// ============================================

// Get all session logs
app.get('/api/sessions', (req, res) => {
  try {
    const sessions = dbHelpers.getAllSessionLogs();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get session logs for a specific week
app.get('/api/sessions/week/:weekNumber', (req, res) => {
  try {
    const sessions = dbHelpers.getWeekSessions(parseInt(req.params.weekNumber));
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific session log
app.get('/api/sessions/:sessionId/:weekNumber', (req, res) => {
  try {
    const session = dbHelpers.getSessionLog(req.params.sessionId, parseInt(req.params.weekNumber));
    res.json(session || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update a session log
app.post('/api/sessions', (req, res) => {
  try {
    // Ensure required fields have defaults
    const data = {
      session_id: req.body.session_id,
      week_number: req.body.week_number,
      session_date: req.body.session_date,
      session_type: req.body.session_type,
      completed: req.body.completed || 0,
      skipped: req.body.skipped || 0,
      skip_reason: req.body.skip_reason || null,
      actual_duration_min: req.body.actual_duration_min || null,
      actual_distance_km: req.body.actual_distance_km || null,
      actual_avg_hr: req.body.actual_avg_hr || null,
      actual_max_hr: req.body.actual_max_hr || null,
      actual_pace_sec_per_km: req.body.actual_pace_sec_per_km || null,
      foot_numbness_onset_km: req.body.foot_numbness_onset_km || null,
      walk_breaks_taken: req.body.walk_breaks_taken || null,
      actual_avg_power: req.body.actual_avg_power || null,
      actual_np_power: req.body.actual_np_power || null,
      actual_tss: req.body.actual_tss || null,
      actual_css_pace: req.body.actual_css_pace || null,
      actual_distance_m: req.body.actual_distance_m || null,
      bike_duration_min: req.body.bike_duration_min || null,
      run_duration_min: req.body.run_duration_min || null,
      rpe: req.body.rpe || null,
      fatigue_before: req.body.fatigue_before || null,
      fatigue_after: req.body.fatigue_after || null,
      notes: req.body.notes || null,
      activity_url: req.body.activity_url || null,
      completion_rate: req.body.completion_rate || null
    };
    
    dbHelpers.upsertSessionLog(data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Quick complete/uncomplete a session
app.patch('/api/sessions/:sessionId/:weekNumber/complete', (req, res) => {
  try {
    const existing = dbHelpers.getSessionLog(req.params.sessionId, parseInt(req.params.weekNumber));
    const data = {
      session_id: req.params.sessionId,
      week_number: parseInt(req.params.weekNumber),
      session_date: req.body.session_date || existing?.session_date || new Date().toISOString().split('T')[0],
      session_type: req.body.session_type || existing?.session_type || 'unknown',
      completed: req.body.completed !== undefined ? req.body.completed : 1,
      skipped: 0,
      skip_reason: null,
      actual_duration_min: req.body.actual_duration_min || existing?.actual_duration_min || null,
      actual_distance_km: req.body.actual_distance_km || existing?.actual_distance_km || null,
      actual_avg_hr: existing?.actual_avg_hr || null,
      actual_max_hr: existing?.actual_max_hr || null,
      actual_pace_sec_per_km: existing?.actual_pace_sec_per_km || null,
      foot_numbness_onset_km: existing?.foot_numbness_onset_km || null,
      walk_breaks_taken: existing?.walk_breaks_taken || null,
      actual_avg_power: existing?.actual_avg_power || null,
      actual_np_power: existing?.actual_np_power || null,
      actual_tss: existing?.actual_tss || null,
      actual_css_pace: existing?.actual_css_pace || null,
      actual_distance_m: existing?.actual_distance_m || null,
      bike_duration_min: existing?.bike_duration_min || null,
      run_duration_min: existing?.run_duration_min || null,
      rpe: req.body.rpe || existing?.rpe || null,
      fatigue_before: existing?.fatigue_before || null,
      fatigue_after: existing?.fatigue_after || null,
      notes: req.body.notes || existing?.notes || null,
      activity_url: existing?.activity_url || null,
      completion_rate: req.body.completion_rate || existing?.completion_rate || null
    };
    
    dbHelpers.upsertSessionLog(data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a session log (Undo)
app.delete('/api/sessions/:sessionId/:weekNumber', (req, res) => {
  try {
    const success = dbHelpers.deleteSessionLog(req.params.sessionId, parseInt(req.params.weekNumber));
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// WEEKLY CHECK-INS
// ============================================

// Get all weekly check-ins
app.get('/api/checkins', (req, res) => {
  try {
    const checkins = dbHelpers.getAllWeeklyCheckins();
    res.json(checkins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get check-in for specific week
app.get('/api/checkins/:weekNumber', (req, res) => {
  try {
    const checkin = dbHelpers.getWeeklyCheckin(parseInt(req.params.weekNumber));
    res.json(checkin || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create/update weekly check-in
app.post('/api/checkins', (req, res) => {
  try {
    dbHelpers.upsertWeeklyCheckin(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// RACE RESULTS
// ============================================

// Get all race results
app.get('/api/races', (req, res) => {
  try {
    const races = dbHelpers.getRaceResults();
    res.json(races);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add race result
app.post('/api/races', (req, res) => {
  try {
    const result = dbHelpers.addRaceResult(req.body);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// SESSION SCHEDULE OVERRIDES
// ============================================

// Get all schedule overrides
app.get('/api/schedule-overrides', (req, res) => {
  try {
    const overrides = dbHelpers.getAllSessionScheduleOverrides();
    res.json(overrides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set a schedule override (move session to different day)
app.post('/api/schedule-overrides', (req, res) => {
  try {
    const { session_id, week_number, new_date } = req.body;
    dbHelpers.setSessionScheduleOverride(session_id, week_number, new_date);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a schedule override (restore to original day)
app.delete('/api/schedule-overrides/:sessionId/:weekNumber', (req, res) => {
  try {
    const result = dbHelpers.deleteSessionScheduleOverride(req.params.sessionId, parseInt(req.params.weekNumber));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// CUSTOM WORKOUTS
// ============================================

// Get all custom workouts
app.get('/api/custom-workouts', (req, res) => {
  try {
    const customWorkouts = dbHelpers.getAllCustomWorkouts();
    res.json(customWorkouts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific custom workout
app.get('/api/custom-workouts/:sessionId/:weekNumber', (req, res) => {
  try {
    const workout = dbHelpers.getCustomWorkout(req.params.sessionId, parseInt(req.params.weekNumber));
    res.json(workout || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update a custom workout
app.post('/api/custom-workouts', (req, res) => {
  try {
    dbHelpers.upsertCustomWorkout(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a custom workout (restore to generated plan)
app.delete('/api/custom-workouts/:sessionId/:weekNumber', (req, res) => {
  try {
    const result = dbHelpers.deleteCustomWorkout(req.params.sessionId, parseInt(req.params.weekNumber));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// INTERVALS.ICU INTEGRATION
// ============================================

// Get intervals.icu configuration
app.get('/api/intervals-icu/config', (req, res) => {
  try {
    const config = dbHelpers.getIntervalsIcuConfig();
    // Don't expose the API key in the response
    const safeConfig = {
      ...config,
      apiKey: config.apiKey ? '***configured***' : null
    };
    res.json(safeConfig);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update intervals.icu configuration
app.put('/api/intervals-icu/config', (req, res) => {
  try {
    dbHelpers.updateIntervalsIcuConfig(req.body);
    const config = dbHelpers.getIntervalsIcuConfig();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set intervals.icu credentials
app.post('/api/intervals-icu/connect', async (req, res) => {
  try {
    const { athleteId, apiKey } = req.body;
    
    if (!athleteId || !apiKey) {
      return res.status(400).json({ error: 'Athlete ID and API key are required' });
    }

    // Set credentials and test connection
    intervalsService.setCredentials(athleteId, apiKey);
    const connectionTest = await intervalsService.testConnection();
    
    if (!connectionTest) {
      return res.status(401).json({ error: 'Invalid credentials or connection failed' });
    }

    // Get athlete info
    const athleteResponse = await intervalsService.getAthlete();
    const athleteInfo = athleteResponse.data;

    // Save credentials and info
    dbHelpers.setIntervalsIcuCredentials(athleteId, apiKey);
    dbHelpers.setIntervalsIcuAthleteInfo(athleteInfo);
    dbHelpers.updateIntervalsIcuSyncStatus('connected');

    const config = dbHelpers.getIntervalsIcuConfig();
    res.json({ 
      success: true, 
      athlete: athleteInfo,
      config: {
        ...config,
        apiKey: '***configured***'
      }
    });
  } catch (err) {
    dbHelpers.updateIntervalsIcuSyncStatus('error', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Disconnect intervals.icu
app.post('/api/intervals-icu/disconnect', (req, res) => {
  try {
    dbHelpers.setIntervalsIcuCredentials(null, null);
    dbHelpers.setIntervalsIcuAthleteInfo(null);
    dbHelpers.setIntervalsIcuWorkouts([]);
    dbHelpers.updateIntervalsIcuSyncStatus('disconnected');
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sync workouts from intervals.icu
app.post('/api/intervals-icu/sync', async (req, res) => {
  try {
    const config = dbHelpers.getIntervalsIcuConfig();
    
    if (!config.connected || !config.athleteId || !config.apiKey) {
      return res.status(400).json({ error: 'Not connected to intervals.icu' });
    }

    dbHelpers.updateIntervalsIcuSyncStatus('syncing');

    // Set credentials
    intervalsService.setCredentials(config.athleteId, config.apiKey);

    // Calculate date range
    const settings = config.syncSettings || {};
    const endDate = new Date().toISOString().split('T')[0];
    let startDate;
    
    if (settings.useCustomDates && settings.customStartDate) {
      // Use custom start date
      startDate = settings.customStartDate;
    } else {
      // Use relative date range
      const daysBack = settings.dateRange || 30;
      startDate = new Date(Date.now() - (daysBack * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    }

     // Fetch workouts
     const workouts = await intervalsService.getWorkouts(startDate, endDate);
     
     // Convert to internal format
     const convertedWorkouts = workouts.map(workout => IntervalsIcuService.convertWorkout(workout));

     // Merge with existing workouts (smart sync - no data loss)
     const mergeResult = dbHelpers.mergeIntervalsIcuWorkouts(convertedWorkouts);
     
     // Update sync timestamp based on whether this was a full or incremental sync
     if (!settings.lastFullSync) {
       // First time syncing all history - mark as full sync
       dbHelpers.updateIntervalsIcuSyncSettings({
         lastFullSync: new Date().toISOString(),
         lastIncrementalSync: new Date().toISOString()
       });
     } else {
       // Subsequent syncs - mark as incremental
       dbHelpers.updateIntervalsIcuSyncSettings({
         lastIncrementalSync: new Date().toISOString()
       });
     }
     
     dbHelpers.updateIntervalsIcuSyncStatus('connected');

     res.json({ 
       success: true, 
       added: mergeResult.added,
       updated: mergeResult.updated,
       total: mergeResult.total,
       dateRange: { startDate, endDate }
     });
  } catch (err) {
    dbHelpers.updateIntervalsIcuSyncStatus('error', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get intervals.icu workouts
app.get('/api/intervals-icu/workouts', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const workouts = dbHelpers.getIntervalsIcuWorkouts(startDate, endDate);
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific intervals.icu workout
app.get('/api/intervals-icu/workouts/:workoutId', (req, res) => {
  try {
    const workout = dbHelpers.getIntervalsIcuWorkout(req.params.workoutId);
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    res.json(workout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update intervals.icu sync settings
app.put('/api/intervals-icu/sync-settings', (req, res) => {
  try {
    dbHelpers.updateIntervalsIcuSyncSettings(req.body);
    const config = dbHelpers.getIntervalsIcuConfig();
    res.json(config.syncSettings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear all intervals.icu workouts (destructive operation)
app.post('/api/intervals-icu/clear-workouts', (req, res) => {
  try {
    const config = dbHelpers.getIntervalsIcuConfig();
    const currentWorkoutCount = (config.workouts || []).length;
    
    // Clear all workouts
    dbHelpers.clearAllIntervalsIcuWorkouts();
    
    res.json({ 
      success: true, 
      message: `Cleared ${currentWorkoutCount} workouts`,
      clearedCount: currentWorkoutCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get intervals.icu athlete info
app.get('/api/intervals-icu/athlete', (req, res) => {
  try {
    const config = dbHelpers.getIntervalsIcuConfig();
    res.json(config.athleteInfo || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// AUTO-SYNC FUNCTIONALITY
// ============================================

/**
 * Initialize auto-sync based on saved settings
 */
function initializeAutoSync() {
  try {
    const config = dbHelpers.getIntervalsIcuConfig();
    
    if (config.connected && config.syncSettings?.autoSync) {
      startAutoSync(config.syncSettings.syncInterval || 24);
      console.log(`Auto-sync enabled: every ${config.syncSettings.syncInterval || 24} hours`);
    }
  } catch (err) {
    console.error('Error initializing auto-sync:', err);
  }
}

/**
 * Start auto-sync interval
 */
function startAutoSync(intervalHours) {
  stopAutoSync(); // Clear any existing interval
  
  const intervalMs = intervalHours * 60 * 60 * 1000;
  
  autoSyncInterval = setInterval(async () => {
    console.log('Running auto-sync...');
    try {
      await performSync();
    } catch (err) {
      console.error('Auto-sync failed:', err);
    }
  }, intervalMs);
  
  // Also run sync immediately if last sync was more than interval ago
  const config = dbHelpers.getIntervalsIcuConfig();
  if (config.lastSync) {
    const lastSyncTime = new Date(config.lastSync).getTime();
    const now = Date.now();
    const timeSinceLastSync = now - lastSyncTime;
    
    if (timeSinceLastSync > intervalMs) {
      console.log('Last sync was too long ago, syncing now...');
      performSync().catch(err => console.error('Initial auto-sync failed:', err));
    }
  } else {
    // No previous sync, run now
    console.log('No previous sync found, syncing now...');
    performSync().catch(err => console.error('Initial auto-sync failed:', err));
  }
}

/**
 * Stop auto-sync interval
 */
function stopAutoSync() {
  if (autoSyncInterval) {
    clearInterval(autoSyncInterval);
    autoSyncInterval = null;
  }
}

/**
 * Perform a sync operation
 */
async function performSync() {
  const config = dbHelpers.getIntervalsIcuConfig();
  
  if (!config.connected || !config.athleteId || !config.apiKey) {
    console.log('Skipping auto-sync: not connected');
    return;
  }

  dbHelpers.updateIntervalsIcuSyncStatus('syncing');

  try {
    // Set credentials
    intervalsService.setCredentials(config.athleteId, config.apiKey);

    // Calculate date range
    const settings = config.syncSettings || {};
    const endDate = new Date().toISOString().split('T')[0];
    let startDate;
    
    if (settings.useCustomDates && settings.customStartDate) {
      // Use custom start date
      startDate = settings.customStartDate;
    } else {
      // Use relative date range
      const daysBack = settings.dateRange || 30;
      startDate = new Date(Date.now() - (daysBack * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    }

    console.log(`Syncing workouts from ${startDate} to ${endDate}`);

    // Fetch workouts
    const workouts = await intervalsService.getWorkouts(startDate, endDate);
    
    // Convert to internal format
    const convertedWorkouts = workouts.map(workout => IntervalsIcuService.convertWorkout(workout));

    // Save workouts
    dbHelpers.setIntervalsIcuWorkouts(convertedWorkouts);
    dbHelpers.updateIntervalsIcuSyncStatus('connected');

    console.log(`Auto-sync completed: ${convertedWorkouts.length} workouts synced`);
    return { success: true, workouts: convertedWorkouts.length, startDate, endDate };
  } catch (err) {
    console.error('Sync error:', err);
    dbHelpers.updateIntervalsIcuSyncStatus('error', err.message);
    throw err;
  }
}

// Enable/disable auto-sync
app.post('/api/intervals-icu/auto-sync', (req, res) => {
  try {
    const { enabled, intervalHours } = req.body;
    
    dbHelpers.updateIntervalsIcuSyncSettings({
      autoSync: enabled,
      syncInterval: intervalHours || 24
    });
    
    if (enabled) {
      startAutoSync(intervalHours || 24);
    } else {
      stopAutoSync();
    }
    
    res.json({ success: true, autoSync: enabled, intervalHours: intervalHours || 24 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// STATISTICS
// ============================================

// Get completion statistics
app.get('/api/stats/completion', (req, res) => {
  try {
    const stats = dbHelpers.getCompletionStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get session type statistics
app.get('/api/stats/session-types', (req, res) => {
  try {
    const stats = dbHelpers.getSessionTypeStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get overall progress summary
app.get('/api/stats/summary', (req, res) => {
  try {
    const completionStats = dbHelpers.getCompletionStats();
    const typeStats = dbHelpers.getSessionTypeStats();
    const metrics = dbHelpers.getCurrentMetrics();
    const checkins = dbHelpers.getAllWeeklyCheckins();
    
    const totalCompleted = completionStats.reduce((sum, w) => sum + w.completed_sessions, 0);
    const totalSessions = completionStats.reduce((sum, w) => sum + w.total_sessions, 0);
    
    res.json({
      totalWeeksTracked: completionStats.length,
      totalSessionsCompleted: totalCompleted,
      totalSessionsLogged: totalSessions,
      overallCompletionRate: totalSessions > 0 ? Math.round((totalCompleted / totalSessions) * 100) : 0,
      currentMetrics: metrics,
      bySessionType: typeStats,
      weeklyProgress: completionStats,
      avgFatigue: checkins.length > 0 ? Math.round(checkins.reduce((sum, c) => sum + (c.fatigue_level || 0), 0) / checkins.length * 10) / 10 : null,
      avgMotivation: checkins.length > 0 ? Math.round(checkins.reduce((sum, c) => sum + (c.motivation_level || 0), 0) / checkins.length * 10) / 10 : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// CALENDAR VIEW WITH INTERVALS.ICU WORKOUTS
// ============================================

// Get calendar data with both planned and intervals.icu workouts
app.get('/api/calendar', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get intervals.icu workouts
    const intervalsWorkouts = dbHelpers.getIntervalsIcuWorkouts(startDate, endDate);
    
    // Get session logs from training plan
    const sessionLogs = dbHelpers.getAllSessionLogs();
    
    // Get current week to determine which plan sessions to include
    const config = dbHelpers.getIntervalsIcuConfig();
    const currentWeekNum = req.query.week ? parseInt(req.query.week) : null;
    
    let planSessions = [];
    if (currentWeekNum) {
      // Load training plan week data
      const TrainingPlanAPI = require('../public/js/plan-generator');
      if (TrainingPlanAPI && TrainingPlanAPI.getWeek) {
        const week = TrainingPlanAPI.getWeek(currentWeekNum);
        if (week && week.sessions) {
          planSessions = week.sessions.map(s => ({
            ...s,
            source: 'training-plan',
            weekNumber: currentWeekNum
          }));
        }
      }
    }
    
    // Combine and sort all workouts by date
    const allWorkouts = [
      ...intervalsWorkouts,
      ...planSessions.map(s => ({
        ...s,
        date: s.date || new Date().toISOString().split('T')[0]
      })),
      ...sessionLogs.filter(log => log.session_date)
        .map(log => ({
          id: `log_${log.session_id}_${log.week_number}`,
          type: log.session_type,
          title: `${log.session_type} Session`,
          date: log.session_date,
          source: 'session-log',
          completed: log.completed,
          skipped: log.skipped,
          actual_duration_min: log.actual_duration_min,
          actual_distance_km: log.actual_distance_km,
          notes: log.notes
        }))
    ];
    
    // Group by date
    const calendarData = {};
    allWorkouts.forEach(workout => {
      const date = workout.date;
      if (!calendarData[date]) {
        calendarData[date] = [];
      }
      calendarData[date].push(workout);
    });
    
    // Sort workouts within each day
    Object.keys(calendarData).forEach(date => {
      calendarData[date].sort((a, b) => {
        // Intervals.icu workouts with start_time first
        if (a.start_time && !b.start_time) return -1;
        if (!a.start_time && b.start_time) return 1;
        if (a.start_time && b.start_time) {
          return a.start_time.localeCompare(b.start_time);
        }
        return 0;
      });
    });
    
    res.json({
      dates: calendarData,
      summary: {
        totalWorkouts: allWorkouts.length,
        intervalsWorkouts: intervalsWorkouts.length,
        planSessions: planSessions.length,
        sessionLogs: sessionLogs.filter(log => log.session_date).length
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// SERVE FRONTEND
// ============================================

// Serve the main app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'profile.html'));
});

app.get('/stats', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'stats.html'));
});

app.get('/calendar', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'calendar.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════╗
  ║   Triathlon Training Plan Server                      ║
  ║   Running on http://localhost:${PORT}                    ║
  ╠═══════════════════════════════════════════════════════╣
  ║   API Endpoints:                                      ║
  ║   - GET  /api/profile          - Athlete profile      ║
  ║   - GET  /api/metrics          - Current metrics      ║
  ║   - PUT  /api/metrics          - Update metrics       ║
  ║   - GET  /api/sessions         - All session logs     ║
  ║   - POST /api/sessions         - Log a session        ║
  ║   - GET  /api/stats/summary    - Progress stats       ║
  ╚═══════════════════════════════════════════════════════╝
  `);
});
