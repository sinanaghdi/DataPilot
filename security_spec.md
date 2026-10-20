# Security Specification for DataPilot

## 1. Data Invariants
1. **User Profile Ownership**: A user profile document at `/users/{userId}` can only be created, read, and updated by the authenticated user whose `request.auth.uid == userId`.
2. **Project Ownership & Master Gate**: Projects in `/users/{userId}/projects/{projectId}` belong exclusively to `userId`. Cross-user access is strictly forbidden (`request.auth.uid == userId`).
3. **Analysis Association**: Any saved analysis in `/users/{userId}/analyses/{analysisId}` must have `incoming().userId == request.auth.uid` and match the path `userId`.
4. **Strict Keys & Anti-Shadow Fields**: Creation payloads must only contain schema-specified keys; unlisted fields will trigger validation failure.
5. **ID Poisoning Protection**: All document IDs `{userId}`, `{projectId}`, and `{analysisId}` must be alphanumeric and bounded `<= 128` chars.
6. **Temporal Integrity**: `createdAt` and `updatedAt` are strictly bounded by server timestamp `request.time`.
7. **Immutable Identity**: `userId` and `id` cannot be modified during updates.

## 2. The Dirty Dozen Malicious Payloads (Tested to Return PERMISSION_DENIED)
1. **Payload 1 (Identity Hijack)**: Unauthenticated write to `/users/victim_123` with `{ uid: "victim_123", email: "hacker@evil.com" }`.
2. **Payload 2 (Cross-User Profile Tampering)**: User `attacker_456` attempts to overwrite `/users/victim_123`.
3. **Payload 3 (Shadow Field Injection)**: User creates project with extra ghost field `{ id: "p1", userId: "u1", ..., "isAdmin": true, "superUser": true }`.
4. **Payload 4 (ID Path Poisoning)**: Write to document ID containing invalid characters or huge buffer: `/users/u1/projects/../../etc/passwd` or 5000 character junk string.
5. **Payload 5 (Owner ID Reassignment)**: Updating existing project to set `userId` from `u1` to `u2`.
6. **Payload 6 (Oversized String Buffer Overflow)**: Project title payload exceeding 200 characters (e.g. 10,000 'A' characters) causing wallet exhaustion.
7. **Payload 7 (Fake Timestamp Spoofing)**: Client provides arbitrary past or future timestamp `{ createdAt: timestamp.date(2020, 1, 1) }`.
8. **Payload 8 (Negative or NaN Numbers)**: Client passes string or negative number into `rowCount` or `columnCount`.
9. **Payload 9 (Cross-User Analysis Injection)**: User `u1` attempts to write an analysis into `u2`'s subcollection `/users/u2/analyses/a1`.
10. **Payload 10 (Analysis Orphan Write)**: Client attempts to write analysis referencing empty or malicious string projectId.
11. **Payload 11 (Blanket Collection Scrape)**: Attacker attempts collection group query or list query across all users' projects without path binding.
12. **Payload 12 (Unauthorized Deletion)**: Attacker tries to delete another user's project or profile.
