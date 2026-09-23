# Contract Management System (GoHighLevel Integrated)

Centralized contract and dynamic form generation platform natively integrated with GoHighLevel.

## Documentation & Specification

The full architectural blueprint and technical specification has been compiled in:
- 📄 **[SPECIFICATION.md](file:///c:/Users/Muneeb/Documents/contractmanager/SPECIFICATION.md)**

## Architecture Summary

- **Centralized Template Model**: Contract Template = Document Builder + Associated Form + GHL Mappings + Conditional Rules + Signing Workflow.
- **Dual Creation Modes**:
  1. **Automatic Mode**: Triggered by GHL Opportunity webhooks (`Opportunity -> WON`), supporting `AWAITING_FORM` and `READY` states.
  2. **Manual Mode**: Authorized GHL users start by choosing a **Contract Template first**, then Contact and Opportunity, with real-time prefill and preview.
- **Dynamic Form Builder**: Unlimited form fields, live GHL field discovery and creation, hybrid storage (GHL sync for CRM fields + JSON for contract-local values).
- **Unified Condition Engine**: One recursive condition engine (AND/OR, 14 operators) powering form visibility, contract clause inclusion/exclusion, and webhook routing rules.
- **Strict GHL-Only Authentication**: Zero standalone passwords; authentication is strictly verified via GHL Signed User Context with a location-level allowlist (`app_user_access`).
- **Data Freeze & Security**: Immutable snapshot on contract send (`snapshot_json`), token-based public client signing portal (`/sign/:token`).
