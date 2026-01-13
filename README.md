.
# 32-Week Triathlon Training Plan Web App

A comprehensive, periodized triathlon training plan for age-group athletes. Built for a 28-year-old triathlete targeting three races across 8 months.

## 📋 Overview

This project provides a complete 32-week training plan with:
- **Proper periodization** (base → build → peak → taper → race)
- **Versatile weekly sessions** (no repetitive weeks!)
- **All disciplines**: swim, bike, run, strength, climbing
- **Date-based calendar navigation** for easy following
- **Web app interface** for tracking and execution

## 🗂️ File Structure

```
triathlon-plan/
├── plan_prompt.md          # Original athlete requirements
├── training_plan_core.js   # Core data structures & phase definitions
├── plan_generator.js       # Complete 32-week generator with 8-12 sessions/week
├── index.html              # Main calendar interface
├── profile.html            # Detailed athlete profile & goals
└── README.md               # This file
```

## 🚀 Getting Started

### Navigation Features

- **Date-based calendar**: Each week shows actual dates (Jan 26 - Feb 1, etc.)
- **Week buttons**: Click any week number to jump
- **Race weeks highlighted**: Pink buttons for Weeks 9, 19, 32
- **Phase badge**: Shows current training phase
- **Export function**: Download week plan as text file

## 📅 Training Periodization

### Macrocycle Structure

| Phase | Weeks | Focus | Weekly Hours | Sessions |
|-------|-------|-------|--------------|----------|
| Base Phase 1 | 1-8 | Run volume, aerobic base | 7-9h | 8-9 |
| Race Week 1 | 9 | Half Marathon | 4h | 5 |
| Base Phase 2 | 10-13 | Triathlon base | 8-10h | 10 |
| Build Phase 1 | 14-17 | Olympic specificity | 9-11h | 11 |
| Taper Week | 18 | Olympic taper | 5h | 6 |
| **Race Week 2** | **19** | **Olympic Triathlon** | **4h** | **5** |
| Recovery | 20-21 | Active recovery | 6h | 8 |
| Base Phase 3 | 22-25 | 70.3 volume build | 8-10h | 10 |
| Build Phase 2 | 26-29 | 70.3 specificity | 10-12h | 12 |
| Taper Weeks | 30-31 | 70.3 taper | 5-6h | 7 |
| **Race Week 3** | **32** | **70.3 Zell am See** | **4h** | **5** |

### Key Training Principles

1. **Monday = Rest Day** - Mandatory recovery after weekend load
2. **Wednesday = Primary Run Workout** - Never skip unless injured
3. **Sunday = Long Run** - Progressive build 10K → 18K
4. **Thursday = Swim + Climbing** - Technique and mental health
5. **Friday = Strength** - Injury prevention focus
6. **Saturday = Long Bike/Brick** - Race-specific work

## 🎯 Session Variety (No Repetitive Weeks!)

### Run Sessions (7+ different workouts)

| Variant | Description | When Used |
|---------|-------------|-----------|
| Mile Repeats | 4-6 x 1mi @ threshold | Base/Build phases |
| Tempo Run | 20-30min continuous @ threshold | Mid-week quality |
| Fartlek | 8x(1min hard/2min easy) | Variety week |
| Hill Repeats | 8x90sec steep hill | Strength focus |
| Progression Run | Building pace to threshold | Endurance + speed |
| Race Pace | 8-15K @ race pace | Specificity weeks |
| Recovery Run | Easy Z2 with walk breaks | Recovery weeks |

### Bike Sessions (10+ different workouts)

| Variant | Description | When Used |
|---------|-------------|-----------|
| FTP Test | 20min max effort | Week 1 only |
| Sweet Spot | 2x20min @ 88-92% FTP | Base building |
| Threshold | 3-5 x 10-15min @ threshold | Key workout |
| VO2 Max | 5x4min @ 105-115% FTP | Power development |
| Tempo | 45-60min @ tempo pace | Endurance |
| Long Endurance | 2-3hr Z2 rides | Saturday focus |
| Race Pace | Olympic/70.3 specific power | Brick weeks |

### Swim Sessions (8+ different workouts)

| Variant | Description | When Used |
|---------|-------------|-----------|
| CSS Test | 400m + 200m TT | Week 1, every 4-6 weeks |
| Technique 400s | 6x400m (drill + swim) | Technique focus |
| CSS Main Set | 8-12 x 200m @ CSS | Aerobic development |
| Threshold 300s | 6x300m @ threshold | Speed work |
| Race Pace | Olympic/70.3 distance @ pace | Specificity |
| Open Water | Sighting, drafting, bilat | Pre-race prep |

### Strength Sessions (4 different workouts)

| Variant | Description | Duration |
|---------|-------------|----------|
| Full Body Baseline | Establish strength levels | 35min |
| Lower Body Focus | Cycling/running power | 40min |
| Upper Body Focus | Push/pull balance | 35min |
| Mobility Only | Foam rolling, stretching | 20min |

### Climbing Sessions (rotating)

- Bouldering (45min) - Most frequent
- Top Rope Easy (60min) - Endurance focus
- Project Climbing (60min) - When motivated
- Lead Climbing (90min) - Skill maintenance

## 🏆 Race Targets

### Race 1: Half Marathon (Week 9)
- **Date**: March 28, 2026
- **Target**: Sub-2:00 (5:40/km)
- **Purpose**: Supported long run, race practice

