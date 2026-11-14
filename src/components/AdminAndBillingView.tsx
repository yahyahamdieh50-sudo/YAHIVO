import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Upload,
  Smartphone,
  AlertCircle,
  Lock,
  FlaskConical,
} from 'lucide-react';
import {
  EQUIPMENT_CATEGORIES,
  type SeededTechnicalDoc,
} from '../data/daikinCatalog';

export interface AiAuditLogItem {
  id: string;
  ownerId: string;
  modelNumber: string;
  question: string;
  confidence: 'Confirmed' | 'Conditional' | 'Not Found in Documents';
  sourceDoc: string;
  resolved: boolean;
  createdAt: string;
}

interface AdminAndBillingViewProps {
  mode: 'billing' | 'admin';
  userPlan: 'free' | 'pro' | 'premium';
  isAdminUser: boolean;
  userEmail: string;
  stripeConfigured: boolean;
  isProduction: boolean;
  onSimulatePlan: (newPlan: 'free' | 'pro' | 'premium') => Promise<{ ok: boolean; notice?: string; error?: string }>;
  documents: SeededTechnicalDoc[];
  onUploadDocument: (
    docPayload: Omit<SeededTechnicalDoc, 'id' | 'createdAt' | 'updatedAt' | 'uploadedBy'>
  ) => Promise<void>;
  onUpdateDocumentStatus: (
    docId: string,
    status: 'draft' | 'approved' | 'archived'
  ) => Promise<void>;
  aiLogs: AiAuditLogItem[];
  onResolveAiLog: (logId: string) => Promise<void>;
  platformConfig: {
    freeDailyAiLimit: number;
    proDailyAiLimit: number;
    premiumDailyAiLimit: number;
    proPriceMonthly: number;
    premiumPriceMonthly: number;
    announcementBanner: string;
  };
  onSavePlatformConfig: (newConfig: AdminAndBillingViewProps['platformConfig']) => Promise<void>;
  onSimulateSecondDeviceLock: () => Promise<void>;
  currentDeviceId: string;
}

