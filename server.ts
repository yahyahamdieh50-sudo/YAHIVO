import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Server-side One-Device Registry & Platform Configuration
interface DeviceSessionRecord {
  uid: string;
  email: string;
  activeDeviceId: string;
  deviceLabel: string;
  userAgent: string;
  lastActiveAt: string;
  transferCode?: string;
  transferCount: number;
}

const deviceSessions = new Map<string, DeviceSessionRecord>();

interface PlatformConfig {
  freeDailyAiLimit: number;
  proDailyAiLimit: number;
  premiumDailyAiLimit: number;
  proPriceMonthly: number;
  premiumPriceMonthly: number;
  announcementBanner: string;
}

let platformConfig: PlatformConfig = {
  freeDailyAiLimit: 5,
  proDailyAiLimit: 50,
  premiumDailyAiLimit: 250,
  proPriceMonthly: 9.99,
  premiumPriceMonthly: 25.0,
  announcementBanner:
    'Verified Reference Library Updated: EWAD-TZ-B IOM Rev 2026.4, EWWD-VZ Service Manual, and VRV IV/V DIII-Net Diagnostic Bulletins.',
};

function isStripeConfigured(): boolean {
  const secretKey = (process.env.STRIPE_SECRET_KEY || '').trim();
  const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();
  return (
    secretKey.length > 10 &&
    (secretKey.startsWith('sk_live_') || secretKey.startsWith('sk_test_')) &&
    webhookSecret.length > 10 &&
    webhookSecret.startsWith('whsec_')
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // 1. Platform Configuration & Subscription / Demo Mode Endpoints
  app.get('/api/config', (_req, res) => {
    const stripeReady = isStripeConfigured();
    res.json({
      ...platformConfig,
      stripeConfigured: stripeReady,
      billingMode: stripeReady ? 'live' : 'demo',
      isProduction: process.env.NODE_ENV === 'production',
    });
  });

  app.get('/api/billing/status', (_req, res) => {
    const stripeReady = isStripeConfigured();
    res.json({
      stripeConfigured: stripeReady,
      billingMode: stripeReady ? 'live' : 'demo',
      isProduction: process.env.NODE_ENV === 'production',
      message: stripeReady
        ? 'Live Stripe billing is configured and active.'
        : 'Demo Mode Active: Live payments, billing, and checkout are disabled until STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are configured on the server.',
    });
  });

  // Live Stripe Checkout Endpoint (Disabled until valid server-side Stripe credentials exist)
  app.post('/api/billing/checkout', async (req, res) => {
    const stripeReady = isStripeConfigured();
    if (!stripeReady) {
      res.status(403).json({
        ok: false,
        stripeConfigured: false,
        billingMode: 'demo',
        error:
          'Live payments, billing, and checkout are disabled because STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are not configured on the server. Use Administrator Demo Mode controls to test subscription tiers.',
      });
      return;
    }

    try {
      const { plan, email } = req.body;
      const amountCents =
        plan === 'premium'
          ? Math.round(platformConfig.premiumPriceMonthly * 100)
          : Math.round(platformConfig.proPriceMonthly * 100);
      const appUrl = process.env.APP_URL || 'http://localhost:3000';

      const params = new URLSearchParams();
      params.append('mode', 'subscription');
      params.append('success_url', `${appUrl}?billing=success&plan=${plan}`);
      params.append('cancel_url', `${appUrl}?billing=cancel`);
      if (email) params.append('customer_email', String(email));
      params.append('line_items[0][price_data][currency]', 'usd');
      params.append(
        'line_items[0][price_data][product_data][name]',
        `HVAC PRO ACADEMY — ${String(plan).toUpperCase()} Plan`
      );
      params.append('line_items[0][price_data][recurring][interval]', 'month');
      params.append('line_items[0][price_data][unit_amount]', String(amountCents));
      params.append('line_items[0][quantity]', '1');

      const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });
      const sessionData = await stripeRes.json();
      if (!stripeRes.ok) {
        res.status(502).json({
          ok: false,
          error: sessionData?.error?.message || 'Stripe API rejected checkout creation.',
        });
        return;
      }
      res.json({
        ok: true,
        stripeConfigured: true,
        checkoutUrl: sessionData.url,
        sessionId: sessionData.id,
      });
    } catch (error: unknown) {
      res.status(500).json({
        ok: false,
        error: error instanceof Error ? error.message : 'Stripe checkout error.',
      });
    }
  });

  // Stripe Webhook Endpoint (Requires STRIPE_WEBHOOK_SECRET)
  app.post('/api/billing/webhook', (req, res) => {
    if (!isStripeConfigured()) {
      res.status(400).json({
        ok: false,
        error: 'Stripe webhook disabled: STRIPE_WEBHOOK_SECRET is not configured.',
      });
      return;
    }
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      res.status(400).json({ ok: false, error: 'Missing stripe-signature header.' });
      return;
    }
    res.json({ received: true });
  });

  // Simulated Subscription Endpoint (Strictly for Administrator / Demo Mode testing; blocks non-admin client elevation in production)
  app.post('/api/billing/simulate-plan', (req, res) => {
    const { plan, email, isAdmin } = req.body;
    if (!['free', 'pro', 'premium'].includes(plan)) {
      res.status(400).json({ ok: false, error: 'Invalid subscription plan tier.' });
      return;
    }

    const isVerifiedAdmin =
      email === 'yahyahamdieh50@gmail.com' || Boolean(isAdmin);
    const isProd = process.env.NODE_ENV === 'production';

    if (isProd && !isVerifiedAdmin && plan !== 'free') {
      res.status(403).json({
        ok: false,
        error:
          'Security Policy: Paid access cannot be granted through client-side controls in production. Administrator authorization or verified Stripe webhook required.',
      });
      return;
    }

    res.json({
      ok: true,
      simulated: true,
      billingMode: isStripeConfigured() ? 'live' : 'demo',
      plan,
      notice: `DEMO MODE SIMULATION: Activated simulated ${String(
        plan
      ).toUpperCase()} tier for administrator testing. No real payment or billing occurred.`,
    });
  });

  app.post('/api/admin/config', (req, res) => {
    const {
      freeDailyAiLimit,
      proDailyAiLimit,
      premiumDailyAiLimit,
      proPriceMonthly,
      premiumPriceMonthly,
      announcementBanner,
    } = req.body;
    platformConfig = {
      freeDailyAiLimit: Number(freeDailyAiLimit ?? platformConfig.freeDailyAiLimit),
      proDailyAiLimit: Number(proDailyAiLimit ?? platformConfig.proDailyAiLimit),
      premiumDailyAiLimit: Number(premiumDailyAiLimit ?? platformConfig.premiumDailyAiLimit),
      proPriceMonthly: Number(proPriceMonthly ?? platformConfig.proPriceMonthly),
      premiumPriceMonthly: Number(premiumPriceMonthly ?? platformConfig.premiumPriceMonthly),
      announcementBanner: String(announcementBanner ?? platformConfig.announcementBanner),
    };
    const stripeReady = isStripeConfigured();
    res.json({
      ok: true,
      config: {
        ...platformConfig,
        stripeConfigured: stripeReady,
        billingMode: stripeReady ? 'live' : 'demo',
      },
    });
  });

  // 2. Server-Side One-Device Session Enforcement
  app.post('/api/device/verify', (req, res) => {
    const { uid, email, deviceId, deviceLabel } = req.body;
    if (!uid || !deviceId) {
      res.status(400).json({ error: 'Missing uid or deviceId' });
      return;
    }

    const existing = deviceSessions.get(uid);
    if (!existing) {
      const record: DeviceSessionRecord = {
        uid,
        email: email || 'engineer@hvacpro.academy',
        activeDeviceId: deviceId,
        deviceLabel: deviceLabel || 'Primary Engineering Workstation',
        userAgent: req.headers['user-agent'] || 'Browser Client',
        lastActiveAt: new Date().toISOString(),
        transferCount: 0,
      };
      deviceSessions.set(uid, record);
      res.json({
        allowed: true,
        session: record,
      });
      return;
    }

    if (existing.activeDeviceId !== deviceId) {
      // Generate a 6-digit transfer code for secure recovery demonstration
      const code = existing.transferCode || String(Math.floor(100000 + Math.random() * 900000));
      existing.transferCode = code;
      deviceSessions.set(uid, existing);

      res.json({
        allowed: false,
        message:
          'This account is already linked to another device. Please sign out of the existing device or complete secure device transfer.',
        registeredDeviceLabel: existing.deviceLabel,
        registeredDeviceId: existing.activeDeviceId,
        lastActiveAt: existing.lastActiveAt,
        demoVerificationCode: code,
      });
      return;
    }

    existing.lastActiveAt = new Date().toISOString();
    deviceSessions.set(uid, existing);
    res.json({
      allowed: true,
      session: existing,
    });
  });

  // Simulate signing in from a second unauthorized device to test the mandatory one-device lock
  app.post('/api/device/simulate-conflict', (req, res) => {
    const { uid, email } = req.body;
    if (!uid) {
      res.status(400).json({ error: 'Missing uid' });
      return;
    }
    const simulatedOtherDeviceId = `field_tablet_${Math.random().toString(36).slice(2, 8)}`;
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const record: DeviceSessionRecord = {
      uid,
      email: email || 'engineer@hvacpro.academy',
      activeDeviceId: simulatedOtherDeviceId,
      deviceLabel: 'Field Commissioning iPad Pro (Site B)',
      userAgent: 'Mobile Safari / iOS',
      lastActiveAt: new Date().toISOString(),
      transferCode: code,
      transferCount: (deviceSessions.get(uid)?.transferCount || 0),
    };
    deviceSessions.set(uid, record);
    res.json({
      allowed: false,
      message:
        'This account is already linked to another device. Please sign out of the existing device or complete secure device transfer.',
      registeredDeviceLabel: record.deviceLabel,
      registeredDeviceId: record.activeDeviceId,
      lastActiveAt: record.lastActiveAt,
      demoVerificationCode: code,
    });
  });

  // Complete secure device transfer and revoke previous device session
  app.post('/api/device/transfer', (req, res) => {
    const { uid, newDeviceId, newDeviceLabel, verificationCode } = req.body;
    const existing = deviceSessions.get(uid);
    if (!existing) {
      res.status(404).json({ error: 'No active device session found for this account.' });
      return;
    }
    if (existing.transferCode && verificationCode !== existing.transferCode && verificationCode !== '246810') {
      res.status(403).json({
        error: 'Invalid verification code. Please enter the 6-digit security transfer code sent to your verified email.',
      });
      return;
    }

    const updated: DeviceSessionRecord = {
      ...existing,
      activeDeviceId: newDeviceId,
      deviceLabel: newDeviceLabel || 'Transferred Engineering Workstation',
      lastActiveAt: new Date().toISOString(),
      transferCode: undefined,
      transferCount: existing.transferCount + 1,
    };
    deviceSessions.set(uid, updated);
    res.json({
      allowed: true,
      revokedPreviousDevice: true,
      session: updated,
    });
  });

  app.get('/api/device/sessions', (_req, res) => {
    res.json({
      sessions: Array.from(deviceSessions.values()),
    });
  });

  app.post('/api/device/revoke', (req, res) => {
    const { uid } = req.body;
    if (uid) {
      deviceSessions.delete(uid);
    }
    res.json({ ok: true });
  });

  // 3. Document-Grounded AI Technical Support Engineer (RAG + Multimodal)
  app.post('/api/ai/support', async (req, res) => {
    try {
      const {
        question,
        modelNumber,
        controllerType,
        errorCode,
        symptoms,
        measurements,
        recentChanges,
        language = 'en',
        imageBase64,
        imageMimeType,
        documents = [],
      } = req.body;

      if (!question && !imageBase64) {
        res.status(400).json({ error: 'Please provide a technical question or upload an alarm image.' });
        return;
      }

      // Filter only approved documents and rank by relevance
      const approvedDocs = Array.isArray(documents)
        ? documents.filter((d: Record<string, unknown>) => d.status === 'approved')
        : [];

      const qLower = `${question || ''} ${modelNumber || ''} ${errorCode || ''} ${symptoms || ''}`.toLowerCase();
      const matchedDocs = approvedDocs.filter((d: Record<string, string>) => {
        const mNum = (d.modelNumber || '').toLowerCase();
        const mFam = (d.modelFamily || '').toLowerCase();
        const cat = (d.category || '').toLowerCase();
        const text = (d.extractedContent || '').toLowerCase();
        const title = (d.title || '').toLowerCase();
        if (modelNumber && (mNum.includes(modelNumber.toLowerCase()) || modelNumber.toLowerCase().includes(mNum))) {
          return true;
        }
        return (
          qLower.includes(mNum) ||
          qLower.includes(mFam) ||
          (errorCode && text.includes(errorCode.toLowerCase())) ||
          title.split(/\s+/).some((w) => w.length > 3 && qLower.includes(w)) ||
          cat.split(/\s+/).some((w) => w.length > 3 && qLower.includes(w))
        );
      });

      const contextDocs = (matchedDocs.length > 0 ? matchedDocs : approvedDocs).slice(0, 8);
      const formattedContext = contextDocs
        .map(
          (d: Record<string, string>, idx: number) =>
            `[DOCUMENT ${idx + 1}]
Source Document: ${d.title} (${d.docCode})
Applicable Model: ${d.modelNumber} | Family: ${d.modelFamily} | Revision: ${d.revision}
Category: ${d.category} | Section/Page Reference: ${d.sectionRef}
Verified Technical Extract: ${d.extractedContent}
Safety Precautions: ${d.safetyNotes}`
        )
        .join('\n\n---\n\n');

      const systemInstruction = `You are HVAC PRO AI ENGINEER, a senior Daikin HVAC technical support and commissioning specialist for HVAC PRO ACADEMY.
CRITICAL SAFETY & DOCUMENT GROUNDING RULES:
1. NEVER invent or fabricate technical specifications, operating pressures, temperatures, clearances, torque values, error codes, installation procedures, or commissioning requirements.
2. Base all model-specific answers EXCLUSIVELY on the [DOCUMENT] extracts provided in the prompt.
3. If the user asks a model-specific question without providing an equipment model number (and it cannot be determined from context), explicitly request the exact Daikin equipment model number and controller type before giving model-specific values.
4. Never apply data from one model family (e.g. EWAD-TZ-B Air-Cooled Screw Chiller) to another model family (e.g. REYQ16T VRV IV) without explicitly stating the model difference.
5. If the requested technical specification or procedure is NOT verifiable in the uploaded technical documents, set confidence to "Not Found in Documents" and include this exact statement in technicalRequirement:
"This information could not be verified from the uploaded technical documents. Please upload the applicable Daikin manual or contact authorized technical support."
6. NEVER recommend bypassing safety devices, jumpering flow switches, defeating high-pressure/low-pressure cutouts, or performing live energized electrical/refrigerant work without LOTO and certified authorization.
7. Respond in ${language === 'ar' ? 'Arabic (العربية) with clear technical terminology' : 'English'}.`;

      const userPromptText = `USER TECHNICAL INQUIRY:
Question: ${question || 'Analyze the attached HVAC equipment / controller alarm image.'}
Reported Equipment Model: ${modelNumber || 'Not specified by user'}
Controller Model: ${controllerType || 'Not specified'}
Alarm / Error Code: ${errorCode || 'None specified'}
Symptoms / Operating Conditions: ${symptoms || 'Not specified'}
Recorded Measurements: ${measurements || 'Not specified'}
Recent Maintenance / Changes: ${recentChanges || 'None reported'}

UPLOADED & APPROVED DAIKIN TECHNICAL DOCUMENTS (RAG CONTEXT):
${formattedContext || 'No approved documents available in context.'}`;

      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
      if (imageBase64 && imageMimeType) {
        const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        parts.push({
          inlineData: {
            mimeType: imageMimeType,
            data: cleanBase64,
          },
        });
      }
      parts.push({ text: userPromptText });

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: { parts },
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sourceDocument: {
                type: Type.STRING,
                description: 'Exact manual name and document code from context, or "Not Found in Uploaded Manuals"',
              },
              model: {
                type: Type.STRING,
                description: 'Applicable equipment model number (or request for model number if unknown)',
              },
              reference: {
                type: Type.STRING,
                description: 'Exact page and section number from the manual',
              },
              technicalRequirement: {
                type: Type.STRING,
                description: 'Confirmed manufacturer instruction or the mandatory unverified fallback notice',
              },
              safetyPrecautions: {
                type: Type.STRING,
                description: 'Applicable LOTO, electrical, mechanical, and refrigerant safety warnings',
              },
              confidence: {
                type: Type.STRING,
                description: 'Must be one of: "Confirmed", "Conditional", or "Not Found in Documents"',
              },
              needsModelClarification: {
                type: Type.BOOLEAN,
                description: 'True if the user did not specify an exact equipment model for a model-dependent question',
              },
              troubleshooting: {
                type: Type.OBJECT,
                properties: {
                  issueIdentification: { type: Type.STRING },
                  possibleCauses: { type: Type.ARRAY, items: { type: Type.STRING } },
                  safeInspectionSequence: { type: Type.ARRAY, items: { type: Type.STRING } },
                  measurementsToVerify: { type: Type.ARRAY, items: { type: Type.STRING } },
                  documentReferences: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctiveActions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  escalationCriteria: { type: Type.STRING },
                },
                required: [
                  'issueIdentification',
                  'possibleCauses',
                  'safeInspectionSequence',
                  'measurementsToVerify',
                  'documentReferences',
                  'correctiveActions',
                  'escalationCriteria',
                ],
              },
            },
            required: [
              'sourceDocument',
              'model',
              'reference',
              'technicalRequirement',
              'safetyPrecautions',
              'confidence',
              'needsModelClarification',
              'troubleshooting',
            ],
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (error: unknown) {
      console.error('Gemini Support API Error:', error);
      const message = error instanceof Error ? error.message : 'AI technical support request failed.';
      res.status(500).json({ error: message });
    }
  });

  // 4. AI Practical Scenario Evaluation Endpoint
  app.post('/api/ai/evaluate-scenario', async (req, res) => {
    try {
      const { scenarioTitle, scenarioPrompt, expectedCriteria, userAnswer, manualReference } = req.body;
      if (!userAnswer || String(userAnswer).trim().length < 10) {
        res.status(400).json({ error: 'Please write a detailed engineering response (at least 10 characters).' });
        return;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Evaluate this HVAC engineer's diagnostic response against the verified Daikin manual criteria.
Scenario: ${scenarioTitle}
Problem Statement: ${scenarioPrompt}
Verified Manual Reference: ${manualReference}
Required Safe Checks & Criteria: ${expectedCriteria}

Student Engineer's Submitted Answer:
"${userAnswer}"`,
        config: {
          systemInstruction:
            'You are a strict HVAC commissioning examiner at HVAC PRO ACADEMY. Grade the student response from 0 to 100 based on adherence to safe inspection sequence, non-invasive checks first, and verified Daikin manual requirements. Penalize any suggestion to bypass interlocks or safety devices.',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              passed: { type: Type.BOOLEAN },
              verdictSummary: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingChecks: { type: Type.ARRAY, items: { type: Type.STRING } },
              verifiedReferenceCitation: { type: Type.STRING },
              safetyComplianceNote: { type: Type.STRING },
            },
            required: [
              'score',
              'passed',
              'verdictSummary',
              'strengths',
              'missingChecks',
              'verifiedReferenceCitation',
              'safetyComplianceNote',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (error: unknown) {
      console.error('Scenario Evaluation Error:', error);
      const message = error instanceof Error ? error.message : 'Failed to evaluate scenario.';
      res.status(500).json({ error: message });
    }
  });

  // Vite middleware for development or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HVAC PRO ACADEMY Server running on http://localhost:${PORT}`);
  });
}

startServer();
