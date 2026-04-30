<script setup lang="ts">
const email = ref('')
const loading = ref(false)
const sent = ref(false)
const errorMessage = ref('')

const onSubmit = async () => {
  errorMessage.value = ''
  loading.value = true
  try {
    // TODO: integrate with password reset API
    sent.value = true
  } catch (err) {
    errorMessage.value = 'No pudimos enviar el correo. Intenta de nuevo.'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-surface relative flex min-h-screen items-center justify-center px-4 py-8">
    <div class="w-full max-w-[400px] flex flex-col gap-5 rounded-xl border border-neutral-100 bg-white p-5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      <div class="flex flex-col items-center gap-3 pt-2">
        <NuxtImg
          src="/images/logo_club_oficios.svg"
          alt="ClubOficios"
          class="h-auto w-full max-w-[160px] object-contain"
          loading="eager"
        />
        <div class="flex flex-col items-center gap-1.5">
          <h1 class="text-neutral-900 text-center text-xl font-extrabold tracking-[-0.6px]">
            Recuperar contraseña
          </h1>
          <p class="text-neutral-500 text-center text-sm font-medium">
            Ingresa tu correo y te enviaremos un enlace
          </p>
        </div>
      </div>

      <form
        v-if="!sent"
        class="flex flex-col gap-4 pb-4"
        @submit.prevent="onSubmit"
      >
        <div class="flex flex-col gap-2">
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
          {{ loading ? 'Enviando…' : 'Enviar enlace' }}
        </button>
      </form>

      <div
        v-else
        class="flex flex-col items-center gap-4 pb-4"
      >
        <div class="size-14 rounded-full bg-emerald-50 flex items-center justify-center">
          <UIcon
            name="i-lucide-check-circle"
            class="size-7 text-emerald-500"
          />
        </div>
        <p class="text-neutral-600 text-center text-sm">
          Si el correo existe, recibirás un enlace para restablecer tu contraseña.
        </p>
        <NuxtLink
          to="/"
          class="text-primary-600 font-bold hover:underline"
        >
          Volver al inicio de sesión
        </NuxtLink>
      </div>

      <div class="flex justify-center pt-2">
        <NuxtLink
          to="/"
          class="text-primary-600 text-sm font-bold hover:underline"
        >
          Volver al inicio de sesión
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
