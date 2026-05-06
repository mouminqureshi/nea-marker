import { useState, useCallback, useRef, useEffect } from "react";

// ─── Criteria metadata ────────────────────────────────────────────────────────

const CRITERIA_META = [
  { code: "1.1",  name: "Investigation of needs & research",  available: 8,  maxLevel: 3, section: "Investigate" },
  { code: "1.2",  name: "Specification",                       available: 8,  maxLevel: 3, section: "Investigate" },
  { code: "2.1",  name: "Design ideas",                        available: 8,  maxLevel: 3, section: "Design"      },
  { code: "2.2",  name: "Review of initial ideas",             available: 8,  maxLevel: 3, section: "Design"      },
  { code: "2.3",  name: "Development into chosen design",      available: 12, maxLevel: 4, section: "Design"      },
  { code: "2.4",  name: "Communication of design ideas",       available: 8,  maxLevel: 3, section: "Design"      },
  { code: "2.5",  name: "Review of chosen design",             available: 6,  maxLevel: 3, section: "Design"      },
  { code: "3.1a", name: "Selection of materials",              available: 8,  maxLevel: 3, section: "Make"        },
  { code: "3.1b", name: "Skills and processes",                available: 16, maxLevel: 4, section: "Make"        },
  { code: "3.2",  name: "Quality and accuracy",                available: 12, maxLevel: 4, section: "Make"        },
  { code: "4.1",  name: "Testing and evaluation",              available: 6,  maxLevel: 3, section: "Evaluate"    },
];

const META_MAP = Object.fromEntries(CRITERIA_META.map(m => [m.code, m]));

// ─── Seed calibration data (moderator-verified from two portfolios) ───────────

