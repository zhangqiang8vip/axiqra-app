<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { seedApi } from '@/api'
import { DataState, StatusBadge } from '@/components'
import type { CandidateSeed } from '@/types'

const { t } = useI18n()
const route = useRoute()

const seed = ref<CandidateSeed | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const claiming = ref(false)

async function loadSeed() {
  const id = parseInt(route.params.id as string)
  if (isNaN(id)) {
    error.value = t('common.invalidId')
    loading.value = false
    return
  }
  loading.value = true
  error.value = null
  try {
    seed.value = await seedApi.getById(id)
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || t('common.loadFailed')
  } finally {
    loading.value = false
  }
}

async function claimSeed() {
  if (!seed.value) return
  claiming.value = true
  try {
    seed.value = await seedApi.claim(seed.value.id)
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || t('common.actionFailed')
  } finally {
    claiming.value = false
  }
}

onMounted(loadSeed)
</script>

<template>
  <section class="page-shell">
    <div class="container page-inner">
      <DataState :loading="loading" :error="error" @retry="loadSeed">
        <template v-if="seed">
          <header class="page-header">
            <div class="header-badges">
              <StatusBadge :status="seed.status" />
            </div>
            <h1>{{ t('seed.detail.title') }}</h1>
          </header>

          <div class="content-body">
            <section class="section">
              <h2>{{ t('seed.detail.taskGoal') }}</h2>
              <p>{{ seed.taskGoal }}</p>
            </section>

            <section class="section">
              <h2>{{ t('seed.detail.coverageGap') }}</h2>
              <p>{{ seed.coverageGap }}</p>
            </section>

            <div v-if="seed.techStack || seed.domain" class="section">
              <h2>{{ t('common.techStack') }}</h2>
              <p>{{ seed.techStack || seed.domain }}</p>
            </div>

            <div class="section actions">
              <button
                v-if="seed.status === 'qualified' || seed.status === 'candidate_pool'"
                class="btn primary"
                :disabled="claiming"
                @click="claimSeed"
              >
                {{ claiming ? t('common.loading') : t('seed.detail.claim') }}
              </button>
            </div>
          </div>
        </template>
      </DataState>
    </div>
  </section>
</template>
