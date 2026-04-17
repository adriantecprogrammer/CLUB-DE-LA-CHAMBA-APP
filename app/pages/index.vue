<script setup lang="ts">
import loginApi from '~/services/login'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const onSubmit = async () => {
  errorMessage.value = ''
  loading.value = true
  try {
    await loginApi.login({ email: email.value, passwordHash: password.value })
  } catch (err) {
    errorMessage.value = 'No pudimos iniciar sesión. Verifica tus datos.'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-surface relative flex min-h-screen items-center justify-center px-4 py-8 sm:py-16 lg:py-[111px]">
    <div class="border-neutral-100 flex w-full max-w-[400px] flex-col gap-5 rounded-xl border bg-white p-5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] sm:gap-6 sm:p-[25px]">
      <div class="flex w-full flex-col items-center gap-3 pt-2 sm:gap-4">
        <NuxtImg
          src="/images/logo_club_oficios.svg"
          alt="ClubOficios"
          class="h-auto w-full max-w-[160px] object-contain sm:max-w-[180px]"
          loading="eager"
        />
        <div class="flex w-full flex-col items-center gap-1.5 sm:gap-2">
          <h1 class="text-neutral-900 text-center text-xl font-extrabold tracking-[-0.6px] sm:text-2xl">
            Iniciar Sesión
          </h1>
          <p class="text-neutral-500 text-center text-sm font-medium">
            Gestiona tus servicios del hogar
          </p>
        </div>
      </div>

      <form
        class="flex w-full flex-col gap-4 pb-4 sm:gap-5"
        @submit.prevent="onSubmit"
      >
        <div class="flex w-full flex-col gap-2">
          <label
            for="email"
            class="text-neutral-900 text-sm font-semibold"
          >Correo electrónico</label>
          <UInput
            id="email"
            v-model="email"
            type="email"
            placeholder="nombre@ejemplo.com"
            icon="i-lucide-mail"
            size="xl"
            required
            autocomplete="email"
            :ui="{
              base: 'w-full bg-surface-muted border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-1 focus:ring-primary-600 focus:border-primary-600',
              leadingIcon: 'text-neutral-400'
            }"
          />
        </div>

        <div class="flex w-full flex-col gap-2">
          <label
            for="password"
            class="text-neutral-900 text-sm font-semibold"
          >Contraseña</label>
          <UInput
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Ingresa tu contraseña"
            icon="i-lucide-lock"
            size="xl"
            required
            autocomplete="current-password"
            :ui="{
              base: 'w-full bg-surface-muted border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-1 focus:ring-primary-600 focus:border-primary-600',
              leadingIcon: 'text-neutral-400'
            }"
          >
            <template #trailing>
              <button
                type="button"
                class="text-neutral-400 hover:text-primary-600 transition"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="showPassword = !showPassword"
              >
                <UIcon
                  :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  class="size-4"
                />
              </button>
            </template>
          </UInput>

          <div class="flex justify-end pt-1">
            <NuxtLink
              to="/forgot-password"
              class="text-primary-600 text-sm font-semibold hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </NuxtLink>
          </div>
        </div>

        <p
          v-if="errorMessage"
          class="-mt-2 text-sm text-red-600"
          role="alert"
        >
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="bg-primary-600 hover:bg-primary-700 shadow-primary-600/20 flex w-full items-center justify-center rounded-lg px-4 py-[14px] text-base font-bold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-70"
        >
          {{ loading ? 'Iniciando…' : 'Iniciar sesión' }}
        </button>
      </form>

      <div class="flex w-full justify-center gap-1 pt-2 text-sm">
        <span class="text-neutral-500">¿No tienes una cuenta?</span>
        <NuxtLink
          to="/register"
          class="text-primary-600 font-bold hover:underline"
        >
          Crear cuenta
        </NuxtLink>
      </div>
    </div>

    <div class="from-primary-600/0 via-primary-600/50 to-primary-600/0 pointer-events-none absolute bottom-0 left-1/2 h-1 w-[90%] max-w-[390px] -translate-x-1/2 bg-linear-to-r opacity-50" />
  </div>
</template>
