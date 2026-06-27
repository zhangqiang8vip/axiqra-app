// ============================================================
// Axiqra Core Types
// ============================================================

// API Response wrapper
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PageResponse<T = unknown> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// ============================================================
// Enums
// ============================================================

export enum VisibilityScope {
  Private = 'private',
  Workspace = 'workspace',
  Enterprise = 'enterprise',
  Public = 'public',
}

export enum WorkspaceType {
  Personal = 'personal',
  Team = 'team',
  Enterprise = 'enterprise',
}

export enum MemberRole {
  Owner = 'owner',
  Admin = 'admin',
  Member = 'member',
}

export enum RiskLevel {
  R0 = 'R0', // 无风险
  R1 = 'R1', // 低风险
  R2 = 'R2', // 中低风险
  R3 = 'R3', // 中风险
  R4 = 'R4', // 高风险
}

export enum VerificationLevel {
  L0 = 'L0', // 无验证
  L1 = 'L1', // 本地验证
  L2 = 'L2', // 测试环境验证
  L3 = 'L3', // 预发布验证
  L4 = 'L4', // 生产监控
  L5 = 'L5', // 多环境验证
}

export enum SolutionStatus {
  Draft = 'draft',
  Candidate = 'candidate',
  NeedsReview = 'needs_review',
  Reviewed = 'reviewed',
  Verified = 'verified',
  Stable = 'stable',
  Canonical = 'canonical',
  Deprecated = 'deprecated',
  Rejected = 'rejected',
  Quarantined = 'quarantined',
  Archived = 'archived',
}

export enum CaseStatus {
  Draft = 'draft',
  Submitted = 'submitted',
  UnderReview = 'under_review',
  Published = 'published',
  Archived = 'archived',
}

export enum SeedStatus {
  Draft = 'draft',
  CommunitySubmitted = 'community_submitted',
  Qualified = 'qualified',
  CandidatePool = 'candidate_pool',
  Claimed = 'claimed',
  Resolved = 'resolved',
  Closed = 'closed',
}

export enum TraceStatus {
  Draft = 'draft',
  Confirmed = 'confirmed',
  Processing = 'processing',
  ProjectCaseCreated = 'project_case_created',
  Rejected = 'rejected',
}

export enum FeedbackResult {
  Worked = 'worked',
  Failed = 'failed',
  Partial = 'partial',
  NotApplicable = 'not_applicable',
}

export enum ReviewDecision {
  Approve = 'approve',
  RequestMoreInfo = 'request_more_info',
  Reject = 'reject',
  Quarantine = 'quarantine',
  Escalate = 'escalate',
}

export enum ConnectSessionStatus {
  Created = 'created',
  InstructionCopied = 'instruction_copied',
  ToolStarted = 'tool_started',
  DoctorRunning = 'doctor_running',
  Connected = 'connected',
  Degraded = 'degraded',
  Failed = 'failed',
  Revoked = 'revoked',
  Expired = 'expired',
}

export enum InvocationStatus {
  Pending = 'pending',
  Running = 'running',
  Success = 'success',
  Failed = 'failed',
}

// ============================================================
// User & Auth
// ============================================================

export interface User {
  id: number
  username: string
  email: string
  nickname?: string
  avatar?: string
  scopes: string[]
  workspaces: Workspace[]
  createdAt?: string
  updatedAt?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  email: string
  nickname?: string
}

export interface LoginResponse {
  userId: number
  username: string
  nickname?: string
  email: string
  avatar?: string
  token: string
}

// ============================================================
// Workspace
// ============================================================

