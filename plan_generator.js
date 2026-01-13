/**
 * COMPLETE 32-WEEK TRIATHLON TRAINING PLAN GENERATOR
 * Versatile, Periodized, Age-Group Optimized
 * 
 * Features:
 * - Proper periodization (base → build → peak → taper → race)
 * - Weekly variety (different session types, not repetitive)
 * - All disciplines: swim, bike, run, strength, climbing
 * - Dynamic progressions based on phase
 * - Date-based navigation for easy following
 */

class TriathlonTrainingPlan {
  constructor() {
    this.startDate = new Date("2026-01-26");
    this.athlete = {
      ftp: 212,
      maxHR: 192,
      css: "2:05/100m",
      footNumbnessOnsetKm: 4
    };
    
    this.races = [
      { week: 9, name: "Half Marathon", date: "2026-03-28" },
      { week: 19, name: "Olympic Tri", date: "2026-06-06" },
      { week: 32, name: "70.3 Zell am See", date: "2026-08-30" }
    ];
  }

  // ============================================
  // GET COMPLETE 32-WEEK PLAN
  // ============================================
  getFullPlan() {
    const plan = {};
    for (let weekNum = 1; weekNum <= 32; weekNum++) {
      plan[weekNum] = this.generateWeek(weekNum);
    }
    return plan;
  }

  // ============================================
  // GENERATE SINGLE WEEK
  // ============================================
  generateWeek(weekNum) {
    const phase = this.getPhaseInfo(weekNum);
    const weekDates = this.getWeekDates(weekNum);
    const load = this.getWeekLoad(weekNum);
    
    const sessions = this.generateSessionsForWeek(weekNum, phase, load);
    
    return {
      weekNumber: weekNum,
      dates: weekDates,
      phase: phase.name,
      focus: phase.focus,
      load: load.level,
      weeklyHours: load.hours,
      sessions: sessions,
      notes: this.getWeekNotes(weekNum, phase),
      isRaceWeek: this.isRaceWeek(weekNum),
      raceName: this.getRaceName(weekNum)
    };
  }

  // ============================================
  // PHASE DETERMINATION
  // ============================================
  getPhaseInfo(weekNum) {
    // Macrocycle 1: Half Marathon Build (Weeks 1-9)
    if (weekNum <= 8) {
      if (weekNum <= 4) return { name: "Base Phase 1", focus: "aerobic_base", macrocycle: 1 };
      return { name: "Build Phase 1", focus: "run_volume_and_threshold", macrocycle: 1 };
    }
    
    // Macrocycle 1 Race Week (Week 9)
    if (weekNum === 9) return { name: "Race Week: Half Marathon", focus: "race_execution", macrocycle: 1 };
    
    // Macrocycle 2: Olympic Build (Weeks 10-19)
    if (weekNum <= 17) {
      if (weekNum <= 13) return { name: "Base Phase 2", focus: "triathlon_base", macrocycle: 2 };
      return { name: "Build Phase 2", focus: "olympic_specificity", macrocycle: 2 };
    }
    
    // Macrocycle 2 Race Week (Week 19)
    if (weekNum === 19) return { name: "Race Week: Olympic", focus: "race_execution", macrocycle: 2 };
    
    // Recovery Weeks (20-21)
    if (weekNum <= 21) return { name: "Recovery Phase", focus: "recover_and_consolidate", macrocycle: 3 };
    
    // Macrocycle 3: 70.3 Build (Weeks 22-31)
    if (weekNum <= 29) {
      if (weekNum <= 25) return { name: "Base Phase 3", focus: "long_course_base", macrocycle: 3 };
      return { name: "Build Phase 3", focus: "70_3_specificity", macrocycle: 3 };
    }
    
    // 70.3 Race Weeks (30-32)
    if (weekNum === 30 || weekNum === 31) return { name: "Taper Phase", focus: "70_3_taper", macrocycle: 3 };
    return { name: "Race Week: 70.3", focus: "race_execution", macrocycle: 3 };
  }

  getWeekLoad(weekNum) {
    const isRaceWeek = this.isRaceWeek(weekNum);
    const phaseInfo = this.getPhaseInfo(weekNum);
    
    if (isRaceWeek) return { hours: 4, level: "race" };
    if (phaseInfo.name.includes("Recovery")) return { hours: 6, level: "recovery" };
    if (phaseInfo.name.includes("Taper")) return { hours: 5, level: "taper" };
    if (phaseInfo.focus.includes("base")) return { hours: 8, level: "base" };
    if (phaseInfo.focus.includes("build")) return { hours: 10, level: "build" };
    
    return { hours: 9, level: "maintenance" };
  }

  isRaceWeek(weekNum) {
    return [9, 19, 32].includes(weekNum);
  }

  getRaceName(weekNum) {
    const race = this.races.find(r => r.week === weekNum);
    return race ? race.name : null;
  }

