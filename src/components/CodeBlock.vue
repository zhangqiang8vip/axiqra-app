<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  text: string
  language?: string
}>()

const copied = ref(false)

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.text)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<template>
  <div class="code-block">
    <div class="code-block__header">
      <span v-if="language" class="code-block__language">{{ language }}</span>
      <button class="code-block__copy" @click="copyToClipboard">
        {{ copied ? '✓ 已复制' : '复制' }}
      </button>
    </div>
    <pre class="code-block__content"><code><slot /></code></pre>
  </div>
</template>

<style scoped>
.code-block {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.code-block__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-tertiary);
  border-bottom: 1px solid var(--color-border);
}

.code-block__language {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.code-block__copy {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.125rem 0.5rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.code-block__copy:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.code-block__content {
  padding: var(--space-4);
  margin: 0;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  color: var(--color-text-primary);
}
</style>
