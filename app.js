/* Acadence AI — app.js */

const Auth = {
  get current()   { return JSON.parse(localStorage.getItem('ac_user') || 'null'); },
  get isAdmin()   { return this.current && this.current.role === 'admin'; },
  get isLoggedIn(){ return !!this.current; },

  login(email, password) {
    const u = this.getUsers().find(function(u){ return u.email===email && u.password===password; });
    if (!u) return false;
    localStorage.setItem('ac_user', JSON.stringify(u));
    return true;
  },

  register(name, email, password) {
    const users = this.getUsers();
    if (users.find(function(u){ return u.email===email; })) return 'exists';
    const initials = name.split(' ').map(function(n){ return n[0]; }).join('').toUpperCase().slice(0,2);
    const u = { id:Date.now(), name, email, password, initials, role:'user', xp:100, streak:0, joined:new Date().toLocaleDateString() };
    users.push(u);
    localStorage.setItem('ac_users', JSON.stringify(users));
    localStorage.setItem('ac_user',  JSON.stringify(u));
    return true;
  },

  logout()  { localStorage.removeItem('ac_user'); window.location.href='login.html'; },
  getUsers(){ return JSON.parse(localStorage.getItem('ac_users') || '[]'); },

  updateCurrent(updates) {
    const u = Object.assign({}, this.current, updates);
    localStorage.setItem('ac_user', JSON.stringify(u));
    const users = this.getUsers().map(function(x){ return x.id===u.id ? u : x; });
    localStorage.setItem('ac_users', JSON.stringify(users));
    return u;
  },

  addXP(amount) {
    if (!this.isLoggedIn) return;
    const u = this.updateCurrent({ xp: (this.current.xp||0) + amount });
    updateXPDisplay();
    return u.xp;
  },

  ensureAdmin() {
    const users = this.getUsers();
    if (!users.find(function(u){ return u.email==='admin@acadence.ai'; })) {
      users.push({ id:1, name:'Admin', email:'admin@acadence.ai', password:'admin123', initials:'AD', role:'admin', xp:9999, streak:99, joined:'2024-01-01' });
      localStorage.setItem('ac_users', JSON.stringify(users));
    }
  }
};

function requireAuth() {
  Auth.ensureAdmin();
  if (!Auth.isLoggedIn) { window.location.href='login.html'; return false; }
  return true;
}