export const AdminAndBillingView: React.FC<AdminAndBillingViewProps> = ({
  mode,
  userPlan,
  isAdminUser,
  userEmail,
  stripeConfigured,
  isProduction,
  onSimulatePlan,
  documents,
  onUploadDocument,
  onUpdateDocumentStatus,
  aiLogs,
  onResolveAiLog,
  platformConfig,
  onSavePlatformConfig,
  onSimulateSecondDeviceLock,
  currentDeviceId,
}) => {
  // Billing & Demo Mode Simulation State
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<'pro' | 'premium' | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [billingNotice, setBillingNotice] = useState('');
  const [billingError, setBillingError] = useState('');

  // Admin Portal State
  const [adminTab, setAdminTab] = useState<'docs' | 'ai-audit' | 'devices' | 'config'>('docs');
  const [docTitle, setDocTitle] = useState('');
  const [docCode, setDocCode] = useState('');
  const [docCategory, setDocCategory] = useState(EQUIPMENT_CATEGORIES[0].name);
  const [docModel, setDocModel] = useState('EWAD-TZ-B');
  const [docFamily, setDocFamily] = useState('EWAD-TZ');
  const [docRevision, setDocRevision] = useState('Rev 2026.11');
  const [docType, setDocType] = useState('Installation & Operation Manual (IOM)');
  const [docSectionRef, setDocSectionRef] = useState('Section 4.2 (Pages 24–28)');
  const [docContent, setDocContent] = useState('');
  const [docSafety, setDocSafety] = useState(
    'Perform full LOTO before servicing electrical or mechanical components.'
  );
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [adminStatusMsg, setAdminStatusMsg] = useState('');

  const [configDraft, setConfigDraft] = useState(platformConfig);

  // Live Stripe Checkout Handler (Only executes when server-side Stripe credentials are valid)
  const handleLiveStripeCheckout = async (plan: 'pro' | 'premium') => {
    setBillingNotice('');
    setBillingError('');
    if (!stripeConfigured) {
      setBillingError(
        'Live payments, billing, and checkout are disabled until STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are configured on the server. Use the Administrator Demo Mode Simulator below to test subscription levels.'
      );
      return;
    }

    setProcessingPayment(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, email: userEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setBillingError(data.error || 'Live Stripe checkout is unavailable.');
        return;
      }
      if (data.checkoutUrl) {
        setBillingNotice(`Stripe Checkout Session created (${data.sessionId}).`);
      }
    } catch (err: unknown) {
      setBillingError(err instanceof Error ? err.message : 'Stripe checkout request failed.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Administrator / Demo Mode Simulated Tier Switcher
  const handleAdminSimulateTier = async (targetPlan: 'free' | 'pro' | 'premium') => {
    setBillingNotice('');
    setBillingError('');
    setProcessingPayment(true);
    try {
      const result = await onSimulatePlan(targetPlan);
      if (result.ok) {
        setBillingNotice(
          result.notice ||
            `DEMO MODE: Simulated ${targetPlan.toUpperCase()} subscription tier activated strictly for administrator testing.`
        );
      } else {
        setBillingError(
          result.error ||
            'Paid access cannot be granted through client-side controls in production.'
        );
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleFileExtractUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
    setDocCode(`D-MAN-${Math.floor(1000 + Math.random() * 9000)}-EN`);
    const reader = new FileReader();
    reader.onload = () => {
      if (
        typeof reader.result === 'string' &&
        !file.type.includes('pdf') &&
        !file.type.includes('image')
      ) {
        setDocContent(reader.result.slice(0, 6000));
      } else {
        setDocContent(
          `Extracted Technical Metadata from [${file.name}] (${Math.round(
            file.size / 1024
          )} KB): Paste or verify exact manufacturer operating parameters, clearances, and torque values from this document prior to administrator approval.`
        );
      }
    };
    reader.readAsText(file);
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;
    setUploadingDoc(true);
    setAdminStatusMsg('');
    try {
      await onUploadDocument({
        title: docTitle.slice(0, 200),
        docCode: (docCode || 'D-EIM-CUSTOM').slice(0, 64),
        category: docCategory.slice(0, 80),
        modelNumber: docModel.slice(0, 80),
        modelFamily: docFamily.slice(0, 80),
        revision: docRevision.slice(0, 32),
        docType: docType.slice(0, 64),
        sectionRef: docSectionRef.slice(0, 120),
        extractedContent: docContent.slice(0, 7900),
        safetyNotes: docSafety.slice(0, 950),
        status: isAdminUser ? 'approved' : 'draft',
      });
      setDocTitle('');
      setDocContent('');
      setAdminStatusMsg('Technical manual indexed in RAG Knowledge Base.');
    } finally {
      setUploadingDoc(false);
    }
  };

  if (mode === 'billing') {
    return (
      <div className="space-y-8">
        {/* Header with Clear Demo Mode vs Live Stripe Status */}
        <div className="pb-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span>Subscription &amp; Entitlement Management</span>
              <span className="mx-2">·</span>
              <span>
                {stripeConfigured
                  ? 'Live Stripe Billing Active'
                  : 'Demo Mode Active (Stripe Optional in Dev)'}
              </span>
              <span className="mx-2">·</span>
              <span>One-Device Protection Enforced</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
              Subscription Plans &amp; Billing
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs font-mono bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
              {stripeConfigured ? 'BILLING: LIVE STRIPE' : 'DEMO MODE · SIMULATED TIER'}
            </div>
            <div className="text-xs font-mono bg-slate-100 dark:bg-slate-900 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
              Active Tier: <strong className="text-sky-600 uppercase">{userPlan}</strong>
            </div>
          </div>
        </div>

        {/* Clear Demo Mode & Stripe Optional Governance Banner */}
        {!stripeConfigured && (
          <div className="p-5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-900 dark:text-amber-200">
              <FlaskConical className="w-4 h-4 text-amber-600 shrink-0" />
              DEMO MODE ACTIVE — LIVE STRIPE PAYMENTS &amp; CHECKOUT DISABLED
            </div>
            <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
              This environment is running without <code className="font-mono">STRIPE_SECRET_KEY</code>{' '}
              and <code className="font-mono">STRIPE_WEBHOOK_SECRET</code>. Real payments, recurring
              billing, and live Stripe checkout are disabled until valid server-side Stripe
              credentials are configured. Paid access is never granted through client-side controls
              in production.
            </p>
          </div>
        )}

        {/* Administrator Subscription Simulator (Demo Mode Testing for All 3 Plans) */}
        {isAdminUser && (
          <div className="p-5 rounded-xl bg-slate-900 text-white border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-mono text-sky-400">
                ADMINISTRATOR SUBSCRIPTION SIMULATOR · DEMO MODE TESTING ONLY
              </div>
              <h3 className="text-sm font-bold">
                Test All Three Subscription Levels Without Live Stripe Credentials
              </h3>
              <p className="text-xs text-slate-300">
                As the administrator, switch between simulated Free ($0), Pro ($9.99/mo), and
                Premium ($25/mo) tiers to verify course locks, daily AI quotas, and certificate
                entitlements.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {(['free', 'pro', 'premium'] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  disabled={processingPayment}
                  onClick={() => handleAdminSimulateTier(tier)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    userPlan === tier
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  Simulate {tier.toUpperCase()}{' '}
                  {tier === 'free'
                    ? '($0)'
                    : tier === 'pro'
                    ? `($${platformConfig.proPriceMonthly.toFixed(2)})`
                    : `($${platformConfig.premiumPriceMonthly.toFixed(2)})`}
                  {userPlan === tier ? ' · Active' : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        {billingNotice && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 font-medium">
            ✓ {billingNotice}
          </div>
        )}

        {billingError && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 font-medium">
            {billingError}
          </div>
        )}

        {/* 3 Pricing Tiers (Free $0, Pro $9.99/month, Premium $25/month — Always Visible) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* FREE PLAN — $0 */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span>FOR INTRODUCTORY LEARNERS</span>
                {userPlan === 'free' && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    ● ACTIVE ({stripeConfigured ? 'LIVE' : 'DEMO'})
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Free Plan</h3>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  $0<span className="text-xs font-normal text-slate-500">/month</span>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
                <li>• Introductory HVAC lessons &amp; selected equipment categories</li>
                <li>• Limited free training videos &amp; introductory quizzes</li>
                <li>
                  • Up to{' '}
                  <strong>{platformConfig.freeDailyAiLimit} AI technical questions/day</strong>
                </li>
                <li>• Preview selected Daikin error-code information</li>
                <li>• 1 Registered Active Device lock</li>
              </ul>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleAdminSimulateTier('free')}
                disabled={userPlan === 'free' || processingPayment}
                className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-50"
              >
                {userPlan === 'free' ? 'Current Active Plan ($0)' : 'Select Free Tier ($0)'}
              </button>
            </div>
          </div>

          {/* PRO PLAN — $9.99/MONTH */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-sky-600 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-sky-600 dark:text-sky-400 font-semibold">
                <span>FOR FIELD &amp; SERVICE ENGINEERS</span>
                {userPlan === 'pro' && <span>● SIMULATED ACTIVE</span>}
              </div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pro Plan</h3>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  ${platformConfig.proPriceMonthly.toFixed(2)}
                  <span className="text-xs font-normal text-slate-500">/month</span>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
                <li>• Full Beginner &amp; Intermediate training across 12 categories</li>
                <li>• Expanded video lessons &amp; interactive hydronic simulations</li>
                <li>
                  • AI Technical Support (
                  <strong>{platformConfig.proDailyAiLimit} questions/day</strong> fair-use)
                </li>
                <li>• Complete searchable Daikin Error-Code Database</li>
                <li>• Standard 4-Stage Installation &amp; Pre-Commissioning checklists</li>
                <li>• Progress tracking &amp; Course Completion Certificates</li>
              </ul>
            </div>

            <div className="space-y-2">
              {stripeConfigured ? (
                <button
                  type="button"
                  onClick={() => setSelectedCheckoutPlan('pro')}
                  disabled={userPlan === 'pro' || processingPayment}
                  className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors disabled:opacity-50"
                >
                  {userPlan === 'pro' ? 'Current Active Plan' : 'Subscribe with Stripe ($9.99/mo)'}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled
                    className="w-full py-2 px-4 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Live Checkout Disabled (Stripe Not Configured)
                  </button>
                  {isAdminUser && (
                    <button
                      type="button"
                      onClick={() => handleAdminSimulateTier('pro')}
                      disabled={userPlan === 'pro' || processingPayment}
                      className="w-full py-2 px-4 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors disabled:opacity-50"
                    >
                      {userPlan === 'pro'
                        ? 'Simulated Pro Active (Demo Mode)'
                        : 'Test Pro Tier (Admin Demo Mode)'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* PREMIUM PLAN — $25/MONTH */}
          <div className="bg-slate-950 text-white rounded-xl border border-slate-800 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-sky-400 font-semibold">
                <span>FOR COMMISSIONING &amp; LEAD ENGINEERS</span>
                {userPlan === 'premium' && <span>● SIMULATED ACTIVE</span>}
              </div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-bold">Premium Plan</h3>
                <div className="text-2xl font-bold font-mono tabular-nums">
                  ${platformConfig.premiumPriceMonthly.toFixed(2)}
                  <span className="text-xs font-normal text-slate-400">/month</span>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li>• Full Beginner, Intermediate &amp; Advanced courses</li>
                <li>• Complete Installation, Pre-Commissioning &amp; 13-Step Commissioning</li>
                <li>
                  • Priority AI Engineer + Multimodal Image/Manual Analysis (
                  <strong>{platformConfig.premiumDailyAiLimit} questions/day</strong>)
                </li>
                <li>• Downloadable editable Readiness Reports &amp; Commissioning Logs</li>
                <li>• Advanced BMS (BACnet/Modbus/DIII-Net) &amp; Controls Academy</li>
                <li>• Interactive AI-graded troubleshooting simulations</li>
              </ul>
            </div>

            <div className="space-y-2">
              {stripeConfigured ? (
                <button
                  type="button"
                  onClick={() => setSelectedCheckoutPlan('premium')}
                  disabled={userPlan === 'premium' || processingPayment}
                  className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-white text-slate-950 hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  {userPlan === 'premium'
                    ? 'Current Active Plan'
                    : 'Subscribe with Stripe ($25/mo)'}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled
                    className="w-full py-2 px-4 text-xs font-semibold rounded-lg bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Live Checkout Disabled (Stripe Not Configured)
                  </button>
                  {isAdminUser && (
                    <button
                      type="button"
                      onClick={() => handleAdminSimulateTier('premium')}
                      disabled={userPlan === 'premium' || processingPayment}
                      className="w-full py-2 px-4 text-xs font-semibold rounded-lg bg-white text-slate-950 hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                      {userPlan === 'premium'
                        ? 'Simulated Premium Active (Demo Mode)'
                        : 'Test Premium Tier (Admin Demo Mode)'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stripe Integration Configuration & Production Security Architecture Card */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              Stripe Integration &amp; Production Entitlement Security Status
            </div>
            <span className="font-mono text-slate-500">
              Environment: {isProduction ? 'PRODUCTION' : 'DEVELOPMENT / DEMO'} · Stripe Keys:{' '}
              {stripeConfigured ? 'CONFIGURED' : 'NOT CONFIGURED (OPTIONAL IN DEV)'}
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Live Stripe Checkout (<code className="font-mono">POST /api/billing/checkout</code>) and
            webhook signature verification (<code className="font-mono">POST /api/billing/webhook</code>)
            remain integrated in the backend server and activate automatically once valid{' '}
            <code className="font-mono">STRIPE_SECRET_KEY</code> and{' '}
            <code className="font-mono">STRIPE_WEBHOOK_SECRET</code> secrets are added. In
            production, Firestore rules and server guards strictly prohibit non-admin users from
            elevating subscription plans via client-side controls.
          </p>
        </div>

        {/* Live Stripe Checkout Modal (Only reachable when stripeConfigured === true) */}
        {selectedCheckoutPlan && stripeConfigured && (
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border-2 border-sky-600 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Live Stripe Subscription Checkout — {selectedCheckoutPlan.toUpperCase()} Plan
                </h3>
              </div>
              <button
                onClick={() => setSelectedCheckoutPlan(null)}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              PCI-DSS Security Compliance: Full payment card details are never stored on HVAC PRO
              ACADEMY servers. Proceed to create a server-side Stripe Checkout Session.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={processingPayment}
                onClick={() => handleLiveStripeCheckout(selectedCheckoutPlan)}
                className="px-5 py-2.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
              >
                {processingPayment
                  ? 'Creating Stripe Checkout Session...'
                  : `Launch Live Stripe Checkout (${selectedCheckoutPlan.toUpperCase()})`}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ADMIN PORTAL VIEW (Prompt Section 13)
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span>Administrator &amp; Technical Reviewer Portal</span>
            <span className="mx-2">·</span>
            <span>RAG Document Governance &amp; Demo Mode Tier Testing</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Administration &amp; Knowledge Base Portal
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          {[
            { id: 'docs' as const, label: `RAG Manuals (${documents.length})` },
            { id: 'ai-audit' as const, label: `AI Audit Logs (${aiLogs.length})` },
            { id: 'devices' as const, label: 'One-Device Security' },
            { id: 'config' as const, label: 'Pricing & Tier Simulator' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setAdminTab(t.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                adminTab === t.id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Admin Subscription Simulator Bar inside Admin Portal */}
      <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <span className="font-mono text-sky-400 font-semibold">
            ADMIN DEMO MODE TIER TESTER:{' '}
          </span>
          <span className="text-slate-300">
            Active Simulated Plan is <strong className="text-white uppercase">{userPlan}</strong>.
            Switch tiers anytime to test learner entitlements:
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {(['free', 'pro', 'premium'] as const).map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => handleAdminSimulateTier(tier)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                userPlan === tier
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Test {tier.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ADMIN TAB 1: UPLOAD & APPROVE TECHNICAL MANUALS */}
      {adminTab === 'docs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleCreateDocument}
            className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3.5 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Upload Daikin Technical Manual (RAG)
              </h3>
              <label className="cursor-pointer inline-flex items-center gap-1 text-sky-600 hover:underline font-medium">
                <Upload className="w-3.5 h-3.5" />
                Select PDF/Doc/Txt
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,image/*"
                  className="hidden"
                  onChange={handleFileExtractUpload}
                />
              </label>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Document Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Daikin EWAD-TZ-B Installation Manual"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Manual Code
                </label>
                <input
                  type="text"
                  placeholder="D-EIMAC01405-21"
                  value={docCode}
                  onChange={(e) => setDocCode(e.target.value)}
                  className="w-full px-3 py-1.5 font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Revision
                </label>
                <input
                  type="text"
                  value={docRevision}
                  onChange={(e) => setDocRevision(e.target.value)}
                  className="w-full px-3 py-1.5 font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Exact Model Number *
                </label>
                <input
                  type="text"
                  required
                  value={docModel}
                  onChange={(e) => setDocModel(e.target.value)}
                  className="w-full px-3 py-1.5 font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Section &amp; Page Reference *
                </label>
                <input
                  type="text"
                  required
                  value={docSectionRef}
                  onChange={(e) => setDocSectionRef(e.target.value)}
                  className="w-full px-3 py-1.5 font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Equipment Category
              </label>
              <select
                aria-label="Select equipment category for document"
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
              >
                {EQUIPMENT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Verified Technical Extract (Tables, Specs &amp; Procedures) *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Paste verified specification tables, clearances, pressure test stages, or error code rules..."
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={uploadingDoc}
              className="w-full py-2.5 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
            >
              {uploadingDoc ? 'Indexing Document...' : 'Upload & Index Technical Manual'}
            </button>

            {adminStatusMsg && (
              <div className="text-emerald-600 font-medium">✓ {adminStatusMsg}</div>
            )}
          </form>

          {/* Right 7 Columns: Document Revision & Approval Queue */}
          <div className="lg:col-span-7 space-y-3">
            {documents.map((docItem) => (
              <div
                key={docItem.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-mono text-slate-500">
                    <span>{docItem.docCode}</span>
                    <span className="mx-1.5">·</span>
                    <span className="text-sky-600 font-semibold">{docItem.modelNumber}</span>
                    <span className="mx-1.5">·</span>
                    <span>{docItem.revision}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-semibold uppercase ${
                        docItem.status === 'approved'
                          ? 'text-emerald-600'
                          : docItem.status === 'draft'
                          ? 'text-amber-600'
                          : 'text-slate-400'
                      }`}
                    >
                      ● {docItem.status}
                    </span>
                    <button
                      onClick={() => onUpdateDocumentStatus(docItem.id, 'approved')}
                      className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium hover:bg-emerald-100"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onUpdateDocumentStatus(docItem.id, 'archived')}
                      className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-200"
                    >
                      Archive
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {docItem.title}
                </h4>
                <div className="font-mono text-[11px] text-slate-500">
                  Category: {docItem.category} | Section Reference: {docItem.sectionRef}
                </div>
                <p className="text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {docItem.extractedContent}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADMIN TAB 2: UNRESOLVED AI QUESTIONS & MISSING REFERENCES */}
      {adminTab === 'ai-audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            AI Technical Support Audit Log &amp; Missing Reference Queue
          </h3>
          {aiLogs.length === 0 ? (
            <p className="text-xs text-slate-500">
              No AI support queries logged in this session yet. Ask a question in the AI Technical
              Support tab to populate the audit trail.
            </p>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {aiLogs.map((log) => (
                <div key={log.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-mono text-slate-500">
                      Model:{' '}
                      <strong className="text-slate-900 dark:text-white">{log.modelNumber}</strong>{' '}
                      · Confidence:{' '}
                      <strong
                        className={
                          log.confidence === 'Confirmed'
                            ? 'text-emerald-600'
                            : log.confidence === 'Conditional'
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }
                      >
                        {log.confidence}
                      </strong>{' '}
                      · Source: {log.sourceDoc}
                    </div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {log.question}
                    </div>
                  </div>
                  <button
                    onClick={() => onResolveAiLog(log.id)}
                    className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap shrink-0 ${
                      log.resolved
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {log.resolved ? 'Reviewed' : 'Mark Reviewed'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADMIN TAB 3: ONE-DEVICE ACCOUNT ENFORCEMENT */}
      {adminTab === 'devices' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Mandatory One-Device Account Enforcement Controls
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Every user account is bound to a single registered device installation in both
                server-side session state and Firestore (/user_sessions).
              </p>
            </div>
            <button
              onClick={onSimulateSecondDeviceLock}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Smartphone className="w-3.5 h-3.5" />
              Test 2nd Device Conflict &amp; Transfer Flow
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1.5">
            <div>Current Registered Workstation ID: {currentDeviceId}</div>
            <div className="text-emerald-600">
              Status: ACTIVE &amp; VERIFIED (Simultaneous multi-device login blocked)
            </div>
          </div>
        </div>
      )}

      {/* ADMIN TAB 4: PRICING & USAGE LIMITS */}
      {adminTab === 'config' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSavePlatformConfig(configDraft);
          }}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs max-w-2xl"
        >
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Configure Subscription Pricing &amp; Daily AI Quotas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Free Daily AI Limit
              </label>
              <input
                type="number"
                value={configDraft.freeDailyAiLimit}
                onChange={(e) =>
                  setConfigDraft({ ...configDraft, freeDailyAiLimit: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Pro Plan Price ($/mo)
              </label>
              <input
                type="number"
                step="0.01"
                value={configDraft.proPriceMonthly}
                onChange={(e) =>
                  setConfigDraft({ ...configDraft, proPriceMonthly: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Premium Plan Price ($/mo)
              </label>
              <input
                type="number"
                step="0.01"
                value={configDraft.premiumPriceMonthly}
                onChange={(e) =>
                  setConfigDraft({ ...configDraft, premiumPriceMonthly: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Global Engineering Announcement Banner
            </label>
            <input
              type="text"
              value={configDraft.announcementBanner}
              onChange={(e) =>
                setConfigDraft({ ...configDraft, announcementBanner: e.target.value })
              }
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
          >
            Save Platform Configuration
          </button>
        </form>
      )}
    </div>
  );
};
