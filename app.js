/* ── Acadence AI app.js ── shared state + utilities ── */

const SS = {
  posts: JSON.parse(localStorage.getItem('ss_posts') || 'null') || [
    {id:1,title:'How does the Krebs Cycle actually work?',content:'The Krebs cycle (citric acid cycle) is a series of chemical reactions used by all aerobic organisms to release stored energy. It occurs in the mitochondrial matrix and produces NADH, FADH₂, and ATP. Key outputs per turn: 3 NADH, 1 FADH₂, 1 GTP, 2 CO₂. Since glucose yields 2 acetyl-CoA, you get 2 full turns for a total of 6 NADH, 2 FADH₂, 2 GTP.',author:'Jordan M.',cat:'Science',tags:['Biology','Biochemistry','AP'],votes:142,comments:18,time:'2h ago',bookmarked:false,voted:0},
    {id:2,title:'Mastering Integration by Parts — complete guide',content:'Integration by parts is derived from the product rule of differentiation. The formula is ∫u dv = uv − ∫v du. The key is choosing the right u and dv using the LIATE rule: Logarithms, Inverse trig, Algebraic, Trig, Exponential. Example: ∫x·eˣ dx — let u=x, dv=eˣdx, then du=dx, v=eˣ. Result: x·eˣ − eˣ + C.',author:'Sam R.',cat:'Math',tags:['Calculus','AP Calc','Integration'],votes:98,comments:11,time:'4h ago',bookmarked:true,voted:1},
    {id:3,title:'The causes and effects of WWI — timeline breakdown',content:'World War I was triggered by the assassination of Archduke Franz Ferdinand in Sarajevo on June 28, 1914. But the underlying causes were far more complex. Remember MAIN: Militarism (arms race), Alliance systems (Triple Entente vs Triple Alliance), Imperialism (colonial competition), Nationalism (ethnic self-determination movements).',author:'Priya L.',cat:'History',tags:['WWI','World History'],votes:74,comments:9,time:'6h ago',bookmarked:false,voted:0},
    {id:4,title:'Understanding Big O Notation with real examples',content:'Big O notation describes how an algorithm\'s time or space complexity grows relative to its input size. O(1) constant — array index lookup. O(log n) logarithmic — binary search. O(n) linear — single loop. O(n log n) — merge sort. O(n²) quadratic — nested loops. Rule: avoid O(n²) or worse for n > 10,000.',author:'Dev K.',cat:'CS',tags:['Algorithms','Programming'],votes:201,comments:34,time:'1d ago',bookmarked:false,voted:0},
    {id:5,title:'Shakespeare\'s Hamlet — themes and analysis',content:'Hamlet explores themes of revenge, mortality, betrayal, and madness. The "To be or not to be" soliloquy reflects Hamlet\'s existential crisis. Key themes: (1) Revenge vs. moral paralysis, (2) Appearance vs. reality, (3) Corruption and power, (4) Mortality and the unknown afterlife.',author:'Lily T.',cat:'English',tags:['Literature','Shakespeare','AP English'],votes:55,comments:7,time:'1d ago',bookmarked:false,voted:0},
  ],

  studyPlan:    JSON.parse(localStorage.getItem('ss_plan')  || 'null'),
  chatMessages: JSON.parse(localStorage.getItem('ss_chat')  || 'null') || [
    {role:'ai', text:'Hi! I\'m your Cadence. Ask me anything — explanations, practice problems, concept breakdowns. What would you like to learn today?'}
  ],
  streak:     parseInt(localStorage.getItem('ss_streak')     || '4'),
  todayMins:  parseInt(localStorage.getItem('ss_todaymins')  || '20'),
  todayTasks: parseInt(localStorage.getItem('ss_todaytasks') || '1'),
  xp:         parseInt(localStorage.getItem('ss_xp')         || '2840'),

  save() {
    localStorage.setItem('ss_posts',      JSON.stringify(this.posts));
    localStorage.setItem('ss_plan',       JSON.stringify(this.studyPlan));
    localStorage.setItem('ss_chat',       JSON.stringify(this.chatMessages));
    localStorage.setItem('ss_streak',     this.streak);
    localStorage.setItem('ss_todaymins',  this.todayMins);
    localStorage.setItem('ss_todaytasks', this.todayTasks);
    localStorage.setItem('ss_xp',         this.xp);
  }
};