/* ── Posts with AP/SAT exam types ── */
const DEFAULT_POSTS = [
  {id:1, title:'AP Biology: Complete Guide to Cellular Respiration', content:'Cellular respiration is the process by which cells break down glucose to produce ATP. It occurs in three stages: Glycolysis (cytoplasm), Krebs Cycle (mitochondrial matrix), and Electron Transport Chain (inner mitochondrial membrane). For AP Bio, you must know the inputs and outputs of each stage, the role of NAD+ and FAD as electron carriers, and how chemiosmosis produces the majority of ATP.', author:'Jordan M.', authorId:0, cat:'AP Biology', examType:'AP', subject:'Biology', tags:['AP Bio','Cellular Respiration','Unit 3'], votes:142, comments:[], time:'2h ago', bookmarked:false, voted:0},
  {id:2, title:'SAT Math: No-Calculator Section Strategies', content:'The SAT no-calculator section tests algebra, problem solving, and data analysis. Key strategies: (1) Plug in answer choices for complex equations. (2) For percentage problems, multiply by the decimal equivalent. (3) Heart of Algebra questions appear most frequently — master linear equations and systems. (4) Passport to Advanced Math includes quadratics and function notation. Average time per question: 75 seconds.', author:'Sam R.', authorId:0, cat:'SAT Math', examType:'SAT', subject:'Math', tags:['SAT','No Calculator','Algebra'], votes:98, comments:[], time:'4h ago', bookmarked:true, voted:1},
  {id:3, title:'AP US History: Period 4 Key Themes (1800-1848)', content:'APUSH Period 4 covers the era of Jacksonian Democracy, Market Revolution, and westward expansion. High-frequency essay topics: (1) How did the Market Revolution transform American society? (2) Evaluate the extent of Jacksonian Democracy. (3) How did nationalism and sectionalism compete 1800-1848? Know the Missouri Compromise, Nullification Crisis, and Trail of Tears in detail.', author:'Priya L.', authorId:0, cat:'AP US History', examType:'AP', subject:'History', tags:['APUSH','Period 4','DBQ'], votes:74, comments:[], time:'6h ago', bookmarked:false, voted:0},
  {id:4, title:'ACT Science: How to Read Data Representation Passages', content:'Data Representation passages (3 per ACT Science) present graphs, tables, and figures. Strategy: do NOT read the intro paragraph first — go straight to the figures, then answer questions. Most answers are directly in the data. Watch for axis labels, units, and trends. For Conflicting Viewpoints passages, identify each scientist viewpoint before answering. Target: 5 minutes per passage.', author:'Dev K.', authorId:0, cat:'ACT Science', examType:'ACT', subject:'Science', tags:['ACT','Science','Data'], votes:201, comments:[], time:'1d ago', bookmarked:false, voted:0},
  {id:5, title:'AP English Language: Synthesis Essay Masterclass', content:'The AP Lang synthesis essay requires you to incorporate at least 3 of 6-7 provided sources to support your argument. Key scoring criteria: (1) Thesis must make a defensible claim with a line of reasoning. (2) Evidence from sources must be explained, not just quoted. (3) Commentary must connect evidence to your thesis. (4) Complexity point: acknowledge counterarguments or tension within sources. Time: 40 minutes.', author:'Lily T.', authorId:0, cat:'AP English', examType:'AP', subject:'English', tags:['AP Lang','Synthesis','FRQ'], votes:55, comments:[], time:'1d ago', bookmarked:false, voted:0},
  {id:6, title:'Official SAT Practice Test 10 — Full Breakdown', content:'This post contains a complete breakdown of SAT Practice Test 10 (College Board official). Sections: Reading (52Q, 65min), Writing & Language (44Q, 35min), Math No-Calc (20Q, 25min), Math Calc (38Q, 55min). Attached: answer explanations for every question, score conversion chart, and common error patterns by question type. Ideal for students targeting 1400+.', author:'Admin', authorId:1, cat:'SAT Practice Test', examType:'SAT', subject:'Full Test', tags:['SAT','Practice Test','Official'], votes:312, comments:[], time:'3d ago', bookmarked:false, voted:0, isPracticeTest:true, testYear:'2024', testSource:'College Board'},
  {id:7, title:'AP Calculus BC: 2023 Free Response Full Solutions', content:'Complete worked solutions for all 6 FRQ questions from the 2023 AP Calculus BC exam. Topics covered: related rates, area between curves, differential equations (slope fields), parametric equations, Taylor series, and the FTC Part 2. Each solution includes the College Board scoring rubric and common point deductions to avoid.', author:'Admin', authorId:1, cat:'AP Calculus', examType:'AP', subject:'Math', tags:['AP Calc BC','FRQ','2023'], votes:189, comments:[], time:'5d ago', bookmarked:false, voted:0, isPracticeTest:true, testYear:'2023', testSource:'College Board'},
];

const SS = {
  get posts()        { return JSON.parse(localStorage.getItem('ss_posts') || 'null') || DEFAULT_POSTS; },
  set posts(v)       { localStorage.setItem('ss_posts', JSON.stringify(v)); },
  get studyPlan()    { return JSON.parse(localStorage.getItem('ss_plan')  || 'null'); },
  set studyPlan(v)   { localStorage.setItem('ss_plan', JSON.stringify(v)); },
  get chatMessages() { return JSON.parse(localStorage.getItem('ss_chat')  || 'null') || [{role:'ai', text:"Hi, I'm Cadence. I specialize in AP and SAT/ACT prep. Ask me anything — concept explanations, practice problems, scoring strategies, or exam tips."}]; },
  set chatMessages(v){ localStorage.setItem('ss_chat', JSON.stringify(v)); },
  get streak()       { return parseInt(localStorage.getItem('ss_streak')    || '4'); },
  set streak(v)      { localStorage.setItem('ss_streak', v); },
  get todayMins()    { return parseInt(localStorage.getItem('ss_todaymins') || '20'); },
  set todayMins(v)   { localStorage.setItem('ss_todaymins', v); },
  save()             { localStorage.setItem('ss_streak', this.streak); localStorage.setItem('ss_todaymins', this.todayMins); }
};

