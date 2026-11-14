import React, { useState } from 'react';
import {
  Send,
  Upload,
  Search,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Languages,
  Wrench,
  HelpCircle,
  Camera,
  ArrowUpRight,
} from 'lucide-react';
import {
  VERIFIED_ERROR_CODES,
  EQUIPMENT_CATEGORIES,
  type SeededTechnicalDoc,
  type VerifiedErrorCode,
} from '../data/daikinCatalog';

export interface StructuredAiAnswer {
  sourceDocument: string;
  model: string;
  reference: string;
  technicalRequirement: string;
  safetyPrecautions: string;
  confidence: 'Confirmed' | 'Conditional' | 'Not Found in Documents' | string;
  needsModelClarification: boolean;
  troubleshooting: {
    issueIdentification: string;
    possibleCauses: string[];
    safeInspectionSequence: string[];
    measurementsToVerify: string[];
    documentReferences: string[];
    correctiveActions: string[];
    escalationCriteria: string;
  };
}

export interface ChatTurn {
  id: string;
  userQuestion: string;
  modelContext: string;
  errorCode?: string;
  attachedImageName?: string;
  timestamp: string;
  answer: StructuredAiAnswer;
}

interface AiEngineerSupportViewProps {
  mode: 'ai-support' | 'error-codes';
  setMode: (mode: 'ai-support' | 'error-codes') => void;
  documents: SeededTechnicalDoc[];
  selectedModelFilter: string;
  dailyAiCount: number;
  dailyAiLimit: number;
  userPlan: 'free' | 'pro' | 'premium';
  onIncrementAiUsage: (logEntry: {
    modelNumber: string;
    question: string;
    confidence: 'Confirmed' | 'Conditional' | 'Not Found in Documents';
    sourceDoc: string;
  }) => Promise<void>;
  onOpenUpgradeModal: () => void;
}

const SAMPLE_QUESTIONS = [
  {
    q: 'Why is my Daikin chiller not starting?',
    model: 'EWAD-TZ-B',
    ctrl: 'MicroTech IV',
    err: 'ALM-FLOW',
  },
  {
    q: 'What does this controller error code U4 mean?',
    model: 'REYQ16T',
    ctrl: 'BRC1E53A / DIII-Net',
    err: 'U4',
  },
  {
    q: 'Why is the chilled-water temperature not reaching setpoint?',
    model: 'EWAD-TZ-B',
    ctrl: 'MicroTech IV',
    err: '',
  },
  {
    q: 'What should I verify before commissioning a water-cooled chiller?',
    model: 'EWWD-VZ',
    ctrl: 'MicroTech IV',
    err: '',
  },
  {
    q: 'Why does my FAHU have abnormal vibration after start-up?',
    model: 'DPS-FAHU-100',
    ctrl: 'Carel c.pCO',
    err: '',
  },
  {
    q: 'Why is the BMS communication not working on RS-485?',
    model: 'MicroTech IV',
    ctrl: 'BACnet MS/TP / Modbus RTU',
    err: '',
  },
  {
    q: 'How do I verify the chilled-water flow switch?',
    model: 'EWAD-TZ-B',
    ctrl: 'MicroTech IV',
    err: '',
  },
  {
    q: 'What is the difference between BACnet and Modbus?',
    model: 'MicroTech IV',
    ctrl: 'BACnet IP / Modbus RTU',
    err: '',
  },
];

