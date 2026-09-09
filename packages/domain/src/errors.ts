export class PsxError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "PsxError";
    this.code = code;
  }
}

export class CanonicalImportError extends PsxError {
  constructor(message: string) {
    super("canonical_import_failed", message);
    this.name = "CanonicalImportError";
  }
}

export class CanonicalCountsError extends PsxError {
  constructor(message: string) {
    super("canonical_counts_mismatch", message);
    this.name = "CanonicalCountsError";
  }
}

export class AutoClaimForbiddenError extends PsxError {
  constructor(message = "Achievements are never auto-claimed. Only an explicit user Claim action is allowed.") {
    super("auto_claim_forbidden", message);
    this.name = "AutoClaimForbiddenError";
  }
}

export class ClaimNotAllowedError extends PsxError {
  constructor(message: string) {
    super("claim_not_allowed", message);
    this.name = "ClaimNotAllowedError";
  }
}

export class NotFoundError extends PsxError {
  constructor(message: string) {
    super("not_found", message);
    this.name = "NotFoundError";
  }
}

export class IsolationError extends PsxError {
  constructor(message: string) {
    super("user_isolation", message);
    this.name = "IsolationError";
  }
}

export class DomainRuleError extends PsxError {
  constructor(code: string, message: string) {
    super(code, message);
    this.name = "DomainRuleError";
  }
}
