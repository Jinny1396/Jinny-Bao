# Firestore Security Specification - Artisanal Wedding RSVPs

## Data Invariants
1. **Unauthenticated Creation**: Guest RSVP forms are filled out by unauthenticated visitors. Thus, `create` is permitted without authentication, provided the payload is valid.
2. **PII and Data Isolation (Zero Leak)**: Guests must not be able to list, fetch (get), update, or delete other guests' RSVPs. Reading (`get`, `list`), updating, and deleting is completely disallowed for the general public.
3. **Admin Controls**: If an administrator or the wedding couple wants to read or manage the rsvps, they must authenticate as an admin (explicitly defined via the admins list).
4. **Valid Schema Enforcement**: The RSVP document MUST exactly match the required schema on creation:
   - `name` is a string with size between 1 and 100 characters.
   - `attendance` is a string that is exactly either "attending" or "declined".
   - `timestamp` is a string with length <= 40 representing an ISO format.
   - Optional fields such as `meal`, `dietary`, `songRequest`, and `greeting` must have strict string size limits to prevent "Denial of Wallet" payloads.

---

## The "Dirty Dozen" Payloads (Exploit Verification Scenarios)

The following payloads represent malicious or invalid actions that our Firestore security rules must block:

1. **Mass Unauthenticated Reading (Listing)**:
   - **Operation**: `list` on `/rsvps` by unauthenticated attacker.
   - **Expected Status**: `PERMISSION_DENIED`
2. **Targeted Reading (Get by ID)**:
   - **Operation**: `get` on `/rsvps/someGuestId` by unauthenticated caller.
   - **Expected Status**: `PERMISSION_DENIED`
3. **Ghost Fields Injection**:
   - Creating an RSVP with extra fields (e.g. `isAdmin: true` or `giftStatus: "sent"`).
   - **Expected Status**: `PERMISSION_DENIED` (fails Strict Key match)
4. **Invalid Type for Name**:
   - Creating with `{ name: 12345, attendance: "attending", timestamp: "2026-05-23T14:43:00Z" }`.
   - **Expected Status**: `PERMISSION_DENIED` (name is not string)
5. **Mega-String Denial of Wallet**:
   - Creating with a `name` string containing 250,000 characters to bloat database storage.
   - **Expected Status**: `PERMISSION_DENIED` (fails size limit checks)
6. **Path Variable Poisoning**:
   - Injecting high-entropy gibberish IDs containing special symbols.
   - **Expected Status**: `PERMISSION_DENIED` (fails `isValidId` validation)
7. **Invalid Enum for Attendance**:
   - Creating with `{ name: "Alice", attendance: "maybe", timestamp: "2026-05-23T14:43:00Z" }`.
   - **Expected Status**: `PERMISSION_DENIED` (attendance not in ["attending", "declined"])
8. **Unauthorized Update**:
   - Attempting to overwrite a submitted RSVP by a random guest.
   - **Expected Status**: `PERMISSION_DENIED` (updates not allowed for non-admins)
9. **Unauthorized Deletion**:
   - Attempting to clear an RSVP by non-admins.
   - **Expected Status**: `PERMISSION_DENIED`
10. **Spoofed Creation Timestamp**:
    - Creating an RSVP with no valid timestamp or a future timestamp far off or of invalid type.
    - **Expected Status**: `PERMISSION_DENIED`
11. **Optional Field Type Poisoning**:
    - Injecting array or object instead of string for `dietary` (e.g. `dietary: ["gluten-free", "nuts"]`).
    - **Expected Status**: `PERMISSION_DENIED`
12. **Admin Spoofing**:
    - Trying to authenticate as an admin through custom claims, which are disabled/unsupported.
    - **Expected Status**: `PERMISSION_DENIED`