const SEED_EXAMPLES = [
  {
    portfolioName: "Folder 2 — Travel Storage Cart",
    contextualChallenge: "How can products be used to meet the storage needs of people that are travelling?",
    savedAt: "2024-01-01T00:00:00.000Z",
    seeded: true,
    corrections: [
      {
        code: "1.1",
        name: "Investigation of needs & research",
        available: 8,
        aiMark: 5,
        aiLevel: 2,
        correctMark: 7,
        correctLevel: 3,
        reason: "Do not under-credit investigation breadth when conclusions are thin. The who/what/where/when/how/why analysis, two structured product analyses covering form AND function, current trends page with named companies, and materials research together constitute a developed investigation. A weak conclusion does not prevent Level 3 if the body of research itself is substantive and contextually justified. Weigh the totality — don't penalise thin conclusions if research pages are developed.",
      },
      {
        code: "2.1",
        name: "Design ideas",
        available: 8,
        aiMark: 5,
        aiLevel: 2,
        correctMark: 4,
        correctLevel: 1,
        reason: "Be stricter when all design ideas are conceptual variations of the same basic form (box on four wheels). All four ideas share the same fundamental structure — this is NOT a wide range. Conceptual sameness must be penalised even when annotation quality is reasonable. Do not over-credit because ideas look different superficially if the underlying concept is identical.",
      },
      {
        code: "2.3",
        name: "Development into chosen design",
        available: 12,
        aiMark: 5,
        aiLevel: 2,
        correctMark: 9,
        correctLevel: 3,
        reason: "Multiple full-size physical models tested with real items (bags placed in masking-tape outlines, cardboard scale models) carry very significant weight and firmly support Level 3. Do not cap at Level 2 because no formal orthographic drawing exists. Annotated 3D drawings with dimensions PLUS a cutting list can satisfy the third-party interpretable requirement at Level 3. The iterative handle development responding to real problems (handle too large for boot, rod intruding into storage space) with photographic evidence of solutions is genuine Level 3 development.",
      },
      {
        code: "2.5",
        name: "Review of chosen design",
        available: 6,
        aiMark: 2,
        aiLevel: 1,
        correctMark: 3,
        correctLevel: 2,
        reason: "A well-structured spec-checking self-evaluation can still reach the bottom of Level 2 even without external user/client feedback. The absence of client feedback damages the mark but does not automatically collapse it to Level 1 minimum. A comprehensive spec-category review with honest analysis of materials, performance and safety against spec points earns the bottom of Level 2.",
      },
      {
        code: "4.1",
        name: "Testing and evaluation",
        available: 6,
        aiMark: 4,
        aiLevel: 2,
        correctMark: 2,
        correctLevel: 1,
        reason: "Photographs of the product in use (being pulled in a car park) are NOT the same as evidenced testing against measurable criteria. Subjective personal comments ('I find it easy to pull') do not satisfy the measurable criteria requirement. The LCA alone cannot carry the section to Level 2 if the testing is unevidenced and conclusions are purely subjective. Be stricter on 4.1 — photos of use ≠ measured testing.",
      },
    ],
  },
  {
    portfolioName: "Timbers — Desk Organiser",
    contextualChallenge: "How can products be used to improve a teenager's study area at home?",
    savedAt: "2024-01-02T00:00:00.000Z",
    seeded: true,
    corrections: [
      {
        code: "1.1",
        name: "Investigation of needs & research",
        available: 8,
        aiMark: 6,
        aiLevel: 2,
        correctMark: 5,
        correctLevel: 2,
        reason: "Do not be seduced by volume of research activities. A questionnaire with graphs and pie charts is not automatically high Level 2 if the conclusions drawn from it are thin. Annotation depth and quality of analytical links to design requirements matter more than the number of research activities conducted. The mind map jumping straight to 'organiser' without broader contextual exploration, and the materials page reading like a textbook rather than applied research, reduce this to mid Level 2.",
      },
      {
        code: "1.2",
        name: "Specification",
        available: 8,
        aiMark: 6,
        aiLevel: 2,
        correctMark: 5,
        correctLevel: 2,
        reason: "A well-formatted specification table does not compensate for generic, manufacturing-focused, or partially measurable spec points. Many points are not rooted in specific research findings. Generic points like 'shouldn't fall apart' and 'materials should be sustainable' without measurable targets are basic not Level 3. Judge content, not format structure.",
      },
      {
        code: "2.1",
        name: "Design ideas",
        available: 8,
        aiMark: 6,
        aiLevel: 2,
        correctMark: 4,
        correctLevel: 1,
        reason: "No materials reference anywhere in design ideas = cannot reach Level 2. All four designs simply state 'made of hardwood' in the review table — this is not materials knowledge evidenced within the design ideas themselves. A narrow spec produces narrow ideas. Consumer feedback integrated on design pages does not substitute for materials and process depth. CAD on one idea alone does not lift the section to Level 2 when materials knowledge is absent.",
      },
      {
        code: "2.2",
        name: "Review of initial ideas",
        available: 8,
        aiMark: 5,
        aiLevel: 2,
        correctMark: 2,
        correctLevel: 1,
        reason: "CRITICAL: One-line or one-phrase entries in a review table are Level 1 regardless of how many categories are covered. 'This product is durable' and 'made of hardwood' are statements, not analysis. Genuine analysis requires expanded reasoning explaining WHY a spec point is met with reference to the design's specific properties. The absence of a conclusion selecting which design is taken forward and why is a significant omission. No conclusion = max Level 1. Do not reward table structure — reward analytical content.",
      },
      {
        code: "2.5",
        name: "Review of chosen design",
        available: 6,
        aiMark: 4,
        aiLevel: 2,
        correctMark: 1,
        correctLevel: 1,
        reason: "CRITICAL PLACEMENT RULE: The user questionnaire on the final page is post-make evaluation content and belongs in 4.1, NOT 2.5. There is no discrete, explicit 2.5 review section placed before the make in this portfolio. 2.5 must be a clearly labelled section reviewing the chosen/final design against the specification, positioned before the manufacturing section. Post-make user feedback questionnaires must never be credited as satisfying 2.5 regardless of their quality. This is Level 1 (1 mark) because there is no 2.5 content at all.",
      },
      {
        code: "3.1a",
        name: "Selection of materials",
        available: 8,
        aiMark: 6,
        aiLevel: 2,
        correctMark: 3,
        correctLevel: 1,
        reason: "CRITICAL: A demonstrably incorrect material property description is a Level 1 indicator that overrides otherwise reasonable content. Describing acrylic as having 'good drape' and being used for 'sportswear and jackets' are properties of acrylic fibre/fabric, NOT acrylic thermoplastic sheet. This fundamental materials knowledge error — confusing two different materials with the same name — demonstrates limited understanding and collapses the criterion to Level 1. Do NOT average out a serious misconception against other materials being described correctly. One wrong fundamental = Level 1.",
      },
      {
        code: "3.2",
        name: "Quality and accuracy",
        available: 12,
        aiMark: 8,
        aiLevel: 3,
        correctMark: 9,
        correctLevel: 3,
        reason: "Be slightly more generous on 3.2 for demanding, mostly functioning prototypes. A multi-compartment organiser with working drawers, vacuum-formed acrylic tray, dowel-jointed shelves and three coats of varnish is a demanding GCSE product. The clunky proportions from thick timber and the sticking drawer move it to 9 rather than higher, but the overall ambition and functionality clearly supports upper Level 3.",
      },
    ],
  },
];

// ─── Colours ──────────────────────────────────────────────────────────────────

const SECTION_COLORS = {
  Investigate: { bg: "bg-amber-950/40", border: "border-amber-700/40", badge: "bg-amber-900/60 text-amber-300", dot: "bg-amber-400" },
  Design:      { bg: "bg-sky-950/40",   border: "border-sky-700/40",   badge: "bg-sky-900/60 text-sky-300",     dot: "bg-sky-400"   },
  Make:        { bg: "bg-emerald-950/40", border: "border-emerald-700/40", badge: "bg-emerald-900/60 text-emerald-300", dot: "bg-emerald-400" },
  Evaluate:    { bg: "bg-violet-950/40", border: "border-violet-700/40", badge: "bg-violet-900/60 text-violet-300", dot: "bg-violet-400" },
};

const STORAGE_KEY = "nea-calibration-v1";

// ─── Mark scheme prompt ───────────────────────────────────────────────────────

