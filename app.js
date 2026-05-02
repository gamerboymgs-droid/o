/* ── Acadence AI — app.js ── */

const Auth = {
  get current() { return JSON.parse(localStorage.getItem('ac_user') || 'null'); },
  get isAdmin()  { return this.current?.role === 'admin'; },
  get isLoggedIn(){ return !!this.current; },

  login(email, password) {
    const users = this.getUsers();
    const u = users.find(u => u.email === email && u.password === password);
    if (!u) return false;
    localStorage.setItem('ac_user', JSON.stringify(u));
    return true;
  },

  register(name, email, password) {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) return 'exists';
    const initials = name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
    const u = { id: Date.now(), name, email, password, initials, role:'user', xp:100, streak:0, joined: new Date().toLocaleDateString() };
    users.push(u);
    localStorage.setItem('ac_users', JSON.stringify(users));
    localStorage.setItem('ac_user',  JSON.stringify(u));
    return true;
  },

  logout() { localStorage.removeItem('ac_user'); window.location.href = 'login.html'; },

  getUsers() { return JSON.parse(localStorage.getItem('ac_users') || '[]'); },

  updateCurrent(updates) {
    const u = { ...this.current, ...updates };
    localStorage.setItem('ac_user', JSON.stringify(u));
    const users = this.getUsers().map(x => x.id === u.id ? u : x);
    localStorage.setItem('ac_users', JSON.stringify(users));
    return u;
  },

  addXP(amount) {
    if (!this.isLoggedIn) return;
    const newXP = (this.current.xp || 0) + amount;
    this.updateCurrent({ xp: newXP });
    updateXPDisplay();
    return newXP;
  },

  ensureAdmin() {
    const users = this.getUsers();
    if (!users.find(u => u.email === 'admin@acadence.ai')) {
      users.push({ id:1, name:'Admin', email:'admin@acadence.ai', password:'admin123', initials:'AD', role:'admin', xp:9999, streak:99, joined:'2024-01-01' });
      localStorage.setItem('ac_users', JSON.stringify(users));
    }
  }
};

function requireAuth() {
  Auth.ensureAdmin();
  if (!Auth.isLoggedIn) { window.location.href = 'login.html'; return false; }
  return true;
}

const SS = {
  get posts() {
    return JSON.parse(localStorage.getItem('ss_posts') || 'null') || [
      {id:1,title:'How does the Krebs Cycle actually work?',content:'The Krebs cycle (citric acid cycle) is a series of chemical reactions used by all aerobic organisms to release stored energy. It occurs in the mitochondrial matrix and produces NADH, FADH2, and ATP. Key outputs per turn: 3 NADH, 1 FADH2, 1 GTP, 2 CO2.',author:'Jordan M.',authorId:0,cat:'Science',tags:['Biology','Biochemistry','AP'],votes:142,comments:[],time:'2h ago',bookmarked:false,voted:0},
      {id:2,title:'Mastering Integration by Parts — complete guide',content:'Integration by parts is derived from the product rule of differentiation. The formula is: u dv = uv minus v du. The key is choosing u and dv using LIATE: Logarithms, Inverse trig, Algebraic, Trig, Exponential.',author:'Sam R.',authorId:0,cat:'Math',tags:['Calculus','AP Calc','Integration'],votes:98,comments:[],time:'4h ago',bookmarked:true,voted:1},
      {id:3,title:'The causes and effects of WWI — timeline breakdown',content:'World War I was triggered by the assassination of Archduke Franz Ferdinand in Sarajevo on June 28, 1914. Remember MAIN: Militarism, Alliance systems, Imperialism, Nationalism.',author:'Priya L.',authorId:0,cat:'History',tags:['WWI','World History'],votes:74,comments:[],time:'6h ago',bookmarked:false,voted:0},
      {id:4,title:'Understanding Big O Notation with real examples',content:'Big O notation describes how an algorithm time or space complexity grows. O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) merge sort, O(n squared) quadratic.',author:'Dev K.',authorId:0,cat:'CS',tags:['Algorithms','Programming'],votes:201,comments:[],time:'1d ago',bookmarked:false,voted:0},
      {id:5,title:'Shakespeare Hamlet — themes and analysis',content:'Hamlet explores revenge, mortality, betrayal, and madness. The To be or not to be soliloquy reflects existential crisis. Key themes: revenge vs. moral paralysis, appearance vs. reality.',author:'Lily T.',authorId:0,cat:'English',tags:['Literature','Shakespeare'],votes:55,comments:[],time:'1d ago',bookmarked:false,voted:0},
    ];
  },
  set posts(v) { localStorage.setItem('ss_posts', JSON.stringify(v)); },
  get studyPlan()    { return JSON.parse(localStorage.getItem('ss_plan')  || 'null'); },
  set studyPlan(v)   { localStorage.setItem('ss_plan', JSON.stringify(v)); },
  get chatMessages() {
    return JSON.parse(localStorage.getItem('ss_chat') || 'null') || [
      {role:'ai', text:"Hi! I'm Cadence, your AI study companion. Ask me anything — explanations, practice problems, concept breakdowns. What would you like to learn today?"}
    ];
  },
  set chatMessages(v){ localStorage.setItem('ss_chat', JSON.stringify(v)); },
  get streak()     { return parseInt(localStorage.getItem('ss_streak')    || '4'); },
  set streak(v)    { localStorage.setItem('ss_streak', v); },
  get todayMins()  { return parseInt(localStorage.getItem('ss_todaymins') || '20'); },
  set todayMins(v) { localStorage.setItem('ss_todaymins', v); },
  get todayTasks() { return parseInt(localStorage.getItem('ss_todaytasks')|| '1'); },
  set todayTasks(v){ localStorage.setItem('ss_todaytasks', v); },
  save() {
    localStorage.setItem('ss_streak',    this.streak);
    localStorage.setItem('ss_todaymins', this.todayMins);
    localStorage.setItem('ss_todaytasks',this.todayTasks);
  }
};

