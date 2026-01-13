/**
 * Triathlon Training Plan Data Structure
 * 32-Week Plan: Jan 26, 2026 → Aug 30, 2026
 * Target Races: Half Marathon (Mar 28), Olympic (Jun 6), 70.3 (Aug 30)
 */

const trainingPlan = {
  metadata: {
    version: "1.0",
    startDate: "2026-01-26",
    endDate: "2026-08-30",
    totalWeeks: 32,
    athleteName: "Age-Group Triathlete",
    weeklyTimeBudget: { min: 7, max: 12, target: 9 },
    units: { distance: "km", pace: "per km", power: "watts", heartRate: "bpm" }
  },

  races: [
    {
      id: "half_marathon",
      name: "Half Marathon",
      date: "2026-03-28",
      type: "run",
      distance: { run: 21.1 },
      targetTime: "1:59:59",
      targetPace: "5:40",
      priority: "training_race",
      week: 9
    },
    {
      id: "olympic_tri",
      name: "Olympic Triathlon",
      date: "2026-06-06",
      type: "triathlon",
      distance: { swim: 1.5, bike: 40, run: 10 },
      targetTime: "2:50:00",
      aggressiveTarget: "2:35:00",
      targets: {
        swim: { time: "28:00", pace: "1:55/100m" },
        bike: { time: "72:00", speed: "32 km/h", npPower: 165 },
        run: { time: "52:00", pace: "5:12" },
        transitions: "3:00"
      },
      priority: "primary",
      week: 19
    },
    {
      id: "zell_am_see_70_3",
      name: "70.3 Zell am See",
      date: "2026-08-30",
      type: "triathlon",
      distance: { swim: 1.9, bike: 90, run: 21.1 },
      targetTime: "5:30:00",
      aggressiveTarget: "5:15:00",
      targets: {
        swim: { time: "38:00", pace: "2:00/100m" },
        bike: { time: "2:55:00", speed: "30.8 km/h", npPower: 155 },
        run: { time: "1:52:00", pace: "5:20" },
        transitions: "4:00"
      },
      priority: "main_focus",
      week: 32,
      courseProfile: { bikeElevation: 1000, runElevation: 0 }
    }
  ],

  athleteProfile: {
    age: 28,
    gender: "male",
    weightKg: 75,
    trainingAgeYears: 1,
    metrics: {
      ftpWatts: 212,
      ftpWkg: 2.83,
      maxHR: 192,
      swimCSS: "2:05/100m",
      runPRs: { "5K": "27:36", "10K": "1:00:12" }
    },
    constraints: {
      poolAccess: "limited",
      weeklyHours: { min: 7, target: 8, max: 12 },
      weekdaySessionMax: 60, // minutes
      footNumbnessOnsetKm: 4
    }
  },

  // Weekly structure templates by phase
  weeklyTemplates: {
    base_build: {
      monday: [{ type: "rest", duration: 0 }],
      tuesday: [{ type: "bike", focus: "threshold", duration: 60 }],
      wednesday: [{ type: "run", focus: "threshold", duration: 60 }],
      thursday: [{ type: "swim", focus: "technique", duration: 40 }],
      friday: [{ type: "bike", focus: "endurance", duration: 60 }],
      saturday: [{ type: "bike", focus: "long", duration: 120 }],
      sunday: [{ type: "run", focus: "long", duration: 75 }]
    },
    specific_prep: {
      monday: [{ type: "rest", duration: 0 }],
      tuesday: [{ type: "bike", focus: "threshold", duration: 75 }],
      wednesday: [{ type: "run", focus: "threshold", duration: 70 }],
      thursday: [{ type: "swim", focus: "css", duration: 45 }],
      friday: [{ type: "run", focus: "easy", duration: 40 }],
      saturday: [{ type: "brick", bike: 120, run: 20, focus: "race_pacing" }],
      sunday: [{ type: "run", focus: "long", duration: 90 }]
    },
    peak: {
      monday: [{ type: "rest", duration: 0 }],
      tuesday: [{ type: "bike", focus: "threshold", duration: 90 }],
      wednesday: [{ type: "run", focus: "threshold", duration: 75 }],
      thursday: [{ type: "swim", focus: "css", duration: 50 }],
      friday: [{ type: "bike", focus: "easy", duration: 60 }],
      saturday: [{ type: "brick", bike: 180, run: 30, focus: "long" }],
      sunday: [{ type: "run", focus: "long", duration: 120 }]
    }
  },

  // Phase definitions (3 macrocycles for 3 races)
  phases: [
    {
      id: "base_halfmarathon",
      weeks: [1, 9],
      focus: "build_run_volume",
      keySession: "sunday_long_run",
      priority: "half_marathon"
    },
    {
      id: "olympic_specific",
      weeks: [10, 18],
      focus: "triathlon_specificity",
      keySession: "saturday_brick",
      priority: "olympic_tri"
    },
    {
      id: "olympic_taper",
      weeks: [19],
      focus: "taper",
      keySession: "olympic_race",
      priority: "olympic_tri"
    },
    {
      id: "recovery_70_3_build",
      weeks: [20, 25],
      focus: "build_run_volume",
      keySession: "sunday_long_run",
      priority: "zell_am_see_70_3"
    },
    {
      id: "70_3_specific",
      weeks: [26, 31],
      focus: "long_bricks",
      keySession: "saturday_long_brick",
      priority: "zell_am_see_70_3"
    },
    {
      id: "70_3_taper",
      weeks: [32],
      focus: "taper",
      keySession: "70_3_race",
      priority: "zell_am_see_70_3"
    }
  ]
};

