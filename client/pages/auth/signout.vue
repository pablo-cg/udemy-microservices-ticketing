<script setup lang="ts">
const { errors, request } = useRequest();

async function signOut() {
  await request({
    url: '/api/users/signout',
    method: 'POST',
    body: {},
    onSuccess: () => navigateTo('/'),
  });
}

await signOut();
</script>

<template>
  <main class="container">
    <h1>Signing Out...</h1>
  </main>
</template>

<style scoped></style>
