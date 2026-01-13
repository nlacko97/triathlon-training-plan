# Agent Guidelines for Triathlon Training Plan

## Overview
Full-stack triathlon training web app with Node.js/Express backend and vanilla JavaScript frontend. Training plan generator for 32-week periodized program targeting 3 races.

## Project Structure
```
server/
├── index.js              # Express server with API routes
└── database.js           # JSON file-based persistence
public/
├── index.html            # Main training calendar UI
├── profile.html          # Athlete profile & metrics
├── stats.html            # Progress statistics
└── js/
    ├── app.js            # Frontend app logic
    └── plan-generator.js # Training plan generator
data/training-data.json    # JSON database (auto-created)
package.json
```

## Build/Run Commands

```bash
npm install                  # Install dependencies
npm run dev                  # Start server (auto-reload on changes)
npm start                    # Start server (production)
# Server runs on http://localhost:3000

# Syntax check (no build step)
node -c server/index.js
node -c public/js/app.js
node -c public/js/plan-generator.js

# Testing: Manual navigation to http://localhost:3000
```

## Code Style Guidelines

### Technology Stack
- **Backend**: Node.js + Express (CommonJS - require/module.exports)
- **Frontend**: Vanilla ES6+ JavaScript (no frameworks)
- **Database**: JSON file-based with synchronous fs operations
- **No TypeScript**: Plain JavaScript throughout
- **No Build Step**: Frontend loads via <script> tags

### Naming Conventions
- **Classes**: `PascalCase` (e.g., `TriathlonTrainingPlan`)
- **Functions/Variables**: `camelCase` (e.g., `loadWeek`, `weekNum`)
- **Constants**: `UPPER_SNAKE_CASE` for primitives, `camelCase` for objects
- **DOM IDs**: `camelCase` (e.g., `weekSelect`, `sessionModal`)
- **CSS classes**: `kebab-case` (e.g., `.session-card`, `.week-details`)
- **API routes**: `/api/resource`, `/api/resource/:id`

### Import Patterns
```javascript
// Backend: CommonJS require
const express = require('express');
const { dbHelpers } = require('./database');

// Frontend: ES6 modules (if used)
// Currently loaded via <script> tags in HTML
```

### Error Handling
```javascript
// API routes: try-catch with status codes
app.get('/api/sessions', (req, res) => {
  try {
    const sessions = dbHelpers.getAllSessionLogs();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Frontend: Graceful degradation
async function loadSessionLogs() {
  try {
    const response = await fetch('/api/sessions');
    if (response.ok) sessionLogs = await response.json();
  } catch (err) {
    sessionLogs = {};  // Fallback for offline
  }
}
```

### Database Operations
```javascript
// All operations synchronous (JSON file-based)
function loadData() {
  if (fs.existsSync(dbPath)) {
    const raw = fs.readFileSync(dbPath, 'utf8');
    return { ...defaultData, ...JSON.parse(raw) };
  }
  return { ...defaultData };
}

function saveData(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}
```

### API Patterns
```javascript
// GET requests
app.get('/api/sessions/week/:weekNumber', (req, res) => {
  const sessions = dbHelpers.getWeekSessions(parseInt(req.params.weekNumber));
  res.json(sessions);
});

// POST/PUT requests
app.post('/api/sessions', (req, res) => {
  dbHelpers.upsertSessionLog(req.body);
  res.json({ success: true });
});
```

### HTML/CSS Conventions
```html
<!-- Semantic HTML5, IDs for JS, classes for styling -->
<div class="card rounded-xl" id="weekDetails">
<button onclick="loadWeek(1)">Week 1</button>
```

```css
/* CSS Grid for calendar, mobile-first responsive */
.sessions-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 15px;
}
@media (max-width: 900px) {
  .sessions-grid { grid-template-columns: repeat(2, 1fr); }
}
```

### Comments & Documentation
```javascript
/**
 * Generate a complete week of training sessions
 * @param {number} weekNum - Week number (1-32)
 * @returns {Object} Week data with sessions array
 */
function generateWeek(weekNum) {
  const phase = getPhaseInfo(weekNum);
  const sessions = generateSessionsForWeek(weekNum, phase);
  return { weekNum, phase, sessions };
}
```

## Common Patterns

### Week Navigation (Bounds Validation)
```javascript
function loadWeek(weekNum) {
  weekNum = parseInt(weekNum);
  if (weekNum < 1 || weekNum > 32) return;
  currentWeek = weekNum;
}
```

### Session Type Icons
```javascript
const typeIcons = {
  run: '🏃', bike: '🚴', swim: '🏊',
  brick: '🧱', strength: '💪', climbing: '🧗',
  rest: '😴', race: '🏆', prep: '📋'
};
```

### Template Literal HTML Generation
```javascript
return `
  <div class="session-card ${config.bg}">
    <h3>${session.title}</h3>
    ${session.description ? `<p>${session.description}</p>` : ''}
  </div>
`;
```

## Key Training Plan Logic

### Phase Detection
- Weeks 1-8: Base Phase 1 (Half Marathon build)
- Week 9: Race Week (Half Marathon)
- Weeks 10-13: Base Phase 2 (Triathlon base)
- Weeks 14-17: Build Phase 1 (Olympic specificity)
- Week 19: Race Week (Olympic Tri)
- Weeks 20-21: Recovery
- Weeks 22-29: 70.3 Build
- Weeks 30-31: Taper
- Week 32: Race Week (70.3)

### Database Schema
```javascript
{
  profile: { name, age, weight_kg, max_hr },
  metrics: { ftp_watts, css_seconds_per_100m, ... },
  testingHistory: [],
  sessionLogs: { "sessionID_weekNum": { ... } },
  weeklyCheckins: { "weekNum": { ... } },
  raceResults: []
}
```

## Important Notes for Agents

1. **No TypeScript**: Pure JavaScript - do not add type annotations
2. **Mixed Module Systems**: Backend uses CommonJS, frontend uses ES6
3. **JSON File Database**: Synchronous fs operations - avoid async file ops
4. **No Build Step**: Frontend loads directly via <script> tags
5. **Week Bounds**: Always validate 1-32 range for week numbers
6. **Date Calculations**: All dates from startDate "2026-01-26"
7. **Race Weeks**: Weeks 9, 19, 32 require special handling
8. **Port Configuration**: Default 3000, configurable via PORT env var

---

**Last Updated**: January 13, 2026
**Maintainer**: AI Assistant
**Target Agents**: OpenCode, Cursor, Copilot, Cline
