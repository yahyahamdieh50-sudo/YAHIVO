import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Languages,
} from 'lucide-react';
import {
  VIDEO_SIMULATION_MODULES,
  type VideoSimulationModule,
} from '../data/daikinCatalog';

interface InteractiveSimulationViewProps {
  onCompleteLesson: (lessonId: string) => void;
  completedLessons: string[];
}

export const InteractiveSimulationView: React.FC<InteractiveSimulationViewProps> = ({
  onCompleteLesson,
  completedLessons,
}) => {
  const [selectedModule, setSelectedModule] = useState<VideoSimulationModule>(
    VIDEO_SIMULATION_MODULES[0]
  );
  const [activeChapterIdx, setActiveChapterIdx] = useState<number>(0);
  const [subtitleLang, setSubtitleLang] = useState<'en' | 'ar'>('en');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Interactive Thermodynamic & Hydronic Simulator Controls
  const [enteringWaterTemp, setEnteringWaterTemp] = useState<number>(12.0);
  const [targetSetpoint, setTargetSetpoint] = useState<number>(7.0);
  const [waterFlowPct, setWaterFlowPct] = useState<number>(100);
  const [condenserFoulingPct, setCondenserFoulingPct] = useState<number>(5);
  const [ambientTemp, setAmbientTemp] = useState<number>(35.0);
  const [crankcaseHeaterHours, setCrankcaseHeaterHours] = useState<number>(14);

  // Derived physical values grounded in Daikin IOM formulas
  const nominalFlowLs = 28.5;
  const actualFlowLs = Number(((nominalFlowLs * waterFlowPct) / 100).toFixed(1));
  const flowSwitchClosed = waterFlowPct >= 75;
  const crankcaseReady = crankcaseHeaterHours >= 12;
  const chillerRunning = isPlaying && flowSwitchClosed && crankcaseReady;

  const deltaT = chillerRunning
    ? Number(Math.min(8.5, (enteringWaterTemp - targetSetpoint) * (100 / Math.max(waterFlowPct, 50))).toFixed(1))
    : 0;
  const leavingWaterTemp = chillerRunning
    ? Number((enteringWaterTemp - deltaT).toFixed(1))
    : enteringWaterTemp;

  // Evaporator approach (nominal 1.2 - 2.2 K; rises if fouled)
  const evapApproachK = chillerRunning
    ? Number((1.4 + condenserFoulingPct * 0.03).toFixed(1))
    : 0;
  const saturatedSuctionTemp = chillerRunning
    ? Number((leavingWaterTemp - evapApproachK).toFixed(1))
    : enteringWaterTemp;

  // Condenser approach (nominal 1.5 - 3.0 K; rises >4.0 K when condenser fouled)
  const condApproachK = chillerRunning
    ? Number((1.6 + condenserFoulingPct * 0.08).toFixed(1))
    : 0;
  const saturatedDischargeTemp = chillerRunning
    ? Number((ambientTemp + 8.5 + condApproachK).toFixed(1))
    : ambientTemp;

  const coolingCapacityKw = chillerRunning
    ? Number((actualFlowLs * 4.186 * (enteringWaterTemp - leavingWaterTemp)).toFixed(1))
    : 0;

  const activeChapter = selectedModule.chapters[activeChapterIdx] || selectedModule.chapters[0];

  const handleVoiceNarration = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const textToRead =
      subtitleLang === 'ar' ? activeChapter.summaryAr : activeChapter.summaryEn;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = subtitleLang === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = 0.98;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleResetSimulation = () => {
    setEnteringWaterTemp(12.0);
    setTargetSetpoint(7.0);
    setWaterFlowPct(100);
    setCondenserFoulingPct(5);
    setAmbientTemp(35.0);
    setCrankcaseHeaterHours(14);
    setIsPlaying(true);
  };

  const handleDownloadNotes = () => {
    const content = `HVAC PRO ACADEMY — VERIFIED LEARNING NOTES
Module: ${selectedModule.title}
Applicable Models: ${selectedModule.modelNumber}
Manual Reference: ${selectedModule.manualReference}
Notice: ${selectedModule.isConceptualNotice}

CHAPTER BREAKDOWN:
${selectedModule.chapters
  .map((c) => `[${c.time}] ${c.title}\nEN: ${c.summaryEn}\nAR: ${c.summaryAr}`)
  .join('\n\n')}

${selectedModule.notesSummary}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedModule.id}_verified_notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header & Module Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Video Lessons & Interactive Simulations</span>
            <span className="mx-2">·</span>
            <span>Document-Grounded Visual Sandbox</span>
            <span className="mx-2">·</span>
            <span className="font-mono">{selectedModule.manualReference}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {selectedModule.title}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {VIDEO_SIMULATION_MODULES.map((mod) => (
            <button
              key={mod.id}
              onClick={() => {
                setSelectedModule(mod);
                setActiveChapterIdx(0);
              }}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedModule.id === mod.id
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {mod.modelNumber} ({mod.duration})
            </button>
          ))}
        </div>
      </div>

      {/* Conceptual Distinction Banner (Prompt Requirement Section 9) */}
      <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <strong className="text-slate-900 dark:text-white font-semibold">
            Conceptual vs. Manufacturer Procedure Notice:{' '}
          </strong>
          {selectedModule.isConceptualNotice}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadNotes}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Download Notes
          </button>
          <button
            onClick={() => onCompleteLesson(selectedModule.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              completedLessons.includes(selectedModule.id)
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 dark:bg-sky-600 text-white hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {completedLessons.includes(selectedModule.id) ? 'Lesson Completed' : 'Mark Lesson Complete'}
          </button>
        </div>
      </div>

      {/* Two-Zone Sandbox Layout (Left 60% Interactive Canvas, Right 40% Control & Concept Deck) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Zone: Interactive Engineering Stage (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 text-white rounded-xl border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="text-xs text-slate-400">
                  <span>Interactive Schematic Telemetry</span>
                  <span className="mx-1.5">·</span>
                  <span className="font-mono">{selectedModule.modelNumber}</span>
                </div>
                <h3 className="text-base font-semibold text-white mt-0.5">
                  {activeChapter.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isPlaying ? 'Pause Loop' : 'Run Loop'}
                </button>
                <button
                  onClick={handleResetSimulation}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </div>

            {/* Live Safety & Interlock Banner inside Simulator */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400">Flow Switch (5D Outlet)</div>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-mono font-semibold">
                  {flowSwitchClosed ? (
                    <span className="text-emerald-400">▲ CLOSED · {actualFlowLs} L/s ({waterFlowPct}%)</span>
                  ) : (
                    <span className="text-rose-400">▼ TRIP OPEN · &lt;75% FLOW LOCKOUT</span>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400">Oil Heater Pre-Heat</div>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-mono font-semibold">
                  {crankcaseReady ? (
                    <span className="text-emerald-400">▲ VERIFIED · {crankcaseHeaterHours}h (&ge;12h)</span>
                  ) : (
                    <span className="text-amber-400">▼ INHIBITED · {crankcaseHeaterHours}h (&lt;12h Req)</span>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400">Condenser Approach</div>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-mono font-semibold">
                  {condApproachK <= 3.5 ? (
                    <span className="text-sky-400">● NOMINAL · {condApproachK} K</span>
                  ) : (
                    <span className="text-amber-400">▲ FOULING WARN · {condApproachK} K (&gt;3.5K)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive SVG Hydronic & Refrigerant Loop Diagram */}
            <div className="my-5 bg-slate-900/90 rounded-xl border border-slate-800 p-4 overflow-x-auto">
              <svg
                viewBox="0 0 680 270"
                className="w-full h-auto min-w-[520px]"
                role="img"
                aria-label="Interactive Daikin Chiller Hydronic and Refrigerant Loop Diagram"
              >
                {/* Condenser / Top Section */}
                <rect
                  x="30"
                  y="20"
                  width="260"
                  height="95"
                  rx="8"
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth="1.5"
                />
                <text x="45" y="42" fill="#e2e8f0" fontSize="12" fontWeight="600">
                  CONDENSER / HEAT REJECTION
                </text>
                <text x="45" y="62" fill="#94a3b8" fontSize="11" fontFamily="monospace">
                  Ambient: {ambientTemp.toFixed(1)}°C | SDT: {saturatedDischargeTemp.toFixed(1)}°C
                </text>
                <text x="45" y="82" fill="#38bdf8" fontSize="11" fontFamily="monospace">
                  Condenser Approach: {condApproachK.toFixed(1)} K (Fouling: {condenserFoulingPct}%)
                </text>
                <text x="45" y="100" fill="#94a3b8" fontSize="10">
                  Clearance Rule: &ge;1800 mm side / &ge;2500 mm chiller-to-chiller
                </text>

                {/* Single-Screw Inverter Compressor */}
                <rect
                  x="340"
                  y="20"
                  width="310"
                  height="95"
                  rx="8"
                  fill="#0f172a"
                  stroke={chillerRunning ? '#0284c7' : '#ef4444'}
                  strokeWidth="1.5"
                />
                <text x="355" y="42" fill="#e2e8f0" fontSize="12" fontWeight="600">
                  SINGLE-SCREW INVERTER &amp; MICROTECH IV
                </text>
                <text x="355" y="62" fill="#38bdf8" fontSize="11" fontFamily="monospace">
                  State: {chillerRunning ? 'RUNNING (INVERTER MODULATING)' : 'SAFETY HOLD / STANDBY'}
                </text>
                <text x="355" y="82" fill="#cbd5e1" fontSize="11" fontFamily="monospace">
                  Cooling Load: {coolingCapacityKw.toFixed(1)} kW | Setpoint: {targetSetpoint.toFixed(1)}°C
                </text>
                <text x="355" y="100" fill="#94a3b8" fontSize="10">
                  Crankcase Heater: {crankcaseHeaterHours}h Pre-Heat (Min 12h per Sec 5.1)
                </text>

                {/* Shell & Tube Evaporator Vessel */}
                <rect
                  x="120"
                  y="150"
                  width="340"
                  height="100"
                  rx="10"
                  fill="#0f172a"
                  stroke="#0ea5e9"
                  strokeWidth="2"
                />
                <text x="140" y="175" fill="#ffffff" fontSize="12" fontWeight="600">
                  EVAPORATOR VESSEL (COUNTER-FLOW)
                </text>
                <text x="140" y="196" fill="#38bdf8" fontSize="11" fontFamily="monospace">
                  SST: {saturatedSuctionTemp.toFixed(1)}°C | Evap Approach: {evapApproachK.toFixed(1)} K
                </text>
                <text x="140" y="216" fill="#cbd5e1" fontSize="11" fontFamily="monospace">
                  EWT: {enteringWaterTemp.toFixed(1)}°C &rarr; LWT: {leavingWaterTemp.toFixed(1)}°C (&Delta;T: {deltaT.toFixed(1)} K)
                </text>
                <text x="140" y="236" fill="#94a3b8" fontSize="10">
                  Ref: D-EIMAC01405-21_04EN Sec 4.4 (Max Test Pressure 10.0 bar)
                </text>

                {/* Chilled Water Inlet Pipe + 1.0mm Strainer */}
                <line
                  x1="20"
                  y1="220"
                  x2="120"
                  y2="220"
                  stroke="#38bdf8"
                  strokeWidth="5"
                  strokeDasharray={chillerRunning ? '8 4' : 'none'}
                />
                <rect x="42" y="205" width="52" height="28" rx="4" fill="#1e293b" stroke="#38bdf8" />
                <text x="47" y="223" fill="#e2e8f0" fontSize="9" fontFamily="monospace">
                  &le;1.0mm
                </text>
                <text x="22" y="196" fill="#94a3b8" fontSize="10">
                  CHW Return In ({enteringWaterTemp.toFixed(1)}°C)
                </text>

                {/* Chilled Water Outlet Pipe + 5D Flow Switch */}
                <line
                  x1="460"
                  y1="175"
                  x2="655"
                  y2="175"
                  stroke={flowSwitchClosed ? '#10b981' : '#f43f5e'}
                  strokeWidth="5"
                />
                <rect
                  x="510"
                  y="156"
                  width="95"
                  height="36"
                  rx="4"
                  fill="#1e293b"
                  stroke={flowSwitchClosed ? '#10b981' : '#f43f5e'}
                  strokeWidth="1.5"
                />
                <text x="518" y="172" fill="#ffffff" fontSize="9" fontWeight="600">
                  FLOW SWITCH (5D)
                </text>
                <text x="518" y="185" fill={flowSwitchClosed ? '#34d399' : '#fb7185'} fontSize="9" fontFamily="monospace">
                  {flowSwitchClosed ? `CLOSED ${actualFlowLs} L/s` : 'OPEN <75% TRIP'}
                </text>
                <text x="480" y="215" fill="#94a3b8" fontSize="10">
                  CHW Supply Out ({leavingWaterTemp.toFixed(1)}°C)
                </text>
              </svg>
            </div>
          </div>

          {/* Subtitle & Voice Narration Bar (English + Arabic) */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono text-sky-400">
                [{activeChapter.time}] {activeChapter.title}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSubtitleLang(subtitleLang === 'en' ? 'ar' : 'en')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  <Languages className="w-3.5 h-3.5" />
                  Subtitles: {subtitleLang === 'en' ? 'English (EN)' : 'العربية (AR)'}
                </button>
                <button
                  onClick={handleVoiceNarration}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  {isSpeaking ? 'Stop Audio' : 'AI Voice Narration'}
                </button>
              </div>
            </div>
            <p
              dir={subtitleLang === 'ar' ? 'rtl' : 'ltr'}
              className="text-sm text-slate-200 leading-relaxed"
            >
              {subtitleLang === 'ar' ? activeChapter.summaryAr : activeChapter.summaryEn}
            </p>
          </div>
        </div>

        {/* Right Zone: Control & Concept Deck (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Interactive Parameter Sliders */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Live Operating Parameter Controls
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500">Real-Time Response</span>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="slider-flow" className="font-medium text-slate-700 dark:text-slate-300">
                    Chilled-Water Flow Rate (Trip &lt; 75%)
                  </label>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                    {waterFlowPct}% ({actualFlowLs} L/s)
                  </span>
                </div>
                <input
                  id="slider-flow"
                  type="range"
                  min={40}
                  max={120}
                  step={5}
                  value={waterFlowPct}
                  onChange={(e) => setWaterFlowPct(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="slider-ewt" className="font-medium text-slate-700 dark:text-slate-300">
                    Entering Chilled-Water Temp (EWT)
                  </label>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                    {enteringWaterTemp.toFixed(1)} °C
                  </span>
                </div>
                <input
                  id="slider-ewt"
                  type="range"
                  min={9.0}
                  max={18.0}
                  step={0.5}
                  value={enteringWaterTemp}
                  onChange={(e) => setEnteringWaterTemp(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="slider-setpoint" className="font-medium text-slate-700 dark:text-slate-300">
                    MicroTech LWT Setpoint (Min +4.0°C Water)
                  </label>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                    {targetSetpoint.toFixed(1)} °C
                  </span>
                </div>
                <input
                  id="slider-setpoint"
                  type="range"
                  min={4.0}
                  max={12.0}
                  step={0.5}
                  value={targetSetpoint}
                  onChange={(e) => setTargetSetpoint(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="slider-fouling" className="font-medium text-slate-700 dark:text-slate-300">
                    Simulated Condenser / Coil Fouling Factor
                  </label>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                    {condenserFoulingPct}% (Approach: {condApproachK} K)
                  </span>
                </div>
                <input
                  id="slider-fouling"
                  type="range"
                  min={0}
                  max={50}
                  step={5}
                  value={condenserFoulingPct}
                  onChange={(e) => setCondenserFoulingPct(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="slider-heater" className="font-medium text-slate-700 dark:text-slate-300">
                    Crankcase Oil Heater Pre-Heat Duration
                  </label>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                    {crankcaseHeaterHours} Hours (Req &ge; 12h)
                  </span>
                </div>
                <input
                  id="slider-heater"
                  type="range"
                  min={0}
                  max={24}
                  step={1}
                  value={crankcaseHeaterHours}
                  onChange={(e) => setCrankcaseHeaterHours(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>
            </div>

            {(!flowSwitchClosed || !crankcaseReady) && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div>
                  <strong>MicroTech Safety Interlock Active: </strong>
                  {!flowSwitchClosed &&
                    'Evaporator water flow dropped below 75% threshold — flow switch contact opened to prevent evaporator tube freeze-up. '}
                  {!crankcaseReady &&
                    'Crankcase oil heater pre-heat is under 12 hours (Sec 5.1) — compressor start inhibited to prevent liquid slugging.'}
                </div>
              </div>
            )}
          </div>

          {/* Chapter Navigation & Verified Notes */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <BookOpen className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Lesson Chapters & Verified Citations
                </h3>
              </div>

              <div className="mt-3 space-y-2">
                {selectedModule.chapters.map((chap, idx) => (
                  <button
                    key={chap.time}
                    onClick={() => setActiveChapterIdx(idx)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      activeChapterIdx === idx
                        ? 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-500/50 text-slate-900 dark:text-white'
                        : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono text-sky-600 dark:text-sky-400">
                      <span>Chapter {idx + 1}</span>
                      <span>{chap.time}</span>
                    </div>
                    <div className="text-xs font-semibold mt-0.5">{chap.title}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-900 dark:text-white mb-1">
                Document-Verified Engineering Summary
              </div>
              <pre className="text-xs font-mono text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {selectedModule.notesSummary}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