let _xpTimer = null;
function trackTypingXP(inputEl, xpPer) {
  xpPer = xpPer || 2;
  if (!inputEl) return;
  inputEl.addEventListener('input', function() {
    clearTimeout(_xpTimer);
    _xpTimer = setTimeout(function() { Auth.addXP(xpPer); }, 800);
  });
}

function updateXPDisplay() {
  const el = document.getElementById('sidebar-xp');
  if (el) el.textContent = 'Level ' + xpLevel() + ' · ' + ((Auth.current && Auth.current.xp)||0).toLocaleString() + ' XP';
}

function xpLevel() {
  const xp = (Auth.current && Auth.current.xp) || 0;
  return Math.floor(xp / 500) + 1;
}

function catColor(cat) {
  return {Science:'blue', Math:'purple', History:'amber', CS:'green', English:'pink'}[cat] || 'gray';
}

function buildSidebar(activePage) {
  const user = Auth.current || { name:'Guest', initials:'?', xp:0 };
  const xp   = user.xp || 0;
  const lvl  = xpLevel();
  const pct  = Math.round((xp % 500) / 500 * 100);

  const pages = [
    {id:'home',        href:'index.html',       icon:'&#x1F3E0;', label:'Home'},
    {id:'community',   href:'community.html',    icon:'&#x1F310;', label:'Community'},
    {id:'study',       href:'study.html',        icon:'&#x1F4C5;', label:'Study Plan'},
    {id:'progress',    href:'progress.html',     icon:'&#x1F4CA;', label:'Progress'},
    {id:'quiz',        href:'quiz.html',         icon:'&#x1F9E0;', label:'Practice Quiz'},
    {id:'flashcards',  href:'flashcards.html',   icon:'&#x1F0CF;', label:'Flashcards'},
    {id:'ai',          href:'ai.html',           icon:'&#x1F916;', label:'Cadence'},
    {id:'leaderboard', href:'leaderboard.html',  icon:'&#x1F3C6;', label:'Leaderboard'},
  ];

  function navGroup(from, to) {
    return pages.slice(from, to).map(function(p) {
      return '<a href="' + p.href + '" class="nav-item ' + (activePage===p.id?'active':'') + '"><span class="nav-icon">' + p.icon + '</span><span>' + p.label + '</span></a>';
    }).join('');
  }

  var adminLink = Auth.isAdmin ? '<div class="nav-section"><div class="nav-label">Admin</div><a href="admin.html" class="nav-item ' + (activePage==='admin'?'active':'') + '" style="color:#f59e0b"><span class="nav-icon">&#x2699;&#xFE0F;</span><span>Admin Panel</span></a></div>' : '';

  return '<nav class="sidebar">'
    + '<a href="index.html" class="logo" style="text-decoration:none">'
    + '<div class="logo-icon">A</div><span class="logo-text">Acadence AI</span></a>'
    + '<div class="nav">'
    + '<div class="nav-section"><div class="nav-label">Main</div>' + navGroup(0,4) + '</div>'
    + '<div class="nav-section"><div class="nav-label">Learning</div>' + navGroup(4,7) + '</div>'
    + '<div class="nav-section"><div class="nav-label">More</div>' + navGroup(7,8) + '</div>'
    + adminLink
    + '</div>'
    + '<div class="sidebar-user">'
    + '<div class="avatar">' + (user.initials||'?') + '</div>'
    + '<div class="user-info">'
    + '<div class="user-name">' + user.name + '</div>'
    + '<div class="user-xp" id="sidebar-xp">Level ' + lvl + ' &middot; ' + xp.toLocaleString() + ' XP</div>'
    + '<div class="xp-bar"><div class="xp-fill" style="width:' + pct + '%"></div></div>'
    + '</div>'
    + '<button onclick="Auth.logout()" title="Log out" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:16px;padding:4px">&#x21A9;</button>'
    + '</div></nav>';
}

