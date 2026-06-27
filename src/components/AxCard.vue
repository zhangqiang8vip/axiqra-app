<script setup lang="ts">
interface Props {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  glow?: boolean
}

withDefaults(defineProps<Props>(), {
  hover: true,
  padding: 'lg',
  glow: false,
})
</script>

<template>
  <div class="ax-card" :class="[`ax-card--padding-${padding}`, { 'ax-card--hover': hover, 'ax-card--glow': glow }]">
    <div v-if="$slots.header" class="ax-card__header">
      <slot name="header" />
    </div>
    <div class="ax-card__body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="ax-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.ax-card {
  background: white;
  border-radius: 1rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.ax-card--hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 12px 32px rgba(0, 0, 0, 0.06);
}

.ax-card--glow {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03), 0 0 0 1px rgba(99, 102, 241, 0.1);
}

.ax-card--glow:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 12px 32px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(99, 102, 241, 0.2);
}

.ax-card__header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ax-card__body {
  padding: 1.5rem;
}

.ax-card--padding-sm .ax-card__body { padding: 1rem; }
.ax-card--padding-md .ax-card__body { padding: 1.25rem; }
.ax-card--padding-lg .ax-card__body { padding: 1.5rem; }
.ax-card--padding-none .ax-card__body { padding: 0; }

.ax-card__footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .ax-card {
    background: #1e293b;
    border-color: #334155;
  }
  
  .ax-card__header {
    border-color: #334155;
  }
  
  .ax-card__footer {
    background: #0f172a;
    border-color: #334155;
  }
}
</style>