const BASE_PROMPT = `You are an experienced GCSE Pearson Edexcel Design and Technology NEA moderator. Mark the uploaded portfolio using the official assessment criteria and moderator-calibrated rules below.

CRITICAL GENERAL RULES:
- Use "best fit" thinking — don't require perfection to award a level
- Reward depth and quality, not volume of content
- Don't penalise unusual presentation formats if content is strong
- Only mark what is explicitly evidenced — never infer from other sections

SECTION-SPECIFIC MODERATOR RULES:

1.1: Do not be seduced by volume of research activities. Annotation depth and quality of analytical links matter more than how many research activities were conducted. A questionnaire with graphs is not automatically high Level 2 if conclusions drawn are thin. Existing product analysis must reference both form AND function for Level 3. A mind map that is generic and could apply to any challenge is a weakness. Weigh the totality of investigation — a weak conclusion does not prevent Level 3 if the research body itself is substantive and contextually justified.

1.2: Prose specifications are acceptable — judge content not format. A well-formatted table does not compensate for generic, manufacturing-focused, or unmeasurable spec points. Points must be measurable and rooted in specific research findings for Level 3. Generic points like "shouldn't break" without measurable targets are basic not Level 3.

2.1: No materials reference within the design ideas themselves = cannot reach Level 2. Simply writing "hardwood" in a review table does not count — materials knowledge must be evidenced within the design idea annotations. Conceptual sameness between ideas (all being variations of the same basic form) must be penalised even if ideas look superficially different. Consumer feedback on design pages does not substitute for materials/process depth. CAD on one idea alone does not lift to Level 2 if materials knowledge is absent throughout.

2.2: CRITICAL — one-line or one-phrase entries in a review table are Level 1 regardless of how many categories are covered. "This product is durable" is a statement not analysis. Genuine analysis requires expanded reasoning explaining WHY a spec point is met with reference to the design's specific properties. The absence of a conclusion selecting which design is taken forward and why is a significant omission — no conclusion = max Level 1. Integrated consumer feedback from design pages belongs in 2.1, not 2.2. Do not reward table structure; reward analytical content.

2.3: Materials research must compare alternatives and inform decisions to count here — a list of chosen materials only belongs in 3.1a not 2.3. Multiple full-size physical models tested with real items firmly support Level 3. Do not cap at Level 2 simply because there is no formal orthographic drawing — annotated 3D drawings with dimensions PLUS a cutting list can satisfy the third-party interpretable requirement at Level 3.

2.4: Assess only design ideas and development sections. Absence of CAD caps at Level 2.

2.5: CRITICAL PLACEMENT RULE — 2.5 must be a discrete, explicitly labelled review section positioned BEFORE the make/manufacture section. Post-make user questionnaires and evaluation-section feedback belong in 4.1 NOT here. Do not credit post-make content as 2.5 regardless of its quality. Client/user feedback on the chosen design specifically is required to access Level 2. Personal reflections and self-evaluation alone = Level 1 maximum. If there is no clearly placed pre-make review section, this is Level 1.

3.1a: CRITICAL — a demonstrably incorrect material property description is a Level 1 indicator that overrides otherwise reasonable content. One serious materials knowledge error (e.g. confusing acrylic thermoplastic with acrylic fabric, or describing incorrect properties for a material) collapses the criterion to Level 1. Do not average out a fundamental misconception against correct content elsewhere.

3.1b: Welding is an advanced skill explicitly supporting top of Level 3. Vacuum forming is advanced. A dedicated safe working environment page/section is a positive indicator. Teacher-assisted cutting limits evidence of full student competence. Level 4 requires sustained fully competent making evidenced across the whole process.

3.2: Reward ambition and functionality. A demanding, fully functioning prototype with some finish imperfections can still reach Level 3-4. "Clunky" proportions from thick materials reduce accuracy but do not prevent Level 3.

4.1: Photographs of a product in use are NOT evidenced testing against measurable criteria. Subjective personal comments ("I find it easy to pull") do not satisfy measurable criteria. A spec-checking table with honest pass/partial/fail assessments and specific justifications is a genuine strength. LCA must be present but cannot carry the section alone if testing is unevidenced and subjective.

ASSESSMENT CRITERIA:
1.1 (8 marks): L1(1-3) limited investigation, basic needs assessment with limited form+function reference, superficial links to research | L2(4-6) adequate investigation, some relevant justified possibilities, some developed links | L3(7-8) developed investigation, fully justified possibilities, full form+function reference, fully developed links between research and design requirements
1.2 (8 marks): L1(1-3) basic brief, basic partially measurable spec points, basic justification | L2(4-6) sound brief, mostly measurable realistic points, generally sound justification | L3(7-8) fully sound brief, fully measurable technical points rooted in research, fully sound justification
2.1 (8 marks): L1(1-3) basic strategies, limited user/spec consideration, basic materials/processes understanding | L2(4-6) generally appropriate strategies, generally sound user/spec consideration, generally sound materials/processes/techniques | L3(7-8) fully appropriate strategies, fully sound consideration, fully sound materials/processes/techniques
2.2 (8 marks): L1(1-3) superficial analysis with one-line statements, limited connections, limited refinement, no design selection conclusion | L2(4-6) generally developed analysis with expanded reasoning, appropriate refinement, mostly sound understanding of design considerations | L3(7-8) fully developed analysis, comprehensive factors, fully relevant connections, effective refinement with clear conclusion
2.3 (12 marks): L1(1-3) limited research use, basic refinements, superficial technical details | L2(4-6) some research use, some sound refinements, generally appropriate modelling, most components third-party interpretable | L3(7-9) generally appropriate research use, generally sound refinements, fully appropriate modelling, most materials/processes third-party interpretable | L4(10-12) fully appropriate research use, fully sound refinements fully meeting spec, effective modelling, all details third-party interpretable
2.4 (8 marks): L1(1-3) basic graphical/CAD/written | L2(4-6) relevant and generally appropriate graphical/CAD/written | L3(7-8) considered and fully appropriate graphical/CAD/written — all three required
2.5 (6 marks): L1(1-2) superficial analysis or no discrete pre-make review section | L2(3-4) generally developed analysis of refinements, competent evaluation with user/client feedback reference, materials/components/techniques considered | L3(5-6) fully developed analysis, effective evaluation with fully sound feedback reference
3.1a (8 marks): L1(1-3) basic selection, limited or incorrect understanding of material properties | L2(4-6) considered selection, generally sound understanding of properties | L3(7-8) effective selection, fully sound understanding of all material properties used
3.1b (16 marks): L1(1-4) basic making, simplistic tools/techniques, adequate H&S | L2(5-8) generally competent making, generally competent tools/techniques, generally high H&S | L3(9-12) mostly competent making across most processes, high H&S | L4(13-16) fully competent making sustained across whole process, fully considered fittings/fixtures, sustained high H&S
3.2 (12 marks): L1(1-3) simplistic prototype, basic problem, limited spec met, basic accuracy | L2(4-6) generally functioning, partially demanding problem, some spec met | L3(7-9) mostly functioning, generally demanding problem, mostly meets spec, generally sound accuracy | L4(10-12) fully functioning, demanding problem, fully meets spec, fully sound accuracy
4.1 (6 marks): L1(1-2) superficial analysis, subjective or unevidenced testing, basic LCA | L2(3-4) generally developed analysis, generally considered approach to measurable testing, competent evaluation with LCA | L3(5-6) fully developed analysis, fully considered measurable testing, effective evaluation with LCA, fully appropriate conclusions`;