export const AiEngineerSupportView: React.FC<AiEngineerSupportViewProps> = ({
  mode,
  setMode,
  documents,
  selectedModelFilter,
  dailyAiCount,
  dailyAiLimit,
  userPlan,
  onIncrementAiUsage,
  onOpenUpgradeModal,
}) => {
  // AI Engineer Chat State
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [question, setQuestion] = useState('');
  const [modelNumber, setModelNumber] = useState(selectedModelFilter || 'EWAD-TZ-B');
  const [controllerType, setControllerType] = useState('MicroTech IV');
  const [errorCode, setErrorCode] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [measurements, setMeasurements] = useState('');
  const [recentChanges, setRecentChanges] = useState('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [imageMimeType, setImageMimeType] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');

  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([
    {
      id: 'initial_demo_turn',
      userQuestion:
        'How do I verify the evaporator water flow switch and strainer before starting a Daikin EWAD-TZ-B chiller?',
      modelContext: 'EWAD-TZ-B · MicroTech IV',
      timestamp: 'Verified Knowledge Base Sample',
      answer: {
        sourceDocument:
          'Daikin EWAD-TZ-B Air-Cooled Inverter Screw Chiller IOM (D-EIMAC01405-21_04EN)',
        model: 'EWAD-TZ-B',
        reference: 'Section 4.4 & Section 7.2 (Pages 31, 52)',
        technicalRequirement:
          'Install a mechanical mesh water strainer with a maximum mesh size of 1.0 mm directly upstream of the evaporator water inlet. Install a calibrated flow switch (thermal dispersion or paddle type) on the evaporator water outlet with a minimum of 5 pipe diameters (5D) of straight pipe upstream and downstream, wired directly to the dedicated digital safety input on the MicroTech controller.',
        safetyPrecautions:
          'WARNING: Never jumper, bridge, or bypass the chilled-water flow switch terminals in the MicroTech control panel. Operating the chiller without verified water flow risks rapid evaporator tube freeze-up and vessel rupture.',
        confidence: 'Confirmed',
        needsModelClarification: false,
        troubleshooting: {
          issueIdentification:
            'Pre-startup verification of evaporator hydraulic protection and flow interlock integrity on EWAD-TZ-B.',
          possibleCauses: [
            'Flow switch mounted within <5D of an elbow causing turbulent false readings',
            'Air pocket trapped at top of evaporator header preventing dispersion sensor contact',
            '1.0 mm inlet strainer clogged with construction debris after initial pipe flush',
          ],
          safeInspectionSequence: [
            '1. Verify closed-loop flushing was completed via bypass before opening chiller isolation valves.',
            '2. Isolate and inspect the 1.0 mm mesh strainer basket at the evaporator inlet for cleanliness.',
            '3. Bleed all air from the evaporator top manual air vent until a solid stream of water flows.',
            '4. Measure straight pipe distance upstream and downstream of the outlet flow switch (>= 5D required).',
          ],
          measurementsToVerify: [
            'Evaporator water pressure drop (kPa) across calibrated inlet/outlet gauges vs IOM curve',
            'Flow switch trip response time: throttle outlet isolation valve and verify MicroTech locks out within 3–5 seconds when flow drops below threshold',
          ],
          documentReferences: [
            'D-EIMAC01405-21_04EN · Section 4.4: Chilled Water Piping & Flow Switch (Page 31)',
            'D-EIMAC01405-21_04EN · Section 7.2: Pre-Start Interlock Checks (Page 52)',
          ],
          correctiveActions: [
            'Clean strainer mesh and re-verify nominal L/s flow rate using balancing valve (PICV/DRV).',
            'Relocate flow switch if installed closer than 5 pipe diameters from a bend or valve.',
          ],
          escalationCriteria:
            'Contact Authorized Daikin Service if the MicroTech digital input fails to change state when the flow switch dry contact opens.',
        },
      },
    },
  ]);

  // Error Code Library State
  const [errSearchQuery, setErrSearchQuery] = useState('');
  const [errCategoryFilter, setErrCategoryFilter] = useState('ALL');
  const [selectedErrorDetail, setSelectedErrorDetail] = useState<VerifiedErrorCode>(
    VERIFIED_ERROR_CODES[0]
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFileName(file.name);
    setImageMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitSupportQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorBanner('');

    if (dailyAiCount >= dailyAiLimit) {
      setErrorBanner(
        `You have reached your ${userPlan.toUpperCase()} plan daily AI limit (${dailyAiLimit} questions/day). Upgrade your subscription for expanded technical support access.`
      );
      onOpenUpgradeModal();
      return;
    }

    if (!question.trim() && !imageBase64) {
      setErrorBanner('Please enter a technical question or attach an alarm/equipment photo.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          modelNumber,
          controllerType,
          errorCode,
          symptoms,
          measurements,
          recentChanges,
          language,
          imageBase64: imageBase64 || undefined,
          imageMimeType: imageMimeType || undefined,
          documents,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'AI Engineer request failed.');
      }

      const newTurn: ChatTurn = {
        id: `turn_${Date.now()}`,
        userQuestion: question || `Analyze uploaded image: ${imageFileName}`,
        modelContext: `${modelNumber || 'Unspecified Model'} · ${controllerType || 'Unspecified Controller'}`,
        errorCode: errorCode || undefined,
        attachedImageName: imageFileName || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        answer: data as StructuredAiAnswer,
      };

      setChatHistory((prev) => [newTurn, ...prev]);
      const normalizedConfidence: 'Confirmed' | 'Conditional' | 'Not Found in Documents' =
        data.confidence === 'Confirmed' || data.confidence === 'Conditional'
          ? data.confidence
          : 'Not Found in Documents';

      await onIncrementAiUsage({
        modelNumber: modelNumber || 'Unspecified',
        question: (question || `Image analysis: ${imageFileName}`).slice(0, 950),
        confidence: normalizedConfidence,
        sourceDoc: String(data.sourceDocument || 'Not Found').slice(0, 190),
      });

      setQuestion('');
      setImageBase64('');
      setImageFileName('');
    } catch (err: unknown) {
      setErrorBanner(
        err instanceof Error ? err.message : 'Unable to reach HVAC PRO AI ENGINEER.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredErrors = VERIFIED_ERROR_CODES.filter((item) => {
    const matchesCat =
      errCategoryFilter === 'ALL' || item.equipmentCategory === errCategoryFilter;
    const q = errSearchQuery.toLowerCase().trim();
    if (!q) return matchesCat;
    return (
      matchesCat &&
      (item.code.toLowerCase().includes(q) ||
        item.officialDescription.toLowerCase().includes(q) ||
        item.applicableModels.some((m) => m.toLowerCase().includes(q)) ||
        item.controllerType.toLowerCase().includes(q) ||
        item.symptoms.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8">
      {/* Mode Switch Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span>RAG Technical Diagnostics</span>
            <span className="mx-2">·</span>
            <span>Strict Manual Grounding</span>
            <span className="mx-2">·</span>
            <span className="font-mono tabular-nums">
              Daily AI Quota: {dailyAiCount}/{dailyAiLimit} ({userPlan.toUpperCase()})
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            {mode === 'ai-support'
              ? 'HVAC PRO AI ENGINEER — Technical Support Specialist'
              : 'Verified Daikin Error Code & Alarm Database'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setMode('ai-support')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                mode === 'ai-support'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              AI Technical Support
            </button>
            <button
              onClick={() => setMode('error-codes')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                mode === 'error-codes'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Error Code Library ({VERIFIED_ERROR_CODES.length})
            </button>
          </div>

          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-900 dark:bg-slate-800 text-white rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Languages className="w-3.5 h-3.5" />
            {language === 'en' ? 'EN · العربية' : 'العربية · EN'}
          </button>
        </div>
      </div>

      {/* MODE 1: HVAC PRO AI ENGINEER */}
      {mode === 'ai-support' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 5 Columns: Structured Diagnostic Telemetry Form */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  1. Equipment & Diagnostic Context
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {documents.filter((d) => d.status === 'approved').length} Approved Manuals Active
              </span>
            </div>

            <form onSubmit={handleSubmitSupportQuery} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    1. Equipment Model *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EWAD-TZ-B, REYQ16T"
                    value={modelNumber}
                    onChange={(e) => setModelNumber(e.target.value)}
                    className="w-full px-3 py-1.5 font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    2. Controller Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MicroTech IV, BRC1E53A"
                    value={controllerType}
                    onChange={(e) => setControllerType(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    3. Exact Alarm / Error Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. U0, U4, E3, ALM-FLOW"
                    value={errorCode}
                    onChange={(e) => setErrorCode(e.target.value)}
                    className="w-full px-3 py-1.5 font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    4. Operating Symptoms
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Not reaching 7°C LWT"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    5. Field Measurements
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EWT 13°C, LWT 10.5°C, 398V"
                    value={measurements}
                    onChange={(e) => setMeasurements(e.target.value)}
                    className="w-full px-3 py-1.5 font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    6. Recent Maintenance
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Strainer cleaned / shutdown"
                    value={recentChanges}
                    onChange={(e) => setRecentChanges(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Engineering Question ({language === 'en' ? 'English' : 'العربية'}) *
                </label>
                <textarea
                  rows={3}
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                  placeholder={
                    language === 'ar'
                      ? 'اكتب سؤالك الفني أو العطل بالتفصيل للتحقق من أدلة دايكن المعتمدة...'
                      : 'Ask a technical question (e.g., Why is my Daikin chiller not starting? What is the strainer mesh requirement?)...'
                  }
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              {/* Photo / Alarm Screenshot Upload */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg transition-colors">
                  <Camera className="w-3.5 h-3.5 text-sky-600" />
                  {imageFileName ? `Attached: ${imageFileName}` : 'Attach Alarm Photo / Nameplate'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isLoading ? 'Verifying Manuals...' : 'Ask HVAC PRO AI'}
                </button>
              </div>
            </form>

            {errorBanner && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-200">
                {errorBanner}
              </div>
            )}

            {/* Quick-Select Technical Queries (Section 7 of Prompt) */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Common Field Engineering Questions (Click to Populate):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_QUESTIONS.map((sq) => (
                  <button
                    key={sq.q}
                    type="button"
                    onClick={() => {
                      setQuestion(sq.q);
                      setModelNumber(sq.model);
                      setControllerType(sq.ctrl);
                      setErrorCode(sq.err);
                    }}
                    className="text-left px-2.5 py-1.5 text-[11px] bg-slate-50 dark:bg-slate-800/70 hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md transition-colors"
                  >
                    {sq.q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right 7 Columns: Document-Grounded Structured Responses */}
          <div className="lg:col-span-7 space-y-5">
            {chatHistory.map((turn) => (
              <div
                key={turn.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5"
              >
                {/* Question Header */}
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">
                      {turn.modelContext}
                      {turn.errorCode ? ` · Code: ${turn.errorCode}` : ''}
                    </span>
                    <span>{turn.timestamp}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {turn.userQuestion}
                  </h3>
                </div>

                {/* Mandatory 6-Field Document Citation Grid (Prompt Section 3) */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      <FileText className="w-4 h-4 text-sky-600" />
                      MANDATORY DOCUMENT VERIFICATION CITATION
                    </div>
                    <span
                      className={`font-mono font-semibold ${
                        turn.answer.confidence === 'Confirmed'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : turn.answer.confidence === 'Conditional'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      Confidence: {turn.answer.confidence}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Source Document:</div>
                      <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                        {turn.answer.sourceDocument}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Model:</div>
                      <div className="font-mono font-semibold text-slate-900 dark:text-white mt-0.5">
                        {turn.answer.model}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">Reference:</div>
                      <div className="font-mono font-semibold text-sky-600 dark:text-sky-400 mt-0.5">
                        {turn.answer.reference}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Technical Requirement:</div>
                    <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed mt-0.5">
                      {turn.answer.technicalRequirement}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                    <strong>Safety Precautions: </strong>
                    {turn.answer.safetyPrecautions}
                  </div>
                </div>

                {/* 7-Part Structured Troubleshooting Response (Prompt Section 7) */}
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      1. Issue Identification
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {turn.answer.troubleshooting.issueIdentification}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                        2. Possible Causes
                      </h4>
                      <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 list-disc pl-4">
                        {turn.answer.troubleshooting.possibleCauses.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                        3. Safe Inspection Sequence
                      </h4>
                      <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 list-disc pl-4">
                        {turn.answer.troubleshooting.safeInspectionSequence.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                        4. Measurements to Verify
                      </h4>
                      <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 list-disc pl-4">
                        {turn.answer.troubleshooting.measurementsToVerify.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                        5. Corrective Actions
                      </h4>
                      <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 list-disc pl-4">
                        {turn.answer.troubleshooting.correctiveActions.map((ca, i) => (
                          <li key={i}>{ca}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-900 text-slate-200 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">
                        6. Document References &amp; 7. When to Escalate to Authorized Daikin Service
                      </div>
                      <p className="text-slate-300 mt-1">
                        {turn.answer.troubleshooting.escalationCriteria}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE 2: ERROR CODE LIBRARY (Prompt Section 8) */}
      {mode === 'error-codes' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Error Code (U0, U2, U4, E3, L5, ALM-FLOW), Model (EWAD-TZ-B, REYQ16T), Controller, or Symptom..."
                value={errSearchQuery}
                onChange={(e) => setErrSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter error codes by equipment category"
                value={errCategoryFilter}
                onChange={(e) => setErrCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
              >
                <option value="ALL">All Equipment Categories</option>
                <option value="Daikin VRV / VRF Systems">Daikin VRV / VRF Systems</option>
                <option value="Daikin Air-Cooled Chillers">Daikin Air-Cooled & Water-Cooled Chillers</option>
              </select>

              <button
                onClick={() => setMode('ai-support')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Camera className="w-3.5 h-3.5" />
                Upload Alarm Screenshot for AI Analysis
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 4 cols: Error Code List */}
            <div className="lg:col-span-4 space-y-2.5">
              {filteredErrors.map((err) => (
                <button
                  key={err.id}
                  onClick={() => setSelectedErrorDetail(err)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    selectedErrorDetail.id === err.id
                      ? 'bg-slate-900 dark:bg-sky-950 text-white border-slate-900 dark:border-sky-500'
                      : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-mono font-bold text-sky-500">
                      {err.code}
                    </span>
                    <span className="text-[11px] font-mono opacity-75">
                      {err.controllerType}
                    </span>
                  </div>
                  <div className="text-xs font-semibold mt-1">{err.officialDescription}</div>
                  <div className="text-[11px] opacity-75 mt-1 font-mono">
                    Models: {err.applicableModels.join(', ')}
                  </div>
                </button>
              ))}
            </div>

            {/* Right 8 cols: Detailed Verified Error Code Specification */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    <span>{selectedErrorDetail.equipmentCategory}</span>
                    <span className="mx-2">·</span>
                    <span className="font-mono">{selectedErrorDetail.controllerType}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    Code <span className="font-mono text-sky-600">{selectedErrorDetail.code}</span> —{' '}
                    {selectedErrorDetail.officialDescription}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setErrorCode(selectedErrorDetail.code);
                    setModelNumber(selectedErrorDetail.applicableModels[0]);
                    setControllerType(selectedErrorDetail.controllerType);
                    setQuestion(
                      `Provide step-by-step troubleshooting for error code ${selectedErrorDetail.code} (${selectedErrorDetail.officialDescription}) on model ${selectedErrorDetail.applicableModels[0]}.`
                    );
                    setMode('ai-support');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 dark:bg-sky-600 text-white rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
                >
                  Open in AI Engineer
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-500">Applicable Verified Models:</span>
                  <div className="font-mono font-semibold text-slate-900 dark:text-white mt-0.5">
                    {selectedErrorDetail.applicableModels.join(' · ')}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Manual & Page Reference:</span>
                  <div className="font-mono font-semibold text-sky-600 dark:text-sky-400 mt-0.5">
                    {selectedErrorDetail.manualReference}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500">Observed Field Symptoms:</span>
                  <div className="text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedErrorDetail.symptoms}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Possible Root Causes
                  </h4>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 list-disc pl-4">
                    {selectedErrorDetail.possibleCauses.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Safe Diagnostic Checks
                  </h4>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 list-disc pl-4">
                    {selectedErrorDetail.safeDiagnosticChecks.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Required Calibrated Measurements
                  </h4>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 list-disc pl-4">
                    {selectedErrorDetail.requiredMeasurements.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Corrective-Action Guidance
                  </h4>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 list-disc pl-4">
                    {selectedErrorDetail.correctiveActionGuidance.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                <strong>Escalation Requirement & Model Family Notice: </strong>
                {selectedErrorDetail.escalationRequirements} Never assume an error code shares the
                same definition across unrelated controller families (e.g., DIII-Net vs. MicroTech).
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
