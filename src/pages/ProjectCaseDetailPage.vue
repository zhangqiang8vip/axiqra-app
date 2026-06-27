<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { projectCaseApi } from '@/api'
import { DataState, RiskBadge, StatusBadge } from '@/components'
import type { ProjectCase } from '@/types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const projectCase = ref<ProjectCase | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

async function loadProjectCase() {
  const id = parseInt(route.params.id as string)
  if (isNaN(id)) {
    error.value = t('common.invalidId')
    loading.value = false
    return
  }
  loading.value = true
  error.value = null
  try {
    projectCase.value = await projectCaseApi.getById(id)
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || t('common.loadFailed')
  } finally {
    loading.value = false
  }
}

onMounted(loadProjectCase)
</script>

<template>
  <section class="page-shell">
    <div class="container page-inner">
      <DataState :loading="loading" :error="error" @retry="loadProjectCase">
        <template v-if="projectCase">
          <header class="page-header">
            <div class="header-badges">
              <RiskBadge :level="projectCase.riskLevel" />
              <StatusBadge :status="projectCase.status" />
            </div>
            <h1>{{ projectCase.title }}</h1>
          </header>

          <div class="content-body">
            <section class="section">
              <h2>{{ t('publicCase.problemStatement') }}</h2>
              <p>{{ projectCase.problemStatement }}</p>
            </section>

            <section class="section">
              <h2>{{ t('solution.title') }}</h2>
              <p>{{ projectCase.solution }}</p>
            </section>

            <div v-if="projectCase.tags?.length" class="section">
              <h2>{{ t('common.tags') }}</h2>
              <div class="tags">
                <span v-for="tag in projectCase.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
          </div>
        </template>
      </DataState>
    </div>
  </section>
</template>