const OUTPUT_INSTRUCTIONS = `

Respond with valid JSON only — no markdown fences, no preamble, no trailing text:
{
  "studentName": "name extracted from portfolio, or 'Unknown'",
  "contextualChallenge": "one sentence description of the design challenge",
  "criteria": [
    {
      "code": "1.1",
      "name": "Investigation of needs and research",
      "available": 8,
      "level": 2,
      "mark": 5,
      "justification": "2-3 sentences referencing specific evidence from this portfolio. Name specific pages, sections, or features observed.",
      "borderline": false,
      "borderlineNote": ""
    }
  ],
  "totalMark": 58,
  "totalAvailable": 100,
  "overallCommentary": "2-3 sentence overall summary of strengths and weaknesses"
}
Include all 11 criteria in this exact order: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1a, 3.1b, 3.2, 4.1
Set borderline: true and populate borderlineNote when a decision is genuinely close (within 1 mark of a level boundary).`;

// ─── Storage helpers ───────────────────────────────────────────────────────────

function loadExamples() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_EXAMPLES;
    const stored = JSON.parse(raw);
    // Merge: keep seeds + any user-added
    const userExamples = stored.filter(e => !e.seeded);
    return [...SEED_EXAMPLES, ...userExamples];
  } catch {
    return SEED_EXAMPLES;
  }
}

function saveUserExamples(allExamples) {
  const userOnly = allExamples.filter(e => !e.seeded);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userOnly));
}

function buildCalibrationBlock(examples) {
  if (!examples.length) return "";
  const lines = examples.map(ex => {
    const corrections = ex.corrections.map(c =>
      `  ${c.code}: AI awarded L${c.aiLevel} (${c.aiMark}/${c.available}) — Correct is L${c.correctLevel} (${c.correctMark}/${c.available}). Moderator reason: ${c.reason}`
    ).join("\n");
    return `Portfolio: "${ex.portfolioName}" | Challenge: ${ex.contextualChallenge}\n${corrections}`;
  });
  return `\n\nMODERATOR-VERIFIED CALIBRATION EXAMPLES — study these carefully and adjust your marking thresholds to match:\n\n${lines.join("\n\n")}`;
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

function ScoreBar({ mark, available }) {
  const pct = (mark / available) * 100;
  const color = pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-sky-500" : pct >= 30 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%`, transition: "width 0.7s ease" }} />
      </div>
      <span className="text-xs font-mono text-slate-400 tabular-nums w-12 text-right">{mark}/{available}</span>
    </div>
  );
}

