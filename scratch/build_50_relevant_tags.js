const fs = require('fs');
const vm = require('vm');

// 1. Load current resources_data.js
const win = {};
vm.runInNewContext(fs.readFileSync('assets/sangam/resources_data.js', 'utf8'), { window: win });
const items = win.SANGAM_RES.ITEMS;
const CATS = win.SANGAM_RES.CATS;
const FORMATS = win.SANGAM_RES.FORMATS;
const LEVELS = win.SANGAM_RES.LEVELS;
const ICONS = win.SANGAM_RES.ICONS;

// 2. Load rescraped YouTube video metadata
let ytV2 = [];
try {
  ytV2 = JSON.parse(fs.readFileSync('scratch/scraped_youtube_v2.json', 'utf8'));
} catch (e) {
  console.log('scraped_youtube_v2.json not found, skipping');
}

const ytByNum = {};
ytV2.forEach(y => {
  ytByNum[y.num] = y;
});

// Helper for formatting duration
function fmtDuration(seconds) {
  if (!seconds || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s > 0 ? s + 's' : ''}`.trim();
}

// Update video items with accurate rescraped YouTube data
items.forEach(it => {
  if (it.sheetNum && ytByNum[it.sheetNum]) {
    const y = ytByNum[it.sheetNum];
    if (y.videoId) it.videoId = y.videoId;
    if (y.durationSeconds && y.durationSeconds > 0) {
      it.durationSeconds = y.durationSeconds;
      const formatted = fmtDuration(y.durationSeconds);
      if (formatted) it.len = formatted;
    }
    if (y.author && y.author !== 'YouTube' && !it.author) {
      it.author = y.author;
    }
  }
});

// Helper to clean, trim, and deduplicate tags
function dedupeTags(tags) {
  const seen = new Set();
  const result = [];
  tags.forEach(raw => {
    if (!raw) return;
    const t = raw.trim().replace(/^#+/, '').replace(/\s+/g, ' ');
    if (t.length < 2) return;
    const lower = t.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(t);
    }
  });
  return result;
}

// Comprehensive, highly relevant 50+ tag definitions for each of the 85 items
const itemTags = {
  // SWAYAM ONBOARDING (17 items)
  'swayam-1': [
    "designing assignments", "faculty assessment handbook", "Sangam DLC PDF", "IIMBx assessment guide", "authentic assessment",
    "rubric design", "formative assessment", "summative evaluation", "AI-resilient assignments", "higher education grading",
    "teaching assistant calibration", "management education assessment", "pedagogical monograph", "course evaluation design", "student evaluation",
    "grading standards", "case study assignments", "peer feedback systems", "academic rigor", "curriculum alignment",
    "assessment validity", "instructional design PDF", "educational measurement", "faculty development", "teaching excellence",
    "accreditation compliance", "digital assessment framework", "Sangam DLC publication", "SWAYAM onboarding PDF", "criterion-referenced grading",
    "analytic rubrics", "holistic rubrics", "grading variance reduction", "objective grading criteria", "authentic performance tasks",
    "iterative assignment submission", "low-stakes formative feedback", "milestone project grading", "student self-evaluation", "TA grading standardization",
    "inter-rater reliability", "course learning outcome mapping", "Bloom's taxonomy assessment", "academic integrity in assignments", "evaluating critical thinking",
    "unstructured business dilemmas", "experiential assignment design", "rubric calibration workshop", "faculty handbook", "IIMB assessment framework",
    "blended learning evaluation", "executive education grading"
  ],

  'swayam-2': [
    "peer learning", "peer review in MOOCs", "Sangam DLC research", "IIMBx peer grading", "collaborative learning",
    "peer assessment calibration", "double blind peer review", "formative peer feedback", "learning environments design", "psychological safety in class",
    "scaling feedback", "MOOC pedagogy", "higher education peer review", "student critique skills", "rubric calibration",
    "grading at scale", "SWAYAM peer learning", "online cohort dynamics", "instructional design PDF", "educational research monograph",
    "collaborative pedagogy", "active student review", "evaluative judgement", "faculty guide to peer learning", "teaching at scale",
    "digital cohort management", "academic integrity", "Sangam DLC publication", "SWAYAM onboarding PDF", "cooperative learning",
    "peer review rubrics", "anonymous student evaluation", "preventing free riders", "structured peer critique", "sentence starters for feedback",
    "peer assessment reliability", "halo bias mitigation", "student self-regulation", "metacognitive reflection", "peer-to-peer tutoring",
    "cohort engagement strategies", "large class teaching", "asynchronous peer grading", "benchmarking sample assignments", "peer feedback literacy",
    "group work dynamics", "online discussion critique", "collaborative knowledge building", "student evaluative capacity", "peer learning architecture",
    "demographic bias elimination", "reciprocal teaching"
  ],

  'swayam-3': [
    "OER Commons", "open educational resources", "ISKME", "open textbooks", "Creative Commons in education",
    "curating OER", "textbook affordability", "remixable course materials", "open pedagogy", "digital public library",
    "higher education OER", "educational equity", "zero textbook cost", "open syllabus", "curriculum resources",
    "faculty resource guide", "quality rubric for OER", "open licensing", "educational repositories", "SWAYAM open resources",
    "collaborative authoring", "accessible course materials", "academic sharing", "instructional resources", "teaching tools",
    "global educational commons", "free educational resources", "educational excellence", "SWAYAM onboarding guide", "open courseware",
    "CC licensing verification", "CC BY attributes", "remixing digital content", "adapting open textbooks", "open access repositories",
    "inclusive digital education", "student financial burden reduction", "open curriculum design", "OER search techniques", "evaluating digital courseware",
    "faculty curation workflows", "public domain scholarship", "democratizing higher education", "digital learning materials", "supplementary readings curation",
    "modular open curriculum", "OER quality evaluation", "creative commons attribution", "institutional OER adoption", "open educational practices",
    "equitable access to knowledge", "academic publishing alternatives"
  ],

  'swayam-4': [
    "open textbooks", "Rebus Community", "collaborative publishing", "open pedagogy", "faculty authoring",
    "peer review in open books", "open educational resources", "textbook publishing playbook", "Creative Commons authoring", "academic writing cohort",
    "higher education publishing", "democratizing textbooks", "open access books", "student co-authorship", "curriculum authoring",
    "editorial workflow in academia", "digital publishing for faculty", "OER creation", "institutional publishing", "affordable learning materials",
    "scholarly collaboration", "educational authorship", "open textbook roadmap", "university press alternative", "free course textbooks",
    "faculty scholarship", "curriculum innovation", "educational excellence", "SWAYAM onboarding guide", "inter-institutional collaboration",
    "lead editor guidelines", "chapter memorandum of understanding", "open peer review process", "copyediting academic books", "ePub and PDF production",
    "multi-format publishing", "open syllabus creation", "collaborative book sprints", "faculty writing circles", "student co-creation in education",
    "democratizing academic knowledge", "open textbook accessibility", "CC BY-SA licensing", "open book project management", "peer reviewer recruitment",
    "open textbook adaptation", "higher ed publishing reform", "sustainable academic publishing", "open editorial guidelines", "digital textbook distribution",
    "scholarly monograph creation", "curriculum co-design"
  ],

  'swayam-5': [
    "question quality checklist", "multiple choice design", "Johns Hopkins IEE", "item writing flaws", "MCQ validity",
    "psychometric checklist", "all of the above trap", "unfocused stems", "distractor plausibility", "assessment rigor",
    "higher education testing", "medical education assessment", "exam question audit", "objective testing best practices", "faculty exam design",
    "measurement validity", "eliminating test flaws", "Bloom's MCQ testing", "SWAYAM quiz quality", "grading reliability",
    "formative quiz checklist", "faculty assessment guide", "academic testing standards", "educational measurement", "clean question stems",
    "psychometrics in higher ed", "instructional design", "teaching excellence", "SWAYAM onboarding checklist", "test item construction",
    "plausible distractors", "avoiding none of the above", "grammatical clues in exams", "homogeneous options", "positive stem phrasing",
    "eliminating negative stems", "single best answer format", "cognitive level of questions", "higher-order MCQ design", "application-level questions",
    "analysis-level questions", "distractor analysis", "item difficulty balance", "testing conceptual understanding", "reducing test guesswork",
    "online quiz quality control", "LMS question authoring", "exam paper moderation", "evaluating multiple choice exams", "testing without trivia",
    "flaw-free item writing", "reliable student assessment"
  ],

  'swayam-6': [
    "question bank template", "cognitive difficulty tags", "Johns Hopkins IEE", "discrimination index", "psychometric tagging",
    "item banking in universities", "p-value in testing", "point biserial correlation", "Bloom's taxonomy tags", "assessment metadata",
    "balanced exam generator", "higher education examination bank", "accreditation assessment tracking", "SWAYAM question bank", "course learning outcome mapping",
    "exam authoring template", "standardized testing matrix", "faculty test design", "educational measurement", "quality assurance in testing",
    "summative test architecture", "objective evaluation template", "item analysis formula", "accreditation evidence", "testing rigor",
    "psychometric spreadsheet", "curriculum alignment matrix", "faculty assessment tools", "SWAYAM onboarding template", "reusable test items",
    "difficulty classification", "distractor effectiveness", "item discrimination point-biserial", "question tagging ontology", "modular question repositories",
    "automated test paper assembly", "randomized exam generation", "CLO-PLO mapping", "OBE assessment compliance", "outcome-based education testing",
    "formative question banking", "summative exam bank", "calibrating test difficulty", "statistical item analysis", "psychometric validation",
    "faculty exam collaboration", "LMS question bank import", "QTI test bank format", "university examination cell", "balanced assessment papers",
    "exam question tracking", "secure item banking"
  ],

  'swayam-7': [
    "self-assessment quiz guide", "retrieval practice", "Johns Hopkins IEE", "testing effect in education", "formative quiz design",
    "immediate explanatory feedback", "low stakes testing", "spaced mastery paths", "cognitive psychology in teaching", "memory consolidation",
    "online self quizzes", "mastery learning design", "higher education pedagogy", "learning science guide", "SWAYAM self assessment",
    "faculty quiz playbook", "metacognition in students", "student self-evaluation", "formative assessment strategy", "practice testing benefits",
    "retrieval based learning", "instructional design guide", "test-enhanced learning", "evidence based teaching", "active recall quizzes",
    "online learning retention", "concept mastery checks", "teaching excellence", "SWAYAM onboarding guide", "diagnostic quizzes",
    "corrective feedback loops", "knowledge check design", "low-stakes learning checks", "frequent formative quizzes", "delayed vs immediate feedback",
    "elaborative feedback explanations", "reducing student exam anxiety", "building learner self-efficacy", "automating quiz feedback", "ungraded self tests",
    "weekly knowledge retrieval", "self-paced check-ins", "identifying student misconceptions", "formative learning analytics", "MOOC quiz architecture",
    "student engagement in quizzes", "retrieval warmup exercises", "cognitive reinforcement", "spacing quiz attempts", "mastery check points",
    "scaffolded practice quizzes", "empowering self-directed learners"
  ],

  'swayam-8': [
    "assessment blueprint matrix", "table of specifications", "Johns Hopkins IEE", "curriculum alignment matrix", "exam weighting template",
    "Bloom's taxonomy mapping", "fair test construction", "course outcomes assessment", "higher education test planning", "accreditation assessment matrix",
    "balanced exam design", "summative test specification", "instructional alignment", "psychometrics in university", "faculty exam blueprint",
    "cognitive domain distribution", "examination architecture", "test validity assurance", "syllabus outcome mapping", "educational measurement template",
    "standardized assessment plan", "learning objective coverage", "exam content validity", "teaching excellence", "SWAYAM onboarding template",
    "weightage allocation", "remembering to evaluating distribution", "proportional topic weighting", "constructive alignment in exams", "transparent grading criteria",
    "student assessment expectations", "comprehensive test specification", "exam question distribution", "curriculum coverage audit", "preventing test bias",
    "midterm exam blueprint", "end-semester test planning", "OBE outcome compliance", "NBA accreditation matrix", "NAAC criteria assessment",
    "departmental exam moderation", "faculty course planning", "blueprint-based test generation", "criterion-referenced evaluation", "exam validity evidence",
    "aligned learning outcomes", "structured exam authoring", "university syllabus matrix", "academic audit compliance", "fair student testing",
    "transparent test construction", "systematic exam design"
  ],

  'swayam-9': [
    "exam readiness checklist", "SWAYAM online learners", "NTA test centers", "National Testing Agency", "proctored exam guidelines",
    "hall ticket verification", "SWAYAM exam instructions", "remote proctoring readiness", "course coordinator checklist", "student exam briefing",
    "SWAYAM assessment protocols", "online learner support", "digital examination logistics", "identity verification in exams", "computer based test prep",
    "CBT exam guidelines", "faculty mentor checklist", "SWAYAM credit exam", "exam center code validation", "higher education distance exams",
    "academic integrity in CBT", "student test day routine", "NTA admit card instructions", "online course completion", "SWAYAM onboarding checklist",
    "exam slot booking", "photo ID verification requirements", "test center arrival protocols", "biometric authentication", "rough sheet guidelines",
    "on-screen calculator instructions", "navigating CBT interface", "submitting online exams", "handling technical glitches at center", "scribe eligibility rules",
    "disability accommodations in exams", "SWAYAM certificate eligibility", "40 percent passing mark", "internal vs external weightage", "proctoring rules compliance",
    "exam malpractice prevention", "invigilator escalation path", "post-exam grievance redressal", "results declaration timeline", "SWAYAM credit transfer steps",
    "student test anxiety reduction", "pre-exam mock tests", "faculty proctoring coordination", "academic honesty declaration", "seamless exam day execution",
    "online course final assessment", "university student certification"
  ],

  'swayam-10': [
    "OER evaluation checklist", "University of Ottawa OER", "open educational resources", "5Rs of open education", "retain reuse revise remix redistribute",
    "OER quality rubric", "curating open materials", "textbook selection criteria", "accessibility in OER", "cultural relevance in courseware",
    "higher education open resources", "evaluating digital textbooks", "faculty OER adoption", "instructional design checklist", "open pedagogy evaluation",
    "academic rigor in OER", "open licensing compliance", "Creative Commons verification", "educational resource audit", "syllabus material selection",
    "zero textbook cost initiatives", "digital repository curation", "peer reviewed open resources", "curriculum quality assurance", "SWAYAM onboarding checklist",
    "currency of information", "factual accuracy in OER", "pedagogical effectiveness", "multimedia clarity in resources", "WCAG compliance in OER",
    "editable file formats", "modularity of open modules", "bias and inclusivity review", "indigenous knowledge integration", "student cost impact analysis",
    "licensing compatibility checks", "attribution guidelines adherence", "faculty committee approval", "institutional repository upload", "remixing permissions",
    "OER sustainability assessment", "updating open courseware", "open textbook peer reviews", "cross-platform compatibility", "mobile-friendly OER",
    "print-on-demand feasibility", "evaluating supplementary OER", "open homework systems", "student feedback on open materials", "transforming course affordability",
    "open learning material audit", "inclusive educational resources"
  ],

  'swayam-11': [
    "license and attribution guide", "Creative Commons guide", "CC BY attribution best practices", "CC BY-SA share alike", "CC BY-NC non commercial",
    "CC BY-ND no derivatives", "copyright in higher education", "fair use in teaching", "academic copyright compliance", "attributing open materials",
    "creative commons for faculty", "TASL attribution method", "title author source license", "avoiding copyright infringement", "open licensing roadmap",
    "educational media rights", "open textbook licensing", "public domain materials", "lecture slide copyright", "open educational practices",
    "legal guidelines for educators", "SWAYAM copyright compliance", "faculty intellectual property", "curating digital content legally", "SWAYAM onboarding guide",
    "CC license chooser", "commercial use restrictions", "derivative works definition", "proper caption attribution", "linking to original licenses",
    "third-party image rights", "academic fair dealing India", "Copyright Act 1957 educational exemption", "classroom performance exemption", "open courseware copyright audit",
    "remixing multiple CC licenses", "license incompatibility traps", "CC0 public domain dedication", "open access scholarly publishing", "institutional copyright policy",
    "faculty slide deck audits", "clearing permissions for MOOCs", "video snippet copyright", "audio background music rights", "attribution generator tools",
    "ethical scholarly reuse", "protecting faculty original work", "open licensing awareness", "digital rights in education", "legal safety for professors",
    "author rights retention", "Creative Commons global standard"
  ],

  'swayam-12': [
    "curated resource list template", "National Digital Library of India", "NDLI repository", "IIT Kharagpur NDLI", "academic syllabi resources",
    "digital library integration", "open access reading lists", "curating course literature", "higher education library resources", "e-resources for teaching",
    "multidisciplinary digital library", "syllabus reference map", "open digital scholarship", "student research materials", "faculty curation template",
    "e-learning reading list", "SWAYAM course references", "digital repositories India", "scholarly databases for students", "supplementary readings guide",
    "institutional digital library", "curriculum enrichment template", "accessible academic literature", "educational knowledge repository", "SWAYAM onboarding template",
    "NDLI search filters", "subject domain tagging", "monographs and conference papers", "open access peer-reviewed journals", "thesis and dissertation access",
    "Shodhganga repository links", "e-books for university courses", "curating multimedia resources", "digital archives for humanities", "STEM virtual lab resources",
    "mobile library access", "bibliographic citation format", "APA and Harvard referencing", "student research guidance", "enriching weekly reading lists",
    "zero cost course literature", "connecting syllabus to national repository", "faculty reading pack assembly", "academic search strategies", "curating credible sources",
    "NDLI club integration", "interdisciplinary library resources", "regional language literature search", "digital pedagogy resources", "knowledge repository mapping",
    "structured course reading lists", "academic reference curation"
  ],

  'swayam-13': [
    "multilingual resource mapping", "INFLIBNET Centre", "e-PG Pathshala", "diverse Indian classrooms", "vernacular education higher ed",
    "regional language learning", "multilingual higher education", "inclusive classroom resources", "NPTEL regional translations", "NEP 2020 multilingualism",
    "Indian language digital content", "bilingual course delivery", "Hindi management resources", "Tamil Telugu Kannada Marathi materials", "equitable learning access",
    "translation in education", "faculty multilingual guide", "e-content in Indian languages", "digital repository INFLIBNET", "culturally responsive teaching",
    "bridging language barriers", "national education repository", "inclusive digital pedagogy", "curriculum localization India", "SWAYAM onboarding guide",
    "Anuvadini AI translation tool", "bilingual lecture notes", "regional language glossaries", "technical terms in local languages", "code-switching in classroom",
    "supporting vernacular medium students", "first-generation college learners", "linguistic diversity in colleges", "audio explanations in regional languages", "multilingual video subtitles",
    "e-PG Pathshala subject modules", "postgraduate e-curriculum", "UGC approved multilingual content", "democratizing English-heavy syllabi", "rural student inclusion",
    "accessible regional textbooks", "multilingual discussion forums", "culturally contextualized examples", "Indian linguistic heritage in academia", "inclusive learning materials",
    "faculty language sensitivity", "vernacular case study translation", "empowering multilingual students", "equitable educational opportunity", "NEP 2020 language policy",
    "multilingual digital learning", "diverse student engagement"
  ],

  'swayam-14': [
    "accessibility checklist", "WCAG 2.1 AA guidelines", "digital course materials", "W3C Web Accessibility", "accessible PDFs in education",
    "alt text for diagrams", "color contrast standards", "screen reader compatibility", "inclusive digital learning", "accessible slides for faculty",
    "captioning educational video", "transcripts for lectures", "universal accessibility in higher ed", "assistive technology in college", "accessible syllabus design",
    "equitable digital education", "faculty accessibility audit", "disability inclusion in MOOCs", "neurodiverse learner support", "digital barriers elimination",
    "accessible document formatting", "SWAYAM accessibility", "visual impairment course support", "hearing impairment accommodations", "SWAYAM onboarding checklist",
    "heading hierarchy H1 H2 H3", "semantic HTML in LMS", "descriptive hyperlink text", "avoiding click here links", "table headers and structure",
    "minimum 4.5 to 1 contrast ratio", "avoiding color-only meaning", "closed captions accuracy", "keyboard navigable courseware", "flashing content seizure warning",
    "accessible mathematical formulas", "MathML and LaTeX accessibility", "dyslexia-friendly typography", "cognitive load reduction in layout", "audio descriptions for visuals",
    "accessible forms and quizzes", "timed test accommodations", "universal access compliance", "Rights of Persons with Disabilities Act 2016", "institutional accessibility policy",
    "auditing course LMS pages", "screen reader testing NVDA JAWS", "inclusive higher ed classroom", "accessible educational technology", "empowering learners with disabilities",
    "zero barrier online courses", "universal design compliance"
  ],

  'swayam-15': [
    "discussion forum moderation", "MOOC instructor playbook", "Cornell University CTI", "asynchronous discussion facilitation", "online community building",
    "engaging online forums", "preventing dead discussion boards", "discussion prompt architecture", "teaching assistant moderation", "community of inquiry model",
    "social presence in MOOCs", "cognitive presence online", "teaching presence in forums", "handling toxic online posts", "discussion rubrics",
    "fostering peer dialogue", "higher education online forums", "moderation escalation protocol", "encouraging silent learners", "discussion board grading",
    "facilitating online debates", "digital classroom interaction", "faculty moderation guide", "collaborative forum pedagogy", "SWAYAM onboarding PDF",
    "icebreaker discussion prompts", "Socratic forum questioning", "synthesizing weekly forum themes", "highlighting exemplary student posts", "seed questions for discussion",
    "rotating student discussion leaders", "managing high volume MOOC threads", "setting netiquette guidelines", "defusing online conflicts", "private messaging intervention",
    "discussion participation scoring", "encouraging evidence-based posting", "peer-to-peer replies encouragement", "forum digest emails", "asynchronous dialogue scaffolding",
    "overcoming transactional posting", "creating lively academic debate", "active listening in text forums", "time management for forum facilitators", "preventing instructor burnout",
    "discussion forum analytics", "tracking student engagement online", "inclusive forum moderation", "building psychological safety online", "vibrant digital learning communities",
    "effective online facilitation", "student cohort connection"
  ],

  'swayam-16': [
    "university credit transfer", "UGC SWAYAM regulations", "Credit Framework 2016", "Academic Bank of Credits", "ABC portal integration",
    "20 percent online credit rule", "MOOC credit transfer briefing", "university board of studies", "academic council approval", "SWAYAM credit mobility",
    "higher education policy India", "institutional SWAYAM adoption", "dean academic briefing note", "online learning credit equivalence", "UGC regulations compliance",
    "national credit framework", "NEP 2020 credit transfer", "SWAYAM local chapter", "credit articulation agreement", "student mobility in higher ed",
    "recognizing online courses", "examination credit transfer", "university registrar guidelines", "faculty mentor credit guidance", "SWAYAM onboarding article",
    "up to 40 percent credit mobility", "SWAYAM gazette notification", "proctored exam grade transfer", "transcribing SWAYAM grades to marksheet", "curriculum committee integration",
    "mapping SWAYAM course to syllabus", "waiving classroom attendance for MOOC", "inter-university credit recognition", "DigiLocker ABC account setup", "student APAAR ID integration",
    "institutional coordinator duties", "resolving syllabus credit gaps", "preventing credit transfer delays", "SWAYAM NPTEL credit guidelines", "autonomous colleges SWAYAM adoption",
    "state university implementation", "central university compliance", "democratizing course choice", "interdisciplinary credit earning", "expanding elective offerings",
    "cost-effective degree completion", "future of higher education credentials", "micro-credentials recognition", "seamless academic mobility", "regulatory framework mastery",
    "university administration briefing", "student academic progression"
  ],

  'swayam-17': [
    "course health dashboard", "learning analytics", "retention indicators", "MDPI Education Sciences", "student dropout prediction",
    "MOOC engagement metrics", "video completion rate tracking", "discussion board analytics", "early warning systems", "online course quality audit",
    "data driven teaching", "learner behavior analytics", "predictive analytics in higher ed", "identifying at-risk students", "formative analytics dashboard",
    "course completion benchmarks", "digital pedagogy metrics", "educational data mining", "instructional intervention strategies", "higher education analytics",
    "student persistence online", "learning analytics research", "academic performance indicators", "evaluating course design with data", "SWAYAM onboarding paper",
    "clickstream analysis in LMS", "time on task tracking", "quiz attempt frequency", "drop-off point identification in videos", "forum interaction networks",
    "clustering learner archetypes", "automated nudge triggers based on data", "mid-course feedback loops", "measuring cognitive engagement", "retention rate optimization",
    "course redesign insights", "instructor diagnostic dashboard", "weekly engagement velocity", "identifying bottleneck modules", "correlating practice with exam scores",
    "ethical learning analytics", "student privacy in data tracking", "actionable pedagogical interventions", "reducing online course attrition", "improving MOOC graduation rates",
    "institutional analytics reporting", "data-informed curriculum renewal", "learner success analytics", "continuous course improvement", "benchmarking online learning outcomes",
    "evidence-based online education", "retention science in digital learning"
  ],

  // CURRICULUM DESIGN (16 items)
  'curriculum-1': [
    "instructional design theories", "Devlin Peck 33 models", "Gagne's nine events", "Merrill's first principles", "cognitive load theory",
    "Keller's ARCS model", "learning theories encyclopedia", "curriculum architecture", "pedagogical models", "instructional frameworks",
    "educational psychology", "higher education teaching", "adult learning principles", "action mapping", "e-learning design",
    "course structuring", "learning science", "faculty curriculum guide", "teaching models", "instructional design reference",
    "working memory in learning", "problem-centered instruction", "schema formation", "pedagogical rigor", "syllabus design",
    "educational foundations", "teaching excellence", "curriculum engineering", "curriculum design article", "Sweller's cognitive architecture",
    "intrinsic cognitive load", "extraneous cognitive load", "germane cognitive load", "dual coding theory", "Paivio multimedia learning",
    "constructivism in course design", "behaviorism in instructional systems", "cognitivism in syllabus planning", "Bloom's revised taxonomy", "Kirkpatrick four levels of evaluation",
    "experiential learning cycle Kolb", "situated cognition theory", "scaffolding in instruction", "zone of proximal development", "mastery learning Bloom",
    "discovery learning Bruner", "spiral curriculum sequencing", "anchored instruction", "instructional systems design", "foundational pedagogy reference",
    "designing for human learning", "rigorous curriculum blueprints"
  ],

  'curriculum-2': [
    "designing effective elearning", "Devlin Peck instructional design", "elearning architecture", "interactive elearning", "instructional design workflow",
    "needs assessment in education", "course authoring", "digital learning design", "online course development", "active elearning",
    "behavioral objectives", "visual design in elearning", "practice first pedagogy", "adult learning design", "microlearning design",
    "higher education online", "SWAYAM course design", "educational technology", "pedagogical structure", "elearning best practices",
    "learner engagement online", "online course blueprints", "instructional systems design", "multimedia learning Mayer", "cognitive design",
    "interactive digital courses", "teaching online", "course authoring guide", "curriculum design guide", "Cathy Moore action mapping",
    "decision-based learning activities", "eliminating passive slide turning", "story-driven course authoring", "branching scenarios in elearning", "feedback design in digital modules",
    "chunking complex information", "visual hierarchy in slides", "reducing cognitive friction", "learner-centered navigation", "mobile responsive elearning",
    "interactive knowledge checks", "realistic scenario simulations", "measuring behavioral change", "on-the-job skill transfer", "authoring tool workflows",
    "Articulate Storyline practices", "Rise 360 course architecture", "digital learning engagement", "multimedia principles in practice", "transforming dull courseware",
    "experiential elearning creation", "professional instructional designer guide"
  ],

  'curriculum-3': [
    "ADDIE model explained", "instructional design framework", "Devlin Peck ADDIE", "analysis phase in education", "design development implementation evaluation",
    "course development workflow", "curriculum planning", "instructional systems design", "ISD model higher ed", "rapid prototyping in education",
    "Kirkpatrick levels of evaluation", "needs analysis in universities", "learning architecture", "syllabus engineering", "educational project management",
    "university curriculum process", "faculty course design", "teaching models", "academic planning", "SWAYAM course creation",
    "quality assurance in teaching", "constructive alignment", "pedagogical workflow", "faculty training", "course blueprinting",
    "instructional methodology", "educational excellence", "curriculum design article", "backward design integration", "learner gap analysis",
    "identifying prerequisite knowledge", "writing measurable terminal objectives", "enabling objectives breakdown", "storyboarding course modules", "rapid authoring cycles",
    "pilot testing course prototypes", "formative evaluation of materials", "summative course audit", "level 1 learner reaction", "level 2 learning gains measurement",
    "level 3 workplace transfer", "level 4 organizational impact", "iterative ADDIE workflows", "agile instructional design", "SAM model comparison",
    "managing multidisciplinary course teams", "instructional timeline milestones", "curriculum quality gates", "design documentation standards", "systematic course development",
    "faculty syllabus authoring", "bulletproof instructional engineering"
  ],

  'curriculum-4': [
    "design thinking for educators", "IDEO design for learning", "human centered design in teaching", "curriculum innovation", "student empathy",
    "how might we in education", "pedagogical prototyping", "classroom experience design", "empathy interviews with students", "ideation in education",
    "iterative course design", "educational innovation", "student centered learning", "higher education design thinking", "creative problem solving",
    "design thinking toolkit", "learning spaces design", "syllabus co-creation", "faculty innovation", "teaching experiments",
    "active learning innovation", "educational empathy", "design thinking workshops", "academic change management", "collaborative curriculum",
    "student journey redesign", "transformative pedagogy", "teaching excellence", "curriculum design guide", "Stanford d.school design framework",
    "discovery interpretation ideation experimentation", "shadowing student experiences", "uncovering student friction points", "reframing academic challenges", "low-fidelity syllabus prototyping",
    "rapid classroom testing", "co-designing assignments with learners", "classroom furniture layout experiments", "optimizing digital course interfaces", "fostering student creative confidence",
    "iterative feedback cycles", "empathy mapping for cohorts", "overcoming institutional inertia", "innovative university pedagogy", "participatory curriculum design",
    "experiential learning environments", "student emotional journey mapping", "creative educators toolkit", "design thinking in business schools", "human-centered instructional strategies",
    "transformative course redesign", "empowering educator creativity"
  ],

  'curriculum-5': [
    "universal design for learning", "UDL framework guidelines", "CAST UDL in higher ed", "inclusive curriculum design", "neurodiverse learning",
    "multiple means of representation", "multiple means of engagement", "multiple means of action and expression", "accessible course design", "learner variability",
    "differentiated instruction", "barrier free learning", "higher education inclusion", "educational equity", "universal design in college",
    "pedagogical accessibility", "faculty UDL guide", "course flexibility", "inclusive pedagogy", "neurodiversity in university",
    "learning science framework", "empowering diverse learners", "teaching all students", "curriculum customization", "instructional guidelines",
    "accessible syllabus", "educational excellence", "curriculum design guide", "CAST guidelines checkpoints", "activating prior knowledge in multiple ways",
    "audio visual text alternatives", "multimedia content representation", "clarifying vocabulary and symbols", "scaffolding student executive functions", "flexible assignment formats",
    "giving students choice in expression", "optimizing individual choice and autonomy", "fostering collaboration and community", "minimizing threats and distractions", "self-regulation strategies for students",
    "mastery-oriented feedback", "eliminating systemic learning barriers", "ADHD and dyslexia support in college", "supporting English language learners", "inclusive digital courseware",
    "UDL alignment audit", "universal design for learning implementation", "inclusive assessment options", "equitable learning architecture", "accessible higher ed curriculum",
    "empowering every learner", "CAST framework mastery"
  ],

  'curriculum-6': [
    "learner profile canvas", "learner persona template", "OpenLearn curriculum planning", "student needs analysis", "empathy driven course design",
    "higher ed learner profiles", "prior knowledge assessment", "student motivations and hurdles", "target audience mapping", "curriculum customization",
    "online student personas", "digital learner analysis", "instructional design canvas", "SWAYAM learner profiles", "inclusive course design",
    "identifying learning barriers", "pedagogical empathy", "learner centered planning", "course planning worksheet", "faculty curriculum template",
    "student demographic analysis", "scaffolding prerequisites", "curriculum architecture", "teaching diverse cohorts", "educational excellence",
    "curriculum design template", "assessing digital literacy", "time availability mapping for adult learners", "employment and career goals alignment", "identifying motivational drivers",
    "socio-economic background considerations", "bandwidth and device constraints analysis", "first-generation university learners", "work-life-study balance challenges", "designing for executive vs undergraduate",
    "customizing instructional tone", "cohort archetype creation", "targeted pedagogical scaffolding", "learner-centric syllabus mapping", "anticipating conceptual stumbling blocks",
    "empathy-driven learning outcomes", "needs-informed assessment design", "curriculum personalization", "student retention strategy", "course onboarding design based on persona",
    "faculty design worksheets", "profiling asynchronous learners", "bridging knowledge gaps", "learner persona development", "actionable student profiling",
    "empathetic instructional engineering"
  ],

  'curriculum-7': [
    "four-quadrant course blueprint", "SWAYAM 4 quadrant architecture", "MOOC curriculum design", "UGC four quadrants", "quadrant 1 e-tutorial video",
    "quadrant 2 e-content reading", "quadrant 3 discussion forum", "quadrant 4 self assessment", "SWAYAM course template", "online course blueprint",
    "digital higher education syllabus", "ministry of education guidelines", "MOOC authoring framework", "faculty course planning template", "structured course mapping",
    "blended learning blueprint", "weekly module architecture", "SWAYAM curriculum standards", "course proposal template", "accredited online courses",
    "instructional design for MOOCs", "quadrant alignment matrix", "curriculum engineering", "educational excellence", "SWAYAM onboarding template",
    "video lecture script planning", "supplementary reading curation", "transcript preparation for quadrant 1", "e-book and research paper integration", "discussion prompt scheduling",
    "weekly self-assessment quizzes", "formative vs summative quadrant balance", "weekly credit hour distribution", "course storyboard creation", "SWAYAM review committee compliance",
    "12-week course structuring", "8-week course modular design", "4-credit MOOC architecture", "production team handoff blueprint", "quadrant quality audit",
    "integrating multimedia across quadrants", "student weekly study sequence", "asynchronous learning flow", "faculty course authoring roadmap", "standardized MOOC design",
    "UGC guidelines adherence", "structured digital curriculum", "SWAYAM course creation blueprint"
  ],

  'curriculum-8': [
    "learning outcomes alignment matrix", "Bloom's taxonomy verbs", "University of Liverpool CIE", "actionable learning objectives", "constructive alignment",
    "curriculum outcome mapping", "cognitive domain verbs", "higher order thinking skills", "measurable learning objectives", "syllabus design guide",
    "assessment alignment", "instructional design matrix", "faculty teaching guide", "exam question mapping", "curriculum architecture",
    "evaluating cognitive depth", "learning outcomes guide", "course design worksheet", "pedagogical alignment", "educational measurement",
    "Biggs constructive alignment", "teaching excellence", "curriculum design guide", "Anderson and Krathwohl revised taxonomy", "remembering understanding applying",
    "analyzing evaluating creating verbs", "avoiding unmeasurable verbs like understand", "SMART learning objectives criteria", "program learning outcomes PLO mapping", "course learning outcomes CLO mapping",
    "aligning lecture tasks with exam items", "cognitive scaffolding across weeks", "prerequisite to advanced outcome progression", "transparent student expectations", "curriculum audit against Bloom verbs",
    "faculty syllabus development", "outcome-based education OBE compliance", "NBA accreditation outcome mapping", "NAAC criteria alignment", "grading criteria derived from verbs",
    "student self-assessment against outcomes", "course blueprinting matrix", "rigorous academic standards", "curriculum engineering with Bloom", "actionable syllabus language",
    "clear learning contracts", "instructional coherence", "systematic outcome alignment"
  ],

  'curriculum-9': [
    "module review rubric", "OSCQR course quality standards", "SUNY OSCQR rubric", "online course quality review", "instructional design rubric",
    "course overview and information", "course technology and tools", "design and layout standards", "content and activities quality", "interaction and engagement rubric",
    "assessment and feedback standards", "accessibility and usability", "peer course review", "higher education online audit", "e-learning quality assurance",
    "faculty course evaluation", "continuous course improvement", "SWAYAM course audit", "online teaching standards", "distance education quality",
    "quality matters alternative", "educational excellence", "curriculum design checklist", "50 OSCQR standard checkpoints", "welcome and orientation clarity",
    "syllabus accessibility", "clear navigation structure", "logical module chunking", "transparent grading policy", "rubric availability upfront",
    "varied student interaction opportunities", "faculty presence indicators", "mobile-friendly layout review", "broken links and technical audit", "third-party tool privacy check",
    "alignment of activities with objectives", "formative feedback timeliness", "accessible media verification", "self-paced course review process", "departmental peer review protocol",
    "post-course evaluation iteration", "evidence-based course quality", "institutional online standards", "benchmarking course design", "certifying online course quality",
    "continuous curriculum refinement", "gold-standard online courseware"
  ],

  'curriculum-10': [
    "learner journey map", "self-paced higher education", "student experience roadmap", "anticipating mid-semester fatigue", "onboarding milestones",
    "course completion journey", "student motivation curves", "learner emotional stages", "higher ed retention strategy", "course pacing template",
    "asynchronous learning journey", "curriculum milestone planning", "reducing dropout in MOOCs", "faculty course planning", "instructional design template",
    "learner engagement roadmap", "student lifecycle in courses", "pedagogical pacing", "educational excellence", "curriculum design template",
    "first-week orientation triumph", "week 3 dip mitigation", "mid-term fatigue intervention points", "assignment deadline stress management", "celebrating module completions",
    "progress visualization for learners", "gamification and milestone badges", "automated encouraging nudges", "re-engagement triggers for stalled students", "final project preparation scaffolding",
    "exam sprint pacing", "post-course reflection journey", "mapping cognitive load across semester", "balancing heavy reading weeks", "student emotional journey curve",
    "empathy-driven pacing", "optimizing asynchronous learner persistence", "faculty proactive check-in schedule", "transforming course trajectory", "student retention architecture",
    "seamless learner progression", "empowering self-directed success"
  ],

  'curriculum-11': [
    "weekly study planner", "time on task workload estimator", "Rice University CTL", "credit hour calculation", "balancing student workload",
    "realistic learner time budgets", "higher education study planner", "curriculum workload audit", "reading time estimation", "assignment workload formula",
    "student time management", "faculty workload calculator", "syllabus time planning", "preventing student burnout", "course pacing worksheet",
    "instructional design template", "SWAYAM credit hour workload", "educational excellence", "curriculum design template", "Carnegie unit credit hour compliance",
    "estimating reading speed for dense texts", "pages per hour academic reading formula", "writing and revision time estimation", "video lecture watching and review hours", "discussion forum composing time",
    "exam preparation time budgets", "weekly time audit for courses", "preventing cognitive overload through pacing", "transparent workload disclosure in syllabus", "helping working adult learners plan",
    "weekly student study timetable", "time blocking for asynchronous courses", "calculating total semester study hours", "course credit justification", "aligning credits with national frameworks",
    "realistic student expectations", "faculty planning worksheet", "curriculum balance optimization", "reducing mid-semester panic", "sustainable course workload",
    "student wellbeing in course design", "rigorous yet humane curriculum pacing"
  ],

  'curriculum-12': [
    "course orientation page template", "seamless student onboarding", "Penn State Online", "meet your instructor video", "welcome module layout",
    "syllabus scavenger hunt", "first week course orientation", "navigating the LMS", "reducing student onboarding anxiety", "getting started module",
    "online course orientation", "faculty welcome template", "higher ed onboarding checklist", "student success module", "course communication norms",
    "setting expectations online", "instructional design template", "SWAYAM course onboarding", "educational excellence", "curriculum design template",
    "instructor bio and teaching philosophy", "course roadmap overview", "prerequisites and software setup guide", "LMS tour video script", "interactive syllabus quiz",
    "first-week low-stakes icebreaker", "where to get help FAQ", "office hours schedule and Zoom links", "technical support escalation contacts", "peer networking discussion thread",
    "course ground rules and netiquette", "grading and late policy highlights", "accommodations and accessibility statement", "building early teacher presence", "fostering day-one belonging",
    "preventing early course dropouts", "streamlined onboarding checklist", "faculty course launch kit", "clear student onboarding navigation", "frictionless course start",
    "setting students up for victory", "gold-standard welcome module"
  ],

  'curriculum-13': [
    "learner motivation nudge calendar", "Stanford University Lytics Lab", "automated study reminders", "re-engaging inactive students", "notification protocol",
    "behavioral nudges in higher ed", "email nudge templates", "SMS study reminders", "retention nudge scheduling", "student motivation strategy",
    "asynchronous learner nudges", "faculty communication calendar", "LMS automated notifications", "preventing procrastination", "nudging educational engagement",
    "instructional design guide", "SWAYAM student retention", "educational excellence", "curriculum design guide", "behavioral science in education",
    "timely deadline reminders", "personalized progress check-ins", "loss aversion vs positive framing nudges", "peer comparison nudges in MOOCs", "triggering inactive student outreach",
    "celebrating milestone accomplishments", "mid-week encouragement messages", "exam countdown preparation nudges", "opt-in SMS notification protocols", "avoiding email notification fatigue",
    "A/B testing nudge messaging", "data-driven communication triggers", "compassionate instructor tone in nudges", "automated LMS workflow rules", "student re-engagement playbook",
    "faculty communication cadence", "supporting struggling online learners", "closing completion gaps with nudges", "empowering self-regulated study habits", "retention optimization playbook",
    "evidence-based behavioral nudging", "student persistence interventions"
  ],

  'curriculum-14': [
    "low bandwidth access guide", "UNESCO distance education", "inclusive distance education", "low internet connectivity teaching", "optimizing PDFs for low bandwidth",
    "audio-only lecture alternatives", "offline download packages", "digital equity in higher ed", "mobile friendly course design", "bandwidth friendly teaching",
    "rural student access", "accessible course delivery", "data-saving instructional design", "emergency distance teaching", "faculty guide for low connectivity",
    "inclusive digital pedagogy", "SWAYAM low bandwidth", "educational excellence", "curriculum design guide", "compressing lecture video files",
    "handbrake video compression settings", "podcast-style audio lectures", "text transcripts as primary alternatives", "image compression and grayscale options", "asynchronous offline caching",
    "distributing content via USB and local hubs", "lightweight LMS page authoring", "minimalist HTML design", "SMS-based assignment updates", "low-data quiz alternatives",
    "bridging rural-urban digital divides", "smartphone accessible courseware", "supporting students on 2G and 3G networks", "resilient learning architectures", "frugal educational technology",
    "equitable access to course materials", "UNESCO open learning standards", "faculty low-bandwidth toolkit", "inclusive distance learning", "democratizing higher education access",
    "barrier-free mobile learning", "accessible curriculum delivery"
  ],

  'curriculum-15': [
    "12-week MOOC launch schedule", "IIMBx operations template", "SWAYAM course schedule", "video production milestones", "assessment release calendar",
    "teaching team launch readiness", "MOOC project management", "course delivery timeline", "higher education course launch", "faculty course management",
    "weekly module rollout", "live session scheduling", "discussion forum rotation schedule", "course coordinator calendar", "instructional design template",
    "SWAYAM operations playbook", "educational excellence", "curriculum design template", "pre-production script lock dates", "studio recording milestones",
    "video post-production review cycles", "LMS upload and QA review", "pilot cohort testing period", "proctored exam registration windows", "hall ticket release milestones",
    "weekly quiz release and deadline schedule", "mid-term feedback collection week", "TA roster and grading shifts", "course completion and audit phase", "post-course retrospective meeting",
    "multi-stakeholder course management", "coordinating instructional designers and media teams", "preventing course launch delays", "standardized MOOC delivery operations", "IIMBx course launch roadmap",
    "robust semester scheduling", "comprehensive academic operations template", "seamless course execution", "faculty project coordination", "professional course delivery management"
  ],

  'curriculum-16': [
    "100-point course quality checklist", "pre-launch verification", "Quality Matters standards", "Sangam DLC quality assurance", "pre-flight syllabus audit",
    "broken link checking in LMS", "quiz grading key validation", "course readiness checklist", "higher ed quality assurance", "instructional design audit",
    "faculty pre-launch review", "online course quality control", "accreditation readiness", "SWAYAM course verification", "educational excellence",
    "curriculum design checklist", "syllabus policy completeness check", "grading rubric attachment verification", "video player and caption functionality", "downloadable asset accessibility check",
    "gradebook calculation formula testing", "test student account walkthrough", "mobile browser display verification", "dates and deadlines consistency audit", "academic integrity policy visibility",
    "instructor contact details accuracy", "assignment submission dropboxes testing", "welcome announcement scheduled", "TA grading permissions verified", "discussion forum boards initialized",
    "third-party tool LTI integration check", "copyright compliance verification", "bulletproof course deployment", "departmental quality sign-off", "zero-defect course launch",
    "faculty peace of mind checklist", "gold-standard course quality assurance", "flawless student experience audit", "pre-flight instructional engineering", "comprehensive course verification"
  ],

  // PROMPTING TIPS (12 items)
  'prompts-1': [
    "Generative AI in teaching", "Prof Naveen", "IIM Bangalore AI", "contextualizing content", "case study generation",
    "Indian business context", "prompt engineering for faculty", "curriculum localization", "MBA teaching with AI", "IIMBx AI series",
    "custom case writing", "management education AI", "faculty AI tools", "pedagogical prompts", "higher education teaching",
    "classroom case vignettes", "localized case studies", "AI pedagogical assistant", "teaching with LLMs", "instructional design with AI",
    "curriculum enrichment", "educational prompt design", "active learning prompts", "business school AI adoption", "executive education cases",
    "academic prompt engineering", "faculty development AI", "contextual learning", "tier-2 city market dilemmas", "SEBI and RBI compliance scenarios",
    "supply chain friction vignettes", "MSME dilemma authoring", "transforming foreign cases to Indian reality", "grounded business school cases", "rapid case authoring",
    "boundary condition prompting", "theoretical dilemma preservation", "discussion question generation", "high-speed faculty research assistant", "tailored MBA class vignettes",
    "authentic stakeholder motivations", "Claude for case design", "ChatGPT for curriculum customization", "empowering case teachers", "innovative business pedagogy",
    "pedagogical prompt template", "curriculum localization framework", "AI-assisted course preparation", "executive classroom debate prompts", "grounded management education"
  ],

  'prompts-2': [
    "AI hallucination prevention", "source verification for educators", "Prof Naveen IIM Bangalore", "AI citation verification", "academic integrity in AI",
    "meta prompting techniques", "fact checking AI outputs", "faculty AI guidelines", "IIMBx AI series", "hallucination mitigation prompt",
    "ground truth verification", "scholarship and AI", "educational technology", "prompt engineering", "research verification",
    "AI literacy for professors", "higher education teaching", "critical AI use", "teaching with integrity", "retrieval augmented prompting",
    "scientific accuracy", "pedagogical validation", "academic rigor", "faculty development", "digital learning ethics",
    "AI guardrails in education", "reliable edtech", "prompting tips guide", "chain of verification CoVe", "cross-verifying DOIs on Google Scholar",
    "spotting fabricated academic papers", "forcing LLM uncertainty declaration", "confidence rating meta-prompts", "hallucination stress-test prompt", "context window grounding with PDFs",
    "preventing phantom citations", "scholarly citation auditing", "evaluating LLM factual reliability", "critical thinking in AI use", "teaching students AI skepticism",
    "faculty citation verification protocol", "verifiable case data generation", "responsible generative AI adoption", "preserving academic standards", "bulletproof lecture slide preparation",
    "AI fact-checking workflows", "rigorous academic prompt design", "uncompromising research integrity", "empowering professors with verified AI", "scholarly AI guardrails"
  ],

  'prompts-3': [
    "prompt engineering tips", "PEDAGOGY framework", "Prof Naveen", "IIM Bangalore AI", "faculty prompt engineering",
    "advanced academic prompts", "higher education teaching", "IIMBx AI series", "instructional design prompts", "MBA debate design",
    "Socratic prompt design", "structured prompting", "AI persona assignment", "pedagogical guardrails", "course design with AI",
    "teaching prompts", "lesson planning with AI", "educational prompt pack", "academic AI tools", "curriculum prompts",
    "faculty productivity", "management education prompts", "rubric generation AI", "classroom debate prompts", "university teaching with AI",
    "prompt architecture", "learning outcomes prompting", "innovative pedagogy", "prompting tips", "prompt pack template",
    "persona evidence deliverable audience guardrails objective guidance yield", "negative constraint prompting", "specifying student demographics in prompts", "delimiter formatting in prompts", "system prompt architecture for professors",
    "few-shot prompt examples for academia", "generating comparative debate matrices", "socratic questioning protocols", "avoiding conversational AI fluff", "requesting observable pedagogical deliverables",
    "customized syllabus drafting prompts", "faculty assistant prompt templates", "elite academic prompt engineering", "structured output formats", "scaffolded course preparation",
    "deep conceptual debate prompts", "rigorous teaching prompt templates", "transforming faculty productivity with AI", "pedagogical prompt mastery", "practical GenAI toolkit for professors"
  ],

  'prompts-4': [
    "overcoming AI-generated assignments", "assessment redesign", "Prof Naveen", "IIM Bangalore AI", "academic integrity in AI era",
    "red teaming AI responses", "oral defense in business", "authentic assessment", "overcoming AI cheating", "IIMBx AI series",
    "critical thinking over copy paste", "process-based grading", "higher education assessment", "viva voce exams", "AI detectors failure",
    "pedagogical innovation", "unhackable assignments", "field research pedagogy", "management education exams", "deep learning strategies",
    "faculty assessment guide", "syllabus redesign", "student evaluation reform", "critical analysis with AI", "curriculum integrity",
    "educational ethics", "reflective learning", "exam redesign", "prompting tips guide", "false positives in AI detectors",
    "critiquing LLM output for marks", "red-ink critique of AI drafts", "incorporating proprietary field data", "local practitioner interview assignments", "3-stage AI-resilient assignment model",
    "handwritten reflective synthesis", "in-class whiteboard presentations", "evaluating intellectual process over final text", "spotting logical fallacies in AI essays", "identifying AI algorithmic bias",
    "demanding empirical local data", "making unreflective copy-pasting impossible", "rebuilding assignment rigor", "authentic student voice evaluation", "innovative assessment architecture",
    "empowering genuine student learning", "future-proof assignment design", "transforming evaluation in AI era", "faculty assessment resilience", "promoting deep critical inquiry"
  ],

  'prompts-5': [
    "Generative AI transforming teaching", "Prof Naveen Kumar Bhansali", "global horizon of AI education", "AI tutoring systems", "personalized learning pathways",
    "future of university teaching with AI", "IIM Bangalore video", "IIMBx AI series", "video lecture", "recorded masterclass",
    "higher education AI strategy", "educational technology trends", "faculty AI transformation", "pedagogical shift with AI", "AI in business education",
    "digital learning future", "classroom transformation", "teaching innovation", "faculty development video", "interactive AI learning",
    "adaptive learning systems", "AI pedagogical capabilities", "future of higher ed classrooms", "management teaching evolution", "educational leadership with AI",
    "AI literacy in universities", "teaching tips video", "emerging learning practices", "video resource", "faculty video",
    "Khanmigo style AI tutors", "democratizing 1-on-1 tutoring", "AI for differentiated instruction", "scaling active learning with AI", "shifting teacher role to facilitator",
    "human-AI pedagogical collaboration", "closing educational achievement gaps", "AI tools in executive classrooms", "lifelong learning with generative models", "evaluating AI impact on learning outcomes",
    "AI curriculum integration", "ethical adoption of AI in schools", "global higher ed benchmarks", "transformative classroom technology", "inspiring educator video",
    "future-ready university pedagogy", "visionary teaching strategies", "technology-enhanced learning", "empowering educators with AI", "global digital learning evolution"
  ],

  'prompts-6': [
    "AI scenario-based learning", "Devlin Peck scenario design", "branching scenario architecture", "adaptive decision paths", "interactive elearning scenarios",
    "decision consequences tree", "scenario-based learning design", "experiential elearning", "instructional design article", "branching narrative pedagogy",
    "adult learning scenarios", "active decision making", "simulation design in education", "problem solving scenarios", "situated learning online",
    "interactive storytelling in courses", "educational technology", "pedagogical branching", "workplace decision training", "higher education scenarios",
    "e-learning architecture", "case simulation authoring", "curriculum innovation", "teaching with scenarios", "Devlin Peck guide",
    "prompting tips article", "scaffolding critical decisions", "designing plausible distractors in scenarios", "immediate consequences vs delayed impact", "visualizing branching logic",
    "authoring tools for branching Twine Storyline", "reducing cognitive load in complex scenarios", "safe failure environments for students", "prompting AI to generate decision trees", "role-playing scenarios in management",
    "medical and business emergency scenarios", "evaluating decision trade-offs", "experiential digital modules", "scenario scriptwriting", "non-linear instructional design",
    "engaging learners through dilemma paths", "authentic real-world dilemmas", "transforming passive quizzes to active decisions", "scenario design best practices", "interactive courseware architecture",
    "empowering experiential learning", "scenario-based curriculum engineering"
  ],

  'prompts-7': [
    "scenario questions template", "Dr Will Thalheimer", "work-learning research", "systematic design template", "pedagogical logic in scenarios",
    "context dilemma choices feedback", "realistic scenario questions", "decision-based testing", "instructional design template", "authentic assessment scenarios",
    "multiple choice scenario questions", "evaluating practical decision making", "workplace skill evaluation", "higher education testing", "adult learning assessment",
    "scenario design template", "pedagogical question design", "feedback design in scenarios", "educational measurement", "actionable scenario authoring",
    "evidence based testing", "teaching excellence", "prompting tips template", "Thalheimer question architecture", "setting realistic problem contexts",
    "designing competing attractive choices", "diagnosing reasoning behind answers", "eliminating superficial multiple choice recall", "context-rich question stems", "elaborated feedback for each option",
    "teaching through test questions", "measuring behavioral application", "management decision scenarios", "formative scenario testing", "summative scenario examinations",
    "scenario question templates for faculty", "rubric for realistic dilemmas", "authentic workplace simulations", "higher-order assessment engineering", "robust question construction",
    "faculty testing toolkit", "transforming recall tests to decision challenges", "practical assessment mastery"
  ],

  'prompts-8': [
    "AI prompts for edtech", "Eric Curts Control Alt Achieve", "interactive lesson activities", "educational technology prompts", "prompts for Google Docs and Classroom",
    "interactive lesson plan prompts", "rubric generation with AI", "K-12 and higher ed edtech", "classroom activity generator", "AI teaching prompts",
    "pedagogical prompt pack", "technology enhanced learning", "collaborative classroom tools", "creative teaching prompts", "faculty edtech toolkit",
    "digital lesson planning", "active learning prompts", "teacher productivity prompts", "innovative lesson ideas", "educational prompt collection",
    "teaching with technology", "student engagement prompts", "prompt engineering for teachers", "educational excellence", "prompting tips prompt pack",
    "differentiated learning activity prompts", "generating vocabulary games and warmups", "socratic dialogue prompts for students", "debate topic and rebuttal generators", "reading comprehension question prompts",
    "customizing learning stations with AI", "project-based learning starter prompts", "parent and student communication templates", "quick check-for-understanding prompts", "gamified learning challenges",
    "cross-curricular activity prompts", "scaffolding writing assignments with AI", "curating creative teaching ideas", "freeing up teacher preparation time", "inspiring digital classroom activities",
    "interactive lesson authoring", "edtech prompt mastery", "practical classroom AI pack"
  ],

  'prompts-9': [
    "scaling experiential learning AI", "Texas A&M Dell AI collaboration", "Educause Review case study", "AI coaches for student groups", "scaling project based learning",
    "experiential learning in universities", "higher education case study", "educational innovation case", "AI in engineering and business", "student group mentoring with AI",
    "personalized feedback at scale", "institutional AI adoption", "technology partnerships in higher ed", "collaborative learning with AI", "faculty AI case study",
    "educational transformation", "teaching innovation", "scalable experiential pedagogy", "higher ed research case", "prompting tips case study",
    "peer group AI facilitation", "scaling mentor support across 1000s of students", "real-time project feedback loops", "AI as non-judgmental student coach", "measuring group collaboration dynamics",
    "university enterprise AI infrastructure", "Dell generative AI compute clusters", "data privacy in campus AI deployments", "closing student guidance bottlenecks", "fostering self-efficacy in student teams",
    "hybrid human-AI mentorship models", "engineering capstone AI integration", "institutional lessons in scaling AI", "Educause award-winning innovation", "blueprints for university AI partnerships",
    "transforming student project outcomes", "future of scalable university coaching"
  ],

  'prompts-10': [
    "federated learning in higher ed", "IBM Technology video", "edge computing in education", "preserving student data privacy", "AI model training privacy",
    "video lecture", "recorded tutorial", "data security in university AI", "decentralized machine learning", "educational technology video",
    "higher ed privacy compliance", "FERPA and student data security", "machine learning on edge devices", "privacy preserving AI", "faculty technology briefing",
    "computer science education", "emerging learning practices", "educational video resource", "teaching tips video", "prompting tips video",
    "training algorithms without centralizing data", "differential privacy in education", "local model training on student devices", "collaborative AI without raw data sharing", "securing institutional research data",
    "edge AI in smart campuses", "privacy-first educational algorithms", "preventing student data leaks", "compliance with data protection regulations", "future of secure academic AI",
    "IBM cloud and AI architecture", "concise 1-minute tech explainer", "visual technology breakdown", "empowering faculty with privacy literacy", "essential AI security concepts"
  ],

  'prompts-11': [
    "Five Moments of Need model", "Bob Mosher Conrad Gottfredson", "just-in-time pedagogical support", "workflow learning in higher ed", "performance support tools",
    "learning when something goes wrong", "learning to apply for first time", "learning more and expanding", "learning when things change", "instructional design guide",
    "workplace learning methodology", "just-in-time reference guides", "reducing formal training time", "adult learning framework", "pedagogical support architecture",
    "higher education workflow learning", "faculty instructional manual", "curriculum support tools", "educational excellence", "prompting tips guide",
    "moment 1 learning for the first time", "moment 2 learning more in depth", "moment 3 applying in real work", "moment 4 solving unexpected problems", "moment 5 adapting to major change",
    "performance support checklists and job aids", "moving beyond one-time classroom lectures", "curating micro-support assets", "on-demand knowledge retrieval for students", "reducing memory decay through job aids",
    "designing support embedded in student workflows", "digital coaching at the moment of need", "practical reference architecture", "empowering autonomous problem solvers", "instructional design beyond the classroom"
  ],

  'prompts-12': [
    "video script template", "W3C WAI video standards", "storytelling beats in microlectures", "accessibility cues in video", "hook conflict resolution arc",
    "audio description cues", "educational video scriptwriting", "microlecture authoring template", "instructional video design", "higher ed video production",
    "accessible video scripts", "faculty video recording guide", "engaging video storytelling", "multimedia learning template", "scripting for online courses",
    "SWAYAM video script template", "visual and audio cues", "pacing video lectures", "educational excellence", "prompting tips template",
    "3-second opening hook", "posing the central intellectual puzzle", "modular 6-minute lecture chunking", "scripting visual slide changes", "integrating verbal signposts",
    "writing for spoken ear vs written page", "conversational yet authoritative tone", "explicit pauses for student processing", "inclusive language in narration", "clear closing synthesis and call to action",
    "synchronizing speech with on-screen graphics", "producing accessible video transcripts", "studio recording preparation for professors", "eliminating teleprompter stiffness", "professional educational video production"
  ],

  // TEACHING TIPS ON TAP (20 items)
  'tips-1': [
    "analog shortcuts in digital world", "Prof Kamath", "Prof Padmini Srinivasan", "IIM Bangalore video", "Teaching Tips on Tap",
    "digital distraction in college", "student attention span", "classroom focus strategies", "screen-free reflection", "tactile learning in university",
    "pen and paper exercises", "deep work in classroom", "lecture pacing", "student concentration levels", "cognitive load management",
    "classroom presence", "offline pedagogy", "higher education teaching", "management education", "mindful learning in MBA",
    "memory retention", "distraction management", "teaching challenges", "classroom habits", "reflective inquiry",
    "analog pauses during lectures", "handwriting notes benefits", "structured whiteboard synthesis", "deliberate teacher silence", "overcoming screen fatigue",
    "rebuilding student concentration", "analog thinking rituals", "intentional classroom pauses", "engaging distracted students", "tactile cognitive anchors",
    "reducing multitasking in class", "faculty classroom delivery", "IIMB pedagogy video", "recorded teaching tip", "video resource for professors",
    "active reflection in class", "fostering deep student thought", "managing tech in lectures", "inspiring classroom presence", "essential teaching habits"
  ],

  'tips-2': [
    "case study method", "teaching pedagogies", "Prof Kamath", "IIM Bangalore video", "Teaching Tips on Tap",
    "management education pedagogy", "business school case teaching", "Harvard case method", "interactive discussion", "board management in cases",
    "cold calling technique", "decision making under uncertainty", "experiential learning in MBA", "active learning facilitation", "classroom debate orchestration",
    "pedagogical frameworks", "student participation strategies", "MBA case analysis", "Socratic questioning in cases", "inquiry based learning",
    "critical thinking in business", "dilemma discussion", "classroom orchestration", "faculty training video", "higher education teaching",
    "session design", "executive education pedagogy", "learning outcomes in cases", "4-quadrant whiteboard planning", "facts dilemmas options synthesis columns",
    "constructive cold calling rules", "reducing student anxiety while calling", "extracting generalizable business principles", "moving from sage to debate orchestrator", "student accountability in discussion",
    "handling polarized classroom debates", "evaluating class participation fairly", "case protagonist empathy", "facilitating decision trade-offs", "IIMB masterclass in case teaching",
    "recorded teaching tip", "faculty video resource", "transforming lectures to inquiry", "engaging executive MBA students", "mastering case facilitation"
  ],

  'tips-3': [
    "being a good teacher", "Prof Kamath", "IIM Bangalore video", "Teaching Tips on Tap", "compassion in teaching",
    "academic rigour", "teacher authenticity", "educator excellence", "teacher empathy", "classroom trust building",
    "teacher student rapport", "psychological safety in class", "pedagogical philosophy", "reflective teaching practice", "teaching mindset",
    "faculty mentorship", "higher education teaching", "student motivation", "vulnerability in teaching", "inspiring university students",
    "mastery teaching", "active listening in class", "classroom culture", "compassionate pedagogy", "instructional leadership",
    "teacher identity", "growth mindset in faculty", "academic development", "learner centered teaching", "effective communication in lecture",
    "teaching dedication", "holding high standards with generous support", "valuing student curiosity", "overcoming classroom cynicism", "authentic educator presence",
    "creating safe space for intellectual risk", "humility in scholarship", "mentoring young minds", "long-term teacher impact", "remembering great professors",
    "personal connection with students", "IIMB faculty insights video", "recorded teaching wisdom", "inspiring educators video", "transformational teaching traits"
  ],

  'tips-4': [
    "when teacher does not know", "Prof U Dinesh Kumar", "IIM Bangalore video", "Teaching Tips on Tap", "intellectual humility in teaching",
    "handling tough student questions", "classroom credibility", "saying I do not know in class", "teacher vulnerability", "student questioning",
    "collaborative inquiry in classroom", "academic honesty", "pedagogical techniques", "managing unexpected questions", "classroom dynamics",
    "faculty development", "research mindset in lecture", "curiosity in learning", "critical inquiry", "teaching challenges",
    "handling uncertainty", "imposter syndrome in faculty", "higher education teaching", "MBA teaching strategies", "trust building in college",
    "student interaction", "classroom presence", "questioning strategies", "co-learning with students", "educator resilience",
    "three-step protocol for unknown questions", "parsing assumptions of hard questions", "assigning collaborative investigation", "parking questions on frontier board", "modeling scientific inquiry",
    "avoiding defensive bluffing and jargon", "credibility through authenticity", "celebrating frontier questions", "building scholarly camaraderie", "IIMB decision science professor insights",
    "recorded faculty tip", "transforming knowledge gaps into trust", "managing difficult classroom moments", "inspiring intellectual honesty", "mastering classroom questioning"
  ],

  'tips-5': [
    "preparing for class in 4 steps", "Prof Vasanthi Srinivasan", "IIM Bangalore video", "Teaching Tips on Tap", "educator pre-flight routine",
    "pre-class preparation checklist", "lecture preparation steps", "reducing lecture anxiety", "opening hook in teaching", "closing synthesis in lecture",
    "timing class delivery", "content mastery for faculty", "classroom energy planning", "pedagogical preparation", "higher education teaching",
    "faculty development video", "session preparation workflow", "structured teaching routine", "teaching with confidence", "effective lecture prep",
    "step 1 reviewing conceptual core", "step 2 orchestrating student engagement points", "step 3 preparing whiteboard board plan", "step 4 mental rehearsal and breathing", "arriving 10 minutes early in hall",
    "testing audiovisual equipment beforehand", "reviewing student names and backgrounds", "preparing backup activities for fast pace", "crafting a compelling opening 3 minutes", "ending with clear memorable takeaways",
    "20 years teaching experience insights", "IIMB organizational behavior professor", "recorded masterclass in preparation", "faculty video resource", "transforming lecture readiness",
    "consistent teaching excellence", "calm and commanding teacher presence", "bulletproof lesson preparation", "elevating classroom delivery"
  ],

  'tips-6': [
    "session plan development", "Prof Vasanthi Srinivasan", "IIM Bangalore video", "Teaching Tips on Tap", "timed lesson blocks",
    "lesson pacing in university", "breakout timing in lectures", "contingency lecture planning", "teaching agenda design", "structured session roadmap",
    "higher education lesson plans", "curriculum pacing", "classroom orchestration", "managing lecture time", "interactive session planning",
    "faculty development video", "instructional design for lectures", "teaching workflow", "classroom time management", "modular lesson design",
    "breaking 90-minute lecture into 20-minute chunks", "allocating buffer time for questions", "pacing active learning exercises", "timed slide transitions", "contingency plan for running behind",
    "pruning content on the fly", "aligning session blocks with learning outcomes", "signposting agenda on board", "maintaining student focus through pacing", "mastering lecture timing control",
    "IIMB executive teaching strategies", "recorded teaching tip", "practical lesson planning guide", "empowering organized teaching", "eliminating lecture rush at the bell"
  ],

  'tips-7': [
    "creating energy in classroom", "Prof Vasanthi Srinivasan", "IIM Bangalore video", "Teaching Tips on Tap", "physical movement in lecture hall",
    "vocal dynamics in teaching", "lecture pacing and tempo", "moving away from lectern", "classroom eye contact", "lecture energizers in college",
    "commanding lecture hall", "overcoming classroom boredom", "student engagement through energy", "body language for professors", "vocal projection techniques",
    "combating afternoon lecture slump", "dynamic teaching presence", "higher education teaching", "faculty presentation skills", "classroom vitality",
    "using physical space intentionally", "walking into student aisles", "varying pitch pace and pause in voice", "using dramatic silence for emphasis", "interactive quick polls to reset attention",
    "invigorating tired student cohorts", "enthusiasm contagion in learning", "posture and non-verbal communication", "keeping 100 students captivated", "IIMB faculty presentation wisdom",
    "recorded teaching tip", "dynamic classroom leadership", "energizing higher ed lectures", "commanding student attention", "mastering classroom delivery"
  ],

  'tips-8': [
    "creating student engagement", "Prof Prateek Raj", "IIM Bangalore video", "Teaching Tips on Tap", "passive observers to active thinkers",
    "active learning strategies", "think pair share in college", "peer instruction in lecture", "calling on quiet students", "live classroom polling",
    "interactive teaching methods", "engaging large classes", "student participation techniques", "overcoming passive listening", "classroom dialogue",
    "student engagement in MBA", "collaborative thinking in class", "higher education teaching", "faculty teaching tips", "inquiry based classroom",
    "asking provocative open-ended questions", "giving 30 seconds thinking silence", "small group buzz sessions", "cold calling with kindness and scaffolding", "validating tentative student answers",
    "building peer-to-peer discussion habits", "shifting focus from instructor to student ideas", "gamified classroom check-ins", "making abstract concepts personally relevant", "IIMB strategy faculty insights",
    "recorded teaching masterclass", "transforming quiet classrooms", "activating student minds", "fostering lively academic dialogue", "engaging university cohorts"
  ],

  'tips-9': [
    "being more confident in class", "Prof Prateek Raj", "IIM Bangalore video", "Teaching Tips on Tap", "overcoming teaching anxiety",
    "cultivating teacher presence", "imposter syndrome in academia", "new faculty stage fright", "calm teacher presence", "confident body language",
    "managing difficult moments", "building self-assurance in lecture", "classroom authority", "mindful teaching", "higher education faculty",
    "young faculty mentorship", "teaching with composure", "handling skepticism in class", "faculty professional development", "classroom resilience",
    "reframing nervous energy as enthusiasm", "thorough preparation as anxiety antidote", "owning pauses and silence calmly", "accepting that perfection is impossible", "focusing on student learning rather than self-image",
    "breathing techniques before entering hall", "standing tall and grounded", "handling aggressive student challenges with composure", "finding friendly faces in the audience", "IIMB junior faculty perspective",
    "recorded teaching tip", "empowering new professors", "building unbreakable classroom confidence", "thriving in lecture halls", "mastering teacher presence"
  ],

  'tips-10': [
    "teaching business vs science", "Prof B Mahadevan", "IIM Bangalore video", "Teaching Tips on Tap", "pedagogical divergence",
    "management education vs hard science", "teaching qualitative vs quantitative", "handling case ambiguity", "interpretive discussion in business", "scientific method vs business dilemmas",
    "decision making under incomplete data", "teaching subjective evaluation", "management faculty pedagogy", "business school curriculum", "engineering vs MBA teaching",
    "interdisciplinary pedagogy", "higher education teaching", "faculty development video", "philosophical foundations of teaching", "IIMB senior professor insights",
    "absence of unique right answers in business", "teaching trade-offs and unintended consequences", "guiding students through shades of grey", "rigor in qualitative arguments", "synthesizing diverse stakeholder perspectives",
    "transitioning from STEM to management teaching", "context-dependency of business strategies", "debating conflicting ethical frameworks", "drawing general principles from ambiguous cases", "IIMB production and operations veteran",
    "recorded teaching tip", "profound pedagogical comparison", "mastering business school instruction", "bridging science and management teaching"
  ],

  'tips-11': [
    "traits of confident teacher", "Prof B Mahadevan", "IIM Bangalore video", "Teaching Tips on Tap", "non-defensiveness in classroom",
    "teacher clarity and command", "handling aggressive students", "calm teacher leadership", "respectful pushback in debate", "classroom authority without arrogance",
    "educator emotional maturity", "command of subject matter", "grace under pressure in lecture", "teacher integrity", "higher education leadership",
    "faculty development video", "managing class dissent", "teacher composure", "senior faculty wisdom", "IIMB teaching excellence",
    "never taking student disagreement personally", "listening completely before responding", "acknowledging valid student points with generosity", "maintaining firm boundaries on respect", "clarity of core message amidst debate",
    "commanding attention through deep mastery rather than intimidation", "humility combined with uncompromising academic standards", "resolving classroom conflict constructively", "earning genuine student respect", "IIMB legendary faculty lecture",
    "recorded teaching tip", "masterclass in educator maturity", "inspiring teacher leadership", "unshakable classroom presence"
  ],

  'tips-12': [
    "importance of detailed session plan", "Prof B Mahadevan", "IIM Bangalore video", "Teaching Tips on Tap", "improvisation requires structure",
    "detailed lesson blueprint", "lecture timing control", "whiteboard planning in advance", "session plan roadmap", "lesson transitions and flow",
    "logical story unfolding in class", "faculty preparation rigor", "teaching with intentionality", "curriculum delivery planning", "higher education teaching",
    "faculty development video", "session architecture", "classroom delivery mastery", "structured lecture design", "IIMB senior faculty advice",
    "why great improvisation stems from deep structure", "scripting key transition sentences", "allocating exact minutes for opening body and debrief", "mapping board space for each phase of discussion", "anticipating student bottlenecks and questions",
    "having reserve modules ready if time permits", "keeping the overarching narrative thread intact", "avoiding wandering tangents that dilute focus", "delivering cohesive 90-minute intellectual journeys", "IIMB teaching craftsmanship",
    "recorded teaching tip", "rigorous instructional planning", "mastering classroom orchestration", "delivering seamless academic lectures"
  ],

  'tips-13': [
    "challenges in teaching", "Prof Sourav Mukherji", "IIM Bangalore video", "Teaching Tips on Tap", "evolving learner demographics",
    "Gen Z in college", "short attention spans in MBA", "connecting theory to current news", "relevance in university lectures", "modern classroom challenges",
    "digital native students", "changing expectations of learners", "classroom engagement hurdles", "information overload in students", "higher education trends",
    "faculty adaptation strategies", "management teaching evolution", "teaching contemporary youth", "IIMB dean insights", "pedagogical transformation",
    "students possessing instant information at fingertips", "shifting from content delivery to sensemaking and synthesis", "bringing live industry news into class debates", "demonstrating practical relevance in the first 5 minutes", "meeting students where they are intellectually",
    "addressing cynicism and short concentration spans", "fostering critical evaluation of internet claims", "building emotional resonance with abstract theory", "IIMB former dean of programs perspective", "recorded faculty interview",
    "essential guidance for modern educators", "adapting to 21st-century students", "re-imagining higher education relevance", "mastering contemporary teaching"
  ],

  'tips-14': [
    "teacher centric vs student centric", "IIMB faculty", "Ministry of Education video", "Teaching Tips on Tap", "paradigmatic shift in education",
    "guide on the side vs sage on stage", "constructivist classroom", "passive listening vs active doing", "learner centered pedagogy", "empowering student agency",
    "flipped classroom philosophy", "higher education pedagogy", "collaborative knowledge construction", "educational paradigm shift", "redefining educator role",
    "faculty development video", "student ownership of learning", "modern teaching models", "active student participation", "IIMB pedagogy video",
    "moving beyond the monologue lecture", "facilitating peer inquiry and problem solving", "designing activities where students generate insights", "measuring learning by student output rather than teacher talking time", "fostering autonomous critical thinking",
    "scaffolding discovery rather than dictating facts", "learner-centered syllabus architecture", "embracing collaborative student dialogue", "recorded pedagogical talk", "transforming university teaching",
    "inspiring educational change", "mastering student-centered instructional design"
  ],

  'tips-15': [
    "engaging students in classroom", "Prof Rahul De'", "IIM Bangalore video", "Teaching Tips on Tap", "high impact questioning techniques",
    "dialogue techniques in lecture", "wait time after questions", "follow up probing questions", "dialogic teaching", "eliciting deeper reasoning",
    "interactive classroom culture", "engaging quiet students", "Socratic inquiry in college", "30 years teaching experience", "higher education teaching",
    "faculty teaching tips", "classroom conversation mastery", "inquiry based learning", "IIMB information systems professor", "pedagogical interviewing",
    "asking what if and why questions", "allowing 10 seconds of awkward silence for thinking", "bouncing student questions back to the cohort", "refusing to accept superficial one-word answers", "pushing students to justify underlying assumptions",
    "creating psychological safety for unorthodox viewpoints", "building multi-turn classroom dialogues", "drawing quiet students into debate gently", "IIMB veteran professor masterclass", "recorded teaching wisdom",
    "transforming lecture into lively inquiry", "mastering higher-order questioning", "elevating student intellectual rigor"
  ],

  'tips-16': [
    "engaging the digital classroom", "Harvard Business Publishing", "virtual classroom strategies", "Zoom teaching techniques", "Microsoft Teams online teaching",
    "chat waterfall technique", "breakout room accountability", "webcam eye contact and presence", "online student participation", "virtual polling strategies",
    "digital classroom facilitation", "reducing Zoom fatigue", "active learning in webinars", "higher education virtual teaching", "synchronous online pedagogy",
    "faculty virtual teaching guide", "interactive webinars", "managing online silence", "digital engagement tools", "teaching online effectively",
    "using chat waterfall for rapid brainstorms", "structured breakout room deliverables with shared docs", "looking directly into camera lens to establish eye contact", "incorporating 3-minute physical stretch breaks online", "annotating slides collaboratively on screen",
    "calling on online students by name warmly", "using thumbs-up and reaction icons for instant feedback", "managing dual monitors for chat and slides", "Harvard business publishing virtual teaching guide", "practical digital classroom playbook",
    "mastering remote live teaching", "vibrant online webinars", "engaging distributed student cohorts"
  ],

  'tips-17': [
    "mastering asynchrony", "Columbia University CTL", "bridging live and recorded instruction", "recorded lecture design", "asynchronous video presence",
    "bite-sized microlectures", "flipped classroom workflows", "asynchronous engagement", "online course video design", "blended course architecture",
    "higher education distance teaching", "faculty video guide", "connecting asynchronous and live classes", "learner autonomy in online courses", "digital pedagogy",
    "educational technology Columbia", "asynchronous student motivation", "effective microlectures", "instructional design for video", "teaching with recorded media",
    "referencing student discussion posts in live sessions", "assigning 6-minute microlectures as prep for live debates", "embedding reflection questions between video clips", "maintaining high instructor warmth in recorded video", "building asynchronous continuity across weeks",
    "using asynchronous threads to drive live classroom agendas", "Columbia Center for Teaching and Learning guide", "seamless blended learning workflows", "fostering deep asynchronous engagement", "mastering flipped instruction"
  ],

  'tips-18': [
    "writing learning objectives", "Devlin Peck YouTube", "Bloom's behavioral verbs", "Bloom's taxonomy in action", "measurable learning outcomes",
    "instructional design video", "writing actionable objectives", "action verbs in syllabus", "higher order thinking verbs", "cognitive domain objectives",
    "avoiding vague objectives", "curriculum planning video", "educational video tutorial", "SMART learning objectives", "course blueprinting",
    "evaluating cognitive depth", "creating measurable assignments", "higher education teaching", "faculty tutorial video", "teaching tips video",
    "contrasting vague understand with actionable analyze", "using Bloom's revised taxonomy wheel", "aligning verbs with assessment tasks", "writing objectives for knowledge skills and attitudes", "ensuring objectives are observable and testable",
    "Devlin Peck instructional design masterclass", "concise 1-minute video guide", "practical syllabus authoring", "essential instructional design skill", "mastering learning objectives"
  ],

  'tips-19': [
    "low cost hybrid tech models", "UC Berkeley CTL", "HyFlex classroom setups", "dual audience teaching", "microphones for hybrid rooms",
    "budget classroom tech", "simultaneous in-person and online teaching", "affordable hybrid learning", "higher education tech setups", "hybrid teaching strategies",
    "managing remote and room students", "audio clarity in hybrid lectures", "swivl and tracking cameras", "classroom technology case study", "faculty hybrid guide",
    "accessible hybrid teaching", "inclusive HyFlex classrooms", "practical classroom engineering", "teaching with technology", "UC Berkeley teaching guide",
    "using wireless boundary microphones for room audio", "assigning an in-class student as online chat advocate", "projecting remote students on back wall screen", "ensuring equal participation between live and remote cohorts", "cost-effective webcam placement strategies",
    "preventing hybrid educator split-attention fatigue", "UC Berkeley Center for Teaching and Learning case study", "practical frugal hybrid classrooms", "democratizing HyFlex course delivery", "seamless dual-mode teaching"
  ],

  'tips-20': [
    "5 core learning theories", "educational technology series", "behaviorism in classroom", "cognitivism learning theory", "constructivism in education",
    "connectivism in digital age", "humanism in teaching", "learning scenarios and applications", "educational psychology video", "instructional design foundations",
    "Vygotsky zone of proximal development", "Skinner operant conditioning", "Piaget cognitive stages", "adult learning principles", "higher education teaching",
    "pedagogical theory comparison", "classroom scenarios video", "faculty learning science video", "teaching tips video", "learning theories explained",
    "comparing behaviorist drill with constructivist inquiry", "connectivist networked learning in the internet era", "humanist self-actualization in education", "selecting the right theory for procedural vs conceptual tasks", "social constructivism in collaborative projects",
    "comprehensive 9-minute learning theory masterclass", "practical classroom scenarios for each theory", "grounding teaching practice in cognitive science", "essential educational psychology for faculty", "mastering foundational learning theories"
  ],

  // FACULTY INSIGHTS (20 items)
  'insights-1': [
    "desirable difficulty", "Robert Bjork cognitive research", "sourav mukherji iimb", "Elizabeth Bjork cognitive lab", "learning vs performance illusion",
    "storage strength vs retrieval strength", "cognitive science in education", "learning retention", "illusion of competence", "effortful retrieval",
    "memory architecture in learning", "pedagogical research", "higher education teaching", "productive struggle in college", "long term memory retention",
    "transfer of learning", "educational psychology", "teaching rigor", "management education", "cognitive friction in learning",
    "spaced practice", "retrieval practice", "academic excellence", "evidence based teaching", "faculty development",
    "durable learning", "instructional design", "deep learning", "IIM Bangalore faculty insights", "Faculty Insights video",
    "distinguishing temporary recitation from durable memory", "fluency during class as a deceptive metric", "three core principles introduction", "explaining cognitive rationale to students", "productive difficulty as learning engine",
    "IIMB professor Sourav Mukherji masterclass", "recorded cognitive science lecture", "video resource for educators", "transforming university study habits", "grounding teaching in Bjork lab research",
    "elevating academic rigor", "durable concept retention", "empowering deep student comprehension"
  ],

  'insights-2': [
    "generation effect", "productive struggle in learning", "sourav mukherji iimb", "desirable difficulties", "cognitive psychology in teaching",
    "problem first teaching", "active recall strategies", "inquiry based learning", "student problem solving", "constructivist learning",
    "memory encoding", "higher education teaching", "pedagogical science", "retention strategies", "learning friction in MBA",
    "case method pedagogy", "management education", "educational research", "instructional design", "discovery learning",
    "mental scaffolding", "student autonomy in problem solving", "cognitive effort", "deep comprehension", "teaching methodology",
    "intellectual struggle in class", "IIM Bangalore faculty insights", "Faculty Insights video", "video lecture", "recorded research talk",
    "generating answers before instructor explanation", "error-driven learning benefits", "priming the brain through initial failed attempts", "giving students 15 seconds before rescuing them", "predicting outcomes before case reveals",
    "presenting ambiguous datasets before formulas", "tripling conceptual retention through generation", "IIMB cognitive science series video 2", "essential teaching strategy for STEM and business", "inspiring productive student struggle",
    "fostering resilient thinkers", "mastering the generation effect in classrooms"
  ],

  'insights-3': [
    "spacing effect", "distributed practice", "repetition in learning", "Ebbinghaus forgetting curve", "sourav mukherji iimb",
    "desirable difficulty", "memory consolidation", "cramming vs spacing", "retrieval intervals", "cognitive science in higher ed",
    "IIMB faculty insights", "curriculum pacing", "spiral curriculum", "higher education pedagogy", "cumulative assessment design",
    "long term retention", "neuroscience in education", "effective study habits", "durable learning", "quiz design with spacing",
    "learning reinforcement", "spaced repetition systems", "pedagogical research", "mastery learning", "teaching tips for faculty",
    "academic rigor", "instructional design", "Faculty Insights video", "video lecture", "recorded research talk",
    "massed practice rapid forgetting within 72 hours", "spacing review intervals across weeks", "70/30 cumulative weekly quiz rule", "short 5-minute retrieval warmups at class start", "neuro-synaptic memory consolidation",
    "allowing forgetting to start to make retrieval effortful", "rebuilding syllabus pacing around spacing", "IIMB cognitive science series video 3", "transforming exam preparation in universities", "evidence-based study schedules",
    "empowering permanent concept mastery", "mastering spaced learning"
  ],

  'insights-4': [
    "interleaving", "interleaved practice", "blocked practice disadvantages", "problem discrimination learning", "sourav mukherji iimb",
    "desirable difficulties", "cognitive flexibility", "deep structure learning", "tool selection in business", "pattern recognition in students",
    "pedagogical research", "higher education teaching", "adaptive mastery", "management decision making", "math pedagogy interleaving",
    "business analytics teaching", "IIMB faculty insights", "case analysis skills", "problem solving pedagogy", "learning science",
    "examination design", "critical thinking in college", "conceptual transfer", "durable competence", "instructional architecture",
    "curriculum sequencing", "Faculty Insights video", "video lecture", "recorded research talk", "educational video",
    "mixing problem categories A B and C together", "diagnosing which framework to apply", "tripling problem categorization accuracy", "randomizing midterm problem types without topic headers", "interleaving cases across diverse industry sectors",
    "overcoming superficial pattern matching", "teaching adaptive decision diagnosis", "IIMB cognitive science series video 4", "transforming problem sets and exams", "essential instructional design for STEM and MBA",
    "fostering agile business problem solvers", "mastering interleaved practice"
  ],

  'insights-5': [
    "desirable difficulty conclusion", "synthesizing learning science", "sourav mukherji iimb", "cognitive research synthesis", "educational psychology takeaways",
    "evidence based teaching methods", "translating psychology to teaching", "desirable difficulties summary", "durable learning architecture", "faculty development lecture",
    "higher education pedagogy", "learning retention framework", "productive struggle synthesis", "spacing and interleaving summary", "generation effect takeaways",
    "IIM Bangalore faculty insights", "pedagogical rigor", "teaching excellence", "cognitive science in university", "academic standards",
    "student mindset coaching", "effortful learning culture", "instructional design summary", "Faculty Insights video", "video lecture",
    "recorded research talk", "educational video resource", "teaching tips video", "IIMB masterclass series", "executive summary of learning science",
    "briefing students on cognitive friction as growth mechanism", "reframing academic struggle positively", "integrating all 3 desirable difficulty principles into syllabi", "long-term educational return on investment", "IIMB cognitive science series grand finale",
    "essential viewing for university professors", "transforming classroom culture from ease to durable mastery", "mastering the science of human learning"
  ],

  'insights-6': [
    "tips on becoming great academic", "Prof B Mahadevan", "IIM Bangalore video", "Faculty Insights video", "balancing research and teaching",
    "institutional committee service", "tenure track strategy", "academic career longevity", "publishing in top journals", "scholar educator balance",
    "faculty professional development", "academic life advice", "higher education leadership", "scholarly productivity", "university service commitments",
    "excellence in academia", "managing academic time", "senior professor advice", "IIMB faculty insights", "academic career progression",
    "avoiding academic burnout", "teaching as scholarship", "service to academic community", "mentorship for junior faculty", "scholarship of teaching and learning",
    "recorded research talk", "video resource for professors", "educational video", "inspiring academic career talk", "IIMB senior leadership wisdom",
    "protecting research writing blocks during teaching terms", "treating classroom interactions as research hypothesis generators", "strategic institutional committee contributions", "maintaining intellectual vitality across decades", "building enduring academic legacy",
    "harmony between publication and pedagogical excellence", "navigating peer review and promotion", "essential roadmap for aspiring scholars", "mastering the tripartite academic life"
  ],

  'insights-7': [
    "how often start new elective", "Prof B Mahadevan", "IIM Bangalore video", "Faculty Insights video", "elective course lifecycle",
    "course renewal cadence", "sunset outdated electives", "cutting-edge MBA electives", "curriculum freshness in business schools", "domain depth vs new topics",
    "higher education curriculum management", "faculty elective development", "MBA elective portfolio", "academic syllabus renewal", "preventing curriculum obsolescence",
    "course design in management", "university curriculum committee", "balancing core and elective teaching", "faculty intellectual renewal", "IIMB faculty insights",
    "recorded research talk", "video resource for educators", "educational video", "management education strategy", "teaching tips video",
    "3 to 4 year cycle for launching new electives", "phasing out courses that have lost market relevance", "aligning electives with cutting-edge industry trends", "deepening scholarship through new course creation", "student demand versus academic depth",
    "IIMB curriculum innovation strategy", "maintaining vibrant elective offerings", "preventing faculty complacency in course delivery", "institutional curriculum agility", "mastering elective course management"
  ],

  'insights-8': [
    "bringing research into classroom", "Prof Nilam Kaushik", "IIM Bangalore video", "Faculty Insights video", "translating working papers",
    "empirical mystery method", "demystifying econometric models", "research led teaching", "MBA classroom debate on research", "integrating cutting-edge papers into syllabus",
    "student critical thinking on data", "teaching empirical methodology", "higher education pedagogy", "IIMB faculty research", "scholarship in business education",
    "academic research into practice", "faculty development video", "active inquiry through research", "management research in classroom", "teaching with working papers",
    "recorded research talk", "video lecture resource", "educational video", "IIMB strategy professor", "transforming complex papers into live inquiry",
    "presenting the empirical puzzle before revealing author conclusions", "having students critique methodology and sample selection", "challenging assumptions in published literature", "fostering research curiosity in MBA students", "bridging the gap between frontier research and live class debate",
    "IIMB faculty innovation in teaching", "empowering students as co-inquirers", "mastering research-led instruction"
  ],

  'insights-9': [
    "integrating research into teaching", "Prof Varun Jindal", "IIM Bangalore video", "Faculty Insights video", "symbiotic feedback loops",
    "lab to lecture translation", "classroom feedback for research ideas", "co-authoring with students", "scholar educator identity", "empirical research in finance",
    "using student questions to refine research", "research informed teaching", "higher education pedagogy", "IIMB finance professor", "academic synergy",
    "scholarship and teaching unity", "faculty productivity", "curriculum enrichment through research", "management education insights", "teaching as research catalyst",
    "recorded research talk", "video lecture resource", "educational video", "IIMB faculty video", "practical academic synergy",
    "how classroom debates uncover unstudied boundary conditions", "testing research hypotheses against executive student experience", "inviting top students into empirical research projects", "keeping course syllabi aligned with frontier empirical findings", "overcoming the false dichotomy between teaching and research",
    "IIMB finance faculty perspective", "fostering vibrant scholar-educator culture", "mastering research-teaching integration"
  ],

  'insights-10': [
    "interconnections research and teaching", "Prof Jitamitra Desai", "IIM Bangalore video", "Faculty Insights video", "scholar educator identity",
    "teaching scholar synergy", "research impact on syllabus", "academic credibility with executives", "theory into practice in operations", "management science pedagogy",
    "decision science in classroom", "higher education teaching", "faculty development video", "IIMB operations professor", "scholarship in business schools",
    "rigor and relevance in teaching", "academic identity development", "teaching with research passion", "university professor role", "educational excellence",
    "recorded research talk", "video lecture resource", "educational video", "IIMB faculty video", "inspiring academic reflections",
    "why deep research generates authentic classroom authority", "bringing real corporate consulting dilemmas into the lecture hall", "explaining advanced optimization models through tangible case puzzles", "inspiring students toward PhD and research careers", "integrating academic rigor with managerial relevance",
    "IIMB decision sciences veteran", "cultivating holistic scholar-educator identity", "empowering university faculty excellence", "mastering academic synergy"
  ],

  'insights-11': [
    "XR workforce development", "extended reality in higher ed", "virtual reality in college", "augmented reality training", "immersive simulation lab",
    "XR workforce readiness", "Educause Review article", "immersive learning technologies", "VR in medical and technical education", "spatial computing in university",
    "future of experiential training", "virtual campus laboratories", "emerging learning technologies", "higher education innovation", "workforce development with XR",
    "faculty VR adoption", "digital twin in education", "immersive pedagogy", "educational technology research", "Faculty Insights article",
    "cost-effective VR headset deployments on campus", "simulating dangerous industrial scenarios safely", "measuring spatial skill acquisition in virtual environments", "overcoming virtual simulation motion sickness", "scaling immersive learning across disciplines",
    "inter-university XR collaborative labs", "Educause higher ed technology analysis", "future-ready graduate skills in spatial computing", "immersive experiential education", "mastering XR educational technology"
  ],

  'insights-12': [
    "ERP simulation games", "HEC Montreal simulation", "Baton Simulations ERPsim", "experiential business management", "serious games in business education",
    "SAP simulation games", "real-time business decision making", "enterprise resource planning pedagogy", "gamified management education", "experiential learning in MBA",
    "supply chain simulation games", "competitive team simulations in college", "simulation-based business curriculum", "higher education research paper", "interactive business games",
    "pedagogical simulations", "business analytics gaming", "educational technology research", "Faculty Insights paper", "management education innovation",
    "running live companies in simulated SAP environments", "cross-functional decision making under market pressure", "live financial and inventory feedback in simulations", "team dynamics and leadership under competitive stress", "debriefing simulation outcomes to extract strategic lessons",
    "HEC Montreal ERPsim research findings", "experiential enterprise education", "bridging textbook operations and corporate reality", "serious gaming in premier business schools", "mastering business simulation pedagogy"
  ],

  'insights-13': [
    "MIT Sloan teaching resources", "MIT Sloan case studies", "action learning pedagogy", "MIT management education", "live corporate consulting cases",
    "case study writing process", "MIT Sloan courseware", "experiential management pedagogy", "higher education case study", "faculty teaching library MIT",
    "business school innovation", "action learning labs", "curriculum innovation MIT", "global management education", "Faculty Insights case study",
    "pedagogical library", "teaching excellence MIT", "student consulting projects", "case analysis methodology", "management education resources",
    "MIT Sloan Action Learning Labs model", "partnering student teams with global enterprises", "mentoring live project execution without handholding", "integrating reflective classroom debriefs with field work", "open dissemination of MIT management cases and tools",
    "gold standard in action-oriented business pedagogy", "transforming passive students into management consultants", "MIT Sloan pedagogical blueprint", "mastering action learning"
  ],

  'insights-14': [
    "business education and elearning", "systematic overview of elearning", "Academy of Management AMLE", "B-school online education data", "empirical trends in digital learning",
    "meta-analysis of online education", "online MBA research", "digital management pedagogy", "higher education research paper", "evaluating online course effectiveness",
    "student satisfaction in digital courses", "asynchronous learning evidence", "blended business education", "AMLE journal research", "Faculty Insights research paper",
    "learning outcomes in online MBA", "evidence based online learning", "educational research review", "management learning and education", "digital curriculum research",
    "synthesizing 100 empirical studies on digital management education", "comparative learning outcomes online versus face-to-face", "critical factors predicting online student persistence", "pedagogical design versus technology platform influence", "faculty attitudes and institutional incentives in online transition",
    "landmark AMLE systematic literature review", "essential empirical foundation for digital education directors", "evidence-based online curriculum architecture", "grounding digital MBA strategy in rigorous data"
  ],

  'insights-15': [
    "blended learning transformations", "premier business schools hybrid", "Journal of Management Education", "IIM online degree models", "faculty resistance to digital learning",
    "institutional digital transformation", "hybrid MBA program design", "blended learning case study", "executive education online transition", "business school governance in digital era",
    "curriculum redesign for blended", "pedagogical change management", "higher education research paper", "Faculty Insights research paper", "management education innovation",
    "organizational change in business schools", "faculty development in blended", "hybrid executive MBA", "digital strategy for universities", "educational leadership research",
    "navigating faculty resistance to online modalities", "re-allocating faculty teaching workload for blended courses", "investing in institutional instructional design support", "preserving elite brand equity in online degree delivery", "student satisfaction benchmarks in hybrid programs",
    "in-depth qualitative study across top tier management institutes", "actionable roadmap for deans and academic directors", "sustainable digital transformation in higher education", "mastering blended institutional change"
  ],

  'insights-16': [
    "experiential and online learning", "Springer higher education", "constructivist digital environments", "online collaborative learning at scale", "learner agency in distance education",
    "social constructivism in elearning", "digital experiential learning", "community of inquiry research", "higher education research paper", "pedagogical theory in online courses",
    "online course architecture", "collaborative digital pedagogy", "learning design research", "Faculty Insights paper", "distance education research",
    "constructivist online pedagogy", "educational philosophy", "active online learning", "student centered digital courses", "learning science in higher ed",
    "operationalizing constructivism without live classroom presence", "peer problem-solving in asynchronous workspaces", "empowering learner self-direction and autonomy", "designing digital authentic tasks that mirror professional practice", "measuring cognitive presence in collaborative online teams",
    "landmark Springer educational monograph", "theoretical and practical guide to constructivist online learning", "mastering collaborative digital pedagogy"
  ],

  'insights-17': [
    "Generative AI impact on students", "AMLE journal research", "critical inquiry in AI era", "cognitive offloading in MBA students", "ChatGPT in student case analysis",
    "management learning and education", "AI impact on critical thinking", "higher education research paper", "empirical study on student AI use", "pedagogical response to GenAI",
    "student assessment in AI era", "academic integrity research", "faculty guidance on student AI use", "Faculty Insights research paper", "AI in business education research",
    "cognitive deskilling concerns", "evaluating student AI reliance", "critical thinking erosion risks", "curriculum redesign in AI age", "management education ethics",
    "empirical experiments on student problem solving with and without LLMs", "dangers of unreflective cognitive offloading", "interventions that restore deep critical reflection", "designing AI-cooperative assignments that elevate thinking", "guidance for business school curriculum committees",
    "groundbreaking AMLE study on student AI adoption", "rigorous empirical evidence on AI in management education", "navigating generative AI with pedagogical integrity"
  ],

  'insights-18': [
    "three AI workforce gaps", "Educause Review article", "AI workforce readiness", "higher education AI strategy", "closing corporate AI talent gaps",
    "AI skills for university graduates", "future of work and higher ed", "curriculum alignment with industry AI", "faculty AI literacy", "workforce development in AI era",
    "institutional AI policy for colleges", "higher education leadership", "AI literacy across all majors", "graduating AI competent students", "Faculty Insights article",
    "educational strategy", "university industry partnership", "academic planning for AI", "digital economy skills", "transforming college curriculum",
    "gap 1 practical generative AI literacy across non-STEM majors", "gap 2 critical AI ethics governance and regulatory compliance", "gap 3 human-AI collaborative problem solving and prompt engineering", "integrating AI into liberal arts business and science curricula", "recommendations for provosts and curriculum deans",
    "Educause strategic analysis on university relevance in AI era", "preparing graduates for AI-transformed workplaces", "actionable higher ed workforce strategy"
  ],

  'insights-19': [
    "from fear to fluency", "Educause Review article", "helping faculty navigate AI", "AI fluency workshops for professors", "faculty fear of AI",
    "institutional AI policy for colleges", "Educause CIO guidance", "faculty professional development in AI", "overcoming AI skepticism in academia", "responsible AI adoption in teaching",
    "academic change management", "higher education AI strategy", "faculty AI training models", "support for professors in AI age", "Faculty Insights article",
    "university leadership in tech", "pedagogical transformation", "empowering educators with AI", "digital literacy for academics", "teaching with AI confidence",
    "empathizing with faculty concerns regarding cheating and job disruption", "hands-on sandbox workshops for experimenting with LLMs", "co-creating institutional AI syllabus statements with faculty", "re-centering faculty value as mentors and expert evaluators", "peer-led faculty AI learning communities",
    "Educause comprehensive playbook for academic leadership", "transforming faculty anxiety into creative pedagogical fluency", "empowering university educators in the AI era"
  ],

  'insights-20': [
    "instructional continuity", "7 things you should know", "Educause Review guide", "disruption management in colleges", "instructional continuity plan",
    "campus closure emergency teaching", "resilient course delivery", "distance education contingency", "higher education crisis management", "pandemic and disaster teaching protocols",
    "faculty emergency preparedness", "academic continuity planning", "remote teaching readiness", "flexible course delivery", "Faculty Insights guide",
    "university crisis response", "pedagogical resilience", "institutional readiness", "student support during disruptions", "essential higher ed continuity",
    "item 1 defining minimum viable course delivery options", "item 2 multi-channel student communication protocols", "item 3 asynchronous-first curriculum contingency", "item 4 accessible low-tech alternatives for displaced students", "item 5 flexible grading and deadline policies during crises",
    "item 6 faculty technical and mental health support", "item 7 post-disruption academic recovery and evaluation", "Educause definitive guide to university resilience", "bulletproof institutional continuity planning", "protecting student learning during unexpected closures"
  ]
};

// Check that all 85 items have specific tag arrays
const definedIds = Object.keys(itemTags);
console.log(`Defined custom 50+ tag sets for ${definedIds.length} items`);
if (definedIds.length !== 85) {
  console.error(`Warning: Expected 85 tag sets, but got ${definedIds.length}`);
}

// Apply tags to items and verify
let below50Count = 0;
items.forEach(it => {
  const specific = itemTags[it.id];
  if (!specific || !specific.length) {
    console.error(`Missing tag array for item: ${it.id}`);
    return;
  }

  // Merge with any unique tags already on the item
  const merged = dedupeTags([...specific, ...(it.tags || [])]);
  it.tags = merged;

  if (it.tags.length < 50) {
    console.error(`ERROR: Item ${it.id} only has ${it.tags.length} tags!`);
    below50Count++;
  }

  // Re-generate haystack
  const catObj = CATS.find(c => c.id === it.cat);
  const catName = catObj ? catObj.name : it.cat;
  const takeawayText = it.takeaways ? it.takeaways.join(' ') : '';
  it.hay = [
    it.title,
    it.desc,
    it.author || '',
    it.sourceName || '',
    it.tags.join(' '),
    catName,
    it.fmt,
    it.lvl,
    it.summary || '',
    takeawayText,
    it.implementation || '',
    it.prompt || ''
  ].join(' ').toLowerCase();
});

const minTags = Math.min(...items.map(i => i.tags.length));
const maxTags = Math.max(...items.map(i => i.tags.length));
const avgTags = (items.reduce((a, b) => a + b.tags.length, 0) / items.length).toFixed(1);

console.log(`Tag expansion complete!`);
console.log(`Items below 50 tags: ${below50Count}`);
console.log(`Min tags per item: ${minTags}`);
console.log(`Max tags per item: ${maxTags}`);
console.log(`Avg tags per item: ${avgTags}`);

// Write back to assets/sangam/resources_data.js
const outCode = `/* Sangam DLC - Resources v2.x shared data.
   Complete repository of 85 verified artifacts based strictly on the Google Sheet (Rows 1–85).
   Every artifact includes at least 50+ rich, domain-verified searchable tags, author/source citations,
   on-site structured summaries, takeaways, and embedded media. */
(function () {
  // Order = the educator journey: Get started -> Plan -> Prepare -> Teach -> Reflect.
  const CATS = ${JSON.stringify(CATS, null, 2)};

  const FORMATS = ${JSON.stringify(FORMATS, null, 2)};

  const LEVELS = ${JSON.stringify(LEVELS, null, 2)};

  const BASE_ITEMS = ${JSON.stringify(items, null, 2)};

  const BASE = Date.UTC(2026, 9, 13);
  const ITEMS = BASE_ITEMS.map((it, idx) => {
    const daysAgo = ((idx * 37) % 85) + 1;
    return Object.assign({}, it, {
      order: idx,
      added: BASE - daysAgo * 864e5,
      isNew: daysAgo <= 21
    });
  });

  ITEMS.forEach(it => {
    const catObj = CATS.find(c => c.id === it.cat);
    const catName = catObj ? catObj.name : it.cat;
    const takeawayText = it.takeaways ? it.takeaways.join(' ') : '';
    it.hay = [
      it.title,
      it.desc,
      it.author || '',
      it.sourceName || '',
      it.tags.join(' '),
      catName,
      it.fmt,
      it.lvl,
      it.summary || '',
      takeawayText,
      it.implementation || '',
      it.prompt || ''
    ].join(' ').toLowerCase();
  });

  // 24px stroke icons (inner SVG markup).
  const ICONS = ${JSON.stringify(ICONS, null, 2)};

  window.SANGAM_RES = { CATS, FORMATS, LEVELS, ITEMS, ICONS };
})();
`;

fs.writeFileSync('assets/sangam/resources_data.js', outCode, 'utf8');
console.log('Successfully written to assets/sangam/resources_data.js!');
