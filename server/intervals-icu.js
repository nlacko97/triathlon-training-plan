/**
 * Intervals.icu API Service
 * Handles authentication and data fetching from intervals.icu
 */

const axios = require('axios');

class IntervalsIcuService {
  constructor() {
    this.baseURL = 'https://intervals.icu/api/v1';
    this.athleteId = null;
    this.apiKey = null;
  }

  /**
   * Set authentication credentials
   * @param {string} athleteId - Intervals.icu athlete ID  
   * @param {string} apiKey - Intervals.icu API key
   */
  setCredentials(athleteId, apiKey) {
    this.athleteId = athleteId;
    this.apiKey = apiKey;
  }

  /**
   * Test connection to intervals.icu
   * @returns {Promise<boolean>} - True if connection successful
   */
  async testConnection() {
    if (!this.athleteId || !this.apiKey) {
      throw new Error('Missing credentials');
    }

    try {
      const response = await this.makeRequest(`/athlete/${this.athleteId}`);
      return response.data && response.data.id === this.athleteId;
    } catch (error) {
      console.error('Intervals.icu connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Get athlete information
   * @returns {Promise<Object>} - Athlete data
   */
  async getAthlete() {
    return this.makeRequest(`/athlete/${this.athleteId}`);
  }

  /**
   * Get workouts for a date range
   * @param {string} startDate - ISO date string (YYYY-MM-DD)
   * @param {string} endDate - ISO date string (YYYY-MM-DD)
   * @returns {Promise<Array>} - Array of workouts
   */
  async getWorkouts(startDate, endDate) {
    // intervals.icu uses 'oldest' and 'newest' parameters
    const response = await this.makeRequest(
      `/athlete/${this.athleteId}/activities?oldest=${startDate}&newest=${endDate}`
    );
    return response.data || [];
  }

  /**
   * Get specific workout details
   * @param {string} workoutId - Workout ID
   * @returns {Promise<Object>} - Workout details
   */
  async getWorkout(workoutId) {
    return this.makeRequest(`/athlete/${this.athleteId}/activities/${workoutId}`);
  }

  /**
   * Get athlete zones and power/heart rate data
   * @returns {Promise<Object>} - Zones data
   */
  async getZones() {
    return this.makeRequest(`/athlete/${this.athleteId}/zones`);
  }

  /**
   * Get athlete statistics
   * @param {string} period - Period (week, month, year)
   * @returns {Promise<Object>} - Statistics
   */
  async getStats(period = 'week') {
    return this.makeRequest(`/athlete/${this.athleteId}/stats?type=${period}`);
  }

  /**
   * Make authenticated request to intervals.icu API
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} - Response data
   */
  async makeRequest(endpoint) {
    if (!this.athleteId || !this.apiKey) {
      throw new Error('Intervals.icu credentials not configured');
    }

    const url = `${this.baseURL}${endpoint}`;
    
    // Use Basic Auth with username "API_KEY" and password as the API key
    const auth = {
      username: 'API_KEY',
      password: this.apiKey
    };
    
    const headers = {
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios.get(url, { 
        auth,
        headers 
      });
      return response;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        let message = 'Intervals.icu API error';
        
        if (status === 401) {
          message = 'Invalid API key or athlete ID';
        } else if (status === 404) {
          message = 'Athlete not found';
        } else if (status === 429) {
          message = 'Rate limit exceeded';
        } else if (data && data.error) {
          message = data.error;
        }
        
        throw new Error(`${message} (${status})`);
      } else if (error.request) {
        throw new Error('Network error - unable to reach intervals.icu');
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    }
  }

  /**
   * Convert intervals.icu workout to internal format
   * Extracts ALL relevant fields from the API response for rich display
   * @param {Object} workout - Intervals.icu workout
   * @returns {Object} - Internal workout format
   */
  static convertWorkout(workout) {
    const type = IntervalsIcuService.determineWorkoutType(workout);
    const movingTime = workout.moving_time || workout.elapsed_time || 0;
    
    return {
      // Basic identifiers
      id: `intervals_${workout.id}`,
      external_id: workout.id,
      source: 'intervals.icu',
      type: type,
      
      // Title and description
      title: workout.name || `${type} Workout`,
      description: workout.description,
      
      // Timestamps and dates
      date: workout.start_date_local?.split('T')[0] || workout.start_date?.split('T')[0],
      start_time: workout.start_date_local || workout.start_date,
      start_date_local: workout.start_date_local,
      
      // Duration metrics (all variants from API)
      duration: movingTime, // Use moving time as primary duration
      moving_time: workout.moving_time,
      elapsed_time: workout.elapsed_time,
      icu_recording_time: workout.icu_recording_time,
      coasting_time: workout.coasting_time,
      
      // Distance and basic metrics
      distance: workout.distance || 0,
      icu_distance: workout.icu_distance,
      
      // Heart rate metrics (full set)
      avg_heart_rate: workout.average_heartrate,
      max_heart_rate: workout.max_heartrate,
      athlete_max_hr: workout.athlete_max_hr,
      lthr: workout.lthr, // Lactate threshold HR
      icu_resting_hr: workout.icu_resting_hr,
      hr_load: workout.hr_load, // HRSS equivalent
      trimp: workout.trimp, // Training Impact
      icu_hrr: workout.icu_hrr, // Heart rate reserve
      
      // HR Zones (7 zones + HR zone times)
      icu_hr_zones: workout.icu_hr_zones, // Array of 7 zone thresholds
      icu_hr_zone_times: workout.icu_hr_zone_times, // Time spent in each zone
      
      // Speed/Pace metrics
      avg_speed: workout.average_speed,
      max_speed: workout.max_speed,
      avg_pace: workout.pace, // seconds per unit
      gap: workout.gap, // Grade Adjusted Pace
      gap_model: workout.gap_model,
      
      // Cadence (primarily running)
      avg_cadence: workout.average_cadence,
      average_stride: workout.average_stride,
      
      // Elevation data
      elevation_gain: workout.total_elevation_gain,
      elevation_loss: workout.total_elevation_loss,
      min_altitude: workout.min_altitude,
      max_altitude: workout.max_altitude,
      average_altitude: workout.average_altitude,
      
      // Power metrics (cycling)
      icu_average_watts: workout.icu_average_watts,
      icu_weighted_avg_watts: workout.icu_weighted_avg_watts,
      icu_power_zones: workout.icu_power_zones,
      icu_power_zone_times: IntervalsIcuService.extractPowerZoneTimes(workout),
      icu_sweet_spot_min: workout.icu_sweet_spot_min,
      icu_sweet_spot_max: workout.icu_sweet_spot_max,
      
      // Pace zones (running/swimming)
      pace_zones: workout.pace_zones,
      pace_zone_times: workout.pace_zone_times,
      gap_zone_times: workout.gap_zone_times,
      
      // Training load and fitness
      icu_training_load: workout.icu_training_load,
      icu_training_load_data: workout.icu_training_load_data,
      icu_intensity: workout.icu_intensity,
      icu_atl: workout.icu_atl, // Acute Training Load (6 days)
      icu_ctl: workout.icu_ctl, // Chronic Training Load (42 days)
      icu_tsb: workout.icu_tsb, // Training Stress Balance
      power_load: workout.power_load,
      pace_load: workout.pace_load,
      polarization_index: workout.polarization_index,
      
      // Efficiency and decoupling
      icu_efficiency_factor: workout.icu_efficiency_factor,
      icu_power_hr: workout.icu_power_hr,
      decoupling: workout.decoupling,
      
      // Intervals and structure
      interval_summary: workout.interval_summary, // Array of strings describing intervals
      icu_lap_count: workout.icu_lap_count,
      icu_warmup_time: workout.icu_warmup_time,
      icu_cooldown_time: workout.icu_cooldown_time,
      
      // Calories and energy
      calories: workout.calories,
      carbs_used: workout.carbs_used,
      carbs_ingested: workout.carbs_ingested,
      
      // Effort and perception
      session_rpe: workout.session_rpe,
      perceived_exertion: workout.perceived_exertion,
      feel: workout.feel,
      
      // Device and metadata
      device_name: workout.device_name,
      source_app: workout.source, // GARMIN_CONNECT, STRAVA, etc.
      file_type: workout.file_type, // fit, tcx, gpx
      external_id: workout.external_id,
      strava_id: workout.strava_id,
      
      // Flags
      commute: workout.commute,
      race: workout.race,
      trainer: workout.trainer,
      has_heartrate: workout.has_heartrate,
      has_gps: workout.has_gps,
      has_weather: workout.has_weather,
      has_segments: workout.has_segments,
      device_watts: workout.device_watts,
      
      // Weight info
      icu_weight: workout.icu_weight,
      
      // Sync tracking
      synced_at: new Date().toISOString(),
      analyzed: workout.analyzed,
      icu_sync_date: workout.icu_sync_date,
      created: workout.created,
      
      // Raw type for reference
      raw_type: workout.type
    };
  }

  /**
   * Parse zones data from intervals.icu
   * Converts object format to array [z1, z2, z3, z4, z5]
   * @param {Object|Array} zonesData - Zones data from API
   * @returns {Array|null} - Array of zone times in seconds
   */
  static parseZonesData(zonesData) {
    if (!zonesData) return null;
    
    // If already an array, return as-is
    if (Array.isArray(zonesData)) {
      return zonesData;
    }
    
    // If it's an object with zone keys, convert to array
    if (typeof zonesData === 'object') {
      // Try standard zone keys (lowercase)
      const zoneKeys = ['z1', 'z2', 'z3', 'z4', 'z5'];
      const zoneValues = zoneKeys.map(key => {
        const value = zonesData[key];
        return typeof value === 'number' ? value : 0;
      });
      
      // If we got meaningful data, return it
      if (zoneValues.some(v => v > 0)) {
        return zoneValues;
      }
      
      // Try uppercase Z1-Z5
      const zoneKeysUpper = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5'];
      const zoneValuesUpper = zoneKeysUpper.map(key => {
        const value = zonesData[key];
        return typeof value === 'number' ? value : 0;
      });
      
      if (zoneValuesUpper.some(v => v > 0)) {
        return zoneValuesUpper;
      }
    }
    
    return null;
  }

  /**
   * Determine workout type from intervals.icu data
   * @param {Object} workout - Intervals.icu workout
   * @returns {string} - Workout type
   */
  static determineWorkoutType(workout) {
    // Try multiple fields for activity type
    const activityType = (workout.type || workout.activity_type || workout.sport_type || '').toLowerCase();
    
    console.log('Determining type for activity:', {
      type: workout.type,
      activity_type: workout.activity_type,
      sport_type: workout.sport_type,
      sub_sport: workout.sub_sport,
      name: workout.name,
      determined: activityType
    });
    
    // Map intervals.icu sport types to internal types
    const typeMap = {
      // Running variants (all map to 'run')
      'run': 'run',
      'running': 'run',
      'trail run': 'run',
      'trail_run': 'run',
      'trailrun': 'run',
      'trail running': 'run',
      'treadmill': 'run',
      'treadmill run': 'run',
      'treadmill_run': 'run',
      'track': 'run',
      'track run': 'run',
      'virtualrun': 'run',
      'virtual_run': 'run',
      'ultra': 'run',
      'ultrarun': 'run',
      
      // Cycling variants (all map to 'bike')
      'ride': 'bike',
      'bike': 'bike',
      'biking': 'bike',
      'cycling': 'bike',
      'cycle': 'bike',
      'road': 'bike',
      'road bike': 'bike',
      'road_bike': 'bike',
      'gravel': 'bike',
      'gravel bike': 'bike',
      'gravel_bike': 'bike',
      'mountain bike': 'bike',
      'mountain_bike': 'bike',
      'mtb': 'bike',
      'cyclocross': 'bike',
      'cx': 'bike',
      'virtualride': 'bike',
      'virtual_ride': 'bike',
      'e-bike': 'bike',
      'ebike': 'bike',
      'indoor cycling': 'bike',
      'indoor_cycling': 'bike',
      'spin': 'bike',
      'trainer': 'bike',
      'turbo': 'bike',
      
      // Swimming
      'swim': 'swim',
      'swimming': 'swim',
      'open water': 'swim',
      'open_water': 'swim',
      'pool': 'swim',
      'pool swim': 'swim',
      
      // Hiking
      'hike': 'hike',
      'hiking': 'hike',
      'backcountry': 'hike',
      'backcountry ski': 'ski',
      'backcountry_ski': 'ski',
      
      // Walking
      'walk': 'run',
      'walking': 'run',
      
      // Strength/Gym
      'strength': 'strength',
      'strength_training': 'strength',
      'strength training': 'strength',
      'weight_training': 'strength',
      'weight training': 'strength',
      'weighttraining': 'strength',
      'weights': 'strength',
      'gym': 'strength',
      'workout': 'strength',
      'crossfit': 'strength',
      'functional': 'strength',
      
      // Climbing
      'climb': 'climbing',
      'climbing': 'climbing',
      'rock climbing': 'climbing',
      'rockclimbing': 'climbing',
      'bouldering': 'climbing',
      'sport climbing': 'climbing',
      
      // Skiing
      'ski': 'ski',
      'skiing': 'ski',
      'alpine ski': 'ski',
      'alpineski': 'ski',
      'downhill ski': 'ski',
      'backcountryski': 'ski',
      'xc ski': 'ski',
      'cross country ski': 'ski',
      'skate ski': 'ski',
      'classic ski': 'ski',
      
      // Basketball
      'basketball': 'basketball',
      'bball': 'basketball',
      
      // Other cardio
      'rower': 'strength',
      'rowing': 'strength',
      'elliptical': 'strength',
      'stairmaster': 'strength',
      'stair stepper': 'strength',
      
      // Recovery
      'yoga': 'recovery',
      'stretching': 'recovery',
      'stretch': 'recovery',
      'massage': 'recovery',
      'meditation': 'recovery',
      'pilates': 'recovery',
      
      // Rest
      'other': 'rest',
      'rest': 'rest',
      'recovery': 'recovery'
    };

    const mapped = typeMap[activityType] || 'rest';
    console.log('Mapped to:', mapped);
    return mapped;
  }

  /**
   * Extract power zone times from icu_zone_times array
   * Converts intervals.icu format to array matching power zone thresholds
   * @param {Object} workout - Workout object from intervals.icu API
   * @returns {Array|null} - Array of times in seconds for each power zone (Z1-Z7)
   */
  static extractPowerZoneTimes(workout) {
    // Check if icu_zone_times exists and has data
    if (!workout.icu_zone_times || !Array.isArray(workout.icu_zone_times)) {
      return null;
    }

    // intervals.icu provides zones in this order:
    // Z1, Z2, Z3, Z4, Z5, Z6, Z7, SS (Sweet Spot)
    // We extract the first 7 zones in order
    const zones = [];
    for (let i = 0; i < 7 && i < workout.icu_zone_times.length; i++) {
      const zoneData = workout.icu_zone_times[i];
      // Each zone has { id: 'Z1', secs: 379 } format
      zones.push(zoneData.secs || 0);
    }

    // Return array only if we have valid zone data
    return zones.length === 7 ? zones : null;
  }
}

module.exports = IntervalsIcuService;