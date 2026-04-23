<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const navItems = [
  { key: 'inicio', label: 'Inicio', icon: 'i-lucide-home' },
  { key: 'solicitudes', label: 'Mis Solicitudes', icon: 'i-lucide-calendar' },
  { key: 'mensajes', label: 'Mensajes', icon: 'i-lucide-message-circle' },
  { key: 'perfil', label: 'Perfil', icon: 'i-lucide-user' }
]
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-[#f3f4f6] px-6 pt-2 pb-safe">
    <div class="flex items-center justify-between pb-2">
      <button
        v-for="item in navItems"
        :key="item.key"
        class="flex flex-col items-center gap-1 transition"
        @click="emit('update:modelValue', item.key)"
      >
        <UIcon
          :name="item.icon"
          class="size-6"
          :class="props.modelValue === item.key ? 'text-primary-600' : 'text-neutral-400'"
        />
        <span
          class="text-[10px]"
          :class="props.modelValue === item.key ? 'text-primary-600 font-bold' : 'text-neutral-400 font-medium'"
        >
          {{ item.label }}
        </span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.pb-safe {
  padding-bottom: max(8px, env(safe-area-inset-bottom));
}
</style>
