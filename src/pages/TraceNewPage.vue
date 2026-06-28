<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTraceStore } from '@/stores/trace'
import { traceApi } from '@/api'
import { RiskLevel } from '@/types'

const { t } = useI18n()
const router = useRouter()
const traceStore = useTraceStore()

// Form state
const taskGoal = ref('')
const projectContext = ref('')
const forwardSteps = ref<{ step: string; command?: string; result?: string }[]>([
  { step: '', command: '', result: '' }
])
const reversePath = ref('')
const failurePath = ref('')
const decisionSteps = ref<{ situation: string; options: string[]; chosen: string; reason: string }[]>([])
const rollbackPath = ref('')
const evolutionHint = ref('')
const riskLevel = ref<RiskLevel>(RiskLevel.R1)

const submitting = ref(false)
const error = ref<string | null>(null)
const showPreview = ref(false)
const lastSaved = ref<string | null>(null)

// Steps config
const steps = [
  { id: 'basic', title: 'Task Goal' },
  { id: 'context', title: 'Context' },
  { id: 'forward', title: 'Forward Path' },
  { id: 'reverse', title: 'Reverse Path' },
  { id: 'failure', title: 'Failure Path' },
  { id: 'decision', title: 'Decision Path' },
  { id: 'rollback', title: 'Rollback' },
  { id: 'evolution', title: 'Evolution' },
  { id: 'risk', title: 'Risk Level' },
]

// Current step
const currentStep = ref(0)
const currentStepTitle = computed(() => steps[currentStep.value]?.title || '')

// Auto-save
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null
watch(
  [taskGoal, projectContext, forwardSteps, reversePath, failurePath, decisionSteps, rollbackPath, evolutionHint, riskLevel],
  () => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer)
    autoSaveTimer = setTimeout(saveDraft, 2000)
  },
  { deep: true }
)

function saveDraft() {
  const draftData = buildTraceData()
  traceStore.setCurrentDraft(draftData)
  traceStore.saveToStorage()
  lastSaved.value = new Date().toLocaleTimeString()
}

function buildTraceData() {
  return {
    taskGoal: taskGoal.value.trim(),
    projectContext: projectContext.value.trim(),
    forwardPath: forwardSteps.value.filter(s => s.step.trim()),
    reversePath: reversePath.value.trim() ? reversePath.value.trim().split('\n').filter(Boolean) : undefined,
    failurePath: failurePath.value.trim() ? failurePath.value.trim().split('\n').filter(Boolean) : undefined,
    decisionPath: decisionSteps.value.filter(d => d.situation.trim()),
    rollbackPath: rollbackPath.value.trim() ? [rollbackPath.value.trim()] : undefined,
    evolutionHint: evolutionHint.value.trim(),
    riskLevel: riskLevel.value,
    userConfirmationStatus: 'draft' as const,
  }
}

function nextStep() {
  if (currentStep.value < steps.length - 1) currentStep.value++
}

function prevStep() {
  if (currentStep.value > 0) currentStep.value--
}

function goToStep(index: number) {
  currentStep.value = index
}

function addForwardStep() {
  forwardSteps.value.push({ step: '', command: '', result: '' })
}

function removeForwardStep(idx: number) {
  forwardSteps.value.splice(idx, 1)
}

function addDecisionStep() {
  decisionSteps.value.push({ situation: '', options: [''], chosen: '', reason: '' })
}

function removeDecisionStep(idx: number) {
  decisionSteps.value.splice(idx, 1)
}

function addOption(decisionIdx: number) {
  const decision = decisionSteps.value[decisionIdx]
  if (decision) decision.options.push('')
}

function removeOption(decisionIdx: number, optionIdx: number) {
  const decision = decisionSteps.value[decisionIdx]
  if (decision) decision.options.splice(optionIdx, 1)
}

async function submitTrace() {
  if (!taskGoal.value.trim()) {
    error.value = 'Task goal cannot be empty'
    return
  }
  submitting.value = true
  error.value = null
  try {
    const traceData = buildTraceData()
    traceStore.setCurrentDraft(traceData)
    traceStore.saveToStorage()
    const trace = await traceApi.create(traceData)
    traceStore.clearStorage()
    router.push({ name: 'trace-confirm', params: { id: trace.id! } })
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || 'Failed to create'
  } finally {
    submitting.value = false
  }
}

function clearDraft() {
  if (confirm('Clear current draft?')) {
    traceStore.clearStorage()
    traceStore.clearDraft()
    taskGoal.value = ''
    projectContext.value = ''
    forwardSteps.value = [{ step: '', command: '', result: '' }]
    reversePath.value = ''
    failurePath.value = ''
    decisionSteps.value = []
    rollbackPath.value = ''
    evolutionHint.value = ''
    riskLevel.value = RiskLevel.R1
    lastSaved.value = null
  }
}

