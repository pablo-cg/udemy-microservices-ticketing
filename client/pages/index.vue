<script setup lang="ts">
const { user } = useUser();
</script>

<template>
  <main class="container">
    <h1>{{ user ? 'You are signed in' : 'You are not signed in' }}</h1>
    <!-- <h1>Index</h1> -->
  </main>
</template>

<style scoped></style>