var BADGES = [
  {icon:'&#x1F525;', name:'Week Warrior',    desc:'7-day streak'},
  {icon:'&#x1F4DA;', name:'Knowledge Seeker',desc:'10 posts read'},
  {icon:'&#x26A1;',  name:'Quick Learner',   desc:'First quiz aced'},
  {icon:'&#x1F31F;', name:'Contributor',     desc:'First post created'},
  {icon:'&#x1F3AF;', name:'On Target',       desc:'Study goal met 5x'},
  {icon:'&#x1F916;', name:'AI Explorer',     desc:'First AI chat'},
];

function renderBadges() {
  return '<div style="display:flex;gap:10px;flex-wrap:wrap">'
    + BADGES.map(function(b) {
        return '<div class="card-sm" style="display:flex;align-items:center;gap:10px;min-width:155px">'
          + '<div style="font-size:24px">' + b.icon + '</div>'
          + '<div><div style="font-size:13px;font-weight:500">' + b.name + '</div>'
          + '<div style="font-size:11px;color:var(--text3)">' + b.desc + '</div></div>'
          + '</div>';
      }).join('')
    + '</div>';
}

var AI_RESPONSES = {
  'krebs':      'The Krebs cycle runs in the mitochondrial matrix. Per turn: acetyl-CoA + oxaloacetate produce citrate. Outputs: 3 NADH, 1 FADH2, 1 ATP, 2 CO2 per turn. Two turns per glucose feeds the electron transport chain for ~32 more ATP.',
  'integral':   'For the integral of 2x: use the power rule (integral of x to the n = x to the n+1 divided by n+1 + C). So the integral of 2x = x squared + C. Always add the constant C for indefinite integrals!',
  'wwi':        'WWI causes = MAIN: Militarism, Alliance systems, Imperialism, Nationalism. The spark: assassination of Archduke Franz Ferdinand, Sarajevo, June 28, 1914.',
  'big o':      'Big O describes runtime growth: O(1) constant, O(log n) binary search, O(n) linear loop, O(n log n) merge sort, O(n squared) nested loops. Avoid quadratic or worse for large inputs.',
  'hamlet':     'To be or not to be is Hamlet meditation on existence vs. oblivion. Core theme: overthinking prevents decisive action. His central flaw is existential paralysis.',
  'derivative': 'The derivative f prime of x = lim as h approaches 0 of [f(x+h) minus f(x)] divided by h. Key rules: power rule gives n times x to the n minus 1, chain rule, and product rule.',
  'default':    'Great question! Break it into parts: (1) identify the core concept, (2) find the key variables, (3) see how they interact. Want a worked example or deeper explanation?'
};

function getAIResponse(msg) {
  var m = msg.toLowerCase();
  var key = Object.keys(AI_RESPONSES).find(function(k) { return m.indexOf(k) !== -1; });
  return AI_RESPONSES[key || 'default'];
}