function catColor(cat) {
  return {Science:'blue', Math:'purple', History:'amber', CS:'green', English:'pink'}[cat] || 'gray';
}

/* All files are flat siblings — every href is just filename.html */
function buildSidebar(activePage) {
  const pages = [
    {id:'home',        href:'index.html',        icon:'🏠', label:'Home'},
    {id:'community',   href:'community.html',     icon:'🌐', label:'Community'},
    {id:'study',       href:'study.html',         icon:'📅', label:'Study Plan'},
    {id:'progress',    href:'progress.html',      icon:'📊', label:'Progress'},
    {id:'quiz',        href:'quiz.html',          icon:'🧠', label:'Practice Quiz'},
    {id:'flashcards',  href:'flashcards.html',    icon:'🃏', label:'Flashcards'},
    {id:'ai',          href:'ai.html',            icon:'🤖', label:'Cadence'},
    {id:'leaderboard', href:'leaderboard.html',   icon:'🏆', label:'Leaderboard'},
  ];

  const nav = (from, to) => pages.slice(from, to).map(p => `
    <a href="${p.href}" class="nav-item ${activePage===p.id?'active':''}">
      <span class="nav-icon">${p.icon}</span>
      <span>${p.label}</span>
    </a>`).join('');

  return `
  <nav class="sidebar">
    <a href="index.html" class="logo" style="text-decoration:none">
      <div class="logo-icon">S</div>
      <span class="logo-text">Acadence AI</span>
    </a>
    <div class="nav">
      <div class="nav-section">
        <div class="nav-label">Main</div>
        ${nav(0,4)}
      </div>
      <div class="nav-section">
        <div class="nav-label">Learning</div>
        ${nav(4,7)}
      </div>
      <div class="nav-section">
        <div class="nav-label">More</div>
        ${nav(7,8)}
      </div>
    </div>
    <div class="sidebar-user">
      <div class="avatar">AK</div>
      <div class="user-info">
        <div class="user-name">Alex Kim</div>
        <div class="user-xp">Level 7 · ${SS.xp.toLocaleString()} XP</div>
        <div class="xp-bar"><div class="xp-fill"></div></div>
      </div>
    </div>
  </nav>`;
}

const AI_RESPONSES = {
  'krebs':      'The Krebs cycle runs in the mitochondrial matrix. Per turn: acetyl-CoA (2C) + oxaloacetate (4C) → citrate (6C). Outputs per turn: 3 NADH, 1 FADH₂, 1 ATP, 2 CO₂. Two turns per glucose → 6 NADH, 2 FADH₂, 2 ATP total. These then feed the electron transport chain for ~32 more ATP.',
  'integral':   '∫2x dx — power rule: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C. So ∫2x dx = 2·x²/2 + C = x² + C. Always add the constant of integration C for indefinite integrals!',
  'wwi':        'WWI causes = MAIN: Militarism (arms race), Alliance systems (Triple Alliance vs Entente), Imperialism (colonial rivalry), Nationalism (ethnic self-determination). The spark: assassination of Archduke Franz Ferdinand, Sarajevo, June 28, 1914.',
  'big o':      'Big O describes runtime growth: O(1) constant, O(log n) logarithmic — binary search, O(n) linear — single loop, O(n log n) — merge sort, O(n²) quadratic — nested loops. Avoid O(n²) or worse for large inputs.',
  'hamlet':     '"To be or not to be" = Hamlet\'s meditation on existence vs. oblivion. Themes: mortality as "undiscovered country", inaction vs. action, existential paralysis. His core flaw: overthinking prevents decisive action.',
  'derivative': 'A derivative f\'(x) = lim(h→0)[f(x+h)−f(x)]/h measures instantaneous rate of change. Key rules: power rule d/dx[xⁿ]=nxⁿ⁻¹, chain rule d/dx[f(g(x))]=f\'(g(x))·g\'(x), product rule d/dx[uv]=u\'v+uv\'.',
  'default':    'Great question! Break it into parts: (1) identify the core concept, (2) find the key variables, (3) consider how they interact. Want a worked example, a practice problem, or a deeper conceptual explanation?'
};

function getAIResponse(msg) {
  const m = msg.toLowerCase();
  const key = Object.keys(AI_RESPONSES).find(k => m.includes(k));
  return AI_RESPONSES[key || 'default'];
}
