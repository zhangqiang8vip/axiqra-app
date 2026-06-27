<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
  type?: 'solution' | 'case' | 'seed' | 'trace' | 'session' | 'review'
  size?: 'sm' | 'md' | 'lg'
}>()

const config = computed(() => {
  const type = props.type || 'solution'
  
  const statusMap: Record<string, Record<string, { color: string; bg: string; label: string }>> = {
    solution: {
      draft: { color: 'var(--color-text-muted)', bg: 'var(--color-bg-secondary)', label: '草稿' },
      candidate: { color: 'var(--color-primary)', bg: 'rgba(37, 99, 235, 0.1)', label: '候选' },
      needs_review: { color: 'var(--color-warning)', bg: 'rgba(234, 179, 8, 0.1)', label: '待审核' },
      reviewed: { color: 'var(--color-success)', bg: 'rgba(34, 197, 94, 0.1)', label: '已审核' },
      verified: { color: 'var(--color-success)', bg: 'rgba(34, 197, 94, 0.15)', label: '已验证' },
      stable: { color: 'var(--color-success)', bg: 'rgba(34, 197, 94, 0.2)', label: '稳定' },
      canonical: { color: 'var(--color-primary)', bg: 'rgba(37, 99, 235, 0.2)', label: '标准' },
      deprecated: { color: 'var(--color-warning)', bg: 'rgba(234, 179, 8, 0.15)', label: '已废弃' },
      rejected: { color: 'var(--color-error)', bg: 'rgba(239, 68, 68, 0.1)', label: '已拒绝' },
      quarantined: { color: 'var(--color-error)', bg: 'rgba(239, 68, 68, 0.15)', label: '隔离' },
      archived: { color: 'var(--color-text-muted)', bg: 'var(--color-bg-secondary)', label: '归档' },
    },
    case: {
      draft: { color: 'var(--color-text-muted)', bg: 'var(--color-bg-secondary)', label: '草稿' },
      submitted: { color: 'var(--color-primary)', bg: 'rgba(37, 99, 235, 0.1)', label: '已提交' },
      under_review: { color: 'var(--color-warning)', bg: 'rgba(234, 179, 8, 0.1)', label: '审核中' },
      published: { color: 'var(--color-success)', bg: 'rgba(34, 197, 94, 0.1)', label: '已发布' },
      archived: { color: 'var(--color-text-muted)', bg: 'var(--color-bg-secondary)', label: '归档' },
    },
    seed: {
      draft: { color: 'var(--color-text-muted)', bg: 'var(--color-bg-secondary)', label: '草稿' },
      community_submitted: { color: 'var(--color-primary)', bg: 'rgba(37, 99, 235, 0.1)', label: '社区提交' },
      qualified: { color: 'var(--color-success)', bg: 'rgba(34, 197, 94, 0.1)', label: '合格' },
      candidate_pool: { color: 'var(--color-primary)', bg: 'rgba(37, 99, 235, 0.15)', label: '候选池' },
      claimed: { color: 'var(--color-warning)', bg: 'rgba(234, 179, 8, 0.1)', label: '已认领' },
      resolved: { color: 'var(--color-success)', bg: 'rgba(34, 197, 94, 0.15)', label: '已解决' },
      closed: { color: 'var(--color-text-muted)', bg: 'var(--color-bg-secondary)', label: '已关闭' },
    },
    trace: {
      draft: { color: 'var(--color-text-muted)', bg: 'var(--color-bg-secondary)', label: '草稿' },
      confirmed: { color: 'var(--color-success)', bg: 'rgba(34, 197, 94, 0.1)', label: '已确认' },
      processing: { color: 'var(--color-warning)', bg: 'rgba(234, 179, 8, 0.1)', label: '处理中' },
      project_case_created: { color: 'var(--color-success)', bg: 'rgba(34, 197, 94, 0.15)', label: '已生成' },
      rejected: { color: 'var(--color-error)', bg: 'rgba(239, 68, 68, 0.1)', label: '已拒绝' },
    },
    session: {
      created: { color: 'var(--color-text-muted)', bg: 'var(--color-bg-secondary)', label: '已创建' },
      instruction_copied: { color: 'var(--color-primary)', bg: 'rgba(37, 99, 235, 0.1)', label: '指令已复制' },
      tool_started: { color: 'var(--color-primary)', bg: 'rgba(37, 99, 235, 0.15)', label: '工具已启动' },
      doctor_running: { color: 'var(--color-warning)', bg: 'rgba(234, 179, 8, 0.1)', label: '诊断中' },
      connected: { color: 'var(--color-success)', bg: 'rgba(34, 197, 94, 0.1)', label: '已连接' },
      degraded: { color: 'var(--color-warning)', bg: 'rgba(234, 179, 8, 0.15)', label: '降级' },
      failed: { color: 'var(--color-error)', bg: 'rgba(239, 68, 68, 0.1)', label: '失败' },
      revoked: { color: 'var(--color-text-muted)', bg: 'var(--color-bg-secondary)', label: '已撤销' },
      expired: { color: 'var(--color-text-muted)', bg: 'var(--color-bg-secondary)', label: '已过期' },
    },
    review: {
      pending: { color: 'var(--color-warning)', bg: 'rgba(234, 179, 8, 0.1)', label: '待审核' },
      approved: { color: 'var(--color-success)', bg: 'rgba(34, 197, 94, 0.1)', label: '已批准' },
      rejected: { color: 'var(--color-error)', bg: 'rgba(239, 68, 68, 0.1)', label: '已拒绝' },
      quarantined: { color: 'var(--color-error)', bg: 'rgba(239, 68, 68, 0.15)', label: '隔离' },
    },
  }

  const typeConfig = statusMap[type] || statusMap['solution'] || {}
  return typeConfig[props.status] || { color: 'var(--color-text-muted)', bg: 'var(--color-bg-secondary)', label: props.status }
})

const sizeClass = computed(() => `badge--${props.size || 'md'}`)
</script>

<template>
  <span class="badge status-badge" :class="sizeClass" :style="{ color: config.color, backgroundColor: config.bg }">
    {{ config.label }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-md);
  font-weight: 500;
  white-space: nowrap;
}

.badge--sm {
  font-size: var(--font-size-xs);
  padding: 0.0625rem 0.375rem;
}

.badge--md {
  font-size: var(--font-size-sm);
}

.badge--lg {
  font-size: var(--font-size-base);
  padding: 0.25rem 0.75rem;
}
</style>