/**
 * SAMPLE WEEK DATA STRUCTURE
 * Every week has a detailed session object
 */
const sampleWeeks = {
  week_1: {
    phase: "base_halfmarathon",
    dates: { start: "2026-01-26", end: "2026-02-01" },
    goals: ["Establish baseline metrics", "Test new running shoes", "Introduce swim technique focus"],
    totalTargetHours: 7.5,
    notes: "Focus on foot numbness monitoring all week",
    sessions: [
      {
        day: "Monday",
        date: "2026-01-26",
        type: "rest",
        title: "Rest Day",
        description: "Complete rest or 15 min easy walk",
        duration: 0,
        completed: false
      },
      {
        day: "Tuesday",
        date: "2026-01-27",
        type: "bike",
        title: "FTP Test (20 min protocol)",
        description: "Warmup 15 min, 20 min max effort, 15 min cooldown. Check new FTP and update zones.",
        target: { duration: 50, power: "100% max", hrZone: "5" },
        completed: false,
        metrics: { actualPower: null, avgHR: null }
      },
      {
        day: "Wednesday",
        date: "2026-01-28",
        type: "run",
        title: "5K Time Trial + CSS Test",
        description: "Morning: 5K flat time trial. Evening: CSS test (400m + 200m). New shoes test.",
        target: { distance: 5, pace: "max", duration: 30 },
        completed: false,
        metrics: { actualTime: null, footNumbnessAtKm: null }
      },
      {
        day: "Thursday",
        date: "2026-01-29",
        type: "swim",
        title: "CSS Baseline + Technique",
        description: "400m TT + 200m TT to establish CSS. Then 6x100 technique drills.",
        target: { distance: 2000, cssTarget: "2:05/100m" },
        completed: false,
        metrics: { cssResult: null }
      },
      {
        day: "Friday",
        date: "2026-01-30",
        type: "bike",
        title: "Z2 Endurance",
        description: "60 min easy endurance ride at 65-70% FTP.",
        target: { duration: 60, power: "65-70% FTP", hrZone: "2" },
        completed: false
      },
      {
        day: "Saturday",
        date: "2026-01-31",
        type: "bike",
        title: "Long Ride Intro",
        description: "90 min endurance on hilly route. Focus on fueling.",
        target: { duration: 90, power: "65-70% FTP" },
        completed: false,
        nutrition: { carbsPerHour: 30, hydration: "500ml/hour" }
      },
      {
        day: "Sunday",
        date: "2026-02-01",
        type: "run",
        title: "Long Run 10K + Climbing",
        description: "10K easy endurance (5:45-6:00/km). Later: rock climbing 30 min skills.",
        target: { distance: 10, pace: "5:45-6:00" },
        completed: false,
        metrics: { footNumbnessAtKm: null, climbingType: "bouldering" }
      }
    ]
  },

  week_9: { // Half marathon race week
    phase: "base_halfmarathon",
    dates: { start: "2026-03-23", end: "2026-03-29" },
    goals: ["Taper for half marathon", "Race Saturday", "Recovery Sunday"],
    totalTargetHours: 5,
    notes: "Race Saturday March 28 - target sub-2:00",
    sessions: [
      {
        day: "Monday",
        date: "2026-03-23",
        type: "rest",
        title: "Rest Day",
        description: "Complete rest before taper week.",
        duration: 0,
        completed: false
      },
      {
        day: "Tuesday",
        date: "2026-03-24",
        type: "run",
        title: "Short Tempo",
        description: "20 min easy + 3x5 min @ 5:30/km with 2 min walk",
        target: { duration: 40 },
        completed: false
      },
      {
        day: "Wednesday",
        date: "2026-03-25",
        type: "bike",
        title: "Easy Spin",
        description: "45 min easy spin at 65% FTP.",
        target: { duration: 45 },
        completed: false
      },
      {
        day: "Thursday",
        date: "2026-03-26",
        type: "run",
        title: "Strides",
        description: "20 min easy + 6x100m strides at 10K pace.",
        target: { duration: 35 },
        completed: false
      },
      {
        day: "Friday",
        date: "2026-03-27",
        type: "rest",
        title: "Pre-Race Rest",
        description: "Complete rest, check gear, plan race nutrition.",
        completed: false
      },
      {
        day: "Saturday",
        date: "2026-03-28",
        type: "race",
        title: "Half Marathon Race",
        description: "Target sub-2:00 (5:40/km). Start conservative, negative split.",
        target: { distance: 21.1, time: "1:59:59", pace: "5:40" },
        completed: false,
        priority: "high"
      },
      {
        day: "Sunday",
        date: "2026-03-29",
        type: "recovery",
        title: "Recovery Day",
        description: "Easy walk or optional 30 min very easy swim.",
        completed: false
      }
    ]
  },

  week_19: { // Olympic race week
    phase: "olympic_taper",
    dates: { start: "2026-06-01", end: "2026-06-07" },
    goals: ["Final taper", "Race prep", "Execute Olympic tri"],
    totalTargetHours: 4,
    notes: "Race Friday June 6 - all systems go!",
    sessions: [
      {
        day: "Monday",
        date: "2026-06-01",
        type: "rest",
        title: "Taper Day 1",
        description: "Complete rest.",
        duration: 0,
        completed: false
      },
      {
        day: "Tuesday",
        date: "2026-06-02",
        type: "swim",
        title: "Short Swim + Race Rehearsal",
        description: "15 min easy + 4x50 race pace + 10 min drills. Practice sighting.",
        target: { duration: 35 },
        completed: false
      },
      {
        day: "Wednesday",
        date: "2026-06-03",
        type: "bike",
        title: "Openers",
        description: "30 min easy + 3x3 min @ race power + 5 min easy.",
        target: { duration: 45 },
        completed: false
      },
      {
        day: "Thursday",
        date: "2026-06-04",
        type: "run",
        title: "Strides",
        description: "20 min easy + 4x100m strides + 10 min easy.",
        target: { duration: 35 },
        completed: false
      },
      {
        day: "Friday",
        date: "2026-06-05",
        type: "prep",
        title: "Race Prep & Travel",
        description: "Check gear, nutrition, race briefing.",
        completed: false
      },
      {
        day: "Saturday",
        date: "2026-06-06",
        type: "race",
        title: "Olympic Triathlon Race",
        description: "Target sub-2:50. Conservative swim, hold back on bike, execute run.",
        target: { totalTime: "2:50:00" },
        completed: false,
        priority: "high"
      },
      {
        day: "Sunday",
        date: "2026-06-07",
        type: "recovery",
        title: "Post-Race Recovery",
        description: "Light walk, stretch, celebrate.",
        duration: 30,
        completed: false
      }
    ]
  }
};

