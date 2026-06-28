<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card, DataState } from '@/components'

const { t } = useI18n()

const loading = ref(true)
const error = ref<string | null>(null)

interface Certification {
  id: number
  type: 'api_key' | 'oauth' | 'mcp' | 'cli'
  name: string
  status: 'active' | 'inactive' | 'expired'
  keyPreview: string
  createdAt: string
  lastUsed?: string
  permissions: string[]
}

const certifications = ref<Certification[]>([])

onMounted(async () => {
  loading.value = true
  try {
    // Mock data - replace with actual API call
    certifications.value = [
      {
        id: 1,
        type: 'api_key',
        name: 'Production API Key',
        status: 'active',
        keyPreview: 'axk_live_****************************abc',
        createdAt: '2024-01-15T10:30:00Z',
        lastUsed: '2024-06-25T14:20:00Z',
        permissions: ['search:read', 'solution:read', 'trace:write']
      },
      {
        id: 2,
        type: 'oauth',
        name: 'CI/CD Integration',
        status: 'active',
        keyPreview: 'oauth_****************************xyz',
        createdAt: '2024-03-20T09:00:00Z',
        lastUsed: '2024-06-24T08:15:00Z',
        permissions: ['search:read', 'connect:read']
      },
      {
        id: 3,
        type: 'mcp',
        name: 'MCP Server Token',
        status: 'active',
        keyPreview: 'mcp_********************************',
        createdAt: '2024-05-10T11:45:00Z',
        lastUsed: '2024-06-25T16:30:00Z',
        permissions: ['search:read', 'solution:read', 'trace:write', 'feedback:write']
      }
    ]
  } catch (err: any) {
    error.value = err?.message || t('certification.loadError')
  } finally {
    loading.value = false
  }
})

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    api_key: t('certification.types.apiKey'),
    oauth: t('certification.types.oauth'),
    mcp: t('certification.types.mcp'),
    cli: t('certification.types.cli')
  }
  return labels[type] || type
}

function getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    active: 'status--active',
    inactive: 'status--inactive',
    expired: 'status--expired'
  }
  return classes[status] || ''
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString()
}

async function revokeCertification(id: number) {
  if (!confirm(t('certification.revokeConfirm'))) return
  // API call to revoke
  console.log('Revoking certification:', id)
}

function regenerateCertification(id: number) {
  console.log('Regenerating certification:', id)
}

function copyCertificationKey(key: string) {
  window.navigator.clipboard.writeText(key)
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">{{ t('certification.title') }}</h1>
      <button class="btn btn--primary">
        {{ t('certification.createNew') }}
      </button>
    </div>

    <DataState :loading="loading" :error="error">
      <div class="cert-list">
        <Card 
          v-for="cert in certifications" 
          :key="cert.id" 
          :title="cert.name"
        >
          <div class="cert-card">
            <div class="cert-meta">
              <span class="cert-type">{{ getTypeLabel(cert.type) }}</span>
              <span class="cert-status" :class="getStatusClass(cert.status)">
                {{ t(`certification.status.${cert.status}`) }}
              </span>
            </div>

            <div class="cert-key">
              <code>{{ cert.keyPreview }}</code>
              <button class="btn btn--ghost btn--sm" @click="copyCertificationKey(cert.keyPreview)">
                {{ t('certification.copy') }}
              </button>
            </div>

            <div class="cert-info">
              <div class="info-row">
                <span class="info-label">{{ t('certification.createdAt') }}:</span>
                <span class="info-value">{{ formatDate(cert.createdAt) }}</span>
              </div>
              <div v-if="cert.lastUsed" class="info-row">
                <span class="info-label">{{ t('certification.lastUsed') }}:</span>
                <span class="info-value">{{ formatDate(cert.lastUsed) }}</span>
              </div>
            </div>

            <div class="cert-permissions">
              <span class="permissions-label">{{ t('certification.permissions') }}:</span>
              <div class="permissions-list">
                <span v-for="perm in cert.permissions" :key="perm" class="permission-badge">
                  {{ perm }}
                </span>
              </div>
            </div>

            <div class="cert-actions">
              <button class="btn btn--secondary btn--sm" @click="regenerateCertification(cert.id)">
                {{ t('certification.regenerate') }}
              </button>
              <button class="btn btn--danger btn--sm" @click="revokeCertification(cert.id)">
                {{ t('certification.revoke') }}
              </button>
            </div>
          </div>
        </Card>

        <div v-if="certifications.length === 0 && !loading" class="empty-state">
          <p>{{ t('certification.empty') }}</p>
          <button class="btn btn--primary">{{ t('certification.createFirst') }}</button>
        </div>
      </div>
    </DataState>
  </div>
</template>

<style scoped>
.page { max-width: var(--container-lg); margin: 0 auto; padding: var(--space-6) var(--space-4); }

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
.page-title { font-size: var(--font-size-2xl); font-weight: 700; margin: 0; }

.cert-list { display: flex; flex-direction: column; gap: var(--space-4); }

.cert-card { display: flex; flex-direction: column; gap: var(--space-4); }

.cert-meta { display: flex; gap: var(--space-3); align-items: center; }
.cert-type { 
  font-size: var(--font-size-sm); 
  padding: var(--space-1) var(--space-2); 
  background: var(--color-bg-secondary); 
  border-radius: var(--radius-md);
}
.cert-status { font-size: var(--font-size-xs); font-weight: 500; }
.status--active { color: var(--color-success); }
.status--inactive { color: var(--color-text-muted); }
.status--expired { color: var(--color-error); }

.cert-key { 
  display: flex; 
  align-items: center; 
  gap: var(--space-2); 
  padding: var(--space-3); 
  background: var(--color-bg-secondary); 
  border-radius: var(--radius-md);
}
.cert-key code { flex: 1; font-family: monospace; color: var(--color-text-secondary); }

.cert-info { display: flex; flex-direction: column; gap: var(--space-2); }
.info-row { display: flex; gap: var(--space-2); font-size: var(--font-size-sm); }
.info-label { color: var(--color-text-muted); }
.info-value { color: var(--color-text-primary); }

.cert-permissions { display: flex; flex-direction: column; gap: var(--space-2); }
.permissions-label { font-size: var(--font-size-sm); color: var(--color-text-muted); }
.permissions-list { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.permission-badge { 
  font-size: var(--font-size-xs); 
  padding: var(--space-1) var(--space-2); 
  background: var(--color-primary-light); 
  color: var(--color-primary);
  border-radius: var(--radius-md);
  font-family: monospace;
}

.cert-actions { display: flex; gap: var(--space-2); padding-top: var(--space-2); border-top: 1px solid var(--color-border); }

.empty-state { text-align: center; padding: var(--space-10); }
.empty-state p { color: var(--color-text-muted); margin-bottom: var(--space-4); }

/* Buttons */
.btn { 
  padding: var(--space-2) var(--space-4); 
  border-radius: var(--radius-md); 
  font-weight: 500; 
  cursor: pointer; 
  border: none;
  transition: all 0.2s;
}
.btn--sm { padding: var(--space-1) var(--space-3); font-size: var(--font-size-sm); }
.btn--primary { background: var(--color-primary); color: white; }
.btn--primary:hover { opacity: 0.9; }
.btn--secondary { background: var(--color-bg-secondary); color: var(--color-text-primary); }
.btn--secondary:hover { background: var(--color-border); }
.btn--ghost { background: transparent; color: var(--color-text-muted); }
.btn--ghost:hover { color: var(--color-primary); }
.btn--danger { background: transparent; color: var(--color-error); }
.btn--danger:hover { background: var(--color-error-light); }
</style>
