<script setup lang="ts">
import registerApi from '~/services/registerApi'
import providersApi from '~/services/providersApi'
import type { IUserCreate } from '~/interfaces/IUser'
import type { IProviderCreate } from '~/interfaces/IProvider'

type Role = 'cliente' | 'proveedor'

const role = ref<Role>('cliente')
const fullName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const bio = ref('')
const experienceYears = ref<number | null>(null)
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const splitFullName = (value: string) => {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  const firstName = parts.shift() ?? ''
  const lastName = parts.join(' ')
  return { firstName, lastName }
}

const onSubmit = async () => {
  errorMessage.value = ''
  loading.value = true
  try {
    const { firstName, lastName } = splitFullName(fullName.value)
    const userPayload: IUserCreate = {
      firstName,
      lastName,
      email: email.value.trim(),
      passwordHash: password.value,
      phone: phone.value.trim(),
      role: role.value === 'cliente' ? 'client' : 'provider'
    }

    const createdUser = await registerApi.registerUser(userPayload)

    if (role.value === 'proveedor') {
      const providerPayload: IProviderCreate = {
        userId: createdUser.id,
        bio: bio.value.trim(),
        experienceYears: experienceYears.value ?? 0,
        verified: 0
      }
      await providersApi.createProvider(providerPayload)
    }

    await navigateTo('/')
  } catch (err) {
    errorMessage.value = 'No pudimos crear tu cuenta. Intenta de nuevo.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    navigateTo('/')
  }
}
</script>