export interface Workspace {
  id: number
  ownerId: number
  workspaceName: string
  workspaceType: WorkspaceType
  visibilityScope: VisibilityScope
  myRole?: MemberRole
  memberCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateWorkspaceRequest {
  workspaceType: WorkspaceType
  workspaceName?: string
}

// ============================================================
// Search
// ============================================================

export interface SearchRequest {
  query: string
  workspaceId?: number
  techStack?: string
  domain?: string
  riskLevel?: RiskLevel
  verificationLevel?: VerificationLevel
  resultType?: 'all' | 'solution' | 'public_case' | 'project_case' | 'candidate_seed'
  page?: number
  pageSize?: number
}

export interface SearchResult {
  id: number
  type: 'solution' | 'public_case' | 'project_case' | 'candidate_seed'
  title: string
  summary: string
  techStack?: string
  domain?: string
  fitReason?: string
  verificationLevel?: VerificationLevel
  riskLevel?: RiskLevel
  status?: SolutionStatus | CaseStatus | SeedStatus
  author?: string
  createdAt?: string
  updatedAt?: string
  invocationCount?: number
  successRate?: number
  sampleSize?: number
}

// ============================================================
// Public Case
// ============================================================

export interface PublicCase {
  id: number
  workspaceId: number
  projectCaseId?: number
  solutionId?: number
  authorId: number
  authorUsername?: string

  // Content
  title: string
  problemStatement: string
  techStack: string
  environment: string
  timeline: TimelineEntry[]
  failureHypotheses: FailureHypothesis[]
  evidenceChain: Evidence[]
  rootCause: string
  fixSteps: string[]
  verificationResult: string
  learningSummary: string
  migrationBoundary: string

  // Metadata
  verificationLevel: VerificationLevel
  riskLevel: RiskLevel
  visibilityScope: VisibilityScope
  tags?: string[]
  relatedSolutionIds?: number[]

  // Feedback
  feedbackCount?: number
  helpfulCount?: number
  correctionCount?: number

  createdAt?: string
  updatedAt?: string
}

export interface TimelineEntry {
  timestamp: string
  action: string
  result: string
  duration?: string
}

export interface FailureHypothesis {
  hypothesis: string
  evidence: string
  status: 'confirmed' | 'ruled_out' | 'unverified'
}

export interface Evidence {
  uri?: string
  url?: string
  path?: string
  type: string
  hash?: string
  sizeBytes?: number
  description?: string
}

// ============================================================
// Solution
// ============================================================

export interface Solution {
  id: number
  workspaceId: number
  authorId: number
  authorUsername?: string

  // Basic info
  title: string
  summary: string
  techStack: string
  domain?: string

  // Execution view
  applicableScenario: string
  inapplicableBoundary: string
  prerequisites: string[]
  executionSteps: ExecutionStep[]
  verificationSteps: string[]
  riskNotes: string[]
  rollbackMethod: string
  failurePaths: string[]
  aiPrompt?: string
  requiredConfirmation: string

  // Learning view
  sourceCaseIds?: number[]
  whyItWorks: string
  commonMisuses: string[]
  boundaryExplanation: string

  // Metadata
  status: SolutionStatus
  verificationLevel: VerificationLevel
  riskLevel: RiskLevel
  visibilityScope: VisibilityScope
  licenseScope?: string
  tags?: string[]

  // Feedback stats
  invocationCount: number
  successRate: number
  sampleSize: number

  // Relations
  relatedPublicCaseIds?: number[]

  createdAt?: string
  updatedAt?: string
}

export interface ExecutionStep {
  step: string
  command?: string
  expectedResult?: string
}

// ============================================================
// Engineering Trace Package
// ============================================================

export interface EngineeringTracePackage {
  id?: number
  workspaceId?: number
  projectId?: number
  authorId?: number

  // Core content
  taskGoal: string
  projectContext?: string
  forwardPath: ForwardPathStep[]
  reversePath?: string[]
  decisionPath?: DecisionPathStep[]
  failurePath?: string[]
  evidenceRefs: Evidence[]
  rollbackPath?: string[]
  evolutionHint?: string

  // Authorization
  authorization?: Authorization
  riskNotes?: string[]
  riskLevel: RiskLevel

  // Status
  userConfirmationStatus: 'pending' | 'confirmed' | 'rejected' | 'draft'
  outcome?: string

