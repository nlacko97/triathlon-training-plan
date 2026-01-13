/**
 * TRIATHLON TRAINING PLAN - CORE DATA STRUCTURE
 * 32-Week Periodized Plan: Jan 26 - Aug 30, 2026
 * 
 * Periodization Structure:
 * - Base Phase 1: Weeks 1-8 (Half Marathon prep)
 * - Race Week 1: Week 9 (Half Marathon)
 * - Base Phase 2: Weeks 10-17 (Olympic prep)
 * - Peak Phase 1: Week 18 (Olympic taper)
 * - Race Week 2: Week 19 (Olympic)
 * - Recovery: Weeks 20-21
 * - Base Phase 3: Weeks 22-29 (70.3 prep)
 * - Peak Phase 2: Weeks 30-31 (70.3 taper)
 * - Race Week 3: Week 32 (70.3)
 */

const TRIATHLON_PLAN = {
  // ============================================
  // PLAN METADATA
  // ============================================
  metadata: {
    version: "2.0",
    startDate: "2026-01-26",
    endDate: "2026-08-30",
    totalWeeks: 32,
    planType: "periodized_age_group_triathlon",
    timeBudget: {
      minHoursPerWeek: 7,
      targetHoursPerWeek: 10,
      maxHoursPerWeek: 12,
      weekdaySessionMax: 90,
      weekdayMin: 30
    }
  },

  // ============================================
  // ATHLETE PROFILE (Moved to separate profile page)
  // ============================================
  athlete: {
    id: "athlete_001",
    personal: {
      name: "Triathlete",
      age: 28,
      gender: "male",
      weightKg: 75,
      trainingAgeYears: 1,
      occupation: "full_time_professional"
    },
    metrics: {
      bikeFTP: { value: 212, unit: "watts", wkg: 2.83, lastTest: "2025-07" },
      maxHR: 192,
      runHRZones: { threshold: 172, hrv: 165 },
      swimCSS: { current: "2:05", targetOlympic: "1:55", target70_3: "2:00" },
      runPRs: { "5K": "27:36", "10K": "1:00:12" }
    },
    constraints: {
      poolAccess: { frequency: "1-2x/week", travelTime: "2hrs for 40min swim" },
      climbingGym: { access: true, minFreq: "1x/week" },
      footIssue: { condition: "numbness_onset_km_4", protocol: "walk_breaks_15min" }
    },
    goals: {
      process: [
        "3 runs/week for 32 weeks (zero misses)",
        "Complete all key sessions",
        "Stay healthy (no injuries)"
      ],
      performance: [
        { race: "half_marathon", target: "1:59:59", stretch: "1:55:00" },
        { race: "olympic_tri", target: "2:50:00", stretch: "2:35:00" },
        { race: "70_3_zell_am_see", target: "5:30:00", stretch: "5:15:00" }
      ]
    }
  },

  // ============================================
  // RACE CALENDAR
  // ============================================
  races: [
    {
      id: "half_marathon_2026",
      name: "Half Marathon",
      date: "2026-03-28",
      week: 9,
      type: "run_race",
      distance: 21.1,
      course: "flat",
      goalTime: "1:59:59",
      goalPace: "5:40",
      priority: "training_race",
      role: "supported_long_run_and_race_practice"
    },
    {
      id: "olympic_tri_2026",
      name: "Olympic Triathlon",
      date: "2026-06-06",
      week: 19,
      type: "olympic_tri",
      distance: { swim: 1.5, bike: 40, run: 10 },
      course: "flat",
      goalTime: "2:50:00",
      aggressiveGoal: "2:35:00",
      targets: {
        swim: { time: "28:00", pace: "1:55/100m" },
        bike: { time: "72:00", speed: "32 km/h", npPower: 165 },
        run: { time: "52:00", pace: "5:12/km" }
      },
      priority: "primary_race",
      role: "main_season_goal"
    },
    {
      id: "70_3_zell_am_see",
      name: "70.3 Zell am See",
      date: "2026-08-30",
      week: 32,
      type: "half_ironman",
      distance: { swim: 1.9, bike: 90, run: 21.1 },
      course: { bike: "1000m_elevation", run: "flat" },
      goalTime: "5:30:00",
      aggressiveGoal: "5:15:00",
      targets: {
        swim: { time: "38:00", pace: "2:00/100m" },
        bike: { time: "2:55:00", speed: "30.8 km/h", npPower: 155 },
        run: { time: "1:52:00", pace: "5:20/km" }
      },
      priority: "main_focus",
      role: "season_capstone"
    }
  ],

  // ============================================
  // MACROCYCLE PERIODIZATION
  // ============================================
  periodization: {
    macrocycles: [
      {
        id: "macro_1",
        name: "Half Marathon Build",
        weeks: "1-9",
        focus: "run_base_aerobic",
        primaryRace: "half_marathon",
        sessionsPerWeek: 10,
        weeklyHours: { min: 7, target: 9, max: 10 },
        structure: {
          weeks: [
            { num: 1, type: "build_1", load: "low" },
            { num: 2, type: "build_1", load: "medium" },
            { num: 3, type: "build_1", load: "high" },
            { num: 4, type: "recovery", load: "low" },
            { num: 5, type: "build_2", load: "medium" },
            { num: 6, type: "build_2", load: "high" },
            { num: 7, type: "build_2", load: "high" },
            { num: 8, type: "taper", load: "medium" },
            { num: 9, type: "race_week", load: "race" }
          ]
        }
      },
      {
        id: "macro_2",
        name: "Olympic Build",
        weeks: "10-19",
        focus: "triathlon_specificity",
        primaryRace: "olympic_tri",
        sessionsPerWeek: 11,
        weeklyHours: { min: 8, target: 10, max: 11 },
        structure: {
          weeks: [
            { num: 10, type: "build_1", load: "medium" },
            { num: 11, type: "build_1", load: "high" },
            { num: 12, type: "build_1", load: "high" },
            { num: 13, type: "recovery", load: "low" },
            { num: 14, type: "build_2", load: "medium" },
            { num: 15, type: "build_2", load: "high" },
            { num: 16, type: "build_2", load: "high" },
            { num: 17, type: "build_2", load: "very_high" },
            { num: 18, type: "taper", load: "medium" },
            { num: 19, type: "race_week", load: "race" }
          ]
        }
      },
      {
        id: "macro_3",
        name: "70.3 Build",
        weeks: "20-32",
        focus: "long_course_endurance",
        primaryRace: "70_3_zell_am_see",
        sessionsPerWeek: 12,
        weeklyHours: { min: 9, target: 11, max: 12 },
        structure: {
          weeks: [
            { num: 20, type: "recovery", load: "low" },
            { num: 21, type: "recovery", load: "low" },
            { num: 22, type: "build_1", load: "medium" },
            { num: 23, type: "build_1", load: "high" },
            { num: 24, type: "build_1", load: "high" },
            { num: 25, type: "recovery", load: "low" },
            { num: 26, type: "build_2", load: "medium" },
            { num: 27, type: "build_2", load: "high" },
            { num: 28, type: "build_2", load: "high" },
            { num: 29, type: "build_2", load: "very_high" },
            { num: 30, type: "taper", load: "medium" },
            { num: 31, type: "taper", load: "low" },
            { num: 32, type: "race_week", load: "race" }
          ]
        }
      }
    ]
  },

  // ============================================
  // SESSION TYPE DEFINITIONS
  // ============================================
  sessionTypes: {
    run: {
      categories: [
        { id: "recovery", name: "Recovery Run", intensityZone: 1, rpe: 1-3 },
        { id: "endurance", name: "Endurance Run", intensityZone: 2, rpe: 3-5 },
        { id: "tempo", name: "Tempo Run", intensityZone: 3, rpe: 5-7 },
        { id: "threshold", name: "Threshold Run", intensityZone: 4, rpe: 7-8 },
        { id: "intervals", name: "Interval Training", intensityZone: 4-5, rpe: 7-9 },
        { id: "long_run", name: "Long Run", intensityZone: 2, rpe: 4-6 },
        { id: "race", name: "Race Pace", intensityZone: 4, rpe: 7-9 }
      ],
      weeklyFrequency: { min: 3, target: 3, max: 4 }
    },
    bike: {
      categories: [
        { id: "recovery", name: "Recovery Spin", intensityZone: 1, rpe: 1-3 },
        { id: "endurance", name: "Endurance Ride", intensityZone: 2, rpe: 3-5 },
        { id: "tempo", name: "Tempo Ride", intensityZone: 3, rpe: 5-6 },
        { id: "threshold", name: "Threshold Intervals", intensityZone: 4, rpe: 7-8 },
        { id: "vo2max", name: "VO2 Max", intensityZone: 5, rpe: 9 },
        { id: "long_ride", name: "Long Ride", intensityZone: 2, rpe: 4-6 },
        { id: "brick", name: "Bike-Run Brick", intensityZone: "mixed", rpe: "mixed" }
      ],
      weeklyFrequency: { min: 2, target: 3, max: 4 }
    },
    swim: {
      categories: [
        { id: "technique", name: "Technique Focus", intensityZone: 1, rpe: 2-4 },
        { id: "endurance", name: "Swim Endurance", intensityZone: 2, rpe: 3-5 },
        { id: "threshold", name: "Threshold Set", intensityZone: 3, rpe: 5-7 },
        { id: "css", name: "CSS Training", intensityZone: 3, rpe: 5-7 },
        { id: "open_water", name: "Open Water", intensityZone: 2, rpe: 4-6 },
        { id: "race_pace", name: "Race Pace", intensityZone: 4, rpe: 7-8 }
      ],
      weeklyFrequency: { min: 1, target: 2, max: 3 }
    },
    strength: {
      categories: [
        { id: "maintenance", name: "Strength Maintenance", focus: "injury_prevention" },
        { id: "power", name: "Power Development", focus: "force_production" },
        { id: "stability", name: "Core & Stability", focus: "movement_quality" }
      ],
      weeklyFrequency: { min: 1, target: 1, max: 2 }
    },
    crossTraining: {
      climbing: {
        categories: [
          { id: "bouldering", name: "Bouldering", intensity: "moderate", duration: 45 },
          { id: "top_rope", name: "Top Rope", intensity: "moderate", duration: 60 },
          { id: "lead", name: "Lead Climbing", intensity: "high", duration: 90 }
        ],
        weeklyFrequency: { min: 1, target: 1, max: 2 },
        purpose: "mental_health_skill_maintenance"
      }
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TRIATHLON_PLAN;
}