### Race 2: Olympic Triathlon (Week 19)
- **Date**: June 6, 2026
- **Distance**: 1.5K swim / 40K bike / 10K run
- **Target**: Sub-2:50
  - Swim: 28min (1:55/100m)
  - Bike: 72min (165W NP)
  - Run: 52min (5:12/km)

### Race 3: 70.3 Zell am See (Week 32)
- **Date**: August 30, 2026
- **Distance**: 1.9K swim / 90K bike / 21.1K run
- **Course**: 1000m bike elevation, flat run
- **Target**: Sub-5:30
  - Swim: 38min (2:00/100m)
  - Bike: 2:55 (155W NP)
  - Run: 1:52 (5:20/km)

## 💪 Weekly Structure Example

### Typical Training Week (Build Phase)

| Day | Session | Type | Duration | Focus |
|-----|---------|------|----------|-------|
| Mon | Rest | Rest | 0h | Recovery |
| Tue | Bike Threshold | Bike | 75min | 3x12min @ threshold |
| Wed | Mile Repeats | Run | 60min | 5 x 1mi @ 5:00/km |
| Thu | CSS + Drills | Swim | 45min | 8x200m @ CSS |
| Thu PM | Bouldering | Climbing | 45min | Skill/mental |
| Fri | Strength | Strength | 35min | Full body |
| Sat | Brick | Brick | 110min | Bike 90min + Run 20min |
| Sun | Long Run | Run | 90min | 14K @ 5:30/km |
| **Total** | | | **~10h** | |

### Recovery Week Example

| Day | Session | Type | Duration |
|-----|---------|------|----------|
| Mon | Rest | Rest | 0h |
| Tue | Recovery Spin | Bike | 45min |
| Wed | Recovery Run | Run | 35min |
| Thu | Easy Swim | Swim | 30min |
| Fri | Mobility | Strength | 25min |
| Sat | Short Brick | Brick | 60min |
| Sun | Easy Climb | Climbing | 45min |
| **Total** | | | **~6h** |

## 🎯 Key Success Metrics

### Process Goals (Non-Negotiable)

- [ ] 3 runs/week for 32 weeks (zero misses)
- [ ] Never skip Wednesday threshold run
- [ ] Never skip Sunday long run (within 10% of target)
- [ ] Complete 1 strength session/week
- [ ] Complete 1 climbing session/week
- [ ] Monitor and log foot numbness

### Performance Goals

| Race | Success | Stretch |
|------|---------|---------|
| Half Marathon | Sub-2:00 | 1:55:00 |
| Olympic Tri | Sub-2:50 | 2:35:00 |
| 70.3 | Sub-5:30 | 5:15:00 |

### Health Goals

- No injuries (32 weeks)
- Foot numbness resolved or stable
- Sleep: 7-8 hours/night
- Positive mental state throughout

## 🔧 Customization Guide

### Adjust Weekly Hours

In `plan_generator.js`, modify `calculateWeeklyHours()`:

```javascript
function calculateWeeklyHours(weekNum) {
  const phase = getPhase(weekNum);
  if (phase.focus === "base") return 8;    // Increase base
  if (phase.focus === "build") return 11;   // Increase build
  if (phase.focus === "taper") return 4;
  return 9;
}
```

### Change Race Targets

In `training_plan_core.js`, modify the races array:

```javascript
{
  id: "olympic_tri_2026",
  goalTime: "2:45:00",  // New target
  targets: {
    swim: { time: "27:00", pace: "1:48/100m" },
    bike: { npPower: 170 },  // Higher power
    run: { time: "50:00", pace: "5:00/km" }
  }
}
```

### Add New Session Types

Add to `sessionTypes` in `training_plan_core.js`:

```javascript
yoga: {
  categories: [
    { id: "recovery_yoga", name: "Recovery Yoga", duration: 30 }
  ],
  weeklyFrequency: { min: 0, target: 1, max: 2 }
}
```

## 📊 API Usage

```javascript
// Get full 32-week plan
const fullPlan = TrainingPlanAPI.getAllWeeks();

// Get specific week
const week15 = TrainingPlanAPI.getWeek(15);

// Get race information
const race = TrainingPlanAPI.getRace(19);

// Get phase info
const phase = TrainingPlanAPI.getPhase(22);

// Calculate week dates
const dates = TrainingPlanAPI.getDates(5);
```

## 📱 Technical Details

- **No dependencies**: Pure HTML/CSS/JavaScript
- **Browser support**: Chrome 90+, Firefox 88+, Safari 14+
- **Offline capable**: Works without internet
- **Mobile responsive**: Works on phones/tablets
- **Data format**: JSON-serializable for easy export

## 🏃‍♂️ Athlete Constraints Built-In

- **Time-limited**: 7-12 hours/week (average 9-10h)
- **Pool access**: 1-2x/week realistic (2hr commitment)
- **Foot numbness**: Protocol with walk breaks
- **Climbing**: Mandatory weekly session
- **Strength**: Maintenance focus, not primary stimulus

---

**Plan Version**: 2.0 (Periodized & Versatile)  
**Created**: January 12, 2026  
**Plan Period**: January 26 - August 30, 2026 (32 weeks)  
**Target Athlete**: 28-year-old male age-grouper, time-crunched