/**
 * SESSION LIBRARY - Reusable session templates
 * Used to generate weekly sessions dynamically
 */
const sessionLibrary = {
  run: {
    threshold: {
      id: "run_threshold_miles",
      title: "Threshold: Mile Repeats",
      description: "4-6 x 1 mile @ 5:00-5:15/km with 90 sec walking recovery",
      target: { distance: 8, duration: 60, pace: "5:00-5:15", rpe: 7 },
      progression: {
        week1: { intervals: 4, distance: 1600, rest: "90s walk" },
        week4: { intervals: 5, distance: 1600, rest: "90s walk" },
        week8: { intervals: 6, distance: 1600, rest: "60s walk" }
      }
    },
    long_run: {
      id: "run_long_sunday",
      title: "Long Run",
      description: "Progressive distance from 10K → 18K at 5:30-5:45/km",
      target: { duration: 90, pace: "5:30-5:45", hrZone: "2" },
      progression: {
        weeks1_4: [10, 11, 12, 10], // Recovery week 4
        weeks5_8: [12, 13, 14, 12],
        weeks9_12: [14, 15, 16, 14],
        weeks13_16: [16, 17, 18, 16]
      },
      footMonitoring: true
    }
  },

  bike: {
    threshold: {
      id: "bike_threshold_intervals",
      title: "Threshold Intervals",
      description: "3-5 x 10-15 min @ 85-95% FTP",
      target: { power: "85-95% FTP", duration: 75, hrZone: "3-4" },
      progression: {
        week1: { intervals: 3, duration: 10, rest: 5 },
        week4: { intervals: 4, duration: 12, rest: 4 },
        week8: { intervals: 5, duration: 15, rest: 3 }
      }
    },
    long_endurance: {
      id: "bike_long_saturday",
      title: "Long Ride",
      description: "90-240 min endurance, hilly routes preferred for 70.3 prep",
      target: { power: "65-70% FTP", hrZone: "2" },
      progression: {
        basePhase: { duration: 90 },
        buildPhase: { duration: 120 },
        peakPhase: { duration: 180 }
      },
      nutrition: {
        carbsPerHour: 30,
        practiceFor70_3: { startWeek: 20, carbsPerHour: 60 }
      }
    }
  },

  swim: {
    css_test: {
      id: "swim_css_test",
      title: "CSS Test",
      description: "400m time trial + 200m time trial",
      target: { distance: 1200 },
      protocol: "Swim 400m max effort, rest 5-10 min, swim 200m max effort"
    },
    css_main_set: {
      id: "swim_css_200s",
      title: "CSS Main Set",
      description: "8 x 200m @ CSS + 15 sec rest",
      target: { distance: 2000, cssPace: "1:55/100m" },
      progression: {
        week1: { intervals: 6, distance: 200 },
        week4: { intervals: 8, distance: 200 },
        week8: { intervals: 10, distance: 200 }
      }
    },
    technique: {
      id: "swim_technique",
      title: "Technique Focus",
      description: "40% drills: catch, rotation, breathing. Sculling, single arm, 6-kick switch drill.",
      target: { duration: 45, distance: 1500 }
    }
  },

  strength: {
    maintenance: {
      id: "strength_maintenance",
      title: "Strength Maintenance",
      description: "Tri-specific circuit: single-leg deadlifts, split squats, planks, side planks, clamshells",
      target: { duration: 30, exercises: 8, rounds: 3 },
      exercises: [
        { name: "Single-leg deadlift", reps: "12x3", weight: "bodyweight" },
        { name: "Split squat", reps: "12x3", weight: "light" },
        { name: "Plank", reps: "60s x 3" },
        { name: "Clamshells", reps: "15x3" }
      ]
    }
  },

  brick: {
    olympic_pacing: {
      id: "brick_olympic",
      title: "Olympic Distance Brick",
      description: "Bike 60-90 min @ race power → Run 20 min @ race pace",
      target: { bikeDuration: 75, bikePower: 165, runDuration: 20, runPace: "5:12" }
    },
    long_brick: {
      id: "brick_70_3",
      title: "70.3 Long Brick",
      description: "Bike 2.5-3.5 hrs → Run 30-45 min off bike",
      target: { bikeDuration: 180, bikePower: 155, runDuration: 45, runPace: "5:20" }
    }
  }
};