  createdAt?: string
  updatedAt?: string
}

export interface ForwardPathStep {
  step: string
  command?: string
  result?: string
  timestamp?: string
}

export interface DecisionPathStep {
  situation: string
  options: string[]
  chosen: string
  reason: string
  timestamp?: string
}

export interface Authorization {
  agentId?: string
  agentName?: string
  invocationId?: string
  invocationCount?: number
  sessionId?: string
  channel?: string
  toolType?: string
}

// ============================================================
// Project Case
// ============================================================

export interface ProjectCase {
  id: number
  workspaceId: number
  traceId?: number
  authorId: number
  authorUsername?: string

  title: string
  problemStatement: string
  solution: string
  status: CaseStatus

  visibilityScope: VisibilityScope
  techStack?: string
  tags?: string[]

  reviewStatus?: ReviewStatus
  publishedAt?: string

  createdAt?: string
  updatedAt?: string
}

export interface ReviewStatus {
  status: 'pending' | 'approved' | 'rejected' | 'quarantined'
  reviewedBy?: number
  reviewedAt?: string
  reason?: string
}

// ============================================================
// Candidate Seed
// ============================================================

export interface CandidateSeed {
  id: number
  workspaceId: number
  authorId: number
  authorUsername?: string

  queryHash: string
  query?: string
  taskGoal: string
  techStack?: string
  domain?: string
  coverageGap: string

  status: SeedStatus
  assigneeId?: number

  solutionId?: number

  createdAt?: string
  updatedAt?: string
}

export interface CreateSeedRequest {
  query: string
  workspaceId?: number
  techStack?: string
  domain?: string
  taskGoal?: string
  coverageGap?: string
}

// ============================================================
// Connect Session
// ============================================================

export interface ConnectSession {
  id: number
  workspaceId: number
  userId: number
  channel: 'cli' | 'mcp' | 'api' | 'web'
  toolType?: string

  status: ConnectSessionStatus
  sessionToken?: string

  lastDoctorResult?: DoctorResult
  scopes?: string[]

  createdAt?: string
  updatedAt?: string
  expiresAt?: string
}

export interface DoctorResult {
  timestamp: string
  checks: DoctorCheck[]
  overall: 'pass' | 'fail' | 'warning'
}

export interface DoctorCheck {
  name: string
  status: 'pass' | 'fail' | 'warning' | 'skip'
  message?: string
  details?: Record<string, unknown>
}

export interface CreateConnectSessionRequest {
  channel: 'cli' | 'mcp' | 'api' | 'web'
  toolType?: string
  workspaceId?: number
}

// ============================================================
// Invocation & Feedback
// ============================================================

export interface Invocation {
  id: number
  solutionId: number
  sessionId?: number
  userId: number

  status: InvocationStatus
  executionContext?: string
  result?: string
  errorMessage?: string

  createdAt?: string
  completedAt?: string
}

export interface Feedback {
  id: number
  invocationId: number
  userId: number
  result: FeedbackResult
  reason?: string
  context?: string

  createdAt?: string
}

export interface SubmitFeedbackRequest {
  invocationId: number
  result: FeedbackResult
  reason?: string
  context?: string
}

// ============================================================
// Review
// ============================================================

export interface Review {
  id: number
  targetType: 'public_case' | 'solution' | 'project_case'
  targetId: number
  reviewerId?: number

  decision?: ReviewDecision
  reasonCode?: string
  comment?: string

  riskLevel: RiskLevel
  sensitivityFlags?: string[]

  createdAt?: string
  decidedAt?: string
}

export interface ReviewQueueItem {
  id: number
  type: 'public_case' | 'solution' | 'project_case'
  title: string
  authorUsername?: string
  riskLevel: RiskLevel
  sensitivityFlags: string[]
  submittedAt: string
}

export interface SubmitReviewRequest {
  targetType: 'public_case' | 'solution' | 'project_case'
  targetId: number
  decision: ReviewDecision
  reasonCode?: string
  comment?: string
}

// ============================================================
// Quota
// ============================================================

export interface Quota {
  used: number
  limit: number
  resetAt?: string
  scope?: string
}

// ============================================================
// Error types
// ============================================================

export interface ApiError {
  code: number
  message: string
  details?: Record<string, string[]>
}

export interface NetworkError {
  message: string
  code?: string
  status?: number
}
