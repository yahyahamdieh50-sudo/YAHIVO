import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Camera,
  Download,
  Save,
  ClipboardCheck,
  Gauge,
  ShieldAlert,
} from 'lucide-react';
import {
  INSTALLATION_STAGES,
  PRE_COMMISSIONING_ITEMS,
  COMMISSIONING_STEPS,
  type PreCommItemTemplate,
} from '../data/daikinCatalog';

export interface PreCommRowState extends PreCommItemTemplate {
  status: 'PASS' | 'FAIL' | 'NOT APPLICABLE' | 'PENDING';
  measurement: string;
  inspector: string;
  completionDate: string;
  comment: string;
  photoName?: string;
}

export interface CommissioningReadingState {
  modelNumber: string;
  ambientTempC: number;
  enteringWaterTempC: number;
  leavingWaterTempC: number;
  waterFlowLs: number;
  voltageV: number;
  currentA: number;
  capacityPct: number;
  compressorStatus: string;
  pumpStatus: string;
  setpointC: number;
  activeAlarms: string;
}

interface InstallationCommissioningViewProps {
  activeSubTab: 'installation' | 'pre-commissioning' | 'commissioning';
  setActiveSubTab: (tab: 'installation' | 'pre-commissioning' | 'commissioning') => void;
  selectedModelFilter: string;
  onSavePreCommChecklist: (payload: {
    projectName: string;
    modelNumber: string;
    serialNumber: string;
    inspectorName: string;
    summaryStatus: 'pending' | 'ready' | 'hold';
    passedCount: number;
    failedCount: number;
    notes: string;
  }) => Promise<void>;
  onSaveCommissioningLog: (payload: CommissioningReadingState) => Promise<void>;
  savedChecklistsCount: number;
  savedLogsCount: number;
}

