/* ============================================================
   "Ask Deepu" — client-side profile assistant
   Vanilla JS, no dependencies, no network calls.
   Answers come from the knowledge base below — keep it in sync
   with index.html when the profile changes.
   ============================================================ */
(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EMAIL = 'tnairdeepu@gmail.com';
  const PHONE = '+1 647-994-6021';
  const LINKEDIN = 'https://www.linkedin.com/in/deepu-t-nair-8b315641/';
  const RESUME = 'assets/Deepu_Nair_Resume.docx';

  /* ---------------------------------------------------------
     Answer markup (author-written only, never user input):
       [label](href)   link
       **text**        bold
       lines starting with "• " are grouped into a list
     --------------------------------------------------------- */
  const CONTACT_LINE = `Reach Deepu at [${EMAIL}](mailto:${EMAIL}), [${PHONE}](tel:+16479946021) or on [LinkedIn](${LINKEDIN}).`;

  const INTENTS = [
    {
      id: 'greeting', weight: 0.5,
      keywords: ['hi', 'hello', 'hey', 'hola', 'yo', 'greetings', 'good morning', 'good afternoon', 'good evening'],
      answer: ["Hi! I can tell you about Deepu's experience, skills, certifications, education or how to get in touch. What would you like to know?"],
      chips: ['Experience', 'Skills', 'Certifications', 'Contact'],
    },
    {
      id: 'bot', weight: 1,
      keywords: ['who are you', 'what are you', 'are you a bot', 'are you real', 'are you human', 'bot', 'chatbot', 'assistant', 'ai assistant'],
      answer: ["I'm **Ask Deepu**, a small assistant built into this portfolio. I answer questions about Deepu's profile from what's on this page. For anything I can't answer, it's best to contact him directly."],
      chips: ['Who is Deepu?', 'Contact'],
    },
    {
      id: 'about', weight: 0.8,
      keywords: ['who', 'about', 'summary', 'introduce', 'introduction', 'tell me about', 'background', 'profile', 'overview', 'bio', 'deepu', 'himself', 'elevator pitch'],
      answer: [
        '**Deepu T Nair** is a Senior Software Engineer with **13 years** of experience designing, building and modernizing enterprise platforms in **.NET and Azure**.',
        'He specializes in turning legacy monoliths into microservice, event-driven and cloud-ready systems, and in building reusable CI/CD pipelines so releases stay reliable.',
        "He's based in **Halifax, Nova Scotia**, and has delivery experience in Canada and India.",
      ],
      chips: ['Experience', 'Skills', 'Is he open to work?'],
    },
    {
      id: 'current', weight: 1,
      keywords: ['current', 'currently', 'now', 'present', 'latest', 'right now', 'current role', 'current job', 'current company', 'where does he work', 'where is he working', 'today'],
      answer: [
        'Deepu is currently a **Senior Software Engineer at Cognizant Technology Solutions** in Nova Scotia, Canada (Apr 2022 to present). There he:',
        '• Designs reusable **Azure DevOps CI/CD pipelines** used across multiple applications',
        '• Builds **GitHub Actions** workflows for builds, code-quality gates and deployments',
        '• Created standardized **Azure repository templates** to speed up team onboarding',
        '• Automated deployments into **Azure Databricks** for reliable data processing',
        '• Refactors code for performance and drives **Agile Scrum** ceremonies',
      ],
      chips: ['Previous roles', 'Skills'],
    },
    {
      id: 'experience', weight: 1,
      keywords: ['experience', 'work history', 'career', 'job', 'jobs', 'worked', 'employer', 'employers', 'company', 'companies', 'roles', 'years', 'how long', 'how many years', 'previous', 'past', 'before', 'history', 'aibel', 'india', 'cognizant', 'timeline'],
      answer: [
        'Deepu has **13 years** of engineering experience across three roles:',
        '• **Senior Software Engineer, Cognizant (Nova Scotia, Canada)**, Apr 2022 to present: Azure DevOps and GitHub Actions pipelines, repository templates, Databricks deployments',
        '• **Senior Software Engineer, Cognizant (India)**, Sep 2016 to Apr 2022: modernized .NET monoliths into microservices and event-driven systems, and containerized apps with Docker on AKS',
        '• **Senior Software Engineer, Aibel Media and Advertising**, Apr 2013 to Aug 2016: led a team of 4 building a .NET/SQL Server web platform, shipped Android/iOS/Windows apps and tuned SQL performance',
        'See the full details in the [Experience](#experience) section.',
      ],
      chips: ['Current role', 'Key projects', 'Skills'],
    },
    {
      id: 'skills', weight: 1,
      keywords: ['skill', 'skills', 'stack', 'tech', 'tech stack', 'technology', 'technologies', 'tool', 'tools', 'toolkit', 'language', 'languages', 'framework', 'frameworks', 'expertise', 'strength', 'strengths', 'good at', 'proficient', 'specialize', 'specialty'],
      answer: [
        "Deepu's core stack is **.NET and Azure**:",
        '• **Backend & data:** C#, .NET / .NET Core, ASP.NET MVC, REST APIs, SQL Server / T-SQL, Entity Framework, LINQ, PostgreSQL',
        '• **Cloud & DevOps:** Azure DevOps CI/CD, GitHub Actions, Docker, Kubernetes (AKS), Azure Databricks, microservices and event-driven architecture',
        '• **Frontend:** JavaScript, HTML, CSS, jQuery, Vue, Node.js',
        '• **Practices:** Agile Scrum, unit testing, peer review, legacy modernization',
        'Try asking about a specific technology, for example "Does he know Kubernetes?"',
      ],
      chips: ['Does he know Docker?', 'Certifications', 'Key projects'],
    },
    {
      id: 'certs', weight: 1,
      keywords: ['certification', 'certifications', 'certified', 'certificate', 'certificates', 'cert', 'certs', 'credential', 'credentials', 'accreditation', 'badge', 'award', 'awards', 'hackathon'],
      answer: [
        'Deepu holds these certifications and recognitions:',
        '• **Claude Certified Architect — Foundations** (Anthropic)',
        '• **Microsoft Certified: Azure Developer**',
        '• **Cognizant Certified Full Stack Developer**',
        "• **Vibe Code Hackathon — Cognizant**: recognized for building with Windsurf at Cognizant's internal hackathon",
      ],
      chips: ['Education', 'Skills'],
    },
    {
      id: 'education', weight: 1,
      keywords: ['education', 'degree', 'degrees', 'study', 'studied', 'university', 'college', 'qualification', 'qualifications', 'mca', 'bsc', 'master', 'masters', 'bachelor', 'school', 'graduate', 'graduated', 'academic'],
      answer: [
        'Education:',
        '• **Master of Computer Applications (MCA)**, Kerala University, 2007 to 2010',
        '• **BSc Electronics**, Kerala University, 2004 to 2007',
      ],
      chips: ['Certifications', 'Experience'],
    },
    {
      id: 'projects', weight: 1,
      keywords: ['project', 'projects', 'impact', 'achievement', 'achievements', 'accomplishment', 'accomplishments', 'built', 'solved', 'portfolio', 'work samples', 'case study', 'highlights', 'proud'],
      answer: [
        'Four pieces of work that best show how Deepu engineers:',
        '• **Monolith to microservices:** broke enterprise .NET monoliths into services with asynchronous, event-driven messaging, so migration happened step by step instead of through a risky rewrite',
        '• **One pipeline, every team:** reusable Azure DevOps templates and GitHub Actions workflows, so new engineers onboard in hours',
        '• **Containers on AKS:** moved .NET apps built for a single IIS server onto Docker and Azure Kubernetes Service for scale and high availability',
        '• **Databricks, deployed automatically:** GitHub Actions deploying and running Azure Databricks jobs with no manual steps',
        'More in the [Impact](#work) section.',
      ],
      chips: ['Skills', 'Contact'],
    },
    {
      id: 'availability', weight: 1,
      keywords: ['available', 'availability', 'open to', 'open to work', 'hire', 'hiring', 'recruit', 'looking', 'job search', 'opportunity', 'opportunities', 'relocate', 'relocation', 'notice period', 'position', 'join', 'interview', 'freelance', 'contract'],
      answer: [
        "Yes, Deepu is **open to Senior and Lead engineering roles in Canada**. He's happy to talk architecture, modernization or delivery automation.",
        CONTACT_LINE,
      ],
      chips: ['Download résumé', 'Location'],
    },
    {
      id: 'location', weight: 1,
      keywords: ['where', 'location', 'located', 'based', 'live', 'lives', 'city', 'country', 'halifax', 'nova scotia', 'canada', 'remote', 'timezone', 'time zone'],
      answer: ['Deepu is based in **Halifax, Nova Scotia, Canada**, and has delivery experience in both Canada and India.'],
      chips: ['Is he open to work?', 'Contact'],
    },
    {
      id: 'contact', weight: 1,
      keywords: ['contact', 'email', 'e-mail', 'mail', 'phone', 'call', 'number', 'reach', 'linkedin', 'connect', 'message', 'get in touch', 'touch', 'talk'],
      answer: [CONTACT_LINE, `You can also [download his résumé](${RESUME}).`],
      chips: ['Is he open to work?'],
    },
    {
      id: 'resume', weight: 1.2,
      keywords: ['resume', 'résumé', 'cv', 'download', 'curriculum vitae'],
      answer: [`You can [download Deepu's résumé (.docx)](${RESUME}). References are available on request.`],
      chips: ['Contact'],
    },
    {
      id: 'leadership', weight: 1,
      keywords: ['lead', 'leader', 'leadership', 'team', 'manage', 'managed', 'management', 'mentor', 'mentoring', 'led', 'team size'],
      answer: [
        'Deepu led a **team of 4 developers** at Aibel Media, delivering a full web platform end to end. At Cognizant he drives Agile Scrum ceremonies and works closely with QA, DevOps and product owners.',
        "He's now looking for **Senior or Lead** engineering roles.",
      ],
      chips: ['How does he work?', 'Experience'],
    },
    {
      id: 'workstyle', weight: 1,
      keywords: ['agile', 'scrum', 'methodology', 'process', 'sprint', 'ceremonies', 'testing', 'unit test', 'code review', 'review', 'how does he work', 'work style', 'approach', 'philosophy', 'values'],
      answer: [
        'Deepu works best in **Agile Scrum** teams where design is discussed openly and code is reviewed honestly. He practices unit testing, peer review and test planning with QA.',
        'His motto: *"Ship it reliably, keep it readable, and leave the codebase easier than you found it."*',
      ],
      chips: ['Key projects', 'Skills'],
    },
    {
      id: 'thanks', weight: 0.5,
      keywords: ['thanks', 'thank you', 'thank', 'thx', 'cheers', 'great', 'awesome', 'cool', 'nice', 'bye', 'goodbye', 'ok', 'okay'],
      answer: ["You're welcome! Anything else you'd like to know about Deepu?"],
      chips: ['Contact', 'Skills'],
    },
  ];

  /* Technologies he has: aliases → answer */
  const TECH = [
    { name: 'C# / .NET', aliases: ['c#', 'csharp', 'c sharp', '.net', 'dotnet', 'dot net', '.net core', 'net core', 'asp.net', 'asp.net core', 'mvc', 'rest api', 'rest apis', 'web api'],
      text: '**Yes.** C# and .NET / .NET Core are his core stack, used for 13 years, including ASP.NET MVC, ASP.NET Core and REST APIs.' },
    { name: 'SQL', aliases: ['sql', 'sql server', 't-sql', 'tsql', 'stored procedure', 'stored procedures', 'database', 'databases', 'query tuning', 'mssql'],
      text: '**Yes.** SQL Server / T-SQL is one of his strongest areas: complex stored procedures, query plans, indexing and performance tuning.' },
    { name: 'Entity Framework', aliases: ['entity framework', 'ef', 'ef core', 'linq', 'ado.net', 'orm'],
      text: '**Yes.** Entity Framework, LINQ and ADO.NET are part of his everyday .NET work.' },
    { name: 'PostgreSQL', aliases: ['postgresql', 'postgres'],
      text: '**Yes.** He works with PostgreSQL, alongside SQL Server.' },
    { name: 'Azure', aliases: ['azure', 'microsoft azure', 'cloud'],
      text: "**Yes.** Azure is central to his work: Azure DevOps, AKS and Azure Databricks. He's also a **Microsoft Certified: Azure Developer**." },
    { name: 'CI/CD', aliases: ['azure devops', 'ci/cd', 'cicd', 'ci cd', 'pipeline', 'pipelines', 'devops', 'continuous integration', 'continuous delivery', 'continuous deployment'],
      text: '**Yes.** He designs reusable Azure DevOps CI/CD pipelines and repository templates that standardize build, test and deployment across teams.' },
    { name: 'GitHub Actions', aliases: ['github actions', 'github', 'gh actions', 'actions'],
      text: '**Yes.** He builds and maintains GitHub Actions workflows for builds, code-quality gates and deployments, including into Azure Databricks.' },
    { name: 'Docker', aliases: ['docker', 'container', 'containers', 'containerization', 'containerize'],
      text: '**Yes.** He has containerized .NET applications with Docker to make them portable and scalable.' },
    { name: 'Kubernetes', aliases: ['kubernetes', 'k8s', 'aks', 'azure kubernetes service'],
      text: '**Yes.** He has orchestrated containerized .NET workloads on **Azure Kubernetes Service (AKS)** for high availability.' },
    { name: 'Databricks', aliases: ['databricks', 'azure databricks', 'spark'],
      text: '**Yes.** He automated deployment pipelines into Azure Databricks so data jobs deploy and run without manual steps.' },
    { name: 'Microservices', aliases: ['microservice', 'microservices', 'event-driven', 'event driven', 'asynchronous', 'async', 'distributed', 'messaging', 'architecture', 'system design'],
      text: '**Yes.** A specialty of his: breaking .NET monoliths into microservices with asynchronous, event-driven messaging.' },
    { name: 'JavaScript', aliases: ['javascript', 'js', 'html', 'css', 'frontend', 'front end', 'front-end'],
      text: '**Yes.** He works with JavaScript, HTML and CSS, plus jQuery and Vue on the frontend.' },
    { name: 'Vue', aliases: ['vue', 'vue.js', 'vuejs'],
      text: '**Yes.** Vue is part of his frontend toolkit.' },
    { name: 'jQuery', aliases: ['jquery'],
      text: '**Yes.** He has worked extensively with jQuery.' },
    { name: 'Node.js', aliases: ['node', 'node.js', 'nodejs'],
      text: '**Yes.** He has worked with Node.js.' },
    { name: 'Angular', aliases: ['angular', 'angularjs'],
      text: 'He has supported delivery on Angular projects, mainly legacy ones, alongside .NET and Entity Framework.' },
    { name: 'Mobile', aliases: ['mobile', 'android', 'ios', 'windows phone', 'mobile app', 'mobile apps'],
      text: '**Yes.** At Aibel Media he designed and shipped mobile apps for Android, iOS and Windows from scratch.' },
    { name: 'Tools', aliases: ['git', 'visual studio', 'iis', 'liquibase'],
      text: '**Yes.** His day-to-day tools include Git, Visual Studio, IIS and Liquibase.' },
    { name: 'AI', aliases: ['claude', 'anthropic', 'ai', 'genai', 'gen ai', 'llm', 'llms', 'prompt', 'prompt engineering', 'windsurf', 'artificial intelligence'],
      text: "**Yes.** He's a **Claude Certified Architect — Foundations**, practices prompt engineering, and was recognized at Cognizant's Vibe Code Hackathon for building with Windsurf." },
  ];

  /* Commonly asked technologies that aren't on the profile */
  const NOT_LISTED = {
    'python': 'Python', 'java': 'Java', 'react': 'React', 'react.js': 'React', 'reactjs': 'React',
    'aws': 'AWS', 'amazon web services': 'AWS', 'gcp': 'Google Cloud', 'google cloud': 'Google Cloud',
    'golang': 'Go', 'php': 'PHP', 'ruby': 'Ruby', 'rust': 'Rust', 'swift': 'Swift', 'kotlin': 'Kotlin',
    'typescript': 'TypeScript', 'mongodb': 'MongoDB', 'mongo': 'MongoDB', 'terraform': 'Terraform',
    'spring': 'Spring', 'django': 'Django', 'flutter': 'Flutter', 'scala': 'Scala', 'c++': 'C++',
    'next.js': 'Next.js', 'nextjs': 'Next.js', 'mysql': 'MySQL', 'oracle': 'Oracle',
    'salesforce': 'Salesforce', 'sap': 'SAP',
  };

  const FALLBACK = [
    "I'm not sure about that one. I can answer questions about Deepu's experience, skills, certifications, education, projects and availability.",
    `For anything else, contact him directly at [${EMAIL}](mailto:${EMAIL}).`,
  ];
  const FALLBACK_CHIPS = ['Experience', 'Skills', 'Certifications', 'Contact'];

  /* ---------------------------------------------------------
     Matching
     --------------------------------------------------------- */
  const KNOW_PATTERN = /\b(know|knows|knowledge|experience|experienced|familiar|use|used|uses|using|work(ed|s)? (with|on|in)|skill|skills|skilled|proficient|good (at|with)|done|worked|expert|exposure)\b/;

  function normalize(str) {
    return (' ' + str.toLowerCase()
      .replace(/[’']/g, '')
      .replace(/[^\p{L}\p{N}#+./\-]+/gu, ' ')
      .split(' ')
      .map((t) => t.replace(/[.\-/]+$/, ''))
      .filter(Boolean)
      .join(' ') + ' ');
  }
  const stem = (w) => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);
  const stemText = (padded) => ' ' + padded.trim().split(' ').map(stem).join(' ') + ' ';
  const has = (padded, phrase) => padded.includes(' ' + phrase + ' ');

  // pre-stem intent keywords once
  INTENTS.forEach((it) => {
    it._kw = it.keywords.map((k) => {
      const n = normalize(k).trim();
      return { phrase: stemText(' ' + n + ' ').trim(), multi: n.includes(' ') };
    });
  });

  function findTech(padded) {
    const known = TECH.filter((t) => t.aliases.some((a) => has(padded, normalize(a).trim())));
    const missing = [...new Set(Object.keys(NOT_LISTED)
      .filter((a) => has(padded, normalize(a).trim()))
      .map((a) => NOT_LISTED[a]))];
    return { known, missing };
  }

  function techAnswer({ known, missing }) {
    const lines = known.map((t) => (known.length > 1 ? `• **${t.name}:** ` + t.text.replace(/^\*\*Yes\.\*\*\s*/, '') : t.text));
    if (missing.length) {
      const names = missing.join(', ');
      lines.push(`${names} ${missing.length > 1 ? "aren't" : "isn't"} listed on Deepu's profile. His core strengths are .NET, Azure and SQL Server. To ask about specific experience, email him at [${EMAIL}](mailto:${EMAIL}).`);
    }
    return { answer: lines, chips: ['Skills', 'Key projects', 'Contact'] };
  }

  function respond(input) {
    const padded = normalize(input);
    if (!padded.trim()) return null;
    const stemmed = stemText(padded);

    let best = null, bestScore = 0;
    INTENTS.forEach((it) => {
      let score = 0;
      it._kw.forEach((k) => { if (has(stemmed, k.phrase)) score += k.multi ? 2 : 1; });
      score *= it.weight;
      if (score > bestScore) { bestScore = score; best = it; }
    });

    const tech = findTech(padded);
    const techHit = tech.known.length || tech.missing.length;

    // "does he know X?" / "X?" goes to the tech lookup; "Azure certification" stays with its intent
    if (techHit && (KNOW_PATTERN.test(padded) || bestScore < 1 || tech.missing.length)) {
      return techAnswer(tech);
    }
    if (best && bestScore >= 0.5) return best;
    if (techHit) return techAnswer(tech);
    return { answer: FALLBACK, chips: FALLBACK_CHIPS };
  }

  /* ---------------------------------------------------------
     Rendering
     --------------------------------------------------------- */
  function renderInline(parent, text) {
    const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
    let last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) parent.appendChild(document.createTextNode(text.slice(last, m.index)));
      if (m[1]) {
        const a = document.createElement('a');
        a.textContent = m[1];
        a.href = m[2];
        if (/^https?:/.test(m[2])) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
        if (m[2].endsWith('.docx')) a.setAttribute('download', '');
        parent.appendChild(a);
      } else if (m[3]) {
        const b = document.createElement('strong'); b.textContent = m[3]; parent.appendChild(b);
      } else {
        const i = document.createElement('em'); i.textContent = m[4]; parent.appendChild(i);
      }
      last = re.lastIndex;
    }
    if (last < text.length) parent.appendChild(document.createTextNode(text.slice(last)));
  }

  function renderAnswer(lines) {
    const frag = document.createDocumentFragment();
    let list = null;
    lines.forEach((line) => {
      if (line.startsWith('• ')) {
        if (!list) { list = document.createElement('ul'); frag.appendChild(list); }
        const li = document.createElement('li');
        renderInline(li, line.slice(2));
        list.appendChild(li);
      } else {
        list = null;
        const p = document.createElement('p');
        renderInline(p, line);
        frag.appendChild(p);
      }
    });
    return frag;
  }

  /* ---------------------------------------------------------
     Widget
     --------------------------------------------------------- */
  function init() {
    const launcher = document.getElementById('chatLauncher');
    const panel = document.getElementById('chatPanel');
    const log = document.getElementById('chatLog');
    const chipsEl = document.getElementById('chatChips');
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatInput');
    const closeBtn = document.getElementById('chatClose');
    if (!launcher || !panel || !log || !form || !input) return;

    let greeted = false;
    let busy = false;

    function addMessage(who, content) {
      const msg = document.createElement('div');
      msg.className = 'chat__msg chat__msg--' + who;
      if (typeof content === 'string') msg.textContent = content;
      else msg.appendChild(content);
      log.appendChild(msg);
      log.scrollTop = log.scrollHeight;
      return msg;
    }

    function setChips(labels) {
      chipsEl.textContent = '';
      (labels || []).forEach((label) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'chat__chip';
        b.textContent = label;
        b.addEventListener('click', () => ask(label));
        chipsEl.appendChild(b);
      });
    }

    function reply(result) {
      addMessage('bot', renderAnswer(result.answer));
      setChips(result.chips);
    }

    function ask(text) {
      const q = text.trim();
      if (!q || busy) return;
      addMessage('user', q);
      setChips([]);
      const result = respond(q) || { answer: FALLBACK, chips: FALLBACK_CHIPS };
      if (REDUCED) { reply(result); return; }
      busy = true;
      const typing = addMessage('bot', document.createDocumentFragment());
      typing.classList.add('chat__msg--typing');
      typing.setAttribute('aria-label', 'Ask Deepu is typing');
      typing.innerHTML = '<span></span><span></span><span></span>';
      setTimeout(() => {
        typing.remove();
        reply(result);
        busy = false;
      }, 450 + Math.min(q.length * 8, 350));
    }

    function open() {
      panel.classList.add('is-open');
      panel.removeAttribute('inert');
      panel.setAttribute('aria-hidden', 'false');
      launcher.setAttribute('aria-expanded', 'true');
      launcher.classList.add('is-hidden');
      if (!greeted) {
        greeted = true;
        reply({
          answer: ["Hi, I'm **Ask Deepu**. Ask me anything about Deepu's experience, skills, certifications or how to reach him."],
          chips: ['Who is Deepu?', 'Experience', 'Skills', 'Certifications', 'Contact'],
        });
      }
      setTimeout(() => input.focus(), REDUCED ? 0 : 200);
    }

    function close(returnFocus) {
      panel.classList.remove('is-open');
      panel.setAttribute('inert', '');
      panel.setAttribute('aria-hidden', 'true');
      launcher.setAttribute('aria-expanded', 'false');
      launcher.classList.remove('is-hidden');
      if (returnFocus) launcher.focus();
    }

    launcher.addEventListener('click', open);
    closeBtn?.addEventListener('click', () => close(true));
    panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(true); } });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value;
      input.value = '';
      ask(q);
    });
    // in-page links inside answers: close on mobile so the section is visible
    log.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (a && window.matchMedia('(max-width: 600px)').matches) close(false);
    });
  }

  // expose matcher for quick console testing: AskDeepu.respond('does he know docker')
  window.AskDeepu = { respond };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

