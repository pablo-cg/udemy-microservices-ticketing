<script setup>
import { useRequest } from '~/composables/request';

const email = ref('');
const password = ref('');

const { errors, request } = useRequest();

async function onSubmit() {
  await request({
    url: '/api/users/signin',
    method: 'POST',
    body: {
      email: email.value,
      password: password.value,
    },
    onSuccess: () => navigateTo('/'),
  });
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <h1>Sign In</h1>
    <div class="form-group mb-3">
      <label>Email Address</label>
      <input
        v-model="email"
        type="text"
        class="form-control"
      />
    </div>
    <div class="form-group mb-3">
      <label>Password</label>
      <input
        v-model="password"
        type="password"
        class="form-control"
      />
    </div>
    <RequestErrors :errors="errors" />
    <button class="btn btn-primary">Sign In</button>
  </form>
</template>

<style scoped></style>
