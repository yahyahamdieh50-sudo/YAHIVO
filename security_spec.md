# Security Specification (Phase 0: Payload-First Security TDD)

## 1. Data Invariants

1. **Default-Deny Catch-All**: All unspecified paths under `/databases/{database}/documents/{document=**}` are strictly denied (`allow read, write: if false;`).
2. **Email Verification & Bootstrapped Admin**: All standard writes require `isSignedIn() && isVerified()`. Admin privileges (`isAdmin()`) require either an explicit document in `/admins/$(request.auth.uid)` or the bootstrapped owner email `yahyahamdieh50@gmail.com` with `request.auth.token.email_verified == true`.
3. **Self-Assigned Role Prevention**: Regular users creating `/users/{userId}` can only set `role == 'learner'` and `plan == 'free'`. Only `isAdmin()` can assign elevated roles (`admin`, `reviewer`, `editor`).
4. **One-Device Session Ownership**: `/user_sessions/{userId}` can only be read or written by the matching authenticated user (`userId == request.auth.uid`) or `isAdmin()`.
5. **Document Approval Gate**: Non-admin users can only read `/documents/{docId}` when `resource.data.status == 'approved'`. Only `isAdmin()` can create, update, or archive technical documents.
6. **Strict Schema, Key Allowlisting & Temporal Integrity**: Every `create` enforces `hasAll` and `hasOnly` with `createdAt == request.time`. Every `update` wraps the entire block in `isValid[Entity](incoming())`, enforces immutable `uid`/`ownerId`/`createdAt`, enforces `updatedAt == request.time`, and restricts modified keys via `affectedKeys().hasOnly(...)`.

## 2. The "Dirty Dozen" Payloads

1. **Payload 1 (Privilege Escalation on Registration)**: User creates `/users/{uid}` with `role: "admin"`. -> `PERMISSION_DENIED`
2. **Payload 2 (Shadow Field Injection)**: User updates `/users/{uid}` adding `isSuperUser: true`. -> `PERMISSION_DENIED`
3. **Payload 3 (Unverified Email Spoofing)**: Attacker with `email: "yahyahamdieh50@gmail.com"` and `email_verified: false` writes to `/documents/doc1`. -> `PERMISSION_DENIED`
4. **Payload 4 (Cross-User Session Hijack)**: User `userA` updates `/user_sessions/userB` to steal device lock. -> `PERMISSION_DENIED`
5. **Payload 5 (ID Poisoning / 2KB Document ID)**: User creates `/checklists/{2000_char_id}` exceeding 128 chars. -> `PERMISSION_DENIED`
6. **Payload 6 (Timestamp Forgery)**: User creates `/certificates/cert_1` with backdated `createdAt`. -> `PERMISSION_DENIED`
7. **Payload 7 (Immutable Owner Mutation)**: User updates `/checklists/chk_1` changing `ownerId` to another UID. -> `PERMISSION_DENIED`
8. **Payload 8 (Draft Manual Scraping)**: Non-admin user queries `/documents` where `status == 'draft'`. -> `PERMISSION_DENIED`
9. **Payload 9 (Blanket List Leak on Checklists)**: User `userA` lists `/checklists` belonging to `userB`. -> `PERMISSION_DENIED`
10. **Payload 10 (Array Overflow Attack)**: User updates `/users/{uid}` with `completedLessons` containing 500 items (`> 50`). -> `PERMISSION_DENIED`
11. **Payload 11 (Value Poisoning on Update)**: User updates whitelisted field `displayName` on `/users/{uid}` with a 10,000-char string. -> `PERMISSION_DENIED`
12. **Payload 12 (Certificate Score Tampering)**: User attempts to update an existing `/certificates/{certId}` after issuance. -> `PERMISSION_DENIED`