export const InstallationCommissioningView: React.FC<InstallationCommissioningViewProps> = ({
  activeSubTab,
  setActiveSubTab,
  selectedModelFilter,
  onSavePreCommChecklist,
  onSaveCommissioningLog,
  savedChecklistsCount,
  savedLogsCount,
}) => {
  // Stage 1-4 Installation State
  const [selectedInstStage, setSelectedInstStage] = useState<1 | 2 | 3 | 4>(1);
  const [completedInstSteps, setCompletedInstSteps] = useState<Record<string, boolean>>({
    inst_1_1: true,
    inst_1_2: true,
    inst_1_3: true,
  });
  const [instStepPhotos, setInstStepPhotos] = useState<Record<string, string>>({
    inst_1_1: 'nameplate_EWAD_TZ_B_verified.jpg',
  });
  const [instNotes, setInstNotes] = useState<Record<string, string>>({});

  // Pre-Commissioning Checklist State
  const [projectName, setProjectName] = useState('Marina District Cooling Plant — Chiller #1');
  const [preCommModel, setPreCommModel] = useState(selectedModelFilter || 'EWAD-TZ-B');
  const [serialNumber, setSerialNumber] = useState('DAIK-2026-EWAD-88412');
  const [leadInspector, setLeadInspector] = useState('Eng. Tariq Al-Mansoor');
  const [preCommItems, setPreCommItems] = useState<PreCommRowState[]>(() =>
    PRE_COMMISSIONING_ITEMS.map((item) => ({
      ...item,
      status: item.defaultStatus,
      measurement: item.defaultMeasurement,
      inspector: item.defaultInspector,
      completionDate: item.defaultDate,
      comment: item.defaultComment,
    }))
  );
  const [savingPreComm, setSavingPreComm] = useState(false);
  const [preCommSavedNotice, setPreCommSavedNotice] = useState('');

  // Commissioning Log State
  const [activeCommStep, setActiveCommStep] = useState<number>(1);
  const [commReadings, setCommReadings] = useState<CommissioningReadingState>({
    modelNumber: selectedModelFilter || 'EWAD-TZ-B',
    ambientTempC: 34.5,
    enteringWaterTempC: 12.1,
    leavingWaterTempC: 7.0,
    waterFlowLs: 28.6,
    voltageV: 401,
    currentA: 142.5,
    capacityPct: 88,
    compressorStatus: 'Circuit 1 & 2 Inverter Running Nominal',
    pumpStatus: 'CHWP-01 Active (Duty) / Flow Switch Closed',
    setpointC: 7.0,
    activeAlarms: 'None (0 Active Alarms)',
  });
  const [savingCommLog, setSavingCommLog] = useState(false);
  const [commSavedNotice, setCommSavedNotice] = useState('');

  const filteredInstSteps = INSTALLATION_STAGES.filter(
    (s) => s.stageNumber === selectedInstStage
  );

  const passedPreCommCount = preCommItems.filter((i) => i.status === 'PASS').length;
  const failedPreCommCount = preCommItems.filter((i) => i.status === 'FAIL').length;
  const pendingPreCommCount = preCommItems.filter((i) => i.status === 'PENDING').length;

  const overallReadinessStatus: 'ready' | 'hold' | 'pending' =
    failedPreCommCount > 0 ? 'hold' : pendingPreCommCount > 0 ? 'pending' : 'ready';

  const handleUpdatePreCommRow = (
    id: string,
    field: keyof PreCommRowState,
    value: string
  ) => {
    setPreCommItems((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handlePersistPreComm = async () => {
    setSavingPreComm(true);
    setPreCommSavedNotice('');
    try {
      const unresolvedSummary = preCommItems
        .filter((i) => i.status === 'FAIL' || i.status === 'PENDING')
        .map((i) => `${i.code} (${i.status}): ${i.title} - ${i.comment}`)
        .join(' | ');
      await onSavePreCommChecklist({
        projectName: projectName.slice(0, 150),
        modelNumber: preCommModel.slice(0, 80),
        serialNumber: serialNumber.slice(0, 80),
        inspectorName: leadInspector.slice(0, 100),
        summaryStatus: overallReadinessStatus,
        passedCount: passedPreCommCount,
        failedCount: failedPreCommCount,
        notes: (unresolvedSummary || 'All 16 pre-commissioning checks passed.').slice(0, 2000),
      });
      setPreCommSavedNotice('Pre-Commissioning Readiness Record saved to Firestore.');
    } finally {
      setSavingPreComm(false);
    }
  };

  const handleExportReadinessReport = () => {
    const unresolved = preCommItems.filter(
      (i) => i.status === 'FAIL' || i.status === 'PENDING'
    );
    const reportText = `====================================================================
HVAC PRO ACADEMY — PRE-COMMISSIONING READINESS REPORT
====================================================================
IMPORTANT DISCLAIMER:
This software-generated readiness report is for engineering training and inspection tracking only.
It does NOT represent Daikin manufacturer approval or official authorization to start energized equipment.
--------------------------------------------------------------------
Project Name:      ${projectName}
Equipment Model:   ${preCommModel}
Serial Number:     ${serialNumber}
Lead Inspector:    ${leadInspector}
Readiness Status:  ${overallReadinessStatus.toUpperCase()}
Summary Counts:    PASS: ${passedPreCommCount} | FAIL: ${failedPreCommCount} | PENDING: ${pendingPreCommCount}

UNRESOLVED / HOLD ITEMS (${unresolved.length}):
${
  unresolved.length === 0
    ? 'None — All 16 pre-commissioning checklist items verified.'
    : unresolved
        .map(
          (u) =>
            `- [${u.status}] ${u.code}: ${u.title}\n  Actual: ${u.measurement} | Criteria: ${u.acceptanceCriteria} (${u.manualReference})\n  Comment: ${u.comment} (Responsible: ${u.inspector})`
        )
        .join('\n')
}

COMPLETE 16-POINT VERIFICATION LOG:
${preCommItems
  .map(
    (i) =>
      `${i.code} | ${i.status.padEnd(14)} | ${i.title} | Actual: ${i.measurement} | Ref: ${i.manualReference} | By: ${i.inspector} (${i.completionDate})`
  )
  .join('\n')}
====================================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PreCommissioning_Readiness_${preCommModel}_${serialNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePersistCommLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCommLog(true);
    setCommSavedNotice('');
    try {
      await onSaveCommissioningLog(commReadings);
      setCommSavedNotice('Commissioning Operating Log saved to Firestore.');
    } finally {
      setSavingCommLog(false);
    }
  };

  const calculatedDeltaT = Number(
    (commReadings.enteringWaterTempC - commReadings.leavingWaterTempC).toFixed(2)
  );
  const calculatedCapacityKw = Number(
    (commReadings.waterFlowLs * 4.186 * calculatedDeltaT).toFixed(1)
  );

  return (
    <div className="space-y-8">
      {/* Sub-navigation between Installation, Pre-Commissioning, and Commissioning */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span>Field Engineering Workflows</span>
            <span className="mx-2">·</span>
            <span>Manual-Grounded Hold Points & Checklists</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            {activeSubTab === 'installation' && 'Complete 4-Stage Installation Training System'}
            {activeSubTab === 'pre-commissioning' && 'Pre-Commissioning Inspection & Readiness System'}
            {activeSubTab === 'commissioning' && 'Full 13-Step Commissioning & Operating Log System'}
          </h2>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveSubTab('installation')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeSubTab === 'installation'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            1. Installation (4 Stages)
          </button>
          <button
            onClick={() => setActiveSubTab('pre-commissioning')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeSubTab === 'pre-commissioning'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            2. Pre-Commissioning (16 Checks)
          </button>
          <button
            onClick={() => setActiveSubTab('commissioning')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeSubTab === 'commissioning'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            3. Commissioning (13 Steps)
          </button>
        </div>
      </div>

      {/* TAB 1: 4-STAGE INSTALLATION TRAINING */}
      {activeSubTab === 'installation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { num: 1 as const, label: 'Stage 1: Before Installation', count: 6 },
              { num: 2 as const, label: 'Stage 2: Mechanical Installation', count: 4 },
              { num: 3 as const, label: 'Stage 3: Electrical Installation', count: 3 },
              { num: 4 as const, label: 'Stage 4: Installation Inspection', count: 2 },
            ].map((st) => (
              <button
                key={st.num}
                onClick={() => setSelectedInstStage(st.num)}
                className={`p-4 rounded-xl border text-left transition-colors ${
                  selectedInstStage === st.num
                    ? 'bg-slate-900 dark:bg-sky-950 text-white border-slate-900 dark:border-sky-500'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-mono opacity-75">STAGE 0{st.num} · {st.count} STEPS</div>
                <div className="text-sm font-bold mt-1">{st.label}</div>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredInstSteps.map((step) => {
              const isDone = !!completedInstSteps[step.id];
              const attachedPhoto = instStepPhotos[step.id];
              return (
                <div
                  key={step.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">
                          STEP {step.stepCode}
                        </span>
                        <span>·</span>
                        <span className="font-mono">{step.manualRef}</span>
                        {step.isHoldPoint && (
                          <>
                            <span>·</span>
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              ▲ MANDATORY HOLD POINT ({step.holdPointAuthority})
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {step.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0">
                        <Camera className="w-3.5 h-3.5" />
                        {attachedPhoto ? 'Update Photo Evidence' : 'Attach Photo Evidence'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setInstStepPhotos((prev) => ({ ...prev, [step.id]: f.name }));
                            }
                          }}
                        />
                      </label>
                      <button
                        onClick={() =>
                          setCompletedInstSteps((prev) => ({
                            ...prev,
                            [step.id]: !prev[step.id],
                          }))
                        }
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 dark:bg-sky-600 text-white hover:bg-slate-800'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isDone ? 'Verified & Signed Off' : 'Verify Step'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                    <div className="lg:col-span-2 space-y-2">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">
                        Confirmed Manufacturer Instruction:
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {step.manufacturerInstruction}
                      </p>
                      <div className="text-slate-500 dark:text-slate-400">
                        <strong className="text-slate-700 dark:text-slate-300">
                          Verification Method:{' '}
                        </strong>
                        {step.verificationMethod}
                      </div>
                    </div>

                    <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
                      <label className="block font-semibold text-slate-700 dark:text-slate-300">
                        Site Inspection Notes / Corrective Actions:
                      </label>
                      <input
                        type="text"
                        placeholder="Record measurement, torque, or WIR ref..."
                        value={instNotes[step.id] || ''}
                        onChange={(e) =>
                          setInstNotes((prev) => ({ ...prev, [step.id]: e.target.value }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                      />
                      {attachedPhoto && (
                        <div className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                          ✓ Photo Evidence: {attachedPhoto}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PRE-COMMISSIONING CHECKLIST (16 ITEMS) */}
      {activeSubTab === 'pre-commissioning' && (
        <div className="space-y-6">
          {/* Mandatory Non-Authorization Notice */}
          <div className="p-4 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <strong>Mandatory Pre-Commissioning Governance Notice: </strong>A software-generated
              pre-commissioning readiness result is strictly an engineering quality-tracking tool
              and must <strong>never</strong> be represented as Daikin manufacturer approval or
              authorization to energize or start equipment.
            </div>
          </div>

          {/* Project Metadata Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Project / Plantroom Reference
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Verified Daikin Model Number
                </label>
                <input
                  type="text"
                  value={preCommModel}
                  onChange={(e) => setPreCommModel(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Equipment Serial Number
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Responsible QA/Cx Engineer
                </label>
                <input
                  type="text"
                  value={leadInspector}
                  onChange={(e) => setLeadInspector(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono tabular-nums">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  PASS: {passedPreCommCount}/16
                </span>
                <span>·</span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold">
                  FAIL: {failedPreCommCount}/16
                </span>
                <span>·</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  PENDING: {pendingPreCommCount}/16
                </span>
                <span>·</span>
                <span className="text-slate-600 dark:text-slate-400">
                  Saved Records in DB: {savedChecklistsCount}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportReadinessReport}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Readiness Report
                </button>
                <button
                  onClick={handlePersistPreComm}
                  disabled={savingPreComm}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingPreComm ? 'Saving...' : 'Save Readiness Record'}
                </button>
              </div>
            </div>

            {preCommSavedNotice && (
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ {preCommSavedNotice}
              </div>
            )}
          </div>

          {/* High-Density 16-Point Pre-Commissioning Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-3">Code</th>
                    <th className="py-3 px-3 min-w-[220px]">Inspection Item & Acceptance Criteria</th>
                    <th className="py-3 px-3 min-w-[140px]">Status</th>
                    <th className="py-3 px-3 min-w-[150px]">Actual Measurement</th>
                    <th className="py-3 px-3 min-w-[180px]">Comments & Photo Evidence</th>
                    <th className="py-3 px-3 min-w-[140px]">Responsible & Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  {preCommItems.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-white align-top">
                        {row.code}
                      </td>
                      <td className="py-3 px-3 align-top space-y-1">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {row.title}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 leading-snug">
                          {row.acceptanceCriteria}
                        </div>
                        <div className="font-mono text-[11px] text-sky-600 dark:text-sky-400">
                          Ref: {row.manualReference}
                        </div>
                      </td>
                      <td className="py-3 px-3 align-top">
                        <select
                          aria-label={`Status for ${row.title}`}
                          value={row.status}
                          onChange={(e) =>
                            handleUpdatePreCommRow(
                              row.id,
                              'status',
                              e.target.value as PreCommRowState['status']
                            )
                          }
                          className={`w-full px-2.5 py-1.5 text-xs font-mono font-semibold rounded-md border ${
                            row.status === 'PASS'
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : row.status === 'FAIL'
                              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                              : row.status === 'PENDING'
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          <option value="PASS">PASS</option>
                          <option value="FAIL">FAIL</option>
                          <option value="PENDING">PENDING</option>
                          <option value="NOT APPLICABLE">NOT APPLICABLE</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 align-top">
                        <input
                          type="text"
                          value={row.measurement}
                          onChange={(e) =>
                            handleUpdatePreCommRow(row.id, 'measurement', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="py-3 px-3 align-top space-y-1.5">
                        <input
                          type="text"
                          value={row.comment}
                          onChange={(e) =>
                            handleUpdatePreCommRow(row.id, 'comment', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                        />
                        <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 hover:underline">
                          <Camera className="w-3 h-3" />
                          {row.photoName ? row.photoName : 'Attach Photo'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUpdatePreCommRow(row.id, 'photoName', file.name);
                              }
                            }}
                          />
                        </label>
                      </td>
                      <td className="py-3 px-3 align-top space-y-1">
                        <input
                          type="text"
                          value={row.inspector}
                          onChange={(e) =>
                            handleUpdatePreCommRow(row.id, 'inspector', e.target.value)
                          }
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                        />
                        <input
                          type="date"
                          value={row.completionDate}
                          onChange={(e) =>
                            handleUpdatePreCommRow(row.id, 'completionDate', e.target.value)
                          }
                          className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FULL 13-STEP COMMISSIONING & OPERATING LOG */}
      {activeSubTab === 'commissioning' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Columns: 13-Step Commissioning Sequence */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800">
              <div className="text-xs font-mono text-sky-400">
                QUALIFIED PERSONNEL & PERMIT NOTICE
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Any actual equipment start-up, energized electrical test, refrigerant handling, or
                safety-device verification must be performed exclusively by appropriately qualified
                personnel under valid Permits-to-Work (PTW) and Daikin manufacturer requirements.
              </p>
            </div>

            <div className="space-y-3">
              {COMMISSIONING_STEPS.map((st) => {
                const isSelected = activeCommStep === st.stepNumber;
                return (
                  <div
                    key={st.stepNumber}
                    onClick={() => setActiveCommStep(st.stepNumber)}
                    className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 border-sky-600 dark:border-sky-500 shadow-xs'
                        : 'bg-white/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-md bg-slate-900 dark:bg-sky-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {String(st.stepNumber).padStart(2, '0')}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {st.title}
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                        {st.manualRef}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                        <div>
                          <strong className="text-slate-800 dark:text-slate-200">Objective: </strong>
                          <span className="text-slate-600 dark:text-slate-300">{st.objective}</span>
                        </div>
                        <div>
                          <strong className="text-slate-800 dark:text-slate-200">
                            Verified Procedure:{' '}
                          </strong>
                          <span className="text-slate-600 dark:text-slate-300">{st.procedure}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                          <strong>Safety Hold: </strong>
                          {st.safetyHold}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 5 Columns: Interactive Commissioning Log Form */}
          <form
            onSubmit={handlePersistCommLog}
            className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 sticky top-20"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Commissioning Operating Log Sheet
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Saved Logs: {savedLogsCount}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Equipment Model Number (Verified Envelope: EWAD-TZ-B)
                </label>
                <input
                  type="text"
                  value={commReadings.modelNumber}
                  onChange={(e) =>
                    setCommReadings({ ...commReadings, modelNumber: e.target.value })
                  }
                  className="w-full px-3 py-1.5 font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Ambient Temp (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={commReadings.ambientTempC}
                  onChange={(e) =>
                    setCommReadings({ ...commReadings, ambientTempC: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Controller LWT Setpoint (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={commReadings.setpointC}
                  onChange={(e) =>
                    setCommReadings({ ...commReadings, setpointC: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  CHW Entering Temp EWT (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={commReadings.enteringWaterTempC}
                  onChange={(e) =>
                    setCommReadings({
                      ...commReadings,
                      enteringWaterTempC: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-1.5 font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  CHW Leaving Temp LWT (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={commReadings.leavingWaterTempC}
                  onChange={(e) =>
                    setCommReadings({
                      ...commReadings,
                      leavingWaterTempC: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-1.5 font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Chilled Water Flow (L/s)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={commReadings.waterFlowLs}
                  onChange={(e) =>
                    setCommReadings({ ...commReadings, waterFlowLs: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Operating Capacity (%)
                </label>
                <input
                  type="number"
                  step="1"
                  value={commReadings.capacityPct}
                  onChange={(e) =>
                    setCommReadings({ ...commReadings, capacityPct: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Supply Voltage (V — 400V ±10%)
                </label>
                <input
                  type="number"
                  step="1"
                  value={commReadings.voltageV}
                  onChange={(e) =>
                    setCommReadings({ ...commReadings, voltageV: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Running Load Current (A)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={commReadings.currentA}
                  onChange={(e) =>
                    setCommReadings({ ...commReadings, currentA: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Compressor Status
                </label>
                <input
                  type="text"
                  value={commReadings.compressorStatus}
                  onChange={(e) =>
                    setCommReadings({ ...commReadings, compressorStatus: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Primary Pump & Flow Interlock Status
                </label>
                <input
                  type="text"
                  value={commReadings.pumpStatus}
                  onChange={(e) =>
                    setCommReadings({ ...commReadings, pumpStatus: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Active Controller Alarms
                </label>
                <input
                  type="text"
                  value={commReadings.activeAlarms}
                  onChange={(e) =>
                    setCommReadings({ ...commReadings, activeAlarms: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Verified Manual Envelope Check */}
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs font-mono tabular-nums">
              <div className="font-sans font-semibold text-slate-900 dark:text-white">
                Calculated Thermodynamic Verification (IOM D-EIMAC01405-21_04EN):
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Evaporator Water &Delta;T:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {calculatedDeltaT} K
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Measured Thermal Output:</span>
                <span className="font-semibold text-sky-600 dark:text-sky-400">
                  {calculatedCapacityKw} kW
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">EWAD-TZ-B LWT Envelope (+4.0 to +15.0°C):</span>
                <span
                  className={
                    commReadings.leavingWaterTempC >= 4.0 &&
                    commReadings.leavingWaterTempC <= 15.0
                      ? 'text-emerald-600 font-semibold'
                      : 'text-rose-600 font-semibold'
                  }
                >
                  {commReadings.leavingWaterTempC >= 4.0 &&
                  commReadings.leavingWaterTempC <= 15.0
                    ? 'WITHIN MANUAL RANGE'
                    : 'OUTSIDE MANUAL RANGE'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Supply Voltage Envelope (360V–440V):</span>
                <span
                  className={
                    commReadings.voltageV >= 360 && commReadings.voltageV <= 440
                      ? 'text-emerald-600 font-semibold'
                      : 'text-rose-600 font-semibold'
                  }
                >
                  {commReadings.voltageV >= 360 && commReadings.voltageV <= 440
                    ? 'NOMINAL 400V ±10%'
                    : 'VOLTAGE OUT OF SPEC'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingCommLog}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <ClipboardCheck className="w-4 h-4" />
              {savingCommLog ? 'Recording Commissioning Log...' : 'Record Verified Commissioning Log'}
            </button>

            {commSavedNotice && (
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium text-center">
                ✓ {commSavedNotice}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