onMounted(() => {
  traceStore.loadFromStorage()
  if (traceStore.currentDraft) {
    taskGoal.value = traceStore.currentDraft.taskGoal || ''
    projectContext.value = traceStore.currentDraft.projectContext || ''
    if (traceStore.currentDraft.forwardPath?.length) {
      forwardSteps.value = traceStore.currentDraft.forwardPath.map(p => ({
        step: p.step || '', command: p.command || '', result: p.result || ''
      }))
    }
    reversePath.value = Array.isArray(traceStore.currentDraft.reversePath) 
      ? traceStore.currentDraft.reversePath.join('\n') : ''
    failurePath.value = Array.isArray(traceStore.currentDraft.failurePath)
      ? traceStore.currentDraft.failurePath.join('\n') : ''
    if (traceStore.currentDraft.decisionPath?.length) {
      decisionSteps.value = traceStore.currentDraft.decisionPath.map(d => ({
        situation: d.situation || '', options: d.options || [''], chosen: d.chosen || '', reason: d.reason || ''
      }))
    }
    rollbackPath.value = traceStore.currentDraft.rollbackPath as unknown as string || ''
    evolutionHint.value = traceStore.currentDraft.evolutionHint || ''
    riskLevel.value = (traceStore.currentDraft.riskLevel as RiskLevel) || RiskLevel.R1
  }
})
</script>

