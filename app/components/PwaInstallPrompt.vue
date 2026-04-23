<script setup lang="ts">
const { $pwa } = useNuxtApp()

const showPrompt = computed(() =>
  $pwa?.showInstallPrompt && !$pwa?.isPWAInstalled
)

function install() {
  $pwa?.install()
}

function dismiss() {
  $pwa?.cancelInstall()
}
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="showPrompt"
      class="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-80"
    >
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-start gap-3">
          <img
            src="/pwa-64x64.png"
            alt="Club de la Chamba"
            class="w-12 h-12 rounded-xl flex-shrink-0"
          >
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-900 dark:text-white text-sm">
              Club de oficios app
            </p>
            <p class="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
              Instala la app para acceder mas rapido
            </p>
          </div>
          <button
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0 -mt-1 -mr-1 p-1"
            aria-label="Cerrar"
            @click="dismiss"
          >
            <UIcon
              name="i-lucide-x"
              class="w-4 h-4"
            />
          </button>
        </div>
        <div class="flex gap-2 mt-3">
          <button
            class="flex-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 py-2 rounded-xl border border-gray-200 dark:border-gray-700 font-medium transition-colors"
            @click="dismiss"
          >
            Ahora no
          </button>
          <button
            class="flex-1 text-sm text-white py-2 rounded-xl font-medium transition-colors"
            style="background-color: #0ea5e9;"
            @click="install"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(1rem);
}
</style>