<template>
  <div class="bg-surface relative flex min-h-screen flex-col">
    <header class="bg-white/80 sticky top-0 z-30 flex w-full items-center justify-between p-4 backdrop-blur-md">
      <button
        type="button"
        class="hover:bg-neutral-100 flex size-10 items-center justify-center rounded-full transition"
        aria-label="Regresar"
        @click="goBack"
      >
        <UIcon
          name="i-lucide-arrow-left"
          class="text-neutral-900 size-4"
        />
      </button>
      <h2 class="text-neutral-900 flex-1 pr-10 text-center text-lg font-bold tracking-[-0.27px]">
        Registro
      </h2>
    </header>

    <div class="mx-auto flex w-full max-w-[480px] justify-center px-4 pt-4 sm:max-w-[560px]">
      <NuxtImg
        src="/images/logo_club_oficios.svg"
        alt="ClubOficios"
        class="h-auto w-full max-w-[200px] object-contain sm:max-w-[240px]"
        loading="eager"
      />
    </div>

    <main class="mx-auto flex w-full max-w-[480px] flex-col px-4 pb-6 sm:max-w-[560px] sm:px-6">
      <div class="flex w-full flex-col gap-2 pb-5 pt-5 text-center sm:pb-6 sm:pt-6">
        <h1 class="text-neutral-900 text-2xl font-bold leading-tight tracking-[-0.7px] sm:text-[28px] sm:leading-[35px]">
          Únete a ClubOficios
        </h1>
        <p class="text-neutral-500 text-sm font-medium leading-5">
          Encuentra la mejor ayuda para el mantenimiento de tu hogar
        </p>
      </div>

      <div class="bg-neutral-100 border-neutral-200 mb-6 flex w-full items-center rounded-full border p-[7px]">
        <button
          v-for="opt in [
            { value: 'cliente' as Role, label: 'Cliente' },
            { value: 'proveedor' as Role, label: 'Proveedor de Servicios' }
          ]"
          :key="opt.value"
          type="button"
          class="flex flex-1 items-center justify-center rounded-full px-4 py-[10px] text-sm font-semibold transition"
          :class="role === opt.value
            ? 'bg-primary-600 text-white shadow-sm'
            : 'text-neutral-500 hover:text-neutral-900'"
          @click="role = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>

      <form
        class="flex w-full flex-col gap-4 pb-4"
        @submit.prevent="onSubmit"
      >
        <div class="flex w-full flex-col gap-1.5">
          <label
            for="fullName"
            class="text-neutral-900 text-sm font-semibold"
          >Nombre completo</label>
          <UInput
            id="fullName"
            v-model="fullName"
            type="text"
            placeholder="Ingresa tu nombre completo"
            icon="i-lucide-user"
            size="xl"
            required
            autocomplete="name"
            :ui="{
              base: 'w-full bg-surface-muted border border-neutral-200 rounded-lg text-base text-neutral-900 placeholder:text-neutral-400 focus:ring-1 focus:ring-primary-600 focus:border-primary-600',
              leadingIcon: 'text-neutral-400'
            }"
          />
        </div>

        <div class="flex w-full flex-col gap-1.5">
          <label
            for="email"
            class="text-neutral-900 text-sm font-semibold"
          >Correo electrónico</label>
          <UInput
            id="email"
            v-model="email"
            type="email"
            placeholder="juan.perez@ejemplo.com"
            icon="i-lucide-mail"
            size="xl"
            required
            autocomplete="email"
            :ui="{
              base: 'w-full bg-surface-muted border border-neutral-200 rounded-lg text-base text-neutral-900 placeholder:text-neutral-400 focus:ring-1 focus:ring-primary-600 focus:border-primary-600',
              leadingIcon: 'text-neutral-400'
            }"
          />
        </div>

        <div class="flex w-full flex-col gap-1.5">
          <label
            for="phone"
            class="text-neutral-900 text-sm font-semibold"
          >Número de teléfono</label>
          <UInput
            id="phone"
            v-model="phone"
            type="tel"
            placeholder="+52 (55) 0000-0000"
            icon="i-lucide-phone"
            size="xl"
            required
            autocomplete="tel"
            :ui="{
              base: 'w-full bg-surface-muted border border-neutral-200 rounded-lg text-base text-neutral-900 placeholder:text-neutral-400 focus:ring-1 focus:ring-primary-600 focus:border-primary-600',
              leadingIcon: 'text-neutral-400'
            }"
          />
        </div>

        <div class="flex w-full flex-col gap-1.5">
          <label
            for="password"
            class="text-neutral-900 text-sm font-semibold"
          >Contraseña</label>
          <UInput
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Crea una contraseña"
            icon="i-lucide-lock"
            size="xl"
            required
            autocomplete="new-password"
            :ui="{
              base: 'w-full bg-surface-muted border border-neutral-200 rounded-lg text-base text-neutral-900 placeholder:text-neutral-400 focus:ring-1 focus:ring-primary-600 focus:border-primary-600',
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
        </div>

        <template v-if="role === 'proveedor'">
          <div class="flex w-full flex-col gap-1.5">
            <label
              for="experienceYears"
              class="text-neutral-900 text-sm font-semibold"
            >Años de experiencia</label>
            <UInput
              id="experienceYears"
              v-model.number="experienceYears"
              type="number"
              min="0"
              max="60"
              placeholder="Ej. 5"
              icon="i-lucide-briefcase"
              size="xl"
              required
              :ui="{
                base: 'w-full bg-surface-muted border border-neutral-200 rounded-lg text-base text-neutral-900 placeholder:text-neutral-400 focus:ring-1 focus:ring-primary-600 focus:border-primary-600',
                leadingIcon: 'text-neutral-400'
              }"
            />
          </div>

          <div class="flex w-full flex-col gap-1.5">
            <div class="flex items-center justify-between">
              <label
                for="bio"
                class="text-neutral-900 text-sm font-semibold"
              >Sobre ti</label>
              <span class="text-neutral-400 text-xs">{{ bio.length }}/160</span>
            </div>
            <textarea
              id="bio"
              v-model="bio"
              rows="2"
              maxlength="160"
              placeholder="Describe brevemente tus servicios"
              required
              class="bg-surface-muted border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:ring-primary-600 focus:border-primary-600 w-full resize-none rounded-lg border px-3 py-2.5 text-base focus:ring-1 focus:outline-none"
            />
          </div>
        </template>

        <p class="text-neutral-500 pt-2 text-center text-xs leading-4">
          Al crear una cuenta, aceptas nuestros
          <NuxtLink
            to="/legal/terms"
            class="text-primary-600 font-medium hover:underline"
          >
            Términos de servicio
          </NuxtLink>
          y
          <NuxtLink
            to="/legal/privacy"
            class="text-primary-600 font-medium hover:underline"
          >
            Política de privacidad
          </NuxtLink>.
        </p>

        <p
          v-if="errorMessage"
          class="text-sm text-red-600"
          role="alert"
        >
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="bg-primary-600 hover:bg-primary-700 shadow-primary-600/30 mt-2 flex w-full items-center justify-center rounded-lg px-6 py-4 text-base font-bold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-70"
        >
          {{ loading ? 'Creando cuenta…' : 'Crear cuenta' }}
        </button>
      </form>

      <div class="flex w-full justify-center pt-8 text-sm">
        <p class="text-neutral-600 text-center">
          ¿Ya tienes una cuenta?
          <NuxtLink
            to="/"
            class="text-primary-600 font-bold hover:underline"
          >
            Iniciar sesión
          </NuxtLink>
        </p>
      </div>

      <div class="h-8 w-full" />
    </main>
  </div>
</template>