<template>
  <div class="trace-new-page">
    <!-- Header -->
    <header class="page-header">
      <div class="header-left">
        <button class="btn-back" @click="router.push({ name: 'dashboard' })">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div>
          <h1 class="page-title">New Trace</h1>
          <p class="page-subtitle">Complete the form below to create a new trace</p>
        </div>
      </div>
      <div class="header-right">
        <span v-if="lastSaved" class="auto-save">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Saved {{ lastSaved }}
        </span>
        <button class="btn btn-outline" @click="showPreview = !showPreview">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          {{ showPreview ? 'Hide Preview' : 'Preview All' }}
        </button>
        <button class="btn btn-ghost btn-danger" @click="clearDraft">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Clear
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="page-content">
      <!-- Progress Bar -->
      <div class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${((currentStep + 1) / steps.length) * 100}%` }"></div>
        </div>
        <div class="step-indicators">
          <button 
            v-for="(step, index) in steps" 
            :key="step.id"
            class="step-dot"
            :class="{ 'step-dot--active': currentStep === index }"
            @click="goToStep(index)"
            :title="step.title"
          >
            {{ index + 1 }}
          </button>
        </div>
        <p class="progress-text">Step {{ currentStep + 1 }} of {{ steps.length }}: {{ currentStepTitle }}</p>
      </div>

      <!-- Preview Panel -->
      <div v-if="showPreview" class="preview-panel">
        <div class="preview-header">
          <h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Trace Preview
          </h3>
        </div>
        <div class="preview-grid">
          <div class="preview-item">
            <label>Task Goal</label>
            <p>{{ taskGoal || '-' }}</p>
          </div>
          <div class="preview-item">
            <label>Context</label>
            <p>{{ projectContext || '-' }}</p>
          </div>
          <div class="preview-item">
            <label>Forward Steps</label>
            <p>{{ forwardSteps.filter(s => s.step).length }} step(s) added</p>
          </div>
          <div class="preview-item">
            <label>Risk Level</label>
            <span class="risk-badge" :class="`risk--${riskLevel}`">{{ riskLevel }}</span>
          </div>
          <div class="preview-item preview-item--full">
            <label>Decision Points</label>
            <p>{{ decisionSteps.filter(d => d.situation).length }} decision(s) added</p>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error-alert">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ error }}
      </div>

      <!-- Form Sections -->
      <div class="form-container">
        <!-- Step 0: Task Goal -->
        <section v-show="currentStep === 0" class="form-section">
          <div class="section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h2 class="section-title">Task Goal <span class="required">*</span></h2>
          <p class="section-desc">Describe the main objective of this trace</p>
          <textarea 
            v-model="taskGoal" 
            class="form-textarea" 
            rows="6" 
            placeholder="What is the main goal you want to achieve with this trace? Be specific about the expected outcome..."
          ></textarea>
        </section>

        <!-- Step 1: Context -->
        <section v-show="currentStep === 1" class="form-section">
          <div class="section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h2 class="section-title">Project Context</h2>
          <p class="section-desc">Provide background information about the project</p>
          <textarea 
            v-model="projectContext" 
            class="form-textarea" 
            rows="8" 
            placeholder="Include technology stack, team size, project constraints, and any relevant background information..."
          ></textarea>
        </section>

        <!-- Step 2: Forward Path -->
        <section v-show="currentStep === 2" class="form-section">
          <div class="section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
          <h2 class="section-title">Forward Path</h2>
          <p class="section-desc">Document the steps to achieve the goal</p>
          <div class="steps-list">
            <div v-for="(step, idx) in forwardSteps" :key="idx" class="step-card">
              <div class="step-header">
                <span class="step-num">{{ idx + 1 }}</span>
                <button v-if="forwardSteps.length > 1" type="button" class="btn-remove" @click="removeForwardStep(idx)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <input v-model="step.step" type="text" class="form-input" placeholder="Step description" />
              <input v-model="step.command" type="text" class="form-input form-mono" placeholder="Command or code" />
              <input v-model="step.result" type="text" class="form-input" placeholder="Expected result" />
            </div>
          </div>
          <button type="button" class="btn btn-outline btn-block" @click="addForwardStep">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Step
          </button>
        </section>

        <!-- Step 3: Reverse Path -->
        <section v-show="currentStep === 3" class="form-section">
          <div class="section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </div>
          <h2 class="section-title">Reverse Path</h2>
          <p class="section-desc">How to revert these changes step by step</p>
          <textarea 
            v-model="reversePath" 
            class="form-textarea" 
            rows="8" 
            placeholder="Document how to undo each step. One action per line..."
          ></textarea>
          <p class="form-hint">This helps others understand how to safely reverse the changes</p>
        </section>

        <!-- Step 4: Failure Path -->
        <section v-show="currentStep === 4" class="form-section">
          <div class="section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 class="section-title">Failure Path</h2>
          <p class="section-desc">Document potential failure scenarios</p>
          <textarea 
            v-model="failurePath" 
            class="form-textarea" 
            rows="8" 
            placeholder="What could go wrong? How should failures be handled?..."
          ></textarea>
        </section>

        <!-- Step 5: Decision Path -->
        <section v-show="currentStep === 5" class="form-section">
          <div class="section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="6" y1="3" x2="6" y2="15"/>
              <circle cx="18" cy="6" r="3"/>
              <circle cx="6" cy="18" r="3"/>
              <path d="M18 9a9 9 0 0 1-9 9"/>
            </svg>
          </div>
          <h2 class="section-title">Decision Path</h2>
          <p class="section-desc">Document decision points and rationale</p>
          <div class="decisions-list">
            <div v-for="(decision, idx) in decisionSteps" :key="idx" class="decision-card">
              <div class="decision-header">
                <span class="decision-num">Decision {{ idx + 1 }}</span>
                <button v-if="decisionSteps.length > 1" type="button" class="btn-remove" @click="removeDecisionStep(idx)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <input v-model="decision.situation" type="text" class="form-input" placeholder="Situation or context" />
              <div class="options-section">
                <label class="options-label">Options</label>
                <div v-for="(_, optIdx) in decision.options" :key="optIdx" class="option-row">
                  <input v-model="decision.options[optIdx]" type="text" class="form-input" placeholder="Option" />
                  <button v-if="decision.options.length > 1" type="button" class="btn-remove btn-remove--sm" @click="removeOption(idx, optIdx)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                <button type="button" class="btn btn-sm btn-ghost" @click="addOption(idx)">+ Add Option</button>
              </div>
              <input v-model="decision.chosen" type="text" class="form-input" placeholder="Chosen option" />
              <input v-model="decision.reason" type="text" class="form-input" placeholder="Reason for choice" />
            </div>
          </div>
          <button type="button" class="btn btn-outline btn-block" @click="addDecisionStep">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Decision
          </button>
        </section>

        <!-- Step 6: Rollback -->
        <section v-show="currentStep === 6" class="form-section">
          <div class="section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
          </div>
          <h2 class="section-title">Rollback Path</h2>
          <p class="section-desc">Emergency rollback procedures</p>
          <textarea 
            v-model="rollbackPath" 
            class="form-textarea" 
            rows="8" 
            placeholder="If something goes seriously wrong, how to safely roll back?..."
          ></textarea>
        </section>

        <!-- Step 7: Evolution -->
        <section v-show="currentStep === 7" class="form-section">
          <div class="section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
          <h2 class="section-title">Evolution Hint</h2>
          <p class="section-desc">Suggest how this could be improved</p>
          <textarea 
            v-model="evolutionHint" 
            class="form-textarea" 
            rows="8" 
            placeholder="What optimizations or alternative approaches could improve this solution?..."
          ></textarea>
        </section>

        <!-- Step 8: Risk Level -->
        <section v-show="currentStep === 8" class="form-section">
          <div class="section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h2 class="section-title">Risk Level</h2>
          <p class="section-desc">Select the appropriate risk level</p>
          <div class="risk-options">
            <label v-for="level in [RiskLevel.R0, RiskLevel.R1, RiskLevel.R2, RiskLevel.R3, RiskLevel.R4]" :key="level" class="risk-option" :class="{ 'risk-option--selected': riskLevel === level }">
              <input v-model="riskLevel" type="radio" :value="level" class="sr-only" />
              <span class="risk-dot" :class="`risk-dot--${level}`"></span>
              <span class="risk-info">
                <span class="risk-name">{{ level }}</span>
                <span class="risk-desc">{{ t(`trace.riskLevels.${level}`) }}</span>
              </span>
            </label>
          </div>
        </section>
      </div>

      <!-- Navigation -->
      <div class="form-nav">
        <button type="button" class="btn btn-secondary" @click="prevStep" :disabled="currentStep === 0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Previous
        </button>
        
        <button v-if="currentStep < steps.length - 1" type="button" class="btn btn-primary" @click="nextStep">
          Next
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        
        <button v-else type="button" class="btn btn-success btn-lg" :disabled="submitting || !taskGoal.trim()" @click="submitTrace">
          <svg v-if="submitting" class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"/>
          </svg>
          {{ submitting ? 'Creating...' : 'Create Trace' }}
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.trace-new-page {
  min-height: calc(100vh - var(--header-height, 64px));
  background: var(--color-bg-secondary);
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--color-bg-secondary);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.btn-back:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: var(--color-text-tertiary);
  margin: 4px 0 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.auto-save {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-success);
  padding: 8px 12px;
  background: var(--color-success-light);
  border-radius: 6px;
}

/* Main Content */
.page-content {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* Progress */
.progress-section {
  margin-bottom: 32px;
}

.progress-bar {
  height: 6px;
  background: var(--color-bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.step-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.step-dot {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.step-dot:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.step-dot--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.progress-text {
  text-align: center;
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

/* Preview Panel */
.preview-panel {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.preview-header {
  margin-bottom: 16px;
}

.preview-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-item label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.preview-item p {
  font-size: 14px;
  color: var(--color-text-primary);
  margin: 0;
}

.preview-item--full {
  grid-column: span 2;
}

/* Error Alert */
.error-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: var(--color-error-light);
  color: var(--color-error);
  border-radius: 8px;
  margin-bottom: 24px;
  font-size: 14px;
}

/* Form Container */
.form-container {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
}

.form-section {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 12px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.section-desc {
  font-size: 14px;
  color: var(--color-text-tertiary);
  margin: 0 0 24px;
}

.required {
  color: var(--color-error);
}

/* Form Elements */
.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: 14px;
  transition: all var(--transition-fast);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.form-textarea {
  resize: vertical;
  min-height: 140px;
  line-height: 1.6;
}

.form-mono {
  font-family: var(--font-mono);
  font-size: 13px;
}

.form-hint {
  font-size: 13px;
  color: var(--color-text-tertiary);
  margin: 12px 0 0;
}

/* Steps List */
.steps-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
}

.btn-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: var(--color-text-tertiary);
  transition: all var(--transition-fast);
}

.btn-remove:hover {
  background: var(--color-error-light);
  color: var(--color-error);
}

.btn-remove--sm {
  width: 24px;
  height: 24px;
}

/* Decisions List */
.decisions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.decision-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.decision-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.decision-num {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.options-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.options-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-tertiary);
}

.option-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.option-row .form-input {
  flex: 1;
}

/* Risk Options */
.risk-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.risk-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.risk-option:hover {
  border-color: var(--color-primary);
}

.risk-option--selected {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.risk-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
}

.risk-dot--R0 { background: var(--color-success); }
.risk-dot--R1 { background: var(--color-primary); }
.risk-dot--R2 { background: var(--color-warning); }
.risk-dot--R3 { background: #f97316; }
.risk-dot--R4 { background: var(--color-error); }

.risk-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.risk-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.risk-desc {
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.risk-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.risk--R0 { background: var(--color-success-light); color: var(--color-success); }
.risk--R1 { background: var(--color-primary-light); color: var(--color-primary); }
.risk--R2 { background: var(--color-warning-light); color: var(--color-warning); }
.risk--R3 { background: #fff7ed; color: #f97316; }
.risk--R4 { background: var(--color-error-light); color: var(--color-error); }

/* Navigation */
.form-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-bg);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-bg-secondary);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-success {
  background: var(--color-success);
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
}

.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px dashed var(--color-border);
}

.btn-outline:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}

.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
}

.btn-ghost:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.btn-danger {
  color: var(--color-error);
}

.btn-danger:hover {
  background: var(--color-error-light);
}

.btn-lg {
  padding: 14px 32px;
  font-size: 15px;
}

.btn-block {
  width: 100%;
}

.btn-sm {
  padding: 8px 14px;
  font-size: 13px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .header-right {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .form-container {
    padding: 20px;
  }
  
  .preview-grid {
    grid-template-columns: 1fr;
  }
  
  .preview-item--full {
    grid-column: span 1;
  }
}
</style>