/* ── XP tracking ── */
var _xpTimer = null;
function trackTypingXP(el, xp) {
  if (!el) return;
  xp = xp || 2;
  el.addEventListener('input', function() {
    clearTimeout(_xpTimer);
    _xpTimer = setTimeout(function(){ Auth.addXP(xp); }, 900);
  });
}
function updateXPDisplay() {
  var el = document.getElementById('sidebar-xp');
  if (el) el.textContent = 'Level ' + xpLevel() + '  ·  ' + ((Auth.current && Auth.current.xp)||0).toLocaleString() + ' XP';
}
function xpLevel() { return Math.floor(((Auth.current && Auth.current.xp)||0) / 500) + 1; }

/* ── Category colors ── */
function examColor(type) {
  return {AP:'amber', SAT:'blue', ACT:'green'}[type] || 'gray';
}
function catColor(cat) {
  if (!cat) return 'gray';
  var c = cat.toLowerCase();
  if (c.includes('ap'))  return 'amber';
  if (c.includes('sat')) return 'blue';
  if (c.includes('act')) return 'green';
  return 'gray';
}

/* ── SIDEBAR ── */
function buildSidebar(activePage) {
  var user = Auth.current || {name:'Guest', initials:'?', xp:0};
  var xp  = user.xp || 0;
  var lvl = xpLevel();
  var pct = Math.round((xp % 500) / 500 * 100);

  var pages = [
    {id:'home',        href:'index.html',       icon:'&#9632;', label:'Dashboard'},
    {id:'community',   href:'community.html',    icon:'&#9632;', label:'Knowledge Hub'},
    {id:'exams',       href:'exams.html',        icon:'&#9632;', label:'Exam Library'},
    {id:'study',       href:'study.html',        icon:'&#9632;', label:'Study Plan'},
    {id:'progress',    href:'progress.html',     icon:'&#9632;', label:'Progress'},
    {id:'quiz',        href:'quiz.html',         icon:'&#9632;', label:'Practice Quiz'},
    {id:'flashcards',  href:'flashcards.html',   icon:'&#9632;', label:'Flashcards'},
    {id:'ai',          href:'ai.html',           icon:'&#9632;', label:'Cadence AI'},
    {id:'leaderboard', href:'leaderboard.html',  icon:'&#9632;', label:'Leaderboard'},
  ];

  /* SVG icons to avoid emoji rendering issues */
  var icons = {
    home:        '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>',
    community:   '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
    exams:       '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>',
    study:       '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    progress:    '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    quiz:        '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17" stroke-linecap="round" stroke-width="3"/></svg>',
    flashcards:  '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
    ai:          '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z"/></svg>',
    leaderboard: '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 6l4-4 4 4"/><path d="M12 2v10.3"/><path d="M20 21H4"/><path d="M4 21v-5a2 2 0 012-2h12a2 2 0 012 2v5"/></svg>',
    admin:       '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M20 12h2M2 12h2M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41"/></svg>',
  };

  function navItem(p, iconKey) {
    return '<a href="' + p.href + '" class="nav-item ' + (activePage===p.id?'active':'') + '">'
      + '<span class="nav-icon">' + (icons[iconKey]||'') + '</span>'
      + '<span>' + p.label + '</span></a>';
  }

  var adminLink = Auth.isAdmin
    ? '<div class="nav-section"><div class="nav-label">Admin</div>'
      + '<a href="admin.html" class="nav-item ' + (activePage==='admin'?'active':'') + '" style="' + (activePage!=='admin'?'color:#d97706':'') + '">'
      + '<span class="nav-icon">' + icons.admin + '</span><span>Admin Panel</span></a></div>'
    : '';

  return '<nav class="sidebar">'
    + '<a href="index.html" class="logo" style="text-decoration:none">'
    + '<div class="logo-icon">A</div>'
    + '<div><div class="logo-text">Acadence</div><div class="logo-sub">AP &amp; SAT/ACT Prep</div></div></a>'
    + '<div class="nav">'
    + '<div class="nav-section"><div class="nav-label">Main</div>'
    + navItem(pages[0],'home') + navItem(pages[1],'community') + navItem(pages[2],'exams') + navItem(pages[3],'study') + navItem(pages[4],'progress') + '</div>'
    + '<div class="nav-section"><div class="nav-label">Study Tools</div>'
    + navItem(pages[5],'quiz') + navItem(pages[6],'flashcards') + navItem(pages[7],'ai') + '</div>'
    + '<div class="nav-section"><div class="nav-label">Community</div>'
    + navItem(pages[8],'leaderboard') + '</div>'
    + adminLink + '</div>'
    + '<div class="sidebar-user">'
    + '<div class="avatar">' + (user.initials||'?') + '</div>'
    + '<div class="user-info"><div class="user-name">' + user.name + '</div>'
    + '<div class="user-xp" id="sidebar-xp">Level ' + lvl + '  ·  ' + xp.toLocaleString() + ' XP</div>'
    + '<div class="xp-bar"><div class="xp-fill" style="width:' + pct + '%"></div></div></div>'
    + '<button onclick="Auth.logout()" title="Log out" style="background:none;border:none;color:#57534e;cursor:pointer;font-size:13px;padding:4px;flex-shrink:0">&#x2192;</button>'
    + '</div></nav>';
}

