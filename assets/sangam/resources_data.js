/* Sangam DLC - Resources v2.x shared data.
   Categories mirror sangamdlc.org/resources. Artifact titles/descriptions are SAMPLE content
   for the design prototype; replace with real records (same shape) when wiring to a CMS. */
(function () {
  // Order = the educator journey: Get started -> Plan -> Prepare -> Teach -> Reflect.
  const CATS = [
    { id: 'swayam', verb: 'Get started', name: 'Swayam Onboarding', short: 'Swayam Onboarding', icon: 'compass', desc: 'Join and engage with the Sangam community to enhance your learning journey.' },
    { id: 'curriculum', verb: 'Plan', name: 'Curriculum Design', short: 'Curriculum Design', icon: 'layout', desc: 'Innovative approaches to planning and designing curriculum for modern classrooms.' },
    { id: 'prompts', verb: 'Prepare', name: 'Prompting Tips', short: 'Prompting Tips', icon: 'spark', desc: 'Ready-to-use prompt templates designed for educators.' },
    { id: 'tips', verb: 'Teach', name: 'Teaching Tips on Tap', short: 'Tips on Tap', icon: 'mic', desc: 'Listen to teaching tips from IIMB faculty to enhance your classroom practice.' },
    { id: 'insights', verb: 'Reflect', name: 'Faculty Insights', short: 'Faculty Insights', icon: 'bulb', desc: 'Insights and experiences shared by educators in digital learning.' }
  ];
  const FORMATS = { Audio: 'headphones', Video: 'play', Article: 'doc', Guide: 'book', Template: 'layers', 'Prompt Pack': 'spark', Checklist: 'checklist' };
  const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

  // [title, description, format, level, length, tags, prompt?]
  const RAW = {
    tips: [
      ['Open a Class With a Question, Not a Slide', 'A three-minute habit that gets students thinking before you say a word.', 'Audio', 'Beginner', '4 min', 'engagement,openings'],
      ['The 90-Second Recap That Sticks', 'A quick retrieval routine that helps yesterday\u2019s lesson survive until tomorrow.', 'Audio', 'Beginner', '5 min', 'recap,retrieval'],
      ['Cold-Calling Without the Fear', 'Warm, low-stakes ways to hear from every student, not just the confident few.', 'Audio', 'Beginner', '6 min', 'participation,discussion'],
      ['Why Silence Is a Teaching Tool', 'How a deliberate pause after a question changes the quality of every answer.', 'Audio', 'Beginner', '4 min', 'questioning,pacing'],
      ['Feedback in Under Two Minutes', 'A compact structure for useful comments when you have forty scripts to return.', 'Audio', 'Intermediate', '5 min', 'feedback,assessment'],
      ['Handling the Dominant Voice', 'Keep discussion open when one student keeps answering for everyone.', 'Audio', 'Intermediate', '7 min', 'discussion,facilitation'],
      ['Think-Pair-Share for Large Classes', 'Run active learning with 80 students and no extra equipment.', 'Audio', 'Beginner', '6 min', 'active learning,large class'],
      ['Using Polls to Read the Room', 'Three poll patterns that tell you what to re-teach before moving on.', 'Audio', 'Beginner', '5 min', 'polling,formative'],
      ['Make Your Whiteboard Work Harder', 'Layout, colour and sequencing habits for a board students can follow and copy.', 'Video', 'Beginner', '8 min', 'board,visuals'],
      ['Teaching With Cases: Setting the Stage', 'The first ten minutes decide the whole case discussion. Here is how to use them.', 'Audio', 'Intermediate', '9 min', 'case method,facilitation'],
      ['Ending Class With Purpose', 'Close the loop with a one-minute exit routine students actually remember.', 'Audio', 'Beginner', '4 min', 'closing,reflection'],
      ['Cameras On or Off? Hybrid Etiquette', 'Set clear, fair norms for mixed in-room and online classes.', 'Audio', 'Intermediate', '6 min', 'hybrid,norms'],
      ['Voice and Pacing for Recorded Lectures', 'Small delivery changes that make a recording feel like a conversation.', 'Video', 'Intermediate', '10 min', 'recording,delivery'],
      ['Chunking a 90-Minute Session', 'Break a long class into segments that keep attention without feeling rushed.', 'Audio', 'Intermediate', '7 min', 'planning,attention'],
      ['Small Nudges That Raise Attendance', 'Low-effort messages and routines that bring students back to class.', 'Audio', 'Beginner', '5 min', 'attendance,motivation'],
      ['Teaching Across Mixed Ability Levels', 'Stretch the strongest and support the strugglers in the same session.', 'Audio', 'Advanced', '8 min', 'inclusion,differentiation'],
      ['When Discussion Runs Over', 'Protect your learning goals without cutting students off.', 'Audio', 'Intermediate', '5 min', 'time,facilitation'],
      ['Quick Formative Checks Mid-Lecture', 'A one-page checklist of 10-second checks you can drop into any lecture.', 'Checklist', 'Beginner', '1 page', 'formative,checks'],
      ['Saying \u201CI Don\u2019t Know\u201D Well', 'Turn a tough question you cannot answer into a moment of credibility.', 'Audio', 'Intermediate', '5 min', 'credibility,questioning'],
      ['Classroom Energy After Lunch', 'Reset a sleepy room with three movements that take under a minute each.', 'Audio', 'Beginner', '4 min', 'energy,engagement']
    ],
    insights: [
      ['What Changed When I Flipped My Statistics Course', 'A faculty member\u2019s honest account of what worked, what flopped and what they would redo.', 'Article', 'Intermediate', '8 min read', 'flipped classroom,statistics'],
      ['Lessons From Teaching 1,000 Learners Online', 'What scale does to feedback, community and the way you plan a course.', 'Article', 'Intermediate', '9 min read', 'scale,online'],
      ['Designing Assessments in the Age of AI', 'Practical redesigns that keep assessment meaningful when answers are one prompt away.', 'Article', 'Advanced', '12 min read', 'AI,assessment'],
      ['From Lecture Hall to Studio', 'A faculty journey into recording, and the habits that made it easier.', 'Video', 'Beginner', '14 min', 'studio,recording'],
      ['Why Students Disengage Online', 'Patterns educators noticed across cohorts, and the small changes that helped.', 'Article', 'Intermediate', '7 min read', 'engagement,online'],
      ['Peer Learning in Executive Programmes', 'How structured peer exchange adds value that no lecture can match.', 'Article', 'Advanced', '10 min read', 'peer learning,executive education'],
      ['Using the Case Method in Digital Classrooms', 'A recorded conversation on adapting cold calls and board work for screens.', 'Video', 'Intermediate', '16 min', 'case method,digital'],
      ['The Real Cost of Going Digital', 'An educator\u2019s accounting of time, tools and energy, beyond the licence fee.', 'Article', 'Intermediate', '9 min read', 'planning,workload'],
      ['Building Community in an Asynchronous Course', 'Rituals and prompts that help strangers feel like a cohort.', 'Article', 'Intermediate', '8 min read', 'community,asynchronous'],
      ['Educators on Academic Integrity', 'A candid panel on honour, shortcuts and redesigning for trust.', 'Video', 'Advanced', '18 min', 'integrity,panel'],
      ['What Early-Career Faculty Wish They Knew', 'Short reflections on first-year teaching, from people who remember it clearly.', 'Article', 'Beginner', '6 min read', 'early career,reflection'],
      ['Teaching Large Cohorts With Teaching Assistants', 'A working guide to briefing, calibrating and trusting your TAs.', 'Guide', 'Intermediate', '11 pages', 'teaching assistants,large class'],
      ['What Learners Told Us', 'Student voices on what helped, what frustrated and what they wish had been different.', 'Article', 'Beginner', '7 min read', 'student voice,feedback'],
      ['Making Simulations Work in Management Education', 'Hard-won lessons on timing, debriefs and keeping the model from taking over.', 'Article', 'Advanced', '11 min read', 'simulation,management'],
      ['Accessibility Lessons From the Classroom', 'Changes that helped one learner and ended up helping all of them.', 'Article', 'Intermediate', '8 min read', 'accessibility,inclusion'],
      ['Short Videos vs Long Lectures', 'What educators observed after trying both with the same material.', 'Article', 'Intermediate', '9 min read', 'video,design'],
      ['Mentoring Doctoral Students Online', 'A supervisor\u2019s routines for regular contact without constant meetings.', 'Video', 'Advanced', '15 min', 'doctoral,mentoring'],
      ['Reflection Journals Students Actually Write', 'Prompts and grading choices that turn journals from chore to habit.', 'Article', 'Beginner', '6 min read', 'reflection,assessment'],
      ['A Decade of Technology in Teaching', 'A panel looks back at what stuck, what vanished and what surprised them.', 'Video', 'Intermediate', '32 min', 'panel,technology'],
      ['When a Tool Fails Mid-Class', 'Recovery stories and the fallback plans educators now keep ready.', 'Article', 'Beginner', '5 min read', 'resilience,planning']
    ],
    prompts: [
      ['Generate a Socratic Question Ladder', 'Turn any topic into a sequence of questions that builds from recall to evaluation.', 'Template', 'Beginner', '1 prompt', 'questioning,socratic', 'Act as a Socratic tutor for [subject]. Write 8 questions on [topic] that move from recall to application to evaluation. Do not give the answers.'],
      ['Draft Learning Outcomes in Bloom\u2019s Language', 'Convert a topic list into measurable outcomes with the right action verbs.', 'Template', 'Beginner', '1 prompt', 'outcomes,bloom', 'I teach [course] to [audience]. Turn these topics into 6 measurable learning outcomes using Bloom\u2019s taxonomy verbs: [topics]. Label each with its Bloom level.'],
      ['Build a Quiz With Distractors That Teach', 'Questions whose wrong answers expose the exact misconception behind them.', 'Prompt Pack', 'Intermediate', '6 prompts', 'quiz,misconceptions', 'Write 5 multiple-choice questions on [topic]. For each wrong option, name the misconception it represents. Keep the stem under 25 words.'],
      ['Turn a Case Into Discussion Questions', 'Get a layered question set, from facts to judgement calls, for any case.', 'Template', 'Intermediate', '1 prompt', 'case method,discussion', 'Read the case below. Write 3 opening questions, 3 probing follow-ups and 2 questions that force a trade-off decision. Case: [paste case]'],
      ['Rewrite Feedback to Be Specific and Kind', 'Take a blunt comment and return a version a student can act on.', 'Template', 'Beginner', '1 prompt', 'feedback,tone', 'Rewrite this feedback so it is specific, kind and actionable. Keep my meaning. End with one concrete next step. Feedback: [paste feedback]'],
      ['Create a Rubric From Learning Outcomes', 'A four-level rubric draft you can refine, aligned to your outcomes.', 'Template', 'Intermediate', '1 prompt', 'rubric,assessment', 'Create a 4-level analytic rubric for [assignment] aligned to these outcomes: [outcomes]. Use observable descriptors and avoid vague words like \u201Cgood\u201D.'],
      ['Summarise a Reading for Busy Students', 'A one-page brief with the argument, evidence and three discussion hooks.', 'Template', 'Beginner', '1 prompt', 'reading,summary', 'Summarise the text below in 150 words for busy postgraduate students. Then list its core argument, two pieces of evidence and three discussion hooks. Text: [paste text]'],
      ['Role-Play a Sceptical Stakeholder', 'Rehearse tough questions from a board member, regulator or customer.', 'Prompt Pack', 'Advanced', '5 prompts', 'role play,simulation', 'Role-play a sceptical [role] reviewing this proposal: [summary]. Ask one hard question at a time and wait for my reply. After 5 rounds, give me feedback.'],
      ['Generate Worked Examples at Three Levels', 'The same problem, worked at beginner, intermediate and advanced depth.', 'Template', 'Intermediate', '1 prompt', 'worked examples,differentiation', 'Create a worked example of [concept] at three levels: beginner, intermediate and advanced. Show each step and explain why it is taken.'],
      ['Plan a 60-Minute Active-Learning Session', 'A timed session plan with activities, checks and a closing task.', 'Template', 'Beginner', '1 prompt', 'planning,active learning', 'Plan a 60-minute session on [topic] for [class size] students. Include a timed agenda, two active-learning tasks, one check for understanding and a closing task.'],
      ['Check Your Slides for Jargon and Gaps', 'A second pair of eyes on clarity before you present.', 'Template', 'Beginner', '1 prompt', 'slides,clarity', 'Review this slide text for jargon, missing definitions and logical gaps. Give a list of fixes in priority order. Slides: [paste text]'],
      ['Create Analogies for Hard Concepts', 'Everyday comparisons that make abstract ideas easy to picture.', 'Template', 'Beginner', '1 prompt', 'analogy,explanation', 'Give 3 everyday analogies for [concept] suited to [audience]. For each, say where the analogy breaks down so I can warn students.'],
      ['Design a Pre-Class Warm-Up Activity', 'A ten-minute task that primes students for what you teach next.', 'Template', 'Beginner', '1 prompt', 'flipped,warm-up', 'Design a 10-minute pre-class activity that primes students for [topic]. It should need no prior reading and end with one question to bring to class.'],
      ['Spot Misconceptions Before the Exam', 'Predict common errors and build quick checks around each.', 'Prompt Pack', 'Intermediate', '4 prompts', 'misconceptions,revision', 'List the 6 most common misconceptions students hold about [topic]. For each, write a 2-minute activity that surfaces and corrects it.'],
      ['Translate Material for Mixed-Language Classes', 'Plain-language versions and glossaries without losing meaning.', 'Template', 'Intermediate', '1 prompt', 'language,inclusion', 'Rewrite the passage below in plain English at CEFR B1 level and add a glossary of 8 key terms. Keep technical terms intact. Passage: [paste text]'],
      ['Write Clear Assignment Briefs', 'Briefs that state purpose, task, criteria and format in one page.', 'Template', 'Beginner', '1 prompt', 'assignment,clarity', 'Write a one-page assignment brief for [task] with purpose, steps, assessment criteria, word limit and submission format. Use plain, direct language.'],
      ['Simulate Student Questions for Lecture Prep', 'Anticipate what students will ask, before they ask it.', 'Template', 'Intermediate', '1 prompt', 'preparation,questions', 'You are a curious student seeing [topic] for the first time. Ask me the 10 questions you would raise after my lecture, from naive to sharp.'],
      ['Prompt Hygiene: Privacy and Safe Use', 'A one-page checklist for what never to paste into an AI tool.', 'Checklist', 'Beginner', '1 page', 'privacy,safety'],
      ['Chain Prompts for Course Design', 'Eight linked prompts that take you from audience to full module outline.', 'Prompt Pack', 'Advanced', '8 prompts', 'course design,workflow', 'Step 1: Ask me five questions about my audience and goals. Wait for answers. Step 2: Propose three course outcomes. Step 3: Draft a module outline. Continue only after I approve each step.'],
      ['Evaluate AI Output: A Fact-Check Prompt Set', 'Prompts that make a model show its sources and flag its own uncertainty.', 'Prompt Pack', 'Intermediate', '5 prompts', 'verification,AI literacy', 'For each claim in your last answer, say how confident you are, what evidence would confirm it, and whether it could be a fabrication. Mark anything I should verify.']
    ],
    curriculum: [
      ['Backward Design Planning Canvas', 'Start from what learners should be able to do, then work back to activities.', 'Template', 'Intermediate', '2 pages', 'backward design,planning'],
      ['Course Map: Outcomes to Assessments', 'A single grid that shows every outcome and where it is taught and assessed.', 'Template', 'Intermediate', '1 page', 'alignment,mapping'],
      ['A Beginner\u2019s Guide to Learning Outcomes', 'Write outcomes that are clear, measurable and worth assessing.', 'Guide', 'Beginner', '12 pages', 'outcomes,basics'],
      ['Weekly Pacing Template for a 12-Week Course', 'Plan load, milestones and breathing room across a full term.', 'Template', 'Beginner', '2 pages', 'pacing,planning'],
      ['Blended Learning Design Checklist', 'Check what belongs online, what belongs in the room, and why.', 'Checklist', 'Beginner', '1 page', 'blended,design'],
      ['Aligning Assessments With Outcomes', 'A step-by-step guide to catching assessments that test the wrong thing.', 'Guide', 'Intermediate', '14 pages', 'assessment,alignment'],
      ['Designing a Capstone Project', 'Scope, milestones, support and grading for a project that holds together.', 'Guide', 'Advanced', '18 pages', 'capstone,projects'],
      ['Plain-Language Syllabus Template', 'A syllabus students will actually read, with the essentials up front.', 'Template', 'Beginner', '3 pages', 'syllabus,clarity'],
      ['Choosing Between Sync and Async Activities', 'A decision guide for what to run live and what to leave self-paced.', 'Guide', 'Intermediate', '9 pages', 'synchronous,asynchronous'],
      ['Rubric Library for Common Assignments', 'Starter rubrics for essays, presentations, projects and reflections.', 'Template', 'Intermediate', '8 rubrics', 'rubric,assessment'],
      ['Workload Estimator for Online Courses', 'Estimate weekly student hours from reading, video and task counts.', 'Template', 'Intermediate', '1 sheet', 'workload,planning'],
      ['Designing Group Work That Is Fair', 'Team formation, roles and grading that reduce free-riding.', 'Guide', 'Intermediate', '10 pages', 'group work,fairness'],
      ['Micro-Credential Course Blueprint', 'Structure a short, stackable course with clear evidence of skill.', 'Guide', 'Advanced', '16 pages', 'micro-credential,design'],
      ['Accessible Course Design Checklist', 'Quick checks for captions, contrast, structure and alternatives.', 'Checklist', 'Beginner', '1 page', 'accessibility,design'],
      ['Module Template: Intro, Activity, Check', 'A repeatable module layout that keeps courses consistent.', 'Template', 'Beginner', '2 pages', 'module,structure'],
      ['Planning Assessment for Large Classes', 'Keep rigour and feedback when marking time is limited.', 'Guide', 'Intermediate', '11 pages', 'assessment,large class'],
      ['Curriculum Review Checklist for Programme Heads', 'Questions to ask when reviewing a programme for coherence and currency.', 'Checklist', 'Advanced', '2 pages', 'programme review,quality'],
      ['Bringing Industry Cases Into a Course', 'Find, adapt and teach with live examples without losing the thread.', 'Guide', 'Intermediate', '10 pages', 'cases,industry'],
      ['Designing for Self-Paced Learners', 'Structure, nudges and checkpoints that help people finish alone.', 'Guide', 'Intermediate', '12 pages', 'self-paced,design'],
      ['From Outline to Online: A 4-Week Build Plan', 'A realistic schedule to take a course from outline to first launch.', 'Guide', 'Beginner', '8 pages', 'build plan,online']
    ],
    swayam: [
      ['Welcome to Sangam: A Two-Minute Tour', 'What the community offers and how to find your way around.', 'Video', 'Beginner', '2 min', 'welcome,tour'],
      ['Create Your Swayam Instructor Account', 'Registration, verification and your first sign-in, step by step.', 'Guide', 'Beginner', '5 pages', 'account,setup'],
      ['Your First Course Shell on Swayam', 'Create the course page, add sections and set the basics.', 'Video', 'Beginner', '9 min', 'course setup,walkthrough'],
      ['Onboarding Checklist for New Instructors', 'Everything to complete before you invite your first learner.', 'Checklist', 'Beginner', '1 page', 'checklist,instructors'],
      ['How Swayam Course Review Works', 'What reviewers look for and how to prepare a smooth submission.', 'Guide', 'Beginner', '6 pages', 'review,submission'],
      ['Uploading Videos: Formats and Limits', 'File types, sizes and naming that avoid upload problems.', 'Guide', 'Beginner', '4 pages', 'video,upload'],
      ['Setting Up Quizzes and Assignments', 'Build graded activities and set deadlines, attempts and feedback.', 'Video', 'Intermediate', '11 min', 'quizzes,assessment'],
      ['Discussion Forums: Setup and Moderation', 'Open a forum, set the tone and keep conversations constructive.', 'Guide', 'Intermediate', '7 pages', 'forum,moderation'],
      ['Understanding Enrolment and Learner Data', 'Read enrolment numbers and what they can and cannot tell you.', 'Guide', 'Intermediate', '6 pages', 'enrolment,data'],
      ['How Certificates Are Issued', 'Eligibility rules, timing and what to do when a learner is missing one.', 'Guide', 'Beginner', '4 pages', 'certificates,completion'],
      ['Joining the Sangam Community Calls', 'How the calls work, what to bring and how to ask for help.', 'Video', 'Beginner', '3 min', 'community,events'],
      ['Writing a Clear Course Description', 'A fill-in template for a description learners can decide from.', 'Template', 'Beginner', '1 page', 'description,template'],
      ['Preparing Your Course Trailer', 'A short guide to scripting and recording a trailer in one afternoon.', 'Guide', 'Beginner', '5 pages', 'trailer,video'],
      ['Accessibility Requirements on Swayam', 'The checks every course should pass before it goes live.', 'Checklist', 'Intermediate', '2 pages', 'accessibility,compliance'],
      ['Getting Help: Support and Escalations', 'Who to contact, what to include and how long to expect to wait.', 'Guide', 'Beginner', '3 pages', 'support,help'],
      ['Moving an Existing Course to Swayam', 'Audit what you have, adapt it and avoid common migration mistakes.', 'Guide', 'Intermediate', '9 pages', 'migration,planning'],
      ['Course Launch Day Checklist', 'A calm, ordered list for the day your course opens.', 'Checklist', 'Beginner', '1 page', 'launch,checklist'],
      ['Reading Your Course Analytics', 'Which numbers matter in week one, week four and at the end.', 'Video', 'Intermediate', '8 min', 'analytics,improvement'],
      ['Co-Teaching on Swayam: Roles and Access', 'Share a course safely with co-instructors and teaching assistants.', 'Guide', 'Intermediate', '5 pages', 'co-teaching,permissions'],
      ['FAQ for First-Time Instructors', 'Short answers to the questions new instructors ask most.', 'Article', 'Beginner', '6 min read', 'faq,instructors']
    ]
  };

  // Interleave categories so the default "Featured" order mixes all five.
  const BASE = Date.UTC(2026, 9, 13);
  const ITEMS = [];
  for (let pos = 0; pos < 20; pos++) {
    CATS.forEach((c, ci) => {
      const r = RAW[c.id][pos], k = ITEMS.length;
      const daysAgo = ((k * 37) % 100) + 1;
      ITEMS.push({
        id: c.id + '-' + (pos + 1), cat: c.id, title: r[0], desc: r[1], fmt: r[2], lvl: r[3], len: r[4],
        tags: r[5].split(','), prompt: r[6] || '', added: BASE - daysAgo * 864e5, isNew: daysAgo <= 21, order: k
      });
    });
  }
  ITEMS.forEach(it => { it.hay = [it.title, it.desc, it.tags.join(' '), CATS.find(c => c.id === it.cat).name, it.fmt, it.lvl].join(' ').toLowerCase(); });

  // 24px stroke icons (inner SVG markup).
  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bookmark: '<path d="M6 4h12v17l-6-4-6 4z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17l.7 1.8 1.8.7-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7z"/>',
    layout: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    headphones: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="7" rx="1.5"/><rect x="17" y="14" width="4" height="7" rx="1.5"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="m10 8.5 5 3.5-5 3.5z"/>',
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    book: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H19v13H5.5A1.5 1.5 0 0 0 4 18.5z"/><path d="M4 18.5A1.5 1.5 0 0 0 5.5 20H19v-3"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    checklist: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8.5 12 2.5 2.5L16 9.5"/>',
    all: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>'
  };

  window.SANGAM_RES = { CATS, FORMATS, LEVELS, ITEMS, ICONS };
})();
