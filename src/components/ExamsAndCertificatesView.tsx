import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  BookOpen,
  Download,
  Lock,
  Send,
  ShieldAlert,
} from 'lucide-react';
import {
  ACADEMY_COURSES,
  PRACTICAL_SCENARIOS,
  type AcademyCourse,
  type PracticalScenario,
} from '../data/daikinCatalog';

export interface AwardedCertificateRecord {
  id: string;
  recipientName: string;
  courseId: string;
  courseTitle: string;
  scorePct: number;
  certificateCode: string;
  createdAt: string;
}

interface ExamsAndCertificatesViewProps {
  activeSubTab: 'exams' | 'certificates';
  setActiveSubTab: (tab: 'exams' | 'certificates') => void;
  userPlan: 'free' | 'pro' | 'premium';
  userName: string;
  certificates: AwardedCertificateRecord[];
  onAwardCertificate: (cert: {
    courseId: string;
    courseTitle: string;
    scorePct: number;
    certificateCode: string;
  }) => Promise<void>;
  onOpenUpgradeModal: () => void;
}

export const ExamsAndCertificatesView: React.FC<ExamsAndCertificatesViewProps> = ({
  activeSubTab,
  setActiveSubTab,
  userPlan,
  userName,
  certificates,
  onAwardCertificate,
  onOpenUpgradeModal,
}) => {
  // Course Examination State
  const [selectedCourse, setSelectedCourse] = useState<AcademyCourse>(ACADEMY_COURSES[0]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScorePct, setExamScorePct] = useState(0);
  const [awardingCert, setAwardingCert] = useState(false);

  // Practical Scenario AI Evaluation State
  const [selectedScenario, setSelectedScenario] = useState<PracticalScenario>(
    PRACTICAL_SCENARIOS[0]
  );
  const [scenarioAnswer, setScenarioAnswer] = useState('');
  const [evaluatingScenario, setEvaluatingScenario] = useState(false);
  const [scenarioResult, setScenarioResult] = useState<{
    score: number;
    passed: boolean;
    verdictSummary: string;
    strengths: string[];
    missingChecks: string[];
    verifiedReferenceCitation: string;
    safetyComplianceNote: string;
  } | null>(null);

  const canAccessCourse = (course: AcademyCourse) => {
    if (course.requiredPlan === 'free') return true;
    if (course.requiredPlan === 'pro') return userPlan === 'pro' || userPlan === 'premium';
    return userPlan === 'premium';
  };

  const handleSubmitExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAccessCourse(selectedCourse)) {
      onOpenUpgradeModal();
      return;
    }

    let correct = 0;
    selectedCourse.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct += 1;
      }
    });
    const pct = Math.round((correct / selectedCourse.questions.length) * 100);
    setExamScorePct(pct);
    setExamSubmitted(true);

    if (pct >= 70) {
      setAwardingCert(true);
      try {
        const certCode = `HVACPRO-${selectedCourse.id.slice(0, 6).toUpperCase()}-${Math.floor(
          100000 + Math.random() * 900000
        )}`;
        await onAwardCertificate({
          courseId: selectedCourse.id,
          courseTitle: selectedCourse.title,
          scorePct: pct,
          certificateCode: certCode,
        });
      } finally {
        setAwardingCert(false);
      }
    }
  };

  const handleEvaluateScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenarioAnswer.trim()) return;
    setEvaluatingScenario(true);
    setScenarioResult(null);
    try {
      const response = await fetch('/api/ai/evaluate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioTitle: selectedScenario.title,
          scenarioPrompt: selectedScenario.prompt,
          expectedCriteria: selectedScenario.expectedCriteria,
          manualReference: selectedScenario.manualReference,
          userAnswer: scenarioAnswer,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setScenarioResult(data);
      }
    } finally {
      setEvaluatingScenario(false);
    }
  };

  const handleDownloadCertificate = (cert: AwardedCertificateRecord) => {
    const content = `======================================================================
HVAC PRO ACADEMY — EDUCATIONAL COMPLETION CERTIFICATE
======================================================================
Certificate ID:   ${cert.certificateCode}
Awarded To:       ${cert.recipientName}
Course Completed: ${cert.courseTitle}
Examination Score:${cert.scorePct}% (PASS THRESHOLD: 70%)
Issue Date:       ${new Date(cert.createdAt).toLocaleDateString()}

MANDATORY REGULATORY & MANUFACTURER DISCLAIMER:
This digital certificate represents educational course completion within HVAC PRO ACADEMY only.
It does NOT constitute Daikin Industries factory authorization, OEM warranty certification,
or a government/regulated license to perform high-voltage electrical or refrigerant work.
======================================================================`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificate_${cert.certificateCode}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header & Sub-tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span>Interactive Learning & Assessment</span>
            <span className="mx-2">·</span>
            <span>AI Scenario Grading & Verified Certificates</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            {activeSubTab === 'exams'
              ? 'Practical Troubleshooting Scenarios & Final Certification Exams'
              : 'My HVAC PRO Academy Completion Certificates'}
          </h2>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveSubTab('exams')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeSubTab === 'exams'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Practical Scenarios & Exams
          </button>
          <button
            onClick={() => setActiveSubTab('certificates')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeSubTab === 'certificates'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            My Certificates ({certificates.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'exams' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 6 Columns: AI Scenario-Based Troubleshooting Evaluator (Prompt Section 10) */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div>
              <div className="text-xs text-sky-600 dark:text-sky-400 font-semibold">
                AI-GRADED FIELD TROUBLESHOOTING SIMULATION
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Practical Engineering Scenarios
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select a real-world Daikin field scenario, write your safe diagnostic procedure, and
                receive AI feedback grounded in the exact manual reference.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {PRACTICAL_SCENARIOS.map((scen) => (
                <button
                  key={scen.id}
                  type="button"
                  onClick={() => {
                    setSelectedScenario(scen);
                    setScenarioResult(null);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    selectedScenario.id === scen.id
                      ? 'bg-slate-900 dark:bg-sky-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {scen.modelNumber}
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {selectedScenario.title}
                </span>
                <span className="font-mono">{selectedScenario.difficulty}</span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                “{selectedScenario.prompt}”
              </p>
              <div className="text-[11px] font-mono text-sky-600 dark:text-sky-400">
                Reference Manual: {selectedScenario.manualReference}
              </div>
              <div className="text-[11px] text-slate-500">
                <strong>Engineering Hint:</strong> {selectedScenario.hint}
              </div>
            </div>

            <form onSubmit={handleEvaluateScenario} className="space-y-3 text-xs">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Your Step-by-Step Safe Diagnostic Response:
              </label>
              <textarea
                rows={4}
                placeholder="1. Verify LWT setpoint and active demand limits on MicroTech IV... 2. Measure EWT, LWT, and evaporator flow rate (L/s)..."
                value={scenarioAnswer}
                onChange={(e) => setScenarioAnswer(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
              />
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setScenarioAnswer(selectedScenario.expectedCriteria)}
                  className="text-xs text-sky-600 dark:text-sky-400 hover:underline"
                >
                  Insert Model Engineering Answer
                </button>
                <button
                  type="submit"
                  disabled={evaluatingScenario}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {evaluatingScenario ? 'Grading Against Manual...' : 'Submit for AI Evaluation'}
                </button>
              </div>
            </form>

            {scenarioResult && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white">
                    AI Examiner Verdict:{' '}
                    {scenarioResult.passed ? 'PASSED' : 'NEEDS ADDITIONAL CHECKS'}
                  </span>
                  <span className="font-mono font-bold text-sm text-sky-600 tabular-nums">
                    Score: {scenarioResult.score}/100
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {scenarioResult.verdictSummary}
                </p>
                {scenarioResult.strengths.length > 0 && (
                  <div>
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      Verified Correct Checks:
                    </strong>
                    <ul className="list-disc pl-4 mt-1 space-y-1 text-slate-600 dark:text-slate-300">
                      {scenarioResult.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {scenarioResult.missingChecks.length > 0 && (
                  <div>
                    <strong className="text-amber-600 dark:text-amber-400">
                      Missing Manual Checks:
                    </strong>
                    <ul className="list-disc pl-4 mt-1 space-y-1 text-slate-600 dark:text-slate-300">
                      {scenarioResult.missingChecks.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="font-mono text-[11px] text-sky-600 dark:text-sky-400">
                  Citation: {scenarioResult.verifiedReferenceCitation}
                </div>
              </div>
            )}
          </div>

          {/* Right 6 Columns: Structured Course Final Examination */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div>
              <div className="text-xs text-sky-600 dark:text-sky-400 font-semibold">
                CERTIFICATION EXAMINATION (PASSING SCORE: 70%)
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Academy Course Final Exam
              </h3>
            </div>

            <div className="space-y-2">
              {ACADEMY_COURSES.map((course) => {
                const unlocked = canAccessCourse(course);
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => {
                      setSelectedCourse(course);
                      setSelectedAnswers({});
                      setExamSubmitted(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                      selectedCourse.id === course.id
                        ? 'bg-slate-900 dark:bg-sky-950 text-white border-slate-900 dark:border-sky-500'
                        : 'bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-mono opacity-80">
                        {course.level} · Plan: {course.requiredPlan.toUpperCase()} · Ref:{' '}
                        {course.manualCode}
                      </div>
                      <div className="text-xs font-bold mt-0.5">{course.title}</div>
                    </div>
                    {!unlocked && <Lock className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {!canAccessCourse(selectedCourse) ? (
              <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <Lock className="w-6 h-6 text-amber-500 mx-auto" />
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  Requires {selectedCourse.requiredPlan.toUpperCase()} Subscription Tier
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Upgrade your plan to unlock {selectedCourse.level} certification examinations and
                  digital completion certificates.
                </p>
                <button
                  onClick={onOpenUpgradeModal}
                  className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
                >
                  View Subscription Plans
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitExam} className="space-y-5 text-xs">
                {selectedCourse.questions.map((q, qIdx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="font-semibold text-slate-900 dark:text-white leading-relaxed">
                      {qIdx + 1}. {q.question}
                    </div>
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const isChecked = selectedAnswers[q.id] === oIdx;
                        return (
                          <label
                            key={oIdx}
                            className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-slate-900 dark:text-white font-medium'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              checked={isChecked}
                              onChange={() =>
                                setSelectedAnswers((prev) => ({ ...prev, [q.id]: oIdx }))
                              }
                              className="mt-0.5 accent-sky-600"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>

                    {examSubmitted && (
                      <div
                        className={`p-3 rounded-lg border text-xs ${
                          selectedAnswers[q.id] === q.correctIndex
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                        }`}
                      >
                        <div className="font-semibold">
                          {selectedAnswers[q.id] === q.correctIndex
                            ? '✓ Correct'
                            : '✗ Incorrect'}{' '}
                          ({q.manualRef})
                        </div>
                        <p className="mt-1">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="submit"
                    disabled={awardingCert}
                    className="px-5 py-2.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
                  >
                    {awardingCert ? 'Issuing Certificate...' : 'Submit Final Examination'}
                  </button>

                  {examSubmitted && (
                    <div className="text-xs font-mono font-bold">
                      Score: {examScorePct}%{' '}
                      {examScorePct >= 70
                        ? '— PASSED (Certificate Issued!)'
                        : '— Below 70% Threshold'}
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CERTIFICATES VIEW (Prompt Section 10) */}
      {activeSubTab === 'certificates' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>Educational Completion Notice: </strong>HVAC PRO Academy Completion
              Certificates represent educational course completion only. They do not constitute
              Daikin factory authorization, professional engineering licensure, or legal permission
              to perform regulated electrical or refrigerant work.
            </div>
          </div>

          {certificates.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-10 text-center space-y-3">
              <Award className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-base font-bold text-slate-900 dark:text-white">
                No Completion Certificates Earned Yet
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Complete any course examination with a score of 70% or higher to receive your
                verifiable digital HVAC PRO Academy Completion Certificate.
              </p>
              <button
                onClick={() => setActiveSubTab('exams')}
                className="px-4 py-2 text-xs font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-500 transition-colors"
              >
                Take Certification Exam
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-900 dark:border-sky-600 p-6 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                      <span>EDUCATIONAL COMPLETION CERTIFICATE</span>
                      <span>{cert.certificateCode}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {cert.courseTitle}
                    </h3>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      Awarded to:{' '}
                      <strong className="text-slate-900 dark:text-white">
                        {cert.recipientName || userName}
                      </strong>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>Score: {cert.scorePct}%</span>
                      <span>·</span>
                      <span>Issued: {new Date(cert.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      Disclaimer: Educational course completion only; not Daikin factory
                      authorization or regulated licensing.
                    </p>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      onClick={() => handleDownloadCertificate(cert)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 dark:bg-sky-600 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Certificate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