/**
 * PROGRESSION TRACKING
 * Track improvements in key metrics over time
 */
const progressionTargets = [
  {
    discipline: "run",
    metric: "10K_time",
    baseline: "1:00:12",
    week4Target: "58:30",
    week8Target: "56:00",
    week12Target: "54:00",
    week16Target: "52:00",
    week32Target: "48:00",
    measurementType: "time_trial"
  },
  {
    discipline: "swim",
    metric: "CSS_per_100m",
    baseline: "2:05",
    week4Target: "2:03",
    week8Target: "2:00",
    week12Target: "1:58",
    week16Target: "1:55",
    measurementType: "css_test"
  },
  {
    discipline: "bike",
    metric: "FTP_watts",
    baseline: 212,
    week4Target: 215,
    week8Target: 220,
    week12Target: 225,
    week16Target: 230,
    maintenanceTarget: 230,
    measurementType: "ftp_test"
  }
];

/**
 * NUTRITION PROTOCOL
 * Race-specific fueling strategies
 */
const nutritionProtocol = {
  olympic: {
    preRace: { carbs: 60, timing: "2 hours before", hydration: "300ml" },
    bike: { carbsPerHour: 35, type: "gels", hydration: "500ml/hour" },
    run: { strategy: "1 gel at T2", type: "caffeine_gel" }
  },
  half_ironman: {
    preRace: { carbs: 100, timing: "3 hours before", hydration: "500ml" },
    bike: { carbsPerHour: 70, type: "gels_sports_drink", hydration: "750ml/hour" },
    run: { carbsPerHour: 45, type: "gel_every_30min", totalGels: 6 }
  },
  longTraining: {
    bike: { carbsPerHour: 60, practiceWeeks: "20-32", hydration: "500-750ml/hour" }
  }
};

// Export structure for web app
const trainingPlanAPI = {
  getWeek: (weekNumber) => {
    // Return detailed week object with all sessions
    return sampleWeeks[`week_${weekNumber}`] || generateWeekFromTemplate(weekNumber);
  },
  
  getSession: (sessionId, weekNumber) => {
    // Return detailed session with target metrics
    return sessionLibrary[sessionId];
  },
  
  getProgression: (discipline) => {
    // Return progression targets
    return progressionTargets.filter(t => t.discipline === discipline);
  },
  
  getRacePlan: (raceId) => {
    // Return race-specific targets and pacing
    return trainingPlan.races.find(r => r.id === raceId);
  }
};

console.log("Training plan loaded:", trainingPlan);