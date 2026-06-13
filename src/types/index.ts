export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PageResult<T = unknown> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

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
