/**
 * Triathlon Training Plan Server
 * Express.js backend with SQLite database
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase, dbHelpers } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Initialize database
initializeDatabase();

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
