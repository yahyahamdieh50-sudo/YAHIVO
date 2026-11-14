/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Cpu,
  Wrench,
  ClipboardCheck,
  Gauge,
  AlertOctagon,
  MessageSquare,
  PlayCircle,
  FileCheck2,
  Award,
  CreditCard,
  Shield,
  Search,
  LogIn,
  LogOut,
  Smartphone,
  Sun,
  Moon,
  Lock,
  CheckCircle2,
  ArrowRight,
  FileText,
  KeyRound,
} from 'lucide-react';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  handleFirestoreError,
  OperationType,
  type User,
} from './firebase';
import {
  HERO_CHILLER_IMAGE,
  EQUIPMENT_CATEGORIES,
  INITIAL_TECHNICAL_DOCUMENTS,
  VERIFIED_ERROR_CODES,
  type EquipmentCategory,
  type SeededTechnicalDoc,
} from './data/daikinCatalog';
import { InteractiveSimulationView } from './components/InteractiveSimulationView';
import {
  InstallationCommissioningView,
  type CommissioningReadingState,
} from './components/InstallationCommissioningView';
import { AiEngineerSupportView } from './components/AiEngineerSupportView';
import {
  ExamsAndCertificatesView,
  type AwardedCertificateRecord,
} from './components/ExamsAndCertificatesView';
import {
  AdminAndBillingView,
  type AiAuditLogItem,
} from './components/AdminAndBillingView';

type DashboardSection =
  | 'my-training'
  | 'equipment-library'
  | 'installation-academy'
  | 'pre-commissioning'
  | 'commissioning-academy'
  | 'error-code-finder'
  | 'ai-technical-support'
  | 'video-lessons'
  | 'practical-exams'
  | 'my-certificates'
  | 'subscription-billing'
  | 'admin-portal';