function LevelBadge({ level, mark, available }) {
  const pct = mark / available;
  const cls = pct >= 0.75 ? "bg-emerald-900/60 text-emerald-300 border-emerald-700/50"
    : pct >= 0.5  ? "bg-sky-900/60 text-sky-300 border-sky-700/50"
    : pct >= 0.3  ? "bg-amber-900/60 text-amber-300 border-amber-700/50"
    : "bg-red-900/60 text-red-300 border-red-700/50";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${cls} font-mono whitespace-nowrap`}>
      L{level} · {mark}/{available}
    </span>
  );
}

function TotalGauge({ mark, available }) {
  const pct = (mark / available) * 100;
  const grade = pct >= 80 ? "9" : pct >= 70 ? "8" : pct >= 60 ? "7" : pct >= 50 ? "6"
    : pct >= 40 ? "5" : pct >= 30 ? "4" : pct >= 20 ? "3" : "U";
  const gradeColor = pct >= 70 ? "text-emerald-400" : pct >= 50 ? "text-sky-400" : pct >= 30 ? "text-amber-400" : "text-red-400";
  const r = 40, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const stroke = pct >= 70 ? "#34d399" : pct >= 50 ? "#38bdf8" : pct >= 30 ? "#fbbf24" : "#f87171";
  return (
    <div className="flex items-center gap-5 flex-shrink-0">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={stroke} strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-white">{mark}</span>
          <span className="text-xs text-slate-500">/{available}</span>
        </div>
      </div>
      <div>
        <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Grade</div>
        <div className={`text-5xl font-black ${gradeColor}`}>{grade}</div>
        <div className="text-sm text-slate-500">{pct.toFixed(0)}%</div>
      </div>
    </div>
  );
}

// ─── Criterion card ───────────────────────────────────────────────────────────

function CriterionCard({ criterion, onCorrect, corrected }) {
  const [open, setOpen]           = useState(false);
  const [editMode, setEditMode]   = useState(false);
  const [editMark, setEditMark]   = useState(criterion.mark);
  const [editLevel, setEditLevel] = useState(criterion.level);
  const [editReason, setEditReason] = useState("");

  const meta     = META_MAP[criterion.code];
  const colors   = SECTION_COLORS[meta?.section || "Design"];
  const maxMark  = meta?.available || criterion.available;
  const maxLevel = meta?.maxLevel  || 3;
  const dispMark  = corrected ? corrected.correctMark  : criterion.mark;
  const dispLevel = corrected ? corrected.correctLevel : criterion.level;

  const save = () => {
    if (!editReason.trim()) return;
    onCorrect(criterion.code, {
      code: criterion.code, name: criterion.name, available: maxMark,
      aiMark: criterion.mark, aiLevel: criterion.level,
      correctMark: editMark, correctLevel: editLevel,
      reason: editReason.trim(),
    });
    setEditMode(false);
    setEditReason("");
  };

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}>
      <button onClick={() => setOpen(o => !o)} className="w-full text-left p-4 flex items-start gap-3">
        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-slate-500">{criterion.code}</span>
            <span className="text-sm font-semibold text-slate-200">{criterion.name}</span>
            {criterion.borderline && !corrected && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-orange-900/50 text-orange-300 border border-orange-700/40">⚠ Borderline</span>
            )}
            {corrected && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-teal-900/50 text-teal-300 border border-teal-700/40">✓ Corrected</span>
            )}
          </div>
          <ScoreBar mark={dispMark} available={maxMark} />
        </div>
        <LevelBadge level={dispLevel} mark={dispMark} available={maxMark} />
        <span className="text-slate-600 ml-1 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <div className="h-px bg-white/10" />
          <p className="text-sm text-slate-300 leading-relaxed">{criterion.justification}</p>
          {criterion.borderline && criterion.borderlineNote && (
            <div className="flex gap-2 p-2.5 rounded-lg bg-orange-950/50 border border-orange-800/40">
              <span className="text-orange-400 text-xs flex-shrink-0">⚠</span>
              <p className="text-xs text-orange-300">{criterion.borderlineNote}</p>
            </div>
          )}
          {corrected && (
            <div className="p-2.5 rounded-lg bg-teal-950/50 border border-teal-800/40 text-xs text-teal-300">
              <strong>Your correction:</strong> L{corrected.correctLevel} {corrected.correctMark}/{maxMark} — {corrected.reason}
            </div>
          )}

          {!editMode ? (
            <button onClick={() => { setEditMark(dispMark); setEditLevel(dispLevel); setEditMode(true); }}
              className="text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/30 rounded-lg px-3 py-1.5 transition-all">
              {corrected ? "✎ Edit correction" : "✎ Correct this mark"}
            </button>
          ) : (
            <div className="space-y-2 p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs font-semibold text-slate-300">Correct the AI mark:</p>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 block mb-1">Level (1–{maxLevel})</label>
                  <input type="number" min="1" max={maxLevel} value={editLevel}
                    onChange={e => setEditLevel(Number(e.target.value))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-sm text-white font-mono" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 block mb-1">Mark (1–{maxMark})</label>
                  <input type="number" min="1" max={maxMark} value={editMark}
                    onChange={e => setEditMark(Number(e.target.value))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-sm text-white font-mono" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Reason for correction (required — this trains future marking)</label>
                <textarea value={editReason} onChange={e => setEditReason(e.target.value)}
                  placeholder="e.g. The review table entries are one-line statements only — this is Level 1 regardless of structure..."
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-sm text-slate-200 resize-none placeholder:text-slate-600" />
              </div>
              <div className="flex gap-2">
                <button onClick={save} disabled={!editReason.trim()}
                  className="flex-1 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors">
                  Save correction
                </button>
                <button onClick={() => setEditMode(false)}
                  className="px-3 py-1.5 rounded-lg border border-white/20 text-xs text-slate-400 hover:text-white transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Calibration library ──────────────────────────────────────────────────────

function CalibrationPanel({ examples, onDelete, onClose }) {
  const userExamples = examples.filter(e => !e.seeded);
  const seedExamples = examples.filter(e => e.seeded);
  const totalCorrections = examples.reduce((s, e) => s + e.corrections.length, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-white font-bold text-xl">Calibration Memory</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {totalCorrections} corrections across {examples.length} portfolio{examples.length !== 1 ? "s" : ""} — all injected into every marking call
          </p>
        </div>
        <button onClick={onClose}
          className="text-slate-400 hover:text-white text-sm border border-white/10 rounded-lg px-3 py-1.5 transition-colors flex-shrink-0">
          ← Back
        </button>
      </div>

      {userExamples.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-400">Your corrections</p>
          {userExamples.map((ex, i) => {
            const realIndex = examples.indexOf(ex);
            return (
              <div key={i} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                <div className="flex items-start justify-between px-4 py-3 border-b border-white/10">
                  <div>
                    <p className="text-white font-semibold text-sm">{ex.portfolioName}</p>
                    <p className="text-slate-500 text-xs">{ex.contextualChallenge} · {ex.corrections.length} correction{ex.corrections.length !== 1 ? "s" : ""} · {new Date(ex.savedAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => onDelete(realIndex)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 transition-colors">Remove</button>
                </div>
                <div className="divide-y divide-white/5">
                  {ex.corrections.map((c, j) => (
                    <div key={j} className="px-4 py-2.5 flex items-start gap-3">
                      <span className="font-mono text-xs text-slate-500 w-8 flex-shrink-0 pt-0.5">{c.code}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-slate-400">AI: <span className="font-mono text-red-400">L{c.aiLevel} {c.aiMark}/{c.available}</span></span>
                          <span className="text-slate-600 text-xs">→</span>
                          <span className="text-xs text-slate-400">Correct: <span className="font-mono text-teal-400">L{c.correctLevel} {c.correctMark}/{c.available}</span></span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{c.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Seed calibration (built-in moderator data)</p>
        <p className="text-slate-500 text-xs">These corrections from two moderated portfolios are permanently built in and cannot be removed.</p>
        {seedExamples.map((ex, i) => (
          <div key={i} className="rounded-xl border border-amber-800/30 bg-amber-950/20 overflow-hidden">
            <div className="px-4 py-3 border-b border-amber-800/20">
              <p className="text-amber-300 font-semibold text-sm">{ex.portfolioName}</p>
              <p className="text-amber-400/60 text-xs">{ex.contextualChallenge} · {ex.corrections.length} corrections</p>
            </div>
            <div className="divide-y divide-white/5">
              {ex.corrections.map((c, j) => (
                <div key={j} className="px-4 py-2.5 flex items-start gap-3">
                  <span className="font-mono text-xs text-slate-500 w-8 flex-shrink-0 pt-0.5">{c.code}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400">AI: <span className="font-mono text-red-400/70">L{c.aiLevel} {c.aiMark}/{c.available}</span></span>
                      <span className="text-slate-600 text-xs">→</span>
                      <span className="text-xs text-slate-400">Correct: <span className="font-mono text-teal-400/70">L{c.correctLevel} {c.correctMark}/{c.available}</span></span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{c.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView]           = useState("mark");
  const [files, setFiles]         = useState([]);
  const [dragging, setDragging]   = useState(false);
  const [status, setStatus]       = useState("idle");
  const [result, setResult]       = useState(null);
  const [errorMsg, setErrorMsg]   = useState("");
  const [progress, setProgress]   = useState("");
  const [corrections, setCorrections] = useState({});
  const [examples, setExamples]   = useState([]);
  const [saving, setSaving]       = useState(false);
  const [saveConfirmed, setSaveConfirmed] = useState(false);
  const fileRef = useRef();

  useEffect(() => { setExamples(loadExamples()); }, []);

  const handleFiles = (newFiles) => {
    const pdfs = Array.from(newFiles).filter(f => f.type === "application/pdf");
    if (!pdfs.length) return;
    setFiles(pdfs);
    setResult(null);
    setStatus("idle");
    setCorrections({});
    setSaveConfirmed(false);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const toBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const markPortfolio = async () => {
    if (!files.length) return;
    setStatus("processing");
    setProgress("Reading portfolio pages...");
    setResult(null);
    setCorrections({});
    setSaveConfirmed(false);
    setErrorMsg("");

    try {
      const contents = await Promise.all(files.map(async (f) => ({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: await toBase64(f) },
      })));

      setProgress("Applying mark scheme — this may take 30–60 seconds...");

      const calibBlock = buildCalibrationBlock(examples);
      const fullPrompt = BASE_PROMPT + calibBlock + OUTPUT_INSTRUCTIONS + "\n\nMark this portfolio now. Return only valid JSON.";

      const response = await fetch("/api/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: [...contents, { type: "text", text: fullPrompt }] }],
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || `Server error ${response.status}`);
      }

      const data = await response.json();
      const raw  = data.content?.find(b => b.type === "text")?.text || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      if (parsed.criteria) {
        parsed.criteria = parsed.criteria.map(c => ({
          ...c,
          available: META_MAP[c.code]?.available || c.available,
          name:      META_MAP[c.code]?.name      || c.name,
        }));
      }

      setResult(parsed);
      setStatus("done");
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  const handleCorrect = (code, obj) => setCorrections(prev => ({ ...prev, [code]: obj }));

  const saveToCalibration = async () => {
    const corrList = Object.values(corrections);
    if (!corrList.length || !result) return;
    setSaving(true);
    const newEx = {
      portfolioName: result.studentName || files[0]?.name || "Unknown",
      contextualChallenge: result.contextualChallenge || "",
      corrections: corrList,
      savedAt: new Date().toISOString(),
      seeded: false,
    };
    const updated = [...examples, newEx];
    setExamples(updated);
    saveUserExamples(updated);
    setSaving(false);
    setSaveConfirmed(true);
    setCorrections({});
  };

  const deleteExample = (index) => {
    const updated = examples.filter((_, i) => i !== index);
    setExamples(updated);
    saveUserExamples(updated);
  };

  const SECTIONS = ["Investigate", "Design", "Make", "Evaluate"];
  const corrCount = Object.keys(corrections).length;
  const adjustedTotal = result
    ? result.criteria?.reduce((s, c) => s + (corrections[c.code]?.correctMark ?? c.mark), 0)
    : 0;
  const totalCorrections = examples.reduce((s, e) => s + e.corrections.length, 0);

  return (
    <div className="min-h-screen text-white" style={{
      background: "linear-gradient(160deg,#0a0f1e 0%,#0f172a 40%,#0a1628 100%)",
      fontFamily: "'Georgia','Times New Roman',serif",
    }}>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/10 backdrop-blur-sm bg-black/30 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center flex-shrink-0">
              <span className="text-slate-900 font-black text-sm">DT</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-none">NEA Portfolio Marker</h1>
              <p className="text-slate-500 text-xs mt-0.5">Pearson Edexcel GCSE Design & Technology</p>
            </div>
          </div>
          <button onClick={() => setView(v => v === "mark" ? "calibration" : "mark")}
            className="flex items-center gap-2 text-xs border border-white/20 hover:border-white/40 rounded-lg px-3 py-1.5 text-slate-400 hover:text-white transition-all">
            <span>🎯</span>
            <span className="hidden sm:inline">Calibration Memory</span>
            <span className="bg-teal-700 text-white text-xs px-1.5 py-0.5 rounded-full font-mono">{totalCorrections}</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Calibration view */}
        {view === "calibration" && (
          <CalibrationPanel examples={examples} onDelete={deleteExample} onClose={() => setView("mark")} />
        )}

        {/* Marking view */}
        {view === "mark" && (<>

          {/* Calibration status */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-teal-950/60 border border-teal-800/40 text-teal-300 text-sm">
            <span>🎯</span>
            <span>Marking with <strong>{totalCorrections} calibration corrections</strong> from {examples.length} portfolio{examples.length !== 1 ? "s" : ""}</span>
            <button onClick={() => setView("calibration")} className="ml-auto text-xs underline text-teal-400 hover:text-teal-200">View all</button>
          </div>

          {/* Upload */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all p-10 text-center
              ${dragging ? "border-amber-400 bg-amber-400/10"
              : files.length > 0 ? "border-emerald-500/40 bg-emerald-500/5"
              : "border-white/15 bg-white/3 hover:border-white/30 hover:bg-white/5"}`}
          >
            <input ref={fileRef} type="file" accept="application/pdf" multiple className="hidden"
              onChange={e => handleFiles(e.target.files)} />
            {files.length === 0 ? (
              <>
                <div className="text-5xl mb-3">📄</div>
                <p className="text-white font-semibold text-lg">Drop portfolio PDF here</p>
                <p className="text-slate-500 text-sm mt-1">or click to browse · PDF only</p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">✅</div>
                <p className="text-emerald-400 font-semibold text-sm">{files.map(f => f.name).join(", ")}</p>
                <p className="text-slate-500 text-xs mt-1">Click to change</p>
              </>
            )}
          </div>

          {/* Mark button */}
          {files.length > 0 && status !== "done" && (
            <button onClick={markPortfolio} disabled={status === "processing"}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all
                ${status === "processing"
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-lg shadow-amber-400/20 hover:shadow-amber-400/30 hover:scale-[1.01]"}`}>
              {status === "processing"
                ? <span className="flex items-center justify-center gap-2"><span className="animate-spin">⏳</span>{progress}</span>
                : "Mark Portfolio"}
            </button>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="rounded-xl border border-red-800/50 bg-red-950/40 p-4">
              <p className="text-red-400 font-semibold">Marking failed</p>
              <p className="text-red-300 text-sm mt-1">{errorMsg}</p>
              <button onClick={() => setStatus("idle")} className="mt-2 text-xs text-red-400 underline">Try again</button>
            </div>
          )}

          {/* Results */}
          {status === "done" && result && (<div className="space-y-6">

            {/* Summary card */}
            <div className="rounded-2xl border border-white/10 bg-white/4 backdrop-blur-sm p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <h2 className="text-white text-xl font-bold">{result.studentName || "Portfolio"}</h2>
                  <p className="text-slate-400 text-sm mt-0.5">{result.contextualChallenge}</p>
                  {result.overallCommentary && (
                    <p className="text-slate-300 text-sm mt-3 leading-relaxed">{result.overallCommentary}</p>
                  )}
                  {corrCount > 0 && (
                    <p className="text-amber-400 text-xs mt-2">
                      ⚠ {corrCount} correction{corrCount !== 1 ? "s" : ""} applied · Adjusted total: {adjustedTotal}/100
                    </p>
                  )}
                </div>
                <TotalGauge mark={corrCount > 0 ? adjustedTotal : result.totalMark} available={result.totalAvailable || 100} />
              </div>

              {/* Section bar */}
              <div className="mt-5 flex gap-1 h-1.5 rounded-full overflow-hidden">
                {result.criteria?.map(c => {
                  const pct = ((corrections[c.code]?.correctMark ?? c.mark) / (result.totalAvailable || 100)) * 100;
                  const col = { Investigate:"bg-amber-400", Design:"bg-sky-400", Make:"bg-emerald-400", Evaluate:"bg-violet-400" }[META_MAP[c.code]?.section] || "bg-gray-400";
                  return <div key={c.code} className={`${col} opacity-70`} style={{ width:`${pct}%` }} title={`${c.code}: ${c.mark}/${c.available}`} />;
                })}
              </div>
              <div className="flex gap-4 mt-2">
                {SECTIONS.map(s => (
                  <div key={s} className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${SECTION_COLORS[s].dot}`} />
                    <span className="text-xs text-slate-500">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Criterion cards by section */}
            <div className="space-y-5">
              {SECTIONS.map(section => {
                const crit = result.criteria?.filter(c => META_MAP[c.code]?.section === section) || [];
                if (!crit.length) return null;
                const secTotal = crit.reduce((s, c) => s + (corrections[c.code]?.correctMark ?? c.mark), 0);
                const secAvail = crit.reduce((s, c) => s + (META_MAP[c.code]?.available || c.available), 0);
                const colors   = SECTION_COLORS[section];
                return (
                  <div key={section} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${colors.badge}`}>{section}</span>
                      <span className="text-xs font-mono text-slate-500">{secTotal}/{secAvail}</span>
                    </div>
                    {crit.map(c => (
                      <CriterionCard key={c.code} criterion={c} onCorrect={handleCorrect} corrected={corrections[c.code]} />
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Summary table */}
            <div className="rounded-2xl border border-white/10 bg-white/4 overflow-hidden">
              <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">Mark Summary</h3>
                {corrCount > 0 && <span className="text-xs text-amber-400">{corrCount} correction{corrCount !== 1 ? "s" : ""} applied</span>}
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-2 text-slate-500 font-medium text-xs">Criterion</th>
                    <th className="text-center px-3 py-2 text-slate-500 font-medium text-xs">Level</th>
                    <th className="text-center px-3 py-2 text-slate-500 font-medium text-xs">Mark</th>
                    <th className="text-center px-3 py-2 text-slate-500 font-medium text-xs">Available</th>
                  </tr>
                </thead>
                <tbody>
                  {result.criteria?.map((c, i) => {
                    const corr   = corrections[c.code];
                    const dMark  = corr ? corr.correctMark  : c.mark;
                    const dLevel = corr ? corr.correctLevel : c.level;
                    const colors = SECTION_COLORS[META_MAP[c.code]?.section || "Design"];
                    return (
                      <tr key={c.code} className={`border-b border-white/5 ${i % 2 ? "bg-white/2" : ""}`}>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${colors.dot} flex-shrink-0`} />
                            <span className="font-mono text-xs text-slate-500">{c.code}</span>
                            <span className="text-slate-300 text-xs">{c.name}</span>
                            {corr && <span className="text-xs text-teal-400">✓</span>}
                            {c.borderline && !corr && <span className="text-xs text-orange-400">⚠</span>}
                          </div>
                        </td>
                        <td className="text-center px-3 py-2 font-mono text-xs text-slate-300">{dLevel}</td>
                        <td className={`text-center px-3 py-2 font-bold font-mono ${corr ? "text-teal-400" : "text-white"}`}>{dMark}</td>
                        <td className="text-center px-3 py-2 font-mono text-xs text-slate-500">{META_MAP[c.code]?.available || c.available}</td>
                      </tr>
                    );
                  })}
                  <tr className="border-t-2 border-white/20 bg-white/5">
                    <td className="px-4 py-3 text-white font-bold text-sm">Total</td>
                    <td className="px-3 py-3" />
                    <td className="text-center px-3 py-3 text-amber-400 font-black text-lg font-mono">
                      {corrCount > 0 ? adjustedTotal : result.totalMark}
                    </td>
                    <td className="text-center px-3 py-3 text-slate-500 font-mono">{result.totalAvailable || 100}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Save corrections */}
            {corrCount > 0 && !saveConfirmed && (
              <div className="rounded-2xl border border-teal-700/40 bg-teal-950/40 p-5">
                <h3 className="text-teal-300 font-semibold text-sm mb-1">Save corrections to calibration memory?</h3>
                <p className="text-teal-400/70 text-xs mb-3">
                  Your {corrCount} correction{corrCount !== 1 ? "s" : ""} will be stored and included in all future marking calls, improving accuracy over time.
                </p>
                <button onClick={saveToCalibration} disabled={saving}
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                  {saving ? "Saving..." : `Save ${corrCount} correction${corrCount !== 1 ? "s" : ""} to memory`}
                </button>
              </div>
            )}

            {saveConfirmed && (
              <div className="rounded-2xl border border-teal-700/40 bg-teal-950/40 p-4 text-center">
                <p className="text-teal-300 font-semibold">✓ Corrections saved to calibration memory</p>
                <p className="text-teal-400/70 text-xs mt-1">Future portfolios will be marked with this context.</p>
              </div>
            )}

            <button onClick={() => { setStatus("idle"); setResult(null); setFiles([]); setCorrections({}); setSaveConfirmed(false); }}
              className="w-full py-3 rounded-xl border border-white/15 text-slate-500 hover:text-white hover:border-white/30 transition-all text-sm">
              Mark another portfolio
            </button>

          </div>)}

        </>)}
      </main>

      <footer className="border-t border-white/10 mt-12 px-6 py-4 text-center">
        <p className="text-slate-600 text-xs">
          Calibrated to Pearson Edexcel moderator standards · {totalCorrections} corrections active · Use alongside professional judgement
        </p>
      </footer>
    </div>
  );
}
