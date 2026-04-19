<script setup lang="ts">
  import { ref } from 'vue'
  import BaseInput from '../../../components/atoms/BaseInput.vue'

  // Test data
  const testInputs = ref({
    email: '',
    password: '',
    name: '',
    phone: '',
  })
</script>

<template>
  <div
    class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
  >
    <h3
      class="mb-4 text-xl font-semibold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
    >
      Form Inputs
    </h3>
    <div class="space-y-4">
      <BaseInput
        v-model="testInputs.email"
        label="Email Address"
        type="email"
        placeholder="your@email.com"
        hint="We'll never share your email"
      />
      <BaseInput
        v-model="testInputs.password"
        label="Password"
        type="password"
        placeholder="••••••••"
      />
      <BaseInput
        v-model="testInputs.name"
        label="Full Name"
        type="text"
        placeholder="Enter your full name"
        required
      />
      <BaseInput
        v-model="testInputs.phone"
        label="Phone Number"
        type="tel"
        placeholder="+1 (555) 123-4567"
        hint="International format"
      />
    </div>
  </div>
</template>
