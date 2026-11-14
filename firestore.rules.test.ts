/**
 * Phase 0 Security Test Specification for HVAC PRO ACADEMY Firestore Rules
 * Verifies that all 12 "Dirty Dozen" adversarial payloads return PERMISSION_DENIED.
 */

export interface DirtyPayloadTestCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'create' | 'update' | 'get' | 'list' | 'delete';
  auth: { uid: string; email: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: DirtyPayloadTestCase[] = [
  {
    id: 1,
    name: 'Privilege Escalation on Registration',
    collectionPath: '/users/user_1',
    operation: 'create',
    auth: { uid: 'user_1', email: 'tech@example.com', email_verified: true },
    payload: { uid: 'user_1', displayName: 'Tech', role: 'admin', plan: 'free' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Shadow Field Injection',
    collectionPath: '/users/user_1',
    operation: 'update',
    auth: { uid: 'user_1', email: 'tech@example.com', email_verified: true },
    payload: { displayName: 'Tech', isSuperUser: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified Admin Email Spoofing',
    collectionPath: '/documents/doc_1',
    operation: 'create',
    auth: { uid: 'spoof_1', email: 'yahyahamdieh50@gmail.com', email_verified: false },
    payload: { title: 'Spoofed IOM' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Cross-User Session Hijack',
    collectionPath: '/user_sessions/user_2',
    operation: 'update',
    auth: { uid: 'user_1', email: 'tech@example.com', email_verified: true },
    payload: { activeDeviceId: 'dev_hijack' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'ID Poisoning Exceeding 128 Chars',
    collectionPath: `/checklists/${'a'.repeat(200)}`,
    operation: 'create',
    auth: { uid: 'user_1', email: 'tech@example.com', email_verified: true },
    payload: { ownerId: 'user_1' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Timestamp Forgery on Certificate',
    collectionPath: '/certificates/cert_1',
    operation: 'create',
    auth: { uid: 'user_1', email: 'tech@example.com', email_verified: true },
    payload: { ownerId: 'user_1', createdAt: '2020-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Immutable Owner Mutation on Checklist',
    collectionPath: '/checklists/chk_1',
    operation: 'update',
    auth: { uid: 'user_1', email: 'tech@example.com', email_verified: true },
    payload: { ownerId: 'user_2' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Draft Manual Read by Non-Admin',
    collectionPath: '/documents/draft_doc_1',
    operation: 'get',
    auth: { uid: 'user_1', email: 'tech@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Cross-User Checklist List Leak',
    collectionPath: '/checklists',
    operation: 'list',
    auth: { uid: 'user_1', email: 'tech@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Completed Lessons Array Overflow (>50)',
    collectionPath: '/users/user_1',
    operation: 'update',
    auth: { uid: 'user_1', email: 'tech@example.com', email_verified: true },
    payload: { completedLessons: Array.from({ length: 60 }, (_, i) => `lesson_${i}`) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Value Poisoning on Whitelisted Field',
    collectionPath: '/users/user_1',
    operation: 'update',
    auth: { uid: 'user_1', email: 'tech@example.com', email_verified: true },
    payload: { displayName: 'X'.repeat(500) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Certificate Post-Issuance Tampering',
    collectionPath: '/certificates/cert_1',
    operation: 'update',
    auth: { uid: 'user_1', email: 'tech@example.com', email_verified: true },
    payload: { scorePct: 100 },
    expectedResult: 'PERMISSION_DENIED',
  },
];