  // ============================================
  // DATE UTILITIES
  // ============================================
  getWeekDates(weekNum) {
    const weekStart = new Date(this.startDate);
    weekStart.setDate(weekStart.getDate() + (weekNum - 1) * 7);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      days.push({
        dayName: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i],
        date: date.toISOString().split('T')[0],
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    
    return {
      start: weekStart.toISOString().split('T')[0],
      end: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      days: days
    };
  }

  // ============================================
  // WEEK NOTES
  // ============================================
  getWeekNotes(weekNum, phase) {
    if (weekNum === 1) return "Week 1: Baseline testing week. FTP test Tuesday, CSS test Thursday, 5K TT Friday.";
    if (weekNum === 4) return "Week 4: Recovery week. Reduce volume by 20-30%, focus on technique and recovery.";
    if (weekNum === 9) return "Week 9: Half Marathon race! Target sub-2:00. Treat as supported long run.";
    if (weekNum === 13) return "Week 13: Recovery week. Consolidation phase after Olympic build.";
    if (weekNum === 19) return "Week 19: Olympic Triathlon Race Day! Execute your race plan.";
    if (weekNum === 21) return "Week 21: Active recovery. Easy swims, short rides, walk-based runs.";
    if (weekNum === 25) return "Week 25: Mid-season recovery. Consolidation before 70.3 peak.";
    if (weekNum === 29) return "Week 29: Peak training week. Highest volume before taper.";
    if (weekNum === 30) return "Week 30: Week 1 of 70.3 taper. Reduce volume 30%.";
    if (weekNum === 31) return "Week 31: Week 2 of taper. Reduce volume another 30%.";
    if (weekNum === 32) return "Week 32: RACE WEEK - 70.3 Zell am See!";
    
    return `${phase.name}: ${this.getPhaseFocusDescription(phase.focus)}`;
  }

  getPhaseFocusDescription(focus) {
    const descriptions = {
      "aerobic_base": "Establish fitness foundation, technique focus, easy volume",
      "run_volume_and_threshold": "Build running volume, introduce threshold work",
      "race_execution": "Peak, taper, and race execution",
      "triathlon_base": "Swim technique, bike endurance, run base maintenance",
      "olympic_specificity": "Brick workouts, race-pace efforts, specificity",
      "recover_and_consolidate": "Active recovery, consolidation of gains",
      "long_course_base": "Aerobic base for 70.3, progressive volume",
      "70_3_specificity": "Long bricks, race-pace specificity, nutrition practice",
      "70_3_taper": "Peak fitness consolidation, race prep"
    };
    return descriptions[focus] || "Training phase";
  }

  // ============================================
  // SESSION GENERATION (THE MAIN EVENT)
  // ============================================
  generateSessionsForWeek(weekNum, phase, load) {
    const sessions = [];
    const weekDates = this.getWeekDates(weekNum);
    const isRaceWeek = this.isRaceWeek(weekNum);
    const macrocycle = phase.macrocycle || 1;
    
    // Race week has special structure
    if (isRaceWeek) {
      return this.generateRaceWeekSessions(weekNum, weekDates.days);
    }
    
    // Recovery week - reduce all sessions
    if (load.level === "recovery") {
      return this.generateRecoveryWeekSessions(weekNum, weekDates.days, phase);
    }
    
    // Normal training week - generate full complement
    const dayConfigs = [
      { day: 0, type: "rest", label: "Monday" }, // Always rest
      { day: 1, type: "bike", label: "Tuesday", variant: this.getBikeVariant(weekNum) },
      { day: 2, type: "run", label: "Wednesday", variant: this.getRunVariant(weekNum) },
      { day: 3, type: "swim", label: "Thursday", variant: this.getSwimVariant(weekNum) },
      { day: 4, type: "strength", label: "Friday", variant: this.getStrengthVariant(weekNum) },
      { day: 5, type: "brick", label: "Saturday", variant: this.getBrickVariant(weekNum, macrocycle) },
      { day: 6, type: "run", label: "Sunday", variant: "long_run" }
    ];
    
    dayConfigs.forEach(config => {
      if (config.type === "rest") {
        sessions.push(this.createRestSession(weekDates.days[config.day], weekNum));
      } else {
        sessions.push(this.createSession(weekDates.days[config.day], config.type, config.variant, weekNum, macrocycle));
      }
    });
    
    // Add climbing session (flexible day - Thursday PM or Sunday PM)
    sessions.push(this.createClimbingSession(weekDates.days[2], weekNum));
    
    return sessions;
  }

  // ============================================
  // SESSION VARIETIES (No repetitive weeks!)
  // ============================================
  getBikeVariant(weekNum) {
    const variants = [
      "ftp_test",           // Week 1
      "sweet_spot",         // Week 2
      "threshold_intervals", // Week 3
      "endurance",          // Week 4 (recovery)
      "tempo",              // Week 5
      "vo2max",             // Week 6
      "climbing_repeats",   // Week 7
      "endurance",          // Week 8
      "race_pace",          // Week 10
      "sweet_spot_2x20",    // Week 11
      "threshold_3x15",     // Week 12
      "recovery_ride",      // Week 13
      "tempo_climbing",     // Week 14
      "ftp_boost",          // Week 15
      "threshold_4x12",     // Week 16
      "race_simulation",    // Week 17
      "base_spin",          // Week 22
      "sweet_spot",         // Week 23
      "long_endurance",     // Week 24
      "recovery_ride",      // Week 25
      "tempo",              // Week 26
      "threshold_3x20",     // Week 27
      "climbing_specific",  // Week 28
      "long_endurance",     // Week 29
      "short_intensity",    // Week 30
      "openers",            // Week 31
    ];
    return variants[(weekNum - 1) % variants.length];
  }

  getRunVariant(weekNum) {
    const variants = [
      "baseline_5k_tt",      // Week 1: test
      "mile_repeats_4x",     // Week 2
      "tempo_20min",         // Week 3
      "recovery_run",        // Week 4
      "fartlek_8x",          // Week 5
      "mile_repeats_5x",     // Week 6
      "tempo_progression",   // Week 7
      "short_intervals",     // Week 8
      "race_pace_10k",       // Week 10
      "threshold_pyramid",   // Week 11
      "hills_8x",            // Week 12
      "recovery_shorts",     // Week 13
      "tempo_25min",         // Week 14
      "mile_repeats_6x",     // Week 15
      "race_pace_8k",        // Week 16
      "sharpening",          // Week 17
      "base_aerobic",        // Week 22
      "tempo_30min",         // Week 23
      "long_intervals",      // Week 24
      "recovery",            // Week 25
      "mile_repeats_5x",     // Week 26
      "tempo_progression",   // Week 27
      "race_pace_15k",       // Week 28
      "brick_run_focus",     // Week 29
      "short_tempo",         // Week 30
      "strides",             // Week 31
    ];
    return variants[(weekNum - 1) % variants.length];
  }

  getSwimVariant(weekNum) {
    const variants = [
      "css_test",           // Week 1: baseline
      "technique_400s",     // Week 2
      "css_main_set",       // Week 3
      "technique_focus",    // Week 4
      "endurance_1500",     // Week 5
      "css_boost",          // Week 6
      "drill_intensity",    // Week 7
      "easy_recovery",      // Week 8
      "race_prep",          // Week 10
      "css_pyramid",        // Week 11
      "technique_200s",     // Week 12
      "easy_swim",          // Week 13
      "threshold_300s",     // Week 14
      "css_improved",       // Week 15
      "race_pace_sets",     // Week 16
      "open_water_sim",     // Week 17
      "technique_base",     // Week 22
      "css_pyramid",        // Week 23
      "endurance_build",    // Week 24
      "easy_recovery",      // Week 25
      "threshold_400s",     // Week 26
      "long_css_set",       // Week 27
      "race_pace_1900",     // Week 28
      "open_water_practice", // Week 29
      "short_speed",        // Week 30
      "race_prep",          // Week 31
    ];
    return variants[(weekNum - 1) % variants.length];
  }

  getStrengthVariant(weekNum) {
    const variants = [
      "full_body_baseline",  // Week 1
      "lower_body_focus",    // Week 2
      "upper_body_focus",    // Week 3
      "mobility_only",       // Week 4 (recovery)
      "full_body_power",     // Week 5
      "lower_body_strength", // Week 6
      "upper_body_stability", // Week 7
      "active_recovery",     // Week 8
      "full_body",           // Week 10
      "lower_body",          // Week 11
      "upper_body",          // Week 12
      "mobility",            // Week 13
      "full_body_power",     // Week 14
      "lower_body",          // Week 15
      "upper_body",          // Week 16
      "mobility",            // Week 17
      "full_body",           // Week 22
      "lower_body",          // Week 23
      "upper_body",          // Week 24
      "mobility",            // Week 25
      "full_body_power",     // Week 26
      "lower_body",          // Week 27
      "upper_body",          // Week 28
      "mobility",            // Week 29
      "full_body_light",     // Week 30
      "mobility_only",       // Week 31
    ];
    return variants[(weekNum - 1) % variants.length];
  }

  getBrickVariant(weekNum, macrocycle) {
    if (macrocycle === 1) {
      // Macro 1: Focus on building bike fitness, fewer bricks
      const variants = ["long_rides", "endurance_bike", "long_rides", "race_sim", "race_sim", "long_rides", "race_sim"];
      return variants[(weekNum - 1) % variants.length];
    }
    
    if (macrocycle === 2) {
      // Macro 2: Olympic-specific bricks
      const variants = ["olympic_short", "olympic_mid", "olympic_long", "olympic_race_sim", "olympic_race_sim", "olympic_mid", "olympic_long"];
      return variants[(weekNum - 10) % variants.length];
    }
    
    // Macro 3: 70.3 long bricks
    const variants = ["70_3_short", "70_3_mid", "70_3_long", "70_3_longer", "70_3_race_sim", "70_3_longest", "70_3_race_sim"];
    return variants[(weekNum - 22) % variants.length];
  }

  // ============================================
  // SESSION CREATORS
  // ============================================
  createRestSession(dayInfo, weekNum) {
    return {
      id: `w${weekNum}_${dayInfo.dayName.toLowerCase()}_rest`,
      day: dayInfo.dayName,
      date: dayInfo.date,
      type: "rest",
      title: "Rest Day",
      description: "Complete rest. Optional: 15-30 min easy walk, mobility work, or light stretching.",
      duration: 0,
      intensity: "rest",
      completed: false,
      metrics: {}
    };
  }

  createSession(dayInfo, type, variant, weekNum, macrocycle) {
    const sessionBuilders = {
      run: () => this.buildRunSession(dayInfo, variant, weekNum),
      bike: () => this.buildBikeSession(dayInfo, variant, weekNum, macrocycle),
      swim: () => this.buildSwimSession(dayInfo, variant, weekNum),
      strength: () => this.buildStrengthSession(dayInfo, variant, weekNum),
      brick: () => this.buildBrickSession(dayInfo, variant, weekNum, macrocycle)
    };
    
    return sessionBuilders[type]();
  }

  // ============================================
  // RUN SESSION BUILDER
  // ============================================
  buildRunSession(dayInfo, variant, weekNum) {
    const longRunDistances = this.getLongRunProgression(weekNum);
    
    const runSessions = {
      "baseline_5k_tt": {
        title: "5K Time Trial",
        description: "Establish baseline. Warmup 15 min, all-out 5K, cooldown 10 min.",
        target: { duration: 35, distance: 5, pace: "max_effort" }
      },
      "mile_repeats_4x": {
        title: "Mile Repeats",
        description: "4 x 1 mile @ threshold pace (5:00-5:15/km) with 90 sec jogging recovery.",
        target: { duration: 55, distance: 8, pace: "5:00-5:15", intervals: 4 }
      },
      "tempo_20min": {
        title: "20-Minute Tempo",
        description: "10 min easy + 20 min at threshold (comfortably hard) + 10 min easy.",
        target: { duration: 45, distance: 8, pace: "5:20-5:30" }
      },
      "recovery_run": {
        title: "Recovery Run",
        description: "Easy aerobic run. Keep HR in Z2, conversational pace.",
        target: { duration: 40, distance: 6, pace: "6:00-6:30" }
      },
      "fartlek_8x": {
        title: "Fartlek Play",
        description: "8 x (1 min hard / 2 min easy). Focus on turnover and feel.",
        target: { duration: 50, distance: 8, pace: "varied" }
      },
      "mile_repeats_5x": {
        title: "Mile Repeats - 5",
        description: "5 x 1 mile @ 4:55-5:10/km with 2 min recovery.",
        target: { duration: 65, distance: 10, pace: "4:55-5:10", intervals: 5 }
      },
      "tempo_progression": {
        title: "Progression Run",
        description: "20 min easy + 15 min building to threshold + 10 min threshold.",
        target: { duration: 55, distance: 10, pace: "progressive" }
      },
      "short_intervals": {
        title: "Short Intervals",
        description: "Warmup + 6 x 800m @ 5K pace (4:45/km) with 90 sec rest + cooldown.",
        target: { duration: 50, distance: 8, pace: "4:45" }
      },
      "race_pace_10k": {
        title: "Race Pace 10K",
        description: "10 min easy + 10K @ Olympic race pace (5:12/km) + 10 min easy.",
        target: { duration: 75, distance: 12, pace: "5:12" }
      },
      "threshold_pyramid": {
        title: "Pyramid Intervals",
        description: "1600m, 1200m, 800m, 400m @ threshold pace, full recovery between.",
        target: { duration: 60, distance: 8, pace: "5:00-5:15" }
      },
      "hills_8x": {
        title: "Hill Repeats",
        description: "8 x 90 sec steep hill @ hard effort, jog down recovery.",
        target: { duration: 55, distance: 7, intensity: "hill" }
      },
      "recovery_shorts": {
        title: "Recovery + Strides",
        description: "30 min easy + 4 x 100m strides (fast, relaxed).",
        target: { duration: 40, distance: 5, pace: "easy_plus" }
      },
      "tempo_25min": {
        title: "Extended Tempo",
        description: "15 min easy + 25 min at threshold + 10 min easy.",
        target: { duration: 55, distance: 10, pace: "5:15-5:25" }
      },
      "mile_repeats_6x": {
        title: "Mile Repeats - 6",
        description: "6 x 1 mile @ threshold with full recovery.",
        target: { duration: 75, distance: 12, pace: "5:00-5:15" }
      },
      "race_pace_8k": {
        title: "Race Pace 8K",
        description: "10 min warmup + 8K @ race pace + 10 min cooldown.",
        target: { duration: 65, distance: 10, pace: "5:12" }
      },
      "sharpening": {
        title: "Sharpening Run",
        description: "20 min easy + 4 x 200m fast (strides) + 10 min easy.",
        target: { duration: 40, distance: 6, pace: "variable" }
      },
      "base_aerobic": {
        title: "Aerobic Base Run",
        description: "Steady Z2 effort. Build aerobic foundation for 70.3.",
        target: { duration: 50, distance: 8, pace: "5:45-6:00" }
      },
      "tempo_30min": {
        title: "30-Minute Tempo",
        description: "15 min easy + 30 min @ tempo pace + 10 min easy.",
        target: { duration: 60, distance: 11, pace: "5:20-5:30" }
      },
      "long_intervals": {
        title: "Long Interval Day",
        description: "2 x 20 min @ threshold with 5 min jog recovery.",
        target: { duration: 75, distance: 14, pace: "5:10-5:20" }
      },
      "mile_repeats_5x": {
        title: "Threshold Miles",
        description: "5 x 1 mile @ 70.3 pace (5:20/km) with 2 min rest.",
        target: { duration: 70, distance: 12, pace: "5:20" }
      },
      "tempo_progression": {
        title: "Progression to Tempo",
        description: "25 min easy + 20 min building to threshold + 15 min threshold.",
        target: { duration: 70, distance: 13, pace: "progressive" }
      },
      "race_pace_15k": {
        title: "Long Race Pace",
        description: "15 min easy + 15K @ 70.3 race pace + 10 min easy.",
        target: { duration: 100, distance: 18, pace: "5:20" }
      },
      "brick_run_focus": {
        title: "Off-Bike Run",
        description: "Practice running off the bike. Focus on form, 30 min at race pace.",
        target: { duration: 35, distance: 6, pace: "5:20-5:30" }
      },
      "short_tempo": {
        title: "Short Tempo",
        description: "15 min easy + 15 min @ threshold + 10 min easy.",
        target: { duration: 45, distance: 8, pace: "5:15-5:25" }
      },
      "strides": {
        title: "Strides & Prep",
        description: "20 min easy + 6 x 100m strides + 10 min easy. Race prep.",
        target: { duration: 40, distance: 6, pace: "easy" }
      }
    };
    
    const session = runSessions[variant] || runSessions["recovery_run"];
    
    return {
      id: `w${weekNum}_run_${variant}`,
      day: dayInfo.dayName,
      date: dayInfo.date,
      type: "run",
      title: session.title,
      description: session.description,
      target: session.target,
      duration: session.target.duration,
      completed: false,
      footMonitoring: true,
      metrics: { footNumbnessAtKm: null, actualPace: null, rpe: null }
    };
  }

  // ============================================
  // BIKE SESSION BUILDER
  // ============================================
  buildBikeSession(dayInfo, variant, weekNum, macrocycle) {
    const bikeSessions = {
      "ftp_test": {
        title: "FTP Test",
        description: "20 min test protocol. Warmup 15 min, 20 min max effort, cooldown 10 min.",
        target: { duration: 50, power: "100%", test: true }
      },
      "sweet_spot": {
        title: "Sweet Spot Training",
        description: "2 x 20 min @ 88-92% FTP with 10 min recovery. Sweet spot is race-winning.",
        target: { duration: 75, power: "88-92% FTP", intervals: 2 }
      },
      "threshold_intervals": {
        title: "Threshold Intervals",
        description: "3 x 12 min @ threshold (90-95% FTP) with 6 min recovery.",
        target: { duration: 70, power: "90-95% FTP", intervals: 3 }
      },
      "endurance": {
        title: "Endurance Ride",
        description: "Steady Z2 ride. Focus on aerobic base, stay in power range.",
        target: { duration: 90, power: "65-75% FTP", zone: 2 }
      },
      "tempo": {
        title: "Tempo Ride",
        description: "45 min continuous @ tempo power (76-90% FTP).",
        target: { duration: 60, power: "76-90% FTP" }
      },
      "vo2max": {
        title: "VO2 Max Intervals",
        description: "5 x 4 min @ VO2 max (105-115% FTP) with 4 min recovery.",
        target: { duration: 65, power: "105-115% FTP", intervals: 5 }
      },
      "climbing_repeats": {
        title: "Climbing Repeats",
        description: "Find a hill or use trainer. 6 x 5 min @ threshold, descend recovery.",
        target: { duration: 75, power: "90-95% FTP", intervals: 6 }
      },
      "recovery_ride": {
        title: "Recovery Spin",
        description: "Very easy Z1-Z2. 30-45 min at conversational effort.",
        target: { duration: 45, power: "55-65% FTP", zone: 1 }
      },
      "race_pace": {
        title: "Olympic Race Pace",
        description: "3 x 15 min @ Olympic bike power (165W / 76% FTP) with 10 min recovery.",
        target: { duration: 80, power: "165W avg", intervals: 3 }
      },
      "sweet_spot_2x20": {
        title: "Sweet Spot 2 x 20",
        description: "Classic workout: 2 x 20 min @ 88-92% FTP, 10 min recovery.",
        target: { duration: 70, power: "88-92% FTP" }
      },
      "threshold_3x15": {
        title: "Threshold 3 x 15",
        description: "3 x 15 min @ threshold with 8 min recovery.",
        target: { duration: 80, power: "90-95% FTP", intervals: 3 }
      },
      "recovery_ride": {
        title: "Active Recovery",
        description: "Easy spin. No strain, just blood flow.",
        target: { duration: 40, power: "55-65% FTP" }
      },
      "tempo_climbing": {
        title: "Tempo Climbing",
        description: "45 min tempo on rolling terrain. Build climbing strength.",
        target: { duration: 75, power: "80-90% FTP" }
      },
      "ftp_boost": {
        title: "FTP Builder",
        description: "4 x 10 min @ threshold + 3 x 1 min over-unders. Fresh test format.",
        target: { duration: 70, power: "varied", intervals: 7 }
      },
      "threshold_4x12": {
        title: "Threshold 4 x 12",
        description: "4 x 12 min @ threshold with 6 min recovery.",
        target: { duration: 85, power: "90-95% FTP", intervals: 4 }
      },
      "race_simulation": {
        title: "Bike Race Sim",
        description: "90 min at variable effort: 30 min Z2, 3 x 10 min @ race power, 15 min build.",
        target: { duration: 95, power: "varied" }
      },
      "base_spin": {
        title: "Easy Base Ride",
        description: "60 min easy Z2. Aerobic maintenance.",
        target: { duration: 60, power: "65-75% FTP" }
      },
      "long_endurance": {
        title: "Long Endurance",
        description: "2.5-3 hour steady ride. Practice nutrition, stay Z2.",
        target: { duration: 180, power: "65-75% FTP" }
      },
      "tempo": {
        title: "Extended Tempo",
        description: "60 min tempo. Build sustainable power.",
        target: { duration: 70, power: "80-90% FTP" }
      },
      "threshold_3x20": {
        title: "Long Threshold",
        description: "3 x 20 min @ threshold with 10 min recovery. Key 70.3 workout.",
        target: { duration: 110, power: "90-95% FTP", intervals: 3 }
      },
      "climbing_specific": {
        title: "Hill Specificity",
        description: "Practice climbing on hilly route. 1000m equivalent elevation.",
        target: { duration: 120, power: "varied", elevation: 1000 }
      },
      "short_intensity": {
        title: "Short Intensity",
        description: "2 x 15 min @ threshold + 4 x 2 min VO2 max. Keep legs sharp.",
        target: { duration: 60, power: "varied" }
      },
      "openers": {
        title: "Race Openers",
        description: "30 min easy + 3 x 3 min @ race power + 5 min easy.",
        target: { duration: 50, power: "race_pace" }
      }
    };
    
    const session = bikeSessions[variant] || bikeSessions["endurance"];
    
    return {
      id: `w${weekNum}_bike_${variant}`,
      day: dayInfo.dayName,
      date: dayInfo.date,
      type: "bike",
      title: session.title,
      description: session.description,
      target: session.target,
      duration: session.target.duration,
      completed: false,
      metrics: { avgPower: null, npPower: null, avgHR: null }
    };
  }

  // ============================================
  // SWIM SESSION BUILDER
  // ============================================
  buildSwimSession(dayInfo, variant, weekNum) {
    const swimSessions = {
      "css_test": {
        title: "CSS Test",
        description: "400m TT + 200m TT to establish Critical Swim Speed.",
        target: { distance: 1200, test: true, focus: "baseline" }
      },
      "technique_400s": {
        title: "Technique: 400s",
        description: "6 x 400m with focus: 200m drill + 200m swim @ CSS pace.",
        target: { distance: 2400, drillRatio: "50%", focus: "technique" }
      },
      "css_main_set": {
        title: "CSS Main Set",
        description: "Warmup + 8 x 200m @ CSS + 15 sec rest + cooldown.",
        target: { distance: 2200, intensity: "css", focus: "aerobic" }
      },
      "technique_focus": {
        title: "Drill Intensive",
        description: "60% of time on drills: catch, rotation, breathing. 4 x 100m sculling.",
        target: { distance: 1800, drillRatio: "60%", focus: "technique" }
      },
      "endurance_1500": {
        title: "Swim Endurance",
        description: "Continuous 1500m @ comfortable race pace. Build endurance.",
        target: { distance: 1800, intensity: "moderate", focus: "endurance" }
      },
      "css_boost": {
        title: "CSS Improvement Set",
        description: "10 x 100m @ CSS + 10 sec rest. Focus on efficiency.",
        target: { distance: 2000, intensity: "css", focus: "speed" }
      },
      "drill_intensity": {
        title: "Drill + Intensity",
        description: "30% drills, then 6 x 200m @ threshold with 30 sec rest.",
        target: { distance: 2200, drillRatio: "30%", focus: "mixed" }
      },
      "easy_recovery": {
        title: "Recovery Swim",
        description: "Easy swim focusing on relaxation and long strokes.",
        target: { distance: 1500, intensity: "easy", focus: "recovery" }
      },
      "race_prep": {
        title: "Race Prep Swim",
        description: "15 min warmup + 4 x 50 race pace + 10 min drills. Sighting practice.",
        target: { distance: 1600, focus: "race_specific" }
      },
      "css_pyramid": {
        title: "CSS Pyramid",
        description: "200, 400, 600, 400, 200 @ CSS pace. Pyramid structure.",
        target: { distance: 2000, intensity: "css", focus: "progression" }
      },
      "technique_200s": {
        title: "Technique: 200s",
        description: "8 x 200m: 100m drill + 100m swim. High technique focus.",
        target: { distance: 2000, drillRatio: "50%", focus: "technique" }
      },
      "easy_swim": {
        title: "Easy Aerobic",
        description: "Steady swim, focus on technique, stay relaxed.",
        target: { distance: 1600, intensity: "easy", focus: "aerobic" }
      },
      "threshold_300s": {
        title: "Threshold 300s",
        description: "6 x 300m @ threshold with 20 sec rest.",
        target: { distance: 2400, intensity: "threshold", focus: "speed" }
      },
      "css_improved": {
        title: "Improved CSS Set",
        description: "12 x 100m @ improved CSS pace. Expect faster than Week 1.",
        target: { distance: 2200, intensity: "css", focus: "progression" }
      },
      "race_pace_sets": {
        title: "Race Pace Sets",
        description: "4 x 400m @ Olympic race pace. 30 sec rest between.",
        target: { distance: 2400, intensity: "race_pace", focus: "specificity" }
      },
      "open_water_sim": {
        title: "Open Water Sim",
        description: "OW practice: sighting, drafting, bilateral breathing. Pool version.",
        target: { distance: 2000, focus: "open_water" }
      },
      "technique_base": {
        title: "Technique Foundation",
        description: "Focus on catch and rotation. 50% drill, 50% swim.",
        target: { distance: 1800, drillRatio: "50%", focus: "technique" }
      },
      "endurance_build": {
        title: "Swim Endurance Build",
        description: "Gradually build to 1800m continuous. Aerobic base.",
        target: { distance: 2000, intensity: "moderate", focus: "endurance" }
      },
      "threshold_400s": {
        title: "Threshold 400s",
        description: "5 x 400m @ threshold with 30 sec rest.",
        target: { distance: 2600, intensity: "threshold", focus: "speed" }
      },
      "long_css_set": {
        title: "Long CSS Set",
        description: "10 x 200m @ CSS. Building endurance at race pace.",
        target: { distance: 2800, intensity: "css", focus: "endurance" }
      },
      "race_pace_1900": {
        title: "70.3 Race Pace",
        description: "1900m @ 70.3 race pace. Test nutrition strategy if desired.",
        target: { distance: 2200, intensity: "race_pace", focus: "specificity" }
      },
      "open_water_practice": {
        title: "Open Water Practice",
        description: "If possible, OW session. Otherwise pool with wetsuit simulation.",
        target: { distance: 2000, focus: "open_water" }
      },
      "short_speed": {
        title: "Speed Burst",
        description: "8 x 50m fast with full recovery. Keep legs fresh.",
        target: { distance: 1600, intensity: "varied", focus: "speed" }
      }
    };
    
    const session = swimSessions[variant] || swimSessions["technique_focus"];
    
    return {
      id: `w${weekNum}_swim_${variant}`,
      day: dayInfo.dayName,
      date: dayInfo.date,
      type: "swim",
      title: session.title,
      description: session.description,
      target: session.target,
      duration: Math.round(session.target.distance / 35), // ~35m per 100m pace
      completed: false,
      metrics: { cssResult: null, avgPace: null, rpe: null }
    };
  }

  // ============================================
  // STRENGTH SESSION BUILDER
  // ============================================
  buildStrengthSession(dayInfo, variant, weekNum) {
    const strengthSessions = {
      "full_body_baseline": {
        title: "Full Body Baseline",
        description: "Establish baseline strength. Focus on form, moderate weights.",
        exercises: [
          { name: "Goblet Squat", sets: 3, reps: "10-12" },
          { name: "Single-Leg Deadlift", sets: 3, reps: "8 each" },
          { name: "Push-Ups", sets: 3, reps: "15" },
          { name: "Plank", sets: 3, reps: "45s" },
          { name: "Bent-Over Row", sets: 3, reps: "10" }
        ],
        duration: 35
      },
      "lower_body_focus": {
        title: "Lower Body Power",
        description: "Legs focus for cycling power and running efficiency.",
        exercises: [
          { name: "Back Squat", sets: 4, reps: "8" },
          { name: "Walking Lunges", sets: 3, reps: "12 each" },
          { name: "Calf Raises", sets: 3, reps: "15" },
          { name: "Single-Leg Squat", sets: 2, reps: "8 each" }
        ],
        duration: 40
      },
      "upper_body_focus": {
        title: "Upper Body & Core",
        description: "Push/pull balance, core stability for running form.",
        exercises: [
          { name: "Bench Press", sets: 3, reps: "10" },
          { name: "Pull-Ups", sets: 3, reps: "max" },
          { name: "Shoulder Press", sets: 3, reps: "10" },
          { name: "Side Plank", sets: 3, reps: "30s each" },
          { name: "Russian Twist", sets: 3, reps: "20" }
        ],
        duration: 35
      },
      "mobility_only": {
        title: "Mobility & Activation",
        description: "No heavy lifting. Foam rolling, mobility drills, activation exercises.",
        exercises: [
          { name: "Foam Roll Legs", sets: 1, reps: "5min" },
          { name: "Hip Flexor Stretch", sets: 1, reps: "3min" },
          { name: "Ankle Mobility", sets: 1, reps: "3min" },
          { name: "Cat-Cow", sets: 1, reps: "2min" }
        ],
        duration: 20
      },
      "full_body_power": {
        title: "Full Body Power",
        description: "Explosive movements, power focus for cycling.",
        exercises: [
          { name: "Deadlift", sets: 4, reps: "6" },
          { name: "Box Jump", sets: 3, reps: "10" },
          { name: "Medicine Ball Slam", sets: 3, reps: "12" },
          { name: "Split Squat Jumps", sets: 3, reps: "10 each" },
          { name: "Plank Walk", sets: 3, reps: "30s" }
        ],
        duration: 40
      },
      "lower_body_strength": {
        title: "Lower Body Strength",
        description: "Heavy legs for cycling endurance.",
        exercises: [
          { name: "Front Squat", sets: 4, reps: "8" },
          { name: "Romanian Deadlift", sets: 3, reps: "10" },
          { name: "Leg Press", sets: 3, reps: "12" },
          { name: "Step-Ups", sets: 3, reps: "10 each" },
          { name: "Glute Bridge", sets: 3, reps: "15" }
        ],
        duration: 40
      },
      "upper_body_stability": {
        title: "Upper Body Stability",
        description: "Shoulder stability, core for running economy.",
        exercises: [
          { name: "Face Pull", sets: 3, reps: "15" },
          { name: "Inverted Row", sets: 3, reps: "10" },
          { name: "Y-T-W Raises", sets: 1, reps: "each" },
          { name: "Ab Wheel", sets: 3, reps: "10" },
          { name: "Hollow Hold", sets: 3, reps: "30s" }
        ],
        duration: 30
      },
      "active_recovery": {
        title: "Active Recovery",
        description: "Light movement, blood flow, mobility only.",
        exercises: [
          { name: "Light Stretch", sets: 1, reps: "15min" },
          { name: "Walking", sets: 1, reps: "10min" }
        ],
        duration: 25
      },
      "full_body": {
        title: "Full Body Maintenance",
        description: "Maintain strength without fatigue for training.",
        exercises: [
          { name: "Squat", sets: 3, reps: "10" },
          { name: "Lunge", sets: 3, reps: "10 each" },
          { name: "Push-Up", sets: 3, reps: "12" },
          { name: "Row", sets: 3, reps: "10" },
          { name: "Plank", sets: 3, reps: "60s" }
        ],
        duration: 35
      },
      "lower_body": {
        title: "Lower Body Strength",
        description: "Cycling and running power focus.",
        exercises: [
          { name: "Squat", sets: 4, reps: "8" },
          { name: "Deadlift", sets: 3, reps: "8" },
          { name: "Calf Raise", sets: 4, reps: "15" },
          { name: "Clamshells", sets: 3, reps: "15 each" }
        ],
        duration: 40
      },
      "upper_body": {
        title: "Upper Body & Core",
        description: "Balance for injury prevention.",
        exercises: [
          { name: "Pull-Up", sets: 3, reps: "max" },
          { name: "Push-Up", sets: 3, reps: "15" },
          { name: "Row", sets: 3, reps: "10" },
          { name: "Side Plank", sets: 3, reps: "45s" }
        ],
        duration: 30
      },
      "mobility": {
        title: "Mobility Session",
        description: "Joint health, flexibility, recovery focus.",
        exercises: [
          { name: "Hip Mobility", sets: 1, reps: "5min" },
          { name: "Shoulder Mobility", sets: 1, reps: "5min" },
          { name: "Spine Mobility", sets: 1, reps: "5min" },
          { name: "Ankle Mobility", sets: 1, reps: "5min" }
        ],
        duration: 20
      },
      "full_body_power": {
        title: "Power Development",
        description: "Explosive for cycling performance.",
        exercises: [
          { name: "Power Clean", sets: 4, reps: "5" },
          { name: "Box Jump", sets: 4, reps: "8" },
          { name: "Goblet Squat", sets: 3, reps: "10" },
          { name: "Landmine Press", sets: 3, reps: "10" }
        ],
        duration: 40
      },
      "full_body_light": {
        title: "Light Maintenance",
        description: "Keep moving, no fatigue. 50% volume of normal.",
        exercises: [
          { name: "Bodyweight Squat", sets: 2, reps: "20" },
          { name: "Push-Ups", sets: 2, reps: "10" },
          { name: "Plank", sets: 2, reps: "30s" }
        ],
        duration: 20
      }
    };
    
    const session = strengthSessions[variant] || strengthSessions["full_body"];
    
    return {
      id: `w${weekNum}_strength_${variant}`,
      day: dayInfo.dayName,
      date: dayInfo.date,
      type: "strength",
      title: session.title,
      description: session.description,
      exercises: session.exercises,
      duration: session.duration,
      completed: false,
      metrics: { rpe: null, totalReps: null }
    };
  }

  // ============================================
  // BRICK SESSION BUILDER
  // ============================================
  buildBrickSession(dayInfo, variant, weekNum, macrocycle) {
    const brickSessions = {
      // Macro 1 - Building fitness
      "long_rides": {
        title: "Long Endurance Ride",
        description: "90-120 min Z2 endurance ride. Steady effort, focus on position.",
        bike: { duration: 105, power: "65-75% FTP" },
        run: null
      },
      "endurance_bike": {
        title: "Endurance Bike + Short Run",
        description: "75 min endurance bike + 15 min easy run off bike.",
        bike: { duration: 75, power: "65-75% FTP" },
        run: { duration: 15, pace: "easy" }
      },
      "race_sim": {
        title: "Race Simulation Brick",
        description: "60 min bike @ race power + 20 min run @ race pace.",
        bike: { duration: 60, power: "165W" },
        run: { duration: 20, pace: "5:12" }
      },
      
      // Macro 2 - Olympic specific
      "olympic_short": {
        title: "Short Olympic Brick",
        description: "Bike 45 min @ Olympic pace + Run 15 min @ race pace.",
        bike: { duration: 45, power: "165W" },
        run: { duration: 15, pace: "5:12" }
      },
      "olympic_mid": {
        title: "Olympic Distance Brick",
        description: "Bike 75 min @ Olympic pace + Run 20 min @ race pace.",
        bike: { duration: 75, power: "165W" },
        run: { duration: 20, pace: "5:12" }
      },
      "olympic_long": {
        title: "Long Olympic Brick",
        description: "Bike 90-100 min @ Olympic pace + Run 25 min @ race pace.",
        bike: { duration: 95, power: "165W" },
        run: { duration: 25, pace: "5:12" }
      },
      "olympic_race_sim": {
        title: "Full Olympic Brick",
        description: "Bike 120 min @ race power (build to race pace) + Run 30 min @ race pace.",
        bike: { duration: 120, power: "varied" },
        run: { duration: 30, pace: "5:12" }
      },
      
      // Macro 3 - 70.3 specific
      "70_3_short": {
        title: "70.3 Short Brick",
        description: "Bike 90 min @ 70.3 pace + Run 20 min @ race pace.",
        bike: { duration: 90, power: "155W" },
        run: { duration: 20, pace: "5:20" }
      },
      "70_3_mid": {
        title: "70.3 Medium Brick",
        description: "Bike 120 min @ 70.3 pace + Run 30 min @ race pace.",
        bike: { duration: 120, power: "155W" },
        run: { duration: 30, pace: "5:20" }
      },
      "70_3_long": {
        title: "70.3 Long Brick",
        description: "Bike 150 min @ 70.3 pace + Run 35 min @ race pace.",
        bike: { duration: 150, power: "155W" },
        run: { duration: 35, pace: "5:20" }
      },
      "70_3_longer": {
        title: "70.3 Longer Brick",
        description: "Bike 180 min @ 70.3 pace + Run 40 min @ race pace.",
        bike: { duration: 180, power: "155W" },
        run: { duration: 40, pace: "5:20" }
      },
      "70_3_race_sim": {
        title: "70.3 Race Simulation",
        description: "Bike 2.5 hrs @ race power (practice nutrition) + Run 45 min @ race pace.",
        bike: { duration: 150, power: "155W", nutrition: "practice_70g_carb" },
        run: { duration: 45, pace: "5:20" }
      },
      "70_3_longest": {
        title: "70.3 Longest Brick",
        description: "Bike 210 min + Run 60 min. Full simulation, nutrition practice essential.",
        bike: { duration: 210, power: "155W", nutrition: "full_race_sim" },
        run: { duration: 60, pace: "5:20-5:30" }
      }
    };
    
    const session = brickSessions[variant] || brickSessions["olympic_mid"];
    
    return {
      id: `w${weekNum}_brick_${variant}`,
      day: dayInfo.dayName,
      date: dayInfo.date,
      type: "brick",
      title: session.title,
      description: session.description,
      bike: session.bike,
      run: session.run,
      totalDuration: (session.bike?.duration || 0) + (session.run?.duration || 0),
      completed: false,
      nutrition: session.bike?.nutrition ? { carbsPerHour: 60 } : null,
      metrics: { bikePower: null, runPace: null, rpe: null }
    };
  }

  // ============================================
  // CLIMBING SESSION BUILDER
  // ============================================
  createClimbingSession(dayInfo, weekNum) {
    const climbingVariants = [
      "bouldering",
      "top_rope_easy",
      "bouldering",
      "top_rope_project",
      "bouldering",
      "lead_climbing",
      "bouldering"
    ];
    
    const variant = climbingVariants[(weekNum - 1) % climbingVariants.length];
    
    const climbingSessions = {
      "bouldering": {
        title: "Bouldering Session",
        description: "Focus on technique and problem-solving. 45 min limit, moderate intensity.",
        intensity: "moderate",
        duration: 45,
        focus: "skill_and_technique"
      },
      "top_rope_easy": {
        title: "Top Rope - Easy",
        description: "Easy climbing, focus on movement quality and breathing.",
        intensity: "easy",
        duration: 60,
        focus: "endurance_and_technique"
      },
      "top_rope_project": {
        title: "Project Climbing",
        description: "Work on harder routes. Limit attempts, focus on efficiency.",
        intensity: "hard",
        duration: 60,
        focus: "power_and_efficiency"
      },
      "lead_climbing": {
        title: "Lead Climbing",
        description: "If gym offers: lead climbing on moderate routes. Otherwise, simulated.",
        intensity: "moderate",
        duration: 90,
        focus: "mental_and_physical"
      }
    };
    
    const session = climbingSessions[variant];
    
    return {
      id: `w${weekNum}_climbing`,
      day: dayInfo.dayName,
      date: dayInfo.date,
      type: "climbing",
      title: session.title,
      description: session.description,
      intensity: session.intensity,
      duration: session.duration,
      focus: session.focus,
      completed: false,
      metrics: { problemsClimbed: null, rpe: null }
    };
  }

  // ============================================
  // RACE WEEK SESSION GENERATION
  // ============================================
  generateRaceWeekSessions(weekNum, days) {
    const sessions = [];
    
    // Always start with rest/mobility Monday
    sessions.push({
      id: `w${weekNum}_monday_rest`,
      day: days[0].dayName,
      date: days[0].date,
      type: "rest",
      title: "Rest Day",
      description: "Complete rest. Light mobility if desired.",
      duration: 0,
      completed: false
    });
    
    // Tuesday: Some activity
    sessions.push({
      id: `w${weekNum}_tuesday_activity`,
      day: days[1].dayName,
      date: days[1].date,
      type: weekNum === 32 ? "swim" : "bike",
      title: "Short Active Day",
      description: "30-40 min easy. Keep legs fresh.",
      duration: 35,
      completed: false
    });
    
    // Wednesday: Openers if race Saturday/Sunday
    if (weekNum === 9 || weekNum === 19) {
      sessions.push({
        id: `w${weekNum}_wednesday_openers`,
        day: days[2].dayName,
        date: days[2].date,
        type: "run",
        title: "Openers",
        description: "20 min easy + 4 x 100m strides. Wake up the legs.",
        duration: 35,
        completed: false
      });
    } else {
      // 70.3 is Sunday - different taper
      sessions.push({
        id: `w${weekNum}_wednesday_openers`,
        day: days[2].dayName,
        date: days[2].date,
        type: "bike",
        title: "Bike Openers",
        description: "30 min easy spin + 3 x 3 min @ race power.",
        duration: 45,
        completed: false
      });
    }
    
    // Thursday: More rest
    sessions.push({
      id: `w${weekNum}_thursday_rest`,
      day: days[3].dayName,
      date: days[3].date,
      type: "rest",
      title: "Rest Day",
      description: "Complete rest. Prepare all race gear.",
      duration: 0,
      completed: false
    });
    
    // Friday: Travel/prep
    sessions.push({
      id: `w${weekNum}_friday_prep`,
      day: days[4].dayName,
      date: days[4].date,
      type: "prep",
      title: "Race Prep",
      description: "Check equipment, review race plan, carb load.",
      duration: 60,
      completed: false
    });
    
    // Race day
    const raceDay = weekNum === 32 ? days[6] : days[5]; // 70.3 is Sunday
    sessions.push({
      id: `w${weekNum}_race_day`,
      day: raceDay.dayName,
      date: raceDay.date,
      type: "race",
      title: `RACE DAY: ${this.getRaceName(weekNum)}`,
      description: "Execute your race plan. Trust your training.",
      duration: 0,
      completed: false,
      raceMode: true
    });
    
    // Recovery day
    const recoveryDay = weekNum === 32 ? days[5] : days[6];
    sessions.push({
      id: `w${weekNum}_recovery`,
      day: recoveryDay.dayName,
      date: recoveryDay.date,
      type: "recovery",
      title: "Post-Race Recovery",
      description: "Light walking, easy stretching, celebrate!",
      duration: 30,
      completed: false
    });
    
    return sessions;
  }

  // ============================================
  // RECOVERY WEEK SESSION GENERATION
  // ============================================
  generateRecoveryWeekSessions(weekNum, days, phase) {
    const sessions = [];
    
    const recoveryTemplate = [
      { type: "rest", title: "Rest Day", duration: 0 },
      { type: "bike", title: "Recovery Spin", duration: 45, focus: "easy_z2" },
      { type: "run", title: "Recovery Run", duration: 35, focus: "walk_breaks" },
      { type: "swim", title: "Recovery Swim", duration: 30, focus: "technique_easy" },
      { type: "strength", title: "Mobility Session", duration: 25, focus: "foam_rolling" },
      { type: "brick", title: "Short Brick", duration: 60, focus: "short_easy" },
      { type: "climbing", title: "Easy Bouldering", duration: 45, focus: "fun" }
    ];
    
    recoveryTemplate.forEach((template, idx) => {
      sessions.push({
        id: `w${weekNum}_day${idx}`,
        day: days[idx].dayName,
        date: days[idx].date,
        type: template.type,
        title: template.title,
        description: this.getRecoveryDescription(template.type, template.focus),
        duration: template.duration,
        recoveryFocus: template.focus,
        completed: false
      });
    });
    
    return sessions;
  }

  getRecoveryDescription(type, focus) {
    const descriptions = {
      "rest": "Complete rest. Your body needs this recovery week.",
      "bike": "Very easy Z1-Z2 spin. No strain, just blood flow.",
      "run": "Walk/run intervals. Keep HR low, 15 sec walk breaks.",
      "swim": "Easy technique swim. Focus on feel, no strain.",
      "strength": "Foam rolling and mobility. No heavy lifting.",
      "brick": "45 min easy bike + 15 min easy walk/run.",
      "climbing": "Easy climbing for fun. No projecting, stay relaxed."
    };
    return descriptions[type] || "Recovery focus";
  }

  // ============================================
  // PROGRESSION HELPERS
  // ============================================
  getLongRunProgression(weekNum) {
    // Progressive long run build with race weeks and recovery weeks
    const progression = {
      // Macro 1: 10K → 14K → Half Marathon
      1: 10, 2: 11, 3: 12, 4: 10, 5: 12, 6: 13, 7: 14, 8: 10, 9: 21.1, // Race
      // Macro 2: Rebuild to 16K
      10: 12, 11: 13, 12: 14, 13: 10, 14: 14, 15: 15, 16: 16, 17: 12, 18: 10, 19: 10, // Race
      // Recovery
      20: 8, 21: 8,
      // Macro 3: 70.3 build
      22: 12, 23: 14, 24: 16, 25: 12, 26: 14, 27: 16, 28: 18, 29: 14, 30: 10, 31: 8, 32: 21.1 // Race
    };
    return progression[weekNum] || 10;
  }
}

// Create and export the plan
const trainingPlanGenerator = new TriathlonTrainingPlan();
const completeTrainingPlan = trainingPlanGenerator.getFullPlan();

// API for consuming the plan
const TrainingPlanAPI = {
  getWeek: (weekNum) => completeTrainingPlan[weekNum],
  getAllWeeks: () => completeTrainingPlan,
  getPhase: (weekNum) => trainingPlanGenerator.getPhaseInfo(weekNum),
  getRace: (weekNum) => trainingPlanGenerator.races.find(r => r.week === weekNum),
  getDates: (weekNum) => trainingPlanGenerator.getWeekDates(weekNum),
  getProgression: (discipline) => {
    // Return discipline-specific progression targets
    return {
      run: { focus: "run_volume", longRunProgression: trainingPlanGenerator.getLongRunProgression },
      bike: { focus: "maintain_ftp", thresholdProgression: "see_session_templates" },
      swim: { focus: "css_improvement", target: "1:55/100m" }
    };
  }
};

console.log("32-Week Triathlon Training Plan Generated!");
console.log("Total weeks:", Object.keys(completeTrainingPlan).length);
console.log("Race weeks:", [9, 19, 32].join(", "));
console.log("Sessions per week:", "8-12 (varied)");

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TriathlonTrainingPlan, completeTrainingPlan, TrainingPlanAPI };
}