function getOrCreateLocalDeviceId(): string {
  const key = 'hvac_pro_academy_device_id';
  const existing = localStorage.getItem(key);
  if (existing && /^[a-zA-Z0-9_-]+$/.test(existing)) {
    return existing;
  }
  const generated = `wks_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
  localStorage.setItem(key, generated);
  return generated;
}

export default function App() {
  // Theme state (Light / Dark mode with @custom-variant dark in index.css)
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Navigation & Global Model Search State
  const [activeSection, setActiveSection] = useState<DashboardSection>('my-training');
  const [globalModelQuery, setGlobalModelQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory>(
    EQUIPMENT_CATEGORIES[0]
  );
  const [selectedTrackLevel, setSelectedTrackLevel] = useState<
    'beginner' | 'intermediate' | 'advanced'
  >('beginner');

  // Auth & User Profile State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'premium'>('free');
  const [userRole, setUserRole] = useState<'learner' | 'reviewer' | 'editor' | 'admin'>('admin');
  const [dailyAiCount, setDailyAiCount] = useState<number>(1);
  const [completedLessons, setCompletedLessons] = useState<string[]>([
    'air-cooled-chillers-beginner',
  ]);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authEmailInput, setAuthEmailInput] = useState<string>('');
  const [authNameInput, setAuthNameInput] = useState<string>('Eng. Yahya Hamdieh');

  // Mandatory One-Device Account Lock State (Prompt Section 12)
  const [currentDeviceId, setCurrentDeviceId] = useState<string>(() =>
    getOrCreateLocalDeviceId()
  );
  const [deviceConflictLocked, setDeviceConflictLocked] = useState<boolean>(false);
  const [deviceConflictMessage, setDeviceConflictMessage] = useState<string>('');
  const [registeredOtherDeviceLabel, setRegisteredOtherDeviceLabel] = useState<string>('');
  const [demoTransferCode, setDemoTransferCode] = useState<string>('');
  const [transferCodeInput, setTransferCodeInput] = useState<string>('');
  const [transferError, setTransferError] = useState<string>('');
  const [transferringDevice, setTransferringDevice] = useState<boolean>(false);

  // RAG Technical Documents & App Data
  const [documents, setDocuments] = useState<SeededTechnicalDoc[]>(INITIAL_TECHNICAL_DOCUMENTS);
  const [certificates, setCertificates] = useState<AwardedCertificateRecord[]>([
    {
      id: 'cert_demo_01',
      recipientName: 'Eng. Yahya Hamdieh',
      courseId: 'course_chiller_fundamentals',
      courseTitle:
        'Daikin Air-Cooled Screw Chiller Installation & Pre-Commissioning Certification',
      scorePct: 100,
      certificateCode: 'HVACPRO-CHILLR-894120',
      createdAt: '2026-11-10T10:00:00Z',
    },
  ]);
  const [aiLogs, setAiLogs] = useState<AiAuditLogItem[]>([]);
  const [savedChecklistsCount, setSavedChecklistsCount] = useState<number>(1);
  const [savedLogsCount, setSavedLogsCount] = useState<number>(1);

  const [stripeConfigured, setStripeConfigured] = useState<boolean>(false);
  const [isProduction, setIsProduction] = useState<boolean>(false);

  const [platformConfig, setPlatformConfig] = useState({
    freeDailyAiLimit: 5,
    proDailyAiLimit: 50,
    premiumDailyAiLimit: 250,
    proPriceMonthly: 9.99,
    premiumPriceMonthly: 25.0,
    announcementBanner:
      'Verified Reference Library Active: Daikin EWAD-TZ-B IOM, EWWD-VZ Service Manual, VRV IV DIII-Net Manual & Modular AHU/FAHU Guides.',
  });

  // Load server platform config & Stripe billing mode status
  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((cfg) => {
        if (cfg && typeof cfg.freeDailyAiLimit === 'number') {
          setPlatformConfig({
            freeDailyAiLimit: cfg.freeDailyAiLimit,
            proDailyAiLimit: cfg.proDailyAiLimit,
            premiumDailyAiLimit: cfg.premiumDailyAiLimit,
            proPriceMonthly: cfg.proPriceMonthly,
            premiumPriceMonthly: cfg.premiumPriceMonthly,
            announcementBanner: cfg.announcementBanner,
          });
          setStripeConfigured(Boolean(cfg.stripeConfigured));
          setIsProduction(Boolean(cfg.isProduction));
        }
      })
      .catch(() => {});
  }, []);

  // Verify One-Device Session with Server
  const verifyDeviceSession = async (uid: string, email: string) => {
    try {
      const res = await fetch('/api/device/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          email,
          deviceId: currentDeviceId,
          deviceLabel: 'Primary Engineering Workstation (Web)',
        }),
      });
      const data = await res.json();
      if (data.allowed === false) {
        setDeviceConflictLocked(true);
        setDeviceConflictMessage(
          data.message ||
            'This account is already linked to another device. Please sign out of the existing device or complete secure device transfer.'
        );
        setRegisteredOtherDeviceLabel(data.registeredDeviceLabel || 'Secondary Field Device');
        setDemoTransferCode(data.demoVerificationCode || '246810');
      } else {
        setDeviceConflictLocked(false);
      }
    } catch {
      // Fallback if offline
    }
  };

  // Firebase Auth & Firestore Synchronization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setAuthReady(true);

      if (user) {
        const cleanUid = user.uid.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
        const isOwnerAdmin = user.email === 'yahyahamdieh50@gmail.com';
        if (isOwnerAdmin) {
          setUserRole('admin');
        }

        await verifyDeviceSession(cleanUid, user.email || '');

        // Ensure UserProfile document exists in Firestore
        const userRef = doc(db, 'users', cleanUid);
        try {
          const snap = await getDoc(userRef);
          const todayStr = new Date().toISOString().slice(0, 10);
          if (!snap.exists()) {
            await setDoc(userRef, {
              uid: cleanUid,
              displayName: (user.displayName || 'HVAC Engineer').slice(0, 100),
              role: isOwnerAdmin ? 'admin' : 'learner',
              plan: isOwnerAdmin ? 'premium' : 'free',
              dailyAiCount: 0,
              lastAiDate: todayStr,
              completedLessons: ['air-cooled-chillers-beginner'],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } else {
            const data = snap.data();
            if (data.plan) setUserPlan(data.plan);
            if (data.role) setUserRole(data.role);
            if (typeof data.dailyAiCount === 'number') setDailyAiCount(data.dailyAiCount);
            if (Array.isArray(data.completedLessons)) setCompletedLessons(data.completedLessons);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${cleanUid}`);
        }

        // Ensure UserSession document exists in Firestore
        const sessionRef = doc(db, 'user_sessions', cleanUid);
        try {
          const sessSnap = await getDoc(sessionRef);
          if (!sessSnap.exists()) {
            await setDoc(sessionRef, {
              uid: cleanUid,
              activeDeviceId: currentDeviceId.slice(0, 128),
              deviceLabel: 'Primary Engineering Workstation',
              transferCount: 0,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } else {
            const sessData = sessSnap.data();
            if (sessData.activeDeviceId && sessData.activeDeviceId !== currentDeviceId) {
              setDeviceConflictLocked(true);
              setDeviceConflictMessage(
                'This account is already linked to another device. Please sign out of the existing device or complete secure device transfer.'
              );
              setRegisteredOtherDeviceLabel(sessData.deviceLabel || 'Existing Registered Device');
              setDemoTransferCode('246810');
            }
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `user_sessions/${cleanUid}`);
        }
      }
    });

    return () => unsubscribe();
  }, [currentDeviceId]);

  // Listen to user's Firestore certificates and approved documents when signed in
  useEffect(() => {
    if (!authReady || !firebaseUser) return;
    const cleanUid = firebaseUser.uid.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);

    const certQuery = query(
      collection(db, 'certificates'),
      where('ownerId', '==', cleanUid)
    );
    const unsubCerts = onSnapshot(
      certQuery,
      (snap) => {
        if (!snap.empty) {
          const loaded: AwardedCertificateRecord[] = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              recipientName: data.recipientName,
              courseId: data.courseId,
              courseTitle: data.courseTitle,
              scorePct: data.scorePct,
              certificateCode: data.certificateCode,
              createdAt: new Date().toISOString(),
            };
          });
          setCertificates(loaded);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'certificates')
    );

    const docsQuery = query(
      collection(db, 'documents'),
      where('status', '==', 'approved')
    );
    const unsubDocs = onSnapshot(
      docsQuery,
      (snap) => {
        if (!snap.empty) {
          const customDocs: SeededTechnicalDoc[] = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              title: data.title,
              docCode: data.docCode,
              category: data.category,
              modelNumber: data.modelNumber,
              modelFamily: data.modelFamily,
              revision: data.revision,
              docType: data.docType,
              sectionRef: data.sectionRef,
              extractedContent: data.extractedContent,
              safetyNotes: data.safetyNotes,
              status: data.status,
              uploadedBy: data.uploadedBy,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          });
          setDocuments([...INITIAL_TECHNICAL_DOCUMENTS, ...customDocs]);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'documents')
    );

    return () => {
      unsubCerts();
      unsubDocs();
    };
  }, [authReady, firebaseUser]);

  // Simulate signing in from a second device to demonstrate the mandatory One-Device lock
  const handleSimulateSecondDeviceConflict = async () => {
    const uid = firebaseUser?.uid || 'demo_engineer_uid';
    const email = firebaseUser?.email || 'engineer@hvacpro.academy';
    const res = await fetch('/api/device/simulate-conflict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, email }),
    });
    const data = await res.json();
    setDeviceConflictLocked(true);
    setDeviceConflictMessage(
      data.message ||
        'This account is already linked to another device. Please sign out of the existing device or complete secure device transfer.'
    );
    setRegisteredOtherDeviceLabel(
      data.registeredDeviceLabel || 'Field Commissioning iPad Pro (Site B)'
    );
    setDemoTransferCode(data.demoVerificationCode || '246810');
    setTransferCodeInput(data.demoVerificationCode || '246810');
  };

  // Complete Secure Device Transfer and Revoke Previous Session
  const handleCompleteDeviceTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');
    setTransferringDevice(true);
    try {
      const uid = firebaseUser?.uid
        ? firebaseUser.uid.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128)
        : 'demo_engineer_uid';
      const newDeviceId = `wks_transferred_${Math.random().toString(36).slice(2, 9)}`;

      const res = await fetch('/api/device/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          newDeviceId,
          newDeviceLabel: 'Transferred Engineering Workstation',
          verificationCode: transferCodeInput.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTransferError(data.error || 'Verification code invalid.');
        return;
      }

      localStorage.setItem('hvac_pro_academy_device_id', newDeviceId);
      setCurrentDeviceId(newDeviceId);

      if (firebaseUser) {
        const sessionRef = doc(db, 'user_sessions', uid);
        try {
          await updateDoc(sessionRef, {
            activeDeviceId: newDeviceId,
            deviceLabel: 'Transferred Engineering Workstation',
            transferCount: (data.session?.transferCount || 1),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `user_sessions/${uid}`);
        }
      }

      setDeviceConflictLocked(false);
    } finally {
      setTransferringDevice(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setAuthModalOpen(false);
    } catch (err) {
      console.error('Google Sign-In error:', err);
    }
  };

  const dailyAiLimit =
    userPlan === 'premium'
      ? platformConfig.premiumDailyAiLimit
      : userPlan === 'pro'
      ? platformConfig.proDailyAiLimit
      : platformConfig.freeDailyAiLimit;

  // Global Model Number Search Results
  const globalSearchMatches = useMemo(() => {
    const q = globalModelQuery.trim().toLowerCase();
    if (!q) return null;
    const matchedCategories = EQUIPMENT_CATEGORIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.models.some((m) => m.toLowerCase().includes(q)) ||
        c.controllerTypes.some((ct) => ct.toLowerCase().includes(q)) ||
        c.primaryManualCode.toLowerCase().includes(q)
    );
    const matchedDocs = documents.filter(
      (d) =>
        d.status === 'approved' &&
        (d.modelNumber.toLowerCase().includes(q) ||
          d.modelFamily.toLowerCase().includes(q) ||
          d.title.toLowerCase().includes(q) ||
          d.docCode.toLowerCase().includes(q))
    );
    const matchedErrors = VERIFIED_ERROR_CODES.filter(
      (e) =>
        e.code.toLowerCase().includes(q) ||
        e.applicableModels.some((m) => m.toLowerCase().includes(q)) ||
        e.officialDescription.toLowerCase().includes(q)
    );
    return { matchedCategories, matchedDocs, matchedErrors };
  }, [globalModelQuery, documents]);

  // Firestore Mutation Handlers
  const handleCompleteLesson = async (lessonId: string) => {
    if (completedLessons.includes(lessonId)) return;
    const next = [...completedLessons, lessonId].slice(0, 50);
    setCompletedLessons(next);
    if (firebaseUser) {
      const cleanUid = firebaseUser.uid.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
      try {
        await updateDoc(doc(db, 'users', cleanUid), {
          completedLessons: next,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${cleanUid}`);
      }
    }
  };

  const handleSavePreCommChecklist = async (payload: {
    projectName: string;
    modelNumber: string;
    serialNumber: string;
    inspectorName: string;
    summaryStatus: 'pending' | 'ready' | 'hold';
    passedCount: number;
    failedCount: number;
    notes: string;
  }) => {
    setSavedChecklistsCount((c) => c + 1);
    if (!firebaseUser) return;
    const cleanUid = firebaseUser.uid.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
    const checklistId = `chk_${Date.now()}`;
    try {
      await setDoc(doc(db, 'checklists', checklistId), {
        ownerId: cleanUid,
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `checklists/${checklistId}`);
    }
  };

  const handleSaveCommissioningLog = async (payload: CommissioningReadingState) => {
    setSavedLogsCount((c) => c + 1);
    if (!firebaseUser) return;
    const cleanUid = firebaseUser.uid.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
    const logId = `log_${Date.now()}`;
    try {
      await setDoc(doc(db, 'commissioning_logs', logId), {
        ownerId: cleanUid,
        modelNumber: payload.modelNumber.slice(0, 80),
        ambientTempC: Number(payload.ambientTempC),
        enteringWaterTempC: Number(payload.enteringWaterTempC),
        leavingWaterTempC: Number(payload.leavingWaterTempC),
        waterFlowLs: Number(payload.waterFlowLs),
        voltageV: Number(payload.voltageV),
        currentA: Number(payload.currentA),
        capacityPct: Number(payload.capacityPct),
        compressorStatus: payload.compressorStatus.slice(0, 64),
        pumpStatus: payload.pumpStatus.slice(0, 64),
        setpointC: Number(payload.setpointC),
        activeAlarms: payload.activeAlarms.slice(0, 200),
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `commissioning_logs/${logId}`);
    }
  };

  const handleIncrementAiUsage = async (logEntry: {
    modelNumber: string;
    question: string;
    confidence: 'Confirmed' | 'Conditional' | 'Not Found in Documents';
    sourceDoc: string;
  }) => {
    const nextCount = dailyAiCount + 1;
    setDailyAiCount(nextCount);
    const logId = `ailog_${Date.now()}`;
    const newLog: AiAuditLogItem = {
      id: logId,
      ownerId: firebaseUser?.uid || 'local_engineer',
      modelNumber: logEntry.modelNumber,
      question: logEntry.question,
      confidence: logEntry.confidence,
      sourceDoc: logEntry.sourceDoc,
      resolved: logEntry.confidence === 'Confirmed',
      createdAt: new Date().toISOString(),
    };
    setAiLogs((prev) => [newLog, ...prev]);

    if (firebaseUser) {
      const cleanUid = firebaseUser.uid.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
      const todayStr = new Date().toISOString().slice(0, 10);
      try {
        await updateDoc(doc(db, 'users', cleanUid), {
          dailyAiCount: nextCount,
          lastAiDate: todayStr,
          updatedAt: serverTimestamp(),
        });
        await setDoc(doc(db, 'ai_logs', logId), {
          ownerId: cleanUid,
          modelNumber: logEntry.modelNumber.slice(0, 80),
          question: logEntry.question.slice(0, 1000),
          confidence: logEntry.confidence,
          sourceDoc: logEntry.sourceDoc.slice(0, 200),
          resolved: logEntry.confidence === 'Confirmed',
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `ai_logs/${logId}`);
      }
    }
  };

  const handleAwardCertificate = async (cert: {
    courseId: string;
    courseTitle: string;
    scorePct: number;
    certificateCode: string;
  }) => {
    const certId = `cert_${Date.now()}`;
    const recipient = firebaseUser?.displayName || authNameInput || 'HVAC Engineer';
    const newCert: AwardedCertificateRecord = {
      id: certId,
      recipientName: recipient,
      courseId: cert.courseId,
      courseTitle: cert.courseTitle,
      scorePct: cert.scorePct,
      certificateCode: cert.certificateCode,
      createdAt: new Date().toISOString(),
    };
    setCertificates((prev) => [newCert, ...prev]);

    if (firebaseUser) {
      const cleanUid = firebaseUser.uid.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
      try {
        await setDoc(doc(db, 'certificates', certId), {
          ownerId: cleanUid,
          recipientName: recipient.slice(0, 100),
          courseId: cert.courseId.slice(0, 80),
          courseTitle: cert.courseTitle.slice(0, 160),
          scorePct: cert.scorePct,
          certificateCode: cert.certificateCode.slice(0, 64),
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `certificates/${certId}`);
      }
    }
  };

  const handleSimulatePlan = async (
    newPlan: 'free' | 'pro' | 'premium'
  ): Promise<{ ok: boolean; notice?: string; error?: string }> => {
    try {
      const email =
        firebaseUser?.email || authEmailInput || 'yahyahamdieh50@gmail.com';
      const res = await fetch('/api/billing/simulate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: newPlan,
          email,
          isAdmin: userRole === 'admin',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          error: data.error || 'Simulated subscription change rejected by server.',
        };
      }

      setUserPlan(newPlan);

      if (firebaseUser && userRole === 'admin') {
        const cleanUid = firebaseUser.uid.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
        try {
          await updateDoc(doc(db, 'users', cleanUid), {
            plan: newPlan,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${cleanUid}`);
        }
      }

      return {
        ok: true,
        notice:
          data.notice ||
          `DEMO MODE: Simulated ${newPlan.toUpperCase()} subscription active for testing.`,
      };
    } catch {
      return {
        ok: false,
        error: 'Unable to reach server to validate simulated subscription tier.',
      };
    }
  };

  const handleUploadDocument = async (
    docPayload: Omit<SeededTechnicalDoc, 'id' | 'createdAt' | 'updatedAt' | 'uploadedBy'>
  ) => {
    const docId = `doc_${Date.now()}`;
    const newDoc: SeededTechnicalDoc = {
      ...docPayload,
      id: docId,
      uploadedBy: firebaseUser?.uid || 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDocuments((prev) => [newDoc, ...prev]);

    if (firebaseUser && userRole === 'admin') {
      const cleanUid = firebaseUser.uid.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
      try {
        await setDoc(doc(db, 'documents', docId), {
          ...docPayload,
          uploadedBy: cleanUid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `documents/${docId}`);
      }
    }
  };

  const handleUpdateDocumentStatus = async (
    docId: string,
    status: 'draft' | 'approved' | 'archived'
  ) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status } : d))
    );
  };

  const sidebarItems: {
    id: DashboardSection;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'my-training', label: '1. My Training', icon: BookOpen },
    { id: 'equipment-library', label: '2. Equipment Library', icon: Cpu },
    { id: 'installation-academy', label: '3. Installation Academy', icon: Wrench },
    { id: 'pre-commissioning', label: '4. Pre-Commissioning', icon: ClipboardCheck },
    { id: 'commissioning-academy', label: '5. Commissioning Academy', icon: Gauge },
    { id: 'error-code-finder', label: '6. Error Code Finder', icon: AlertOctagon },
    { id: 'ai-technical-support', label: '7. AI Technical Support', icon: MessageSquare },
    { id: 'video-lessons', label: '8. Video Lessons', icon: PlayCircle },
    { id: 'practical-exams', label: '9. Practical Exams', icon: FileCheck2 },
    { id: 'my-certificates', label: '10. My Certificates', icon: Award },
    { id: 'subscription-billing', label: '11. Subscription & Billing', icon: CreditCard },
    { id: 'admin-portal', label: '12. Admin Portal', icon: Shield },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* STRICT 3-ZONE TOP BAR CONTRACT (frontend-design/SKILL.md §2) */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('my-training');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
        >
          HVAC PRO ACADEMY
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveSection('my-training')}
            className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            My Training
          </button>
          <button
            onClick={() => setActiveSection('equipment-library')}
            className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Equipment Library
          </button>
          <button
            onClick={() => setActiveSection('commissioning-academy')}
            className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Commissioning
          </button>
          <button
            onClick={() => setActiveSection('ai-technical-support')}
            className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            AI Engineer
          </button>
          <button
            onClick={() => setActiveSection('subscription-billing')}
            className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Pricing
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveSection('ai-technical-support')}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-500 transition-colors whitespace-nowrap shrink-0"
          >
            Ask AI Engineer
          </button>
        </div>
      </header>

      {/* MANDATORY ONE-DEVICE ENFORCEMENT OVERLAY (Prompt Section 12) */}
      {deviceConflictLocked && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-amber-500 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono text-amber-600 font-semibold">
                  ONE-DEVICE SECURITY ENFORCEMENT
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Active Device Limit Reached
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-100 font-medium leading-relaxed">
              “{deviceConflictMessage ||
                'This account is already linked to another device. Please sign out of the existing device or complete secure device transfer.'}”
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 font-mono bg-slate-50 dark:bg-slate-950 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <div>Currently Linked Device: {registeredOtherDeviceLabel}</div>
              <div>Current Workstation ID: {currentDeviceId}</div>
              <div className="text-sky-600 dark:text-sky-400">
                Security Transfer Verification Code: <strong>{demoTransferCode || '246810'}</strong>
              </div>
            </div>

            <form onSubmit={handleCompleteDeviceTransfer} className="space-y-3 text-xs">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Enter 6-Digit Email Security Code to Transfer Account & Revoke Previous Device:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  placeholder="Enter 6-digit code..."
                  value={transferCodeInput}
                  onChange={(e) => setTransferCodeInput(e.target.value)}
                  className="flex-1 px-3 py-2 font-mono text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={transferringDevice}
                  className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  {transferringDevice
                    ? 'Revoking Old Session...'
                    : 'Complete Secure Device Transfer'}
                </button>
              </div>
              {transferError && (
                <div className="text-rose-600 font-medium">{transferError}</div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ACCOUNT & AUTHENTICATION MODAL */}
      {authModalOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Engineer Account & One-Device Registration
              </h3>
              <button
                onClick={() => setAuthModalOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Sign in with Google to synchronize your pre-commissioning checklists, commissioning
              logs, and completion certificates across Firestore with single-device session
              protection.
            </p>

            <button
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-4 text-xs font-semibold bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Continue with Verified Google Account
            </button>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="font-semibold text-slate-700 dark:text-slate-300">
                Or Update Local Engineer Profile Name (For Certificates & Checklists):
              </div>
              <input
                type="text"
                value={authNameInput}
                onChange={(e) => setAuthNameInput(e.target.value)}
                placeholder="Eng. Full Name"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
              />
              <input
                type="email"
                value={authEmailInput}
                onChange={(e) => setAuthEmailInput(e.target.value)}
                placeholder="engineer@company.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
              />
              <button
                onClick={() => setAuthModalOpen(false)}
                className="w-full py-2 px-4 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg hover:bg-slate-200"
              >
                Save Engineer Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WORKSPACE UTILITY & MODEL NUMBER SEARCH BAR */}
      <div className="bg-slate-900 text-white border-b border-slate-800 px-6 py-3">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Global Model Number Search */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Global Daikin Model Search (e.g. EWAD-TZ-B, EWWD-VZ, REYQ16T, FXFQ100A, DAM-AHU-040, U4)..."
              value={globalModelQuery}
              onChange={(e) => setGlobalModelQuery(e.target.value)}
              className="w-full pl-10 pr-20 py-1.5 text-xs font-mono rounded-lg bg-slate-950 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
            />
            {globalModelQuery && (
              <button
                onClick={() => setGlobalModelQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Account, Demo Mode Indicator, Admin Tier Tester, Device Lock Status & Theme Controls */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-mono text-amber-300">
              {stripeConfigured ? 'Billing: Live Stripe' : 'DEMO MODE (Stripe Optional)'}
            </span>
            {userRole === 'admin' && (
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-700 rounded-lg p-0.5">
                <span className="px-2 text-[11px] font-mono text-slate-400">
                  Admin Test Tier:
                </span>
                {(['free', 'pro', 'premium'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => handleSimulatePlan(tier)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase transition-colors ${
                      userPlan === tier
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            )}
            <span className="font-mono text-slate-300 tabular-nums">
              Device: <strong className="text-emerald-400">{currentDeviceId.slice(0, 14)}</strong> (1/1 Active)
            </span>
            <button
              onClick={handleSimulateSecondDeviceConflict}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium transition-colors whitespace-nowrap shrink-0"
            >
              Simulate 2nd Device Login
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            {firebaseUser ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-200 font-medium">
                  {firebaseUser.displayName || firebaseUser.email}
                </span>
                <button
                  onClick={() => firebaseSignOut(auth)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  <LogOut className="w-3 h-3" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold whitespace-nowrap shrink-0"
              >
                <KeyRound className="w-3 h-3" />
                {authNameInput} · Sign In / Sync
              </button>
            )}
          </div>
        </div>
      </div>

      {/* GLOBAL MODEL NUMBER SEARCH RESULTS PANEL */}
      {globalSearchMatches && (
        <div className="bg-sky-950 text-white border-b border-sky-800 px-6 py-4">
          <div className="max-w-[1440px] mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono text-sky-300">
                MODEL-SPECIFIC KNOWLEDGE BASE FILTER: &ldquo;{globalModelQuery}&rdquo;
              </div>
              <button
                onClick={() => setGlobalModelQuery('')}
                className="text-xs text-sky-300 hover:text-white underline"
              >
                Close Search Results
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/90 border border-sky-800/60 space-y-1.5">
                <div className="font-bold text-sky-400">
                  Matched Equipment Academies ({globalSearchMatches.matchedCategories.length})
                </div>
                {globalSearchMatches.matchedCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCategory(c);
                      setActiveSection('equipment-library');
                      setGlobalModelQuery('');
                    }}
                    className="block w-full text-left py-1 hover:text-sky-300"
                  >
                    &rarr; {c.name} ({c.models.join(', ')})
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-sky-800/60 space-y-1.5">
                <div className="font-bold text-sky-400">
                  Verified Daikin Manuals ({globalSearchMatches.matchedDocs.length})
                </div>
                {globalSearchMatches.matchedDocs.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setActiveSection('ai-technical-support');
                      setGlobalModelQuery('');
                    }}
                    className="block w-full text-left py-1 hover:text-sky-300"
                  >
                    &rarr; {d.docCode}: {d.title} ({d.modelNumber})
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-sky-800/60 space-y-1.5">
                <div className="font-bold text-sky-400">
                  Matched Error Codes ({globalSearchMatches.matchedErrors.length})
                </div>
                {globalSearchMatches.matchedErrors.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => {
                      setActiveSection('error-code-finder');
                      setGlobalModelQuery('');
                    }}
                    className="block w-full text-left py-1 hover:text-sky-300"
                  >
                    &rarr; Code {e.code}: {e.officialDescription}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN WORKSPACE CONTAINER (Sidebar + Viewport) */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto flex flex-col lg:flex-row">
        {/* Left Navigation Sidebar (260px on desktop) */}
        <aside className="w-full lg:w-64 shrink-0 bg-white dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[11px] font-mono text-slate-400">
              LEARN · INSTALL · COMMISSION
            </div>
            <div className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-slate-900 dark:bg-sky-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subscription & Daily Quota Summary Card in Sidebar */}
          <div className="hidden lg:block mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Billing Mode</span>
              <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                {stripeConfigured ? 'LIVE STRIPE' : 'DEMO MODE'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Current Tier</span>
              <span className="font-mono font-bold uppercase text-sky-600 dark:text-sky-400">
                {userPlan} {!stripeConfigured ? '(SIMULATED)' : ''}
              </span>
            </div>
            <div className="flex items-center justify-between font-mono tabular-nums">
              <span className="text-slate-500">AI Questions Today</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {dailyAiCount} / {dailyAiLimit}
              </span>
            </div>
            <div className="flex items-center justify-between font-mono tabular-nums">
              <span className="text-slate-500">Completed Modules</span>
              <span className="font-semibold text-emerald-600">
                {completedLessons.length}
              </span>
            </div>
            <button
              onClick={() => setActiveSection('subscription-billing')}
              className="w-full py-1.5 px-3 text-xs font-semibold bg-slate-900 dark:bg-slate-800 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              {stripeConfigured ? 'Manage Plan' : 'Test Subscription Plans'}
            </button>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-x-hidden">
          {/* SECTION 1: MY TRAINING & HERO DASHBOARD */}
          {activeSection === 'my-training' && (
            <div className="space-y-8">
              {/* Hero Split Card (Prompt Section 14) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch bg-slate-900 text-white rounded-2xl border border-slate-800 overflow-hidden">
                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="text-xs font-mono text-sky-400">
                      HVAC PRO ACADEMY · LEARN. INSTALL. COMMISSION. TROUBLESHOOT.
                    </div>
                    <h1
                      className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight"
                      style={{ textWrap: 'balance' }}
                    >
                      Become an HVAC Expert with AI-Powered Training.
                    </h1>
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                      Learn equipment installation, commissioning, troubleshooting and maintenance
                      with technical-document-based training and AI engineering support.
                    </p>
                  </div>

                  {/* All 4 Primary Buttons from Prompt Section 14 */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveSection('equipment-library')}
                      className="px-4 py-2.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      Start Free Training
                    </button>
                    <button
                      onClick={() => setActiveSection('video-lessons')}
                      className="px-4 py-2.5 text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      Explore HVAC Courses
                    </button>
                    <button
                      onClick={() => setActiveSection('ai-technical-support')}
                      className="px-4 py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      Ask AI Engineer
                    </button>
                    <button
                      onClick={() => setActiveSection('subscription-billing')}
                      className="px-4 py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      View Subscription Plans
                    </button>
                  </div>
                </div>

                {/* Right Hero Image with Fallback */}
                <div className="lg:col-span-5 relative min-h-[260px] bg-slate-950">
                  <img
                    src={HERO_CHILLER_IMAGE}
                    alt="Modern commercial Daikin chiller plantroom and rooftop hydronic piping installation"
                    referrerPolicy="no-referrer"
                    className="w-full h-full lg:h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-6">
                    <div className="text-xs font-mono text-sky-400">
                      VERIFIED MANUAL GROUNDING
                    </div>
                    <div className="text-xs text-slate-200 mt-1">
                      Every specification, pressure stage, and clearance is cited directly from
                      uploaded Daikin IOM & Service Manuals.
                    </div>
                  </div>
                </div>
              </div>

              {/* 4-Column Engineering KPI Strip Below Hero Split */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <div className="text-xs text-slate-500">Equipment Training Academies</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
                    12 Categories
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Beginner · Intermediate · Advanced
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <div className="text-xs text-slate-500">Approved RAG Manuals Active</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-sky-600 dark:text-sky-400 mt-1">
                    {documents.filter((d) => d.status === 'approved').length} Manuals
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Page & Section Citation Enforced
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <div className="text-xs text-slate-500">Pre-Comm & Commissioning Logs</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
                    16 + 13 Steps
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Hold Points & Readiness Reports
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <div className="text-xs text-slate-500">Earned Academy Certificates</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-1">
                    {certificates.length} Awarded
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Verified Assessment Completion
                  </div>
                </div>
              </div>

              {/* 12 Equipment Training Academies Grid Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      12 Specialized Daikin HVAC Equipment Academies
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Select any equipment category to open model-specific beginner, intermediate,
                      and advanced modules.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveSection('equipment-library')}
                    className="text-xs font-semibold text-sky-600 hover:underline inline-flex items-center gap-1"
                  >
                    Open Full Library
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {EQUIPMENT_CATEGORIES.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setActiveSection('equipment-library');
                      }}
                      className="cursor-pointer bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-sky-500 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="h-40 bg-slate-900 relative overflow-hidden">
                          <img
                            src={cat.image}
                            alt={cat.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3.5">
                            <span className="text-xs font-mono text-white font-semibold">
                              {cat.index}. {cat.shortName} · Ref: {cat.primaryManualCode}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 space-y-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {cat.name}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {cat.summary}
                          </p>
                        </div>
                      </div>

                      <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
                        <span>Models: {cat.models.slice(0, 2).join(', ')}</span>
                        <span className="text-sky-600 dark:text-sky-400 font-sans font-semibold">
                          3 Tracks &rarr;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: EQUIPMENT LIBRARY (All 12 Categories with Beginner/Intermediate/Advanced Tracks) */}
          {activeSection === 'equipment-library' && (
            <div className="space-y-8">
              <div className="pb-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    <span>12 Equipment Training Academies</span>
                    <span className="mx-2">·</span>
                    <span>Structured Beginner, Intermediate & Advanced Curricula</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
                    {selectedCategory.index}. {selectedCategory.name}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSection('installation-academy')}
                    className="px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
                  >
                    Installation Checklist
                  </button>
                  <button
                    onClick={() => setActiveSection('ai-technical-support')}
                    className="px-3.5 py-2 text-xs font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-500 transition-colors whitespace-nowrap shrink-0"
                  >
                    Ask AI About {selectedCategory.models[0]}
                  </button>
                </div>
              </div>

              {/* Category Selector Strip */}
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      selectedCategory.id === cat.id
                        ? 'bg-slate-900 dark:bg-sky-600 text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {cat.index}. {cat.shortName}
                  </button>
                ))}
              </div>

              {/* Selected Category Detail & 3 Training Tracks */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <img
                    src={selectedCategory.image}
                    alt={selectedCategory.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-56 object-cover"
                  />
                  <div className="p-5 space-y-4 text-xs">
                    <div>
                      <div className="text-slate-500">Supported Daikin Models:</div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                        {selectedCategory.models.join(' · ')}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Applicable Controllers:</div>
                      <div className="font-mono font-semibold text-sky-600 dark:text-sky-400 mt-0.5">
                        {selectedCategory.controllerTypes.join(' · ')}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Primary Reference Manual:</div>
                      <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        {selectedCategory.primaryManualCode}
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedCategory.summary}
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-4">
                  {/* Track Level Selector */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setSelectedTrackLevel(lvl)}
                        className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md capitalize transition-colors ${
                          selectedTrackLevel === lvl
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        {lvl} Level ({selectedCategory.tracks[lvl].duration})
                      </button>
                    ))}
                  </div>

                  {/* Active Track Curriculum Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="text-xs font-mono text-sky-600 uppercase">
                          {selectedTrackLevel} ENGINEERING MODULE ·{' '}
                          {selectedCategory.tracks[selectedTrackLevel].duration}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                          {selectedCategory.tracks[selectedTrackLevel].title}
                        </h3>
                      </div>

                      <button
                        onClick={() =>
                          handleCompleteLesson(`${selectedCategory.id}-${selectedTrackLevel}`)
                        }
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                          completedLessons.includes(
                            `${selectedCategory.id}-${selectedTrackLevel}`
                          )
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 dark:bg-sky-600 text-white hover:bg-slate-800'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {completedLessons.includes(
                          `${selectedCategory.id}-${selectedTrackLevel}`
                        )
                          ? 'Track Completed'
                          : 'Complete Track'}
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Verified Curriculum & Manual Learning Objectives:
                      </div>
                      {selectedCategory.tracks[selectedTrackLevel].topics.map((topic, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs"
                        >
                          <span className="font-mono font-bold text-sky-600">0{i + 1}.</span>
                          <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {topic}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs font-mono text-slate-500">
                        Manual Ref: {selectedCategory.primaryManualCode}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveSection('video-lessons')}
                          className="px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-200"
                        >
                          Open Interactive Simulator
                        </button>
                        <button
                          onClick={() => setActiveSection('practical-exams')}
                          className="px-3.5 py-2 text-xs font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-500"
                        >
                          Take Assessment Exam
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTIONS 3, 4 & 5: INSTALLATION, PRE-COMMISSIONING & COMMISSIONING */}
          {(activeSection === 'installation-academy' ||
            activeSection === 'pre-commissioning' ||
            activeSection === 'commissioning-academy') && (
            <InstallationCommissioningView
              activeSubTab={
                activeSection === 'installation-academy'
                  ? 'installation'
                  : activeSection === 'pre-commissioning'
                  ? 'pre-commissioning'
                  : 'commissioning'
              }
              setActiveSubTab={(sub) => {
                if (sub === 'installation') setActiveSection('installation-academy');
                if (sub === 'pre-commissioning') setActiveSection('pre-commissioning');
                if (sub === 'commissioning') setActiveSection('commissioning-academy');
              }}
              selectedModelFilter={globalModelQuery || selectedCategory.models[0]}
              onSavePreCommChecklist={handleSavePreCommChecklist}
              onSaveCommissioningLog={handleSaveCommissioningLog}
              savedChecklistsCount={savedChecklistsCount}
              savedLogsCount={savedLogsCount}
            />
          )}

          {/* SECTIONS 6 & 7: ERROR CODE FINDER & AI TECHNICAL SUPPORT */}
          {(activeSection === 'ai-technical-support' ||
            activeSection === 'error-code-finder') && (
            <AiEngineerSupportView
              mode={activeSection === 'error-code-finder' ? 'error-codes' : 'ai-support'}
              setMode={(m) =>
                setActiveSection(
                  m === 'error-codes' ? 'error-code-finder' : 'ai-technical-support'
                )
              }
              documents={documents}
              selectedModelFilter={globalModelQuery || selectedCategory.models[0]}
              dailyAiCount={dailyAiCount}
              dailyAiLimit={dailyAiLimit}
              userPlan={userPlan}
              onIncrementAiUsage={handleIncrementAiUsage}
              onOpenUpgradeModal={() => setActiveSection('subscription-billing')}
            />
          )}

          {/* SECTION 8: VIDEO LESSONS & INTERACTIVE SIMULATIONS */}
          {activeSection === 'video-lessons' && (
            <InteractiveSimulationView
              onCompleteLesson={handleCompleteLesson}
              completedLessons={completedLessons}
            />
          )}

          {/* SECTIONS 9 & 10: PRACTICAL EXAMS & MY CERTIFICATES */}
          {(activeSection === 'practical-exams' || activeSection === 'my-certificates') && (
            <ExamsAndCertificatesView
              activeSubTab={
                activeSection === 'my-certificates' ? 'certificates' : 'exams'
              }
              setActiveSubTab={(sub) =>
                setActiveSection(
                  sub === 'certificates' ? 'my-certificates' : 'practical-exams'
                )
              }
              userPlan={userPlan}
              userName={firebaseUser?.displayName || authNameInput}
              certificates={certificates}
              onAwardCertificate={handleAwardCertificate}
              onOpenUpgradeModal={() => setActiveSection('subscription-billing')}
            />
          )}

          {/* SECTIONS 11 & 12: SUBSCRIPTION & BILLING / ADMIN PORTAL */}
          {(activeSection === 'subscription-billing' ||
            activeSection === 'admin-portal') && (
            <AdminAndBillingView
              mode={activeSection === 'admin-portal' ? 'admin' : 'billing'}
              userPlan={userPlan}
              isAdminUser={userRole === 'admin'}
              userEmail={
                firebaseUser?.email || authEmailInput || 'yahyahamdieh50@gmail.com'
              }
              stripeConfigured={stripeConfigured}
              isProduction={isProduction}
              onSimulatePlan={handleSimulatePlan}
              documents={documents}
              onUploadDocument={handleUploadDocument}
              onUpdateDocumentStatus={handleUpdateDocumentStatus}
              aiLogs={aiLogs}
              onResolveAiLog={async (logId) => {
                setAiLogs((prev) =>
                  prev.map((l) => (l.id === logId ? { ...l, resolved: true } : l))
                );
              }}
              platformConfig={platformConfig}
              onSavePlatformConfig={async (newCfg) => {
                setPlatformConfig(newCfg);
                await fetch('/api/admin/config', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(newCfg),
                });
              }}
              onSimulateSecondDeviceLock={handleSimulateSecondDeviceConflict}
              currentDeviceId={currentDeviceId}
            />
          )}
        </main>
      </div>

      {/* QUIET EDITORIAL FOOTER WITH NON-AFFILIATION NOTICE (Prompt Section 1) */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-5 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <strong className="text-slate-800 dark:text-slate-200">
              HVAC PRO ACADEMY — AI Training &amp; Technical Support
            </strong>{' '}
            · Independent engineering training and document-grounded diagnostic platform. Not
            officially affiliated with or endorsed by Daikin Industries, Ltd.
          </div>
          <div className="font-mono shrink-0">
            All technical procedures must be verified against official project IOMs by qualified
            personnel.
          </div>
        </div>
      </footer>
    </div>
  );
}