/* ── Badges ── */
var BADGES = [
  {icon:'S', name:'Streak Starter', desc:'5-day streak'},
  {icon:'C', name:'Consistent',     desc:'10-day streak'},
  {icon:'Q', name:'Quiz Master',    desc:'10 quizzes aced'},
  {icon:'W', name:'Writer',         desc:'First post published'},
  {icon:'T', name:'Top Scorer',     desc:'Leaderboard top 10'},
  {icon:'A', name:'AI Power User',  desc:'50 Cadence messages'},
];

function renderBadges() {
  return '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px">'
    + BADGES.map(function(b){
        return '<div class="card-sm" style="display:flex;align-items:center;gap:12px">'
          + '<div style="width:36px;height:36px;border-radius:8px;background:var(--accentlt);color:var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--display);font-weight:700;font-size:14px;flex-shrink:0">' + b.icon + '</div>'
          + '<div><div style="font-size:13px;font-weight:600">' + b.name + '</div>'
          + '<div style="font-size:11px;color:var(--text3)">' + b.desc + '</div></div></div>';
      }).join('')
    + '</div>';
}

/* ── AI Responses (AP/SAT focused) ── */
var AI_RESPONSES = {
  'krebs':       'The Krebs cycle is tested heavily on AP Biology Unit 3. Key facts: occurs in the mitochondrial matrix, 2 turns per glucose. Per turn: 1 acetyl-CoA in, 3 NADH + 1 FADH2 + 1 GTP + 2 CO2 out. AP exam tip: know that most ATP comes from oxidative phosphorylation in the ETC, not directly from the Krebs cycle.',
  'sat math':    'SAT Math covers four areas: Heart of Algebra (linear equations, systems), Problem Solving & Data Analysis (ratios, statistics), Passport to Advanced Math (quadratics, functions), and Additional Topics (geometry, trig). Heart of Algebra is most common (~33% of questions). Key no-calc strategy: substitution often beats algebraic manipulation.',
  'act science': 'ACT Science has 40 questions in 35 minutes — that is 52 seconds per question. Passage types: Data Representation (read graphs/tables), Research Summaries (experiments), Conflicting Viewpoints (scientists disagree). Never spend more than 5 minutes on Conflicting Viewpoints. The questions test reading comprehension more than science knowledge.',
  'synthesis':   'AP Lang Synthesis Essay scoring: Thesis (0-1), Evidence & Commentary (0-4), Sophistication (0-1). To earn the sophistication point, either: explain the limitations of your argument, use a vivid metaphor consistently, or explain the broader implications of your position. Cite sources as (Source A), (Source B) — do not use author names.',
  'ap calc':     'AP Calculus AB/BC FRQ tips: (1) Show all work — answers without justification earn 0. (2) For related rates, always state what you are finding and define variables. (3) Justify your answer using the FTC, MVT, or EVT by name. (4) On BC-only topics: parametric, polar, and series questions appear in Part B. Know the ratio test and alternating series error bound.',
  'apush':       'APUSH essays are scored on: Thesis/Claim, Contextualization, Evidence, Analysis/Reasoning, Complexity. Contextualization is the most commonly missed point — it requires a developed paragraph explaining the broader historical context BEFORE your argument, not just a mention. Use at least 6 specific pieces of evidence across your essay.',
  'default':     'I specialize in AP and SAT/ACT prep. I can help with: AP exam FRQ strategies, SAT/ACT section breakdowns, content review for any AP subject, practice problem explanations, scoring rubric guidance, and study planning. What subject or exam section do you need help with?'
};

function getAIResponse(msg) {
  var m = msg.toLowerCase();
  var key = Object.keys(AI_RESPONSES).find(function(k){ return m.indexOf(k) !== -1; });
  return AI_RESPONSES[key || 'default'];
}
