<script setup lang="ts">
const { user } = useUser();

const links = computed(() => [
  { label: 'Sign In', path: '/auth/signin', visible: !user.value },
  { label: 'Sign Up', path: '/auth/signup', visible: !user.value },
  { label: 'Sign Out', path: '/auth/signout', visible: user.value },
]);
</script>

<template>
  <nav class="navbar navbar-light bg-light">
    <div class="container">
      <NuxtLink
        class="navbar-brand"
        to="/"
      >
        GitTix
      </NuxtLink>

      <div class="d-flex justify-content-end">
        <ul class="nav d-flex align-items-center">
          <li
            v-for="link in links"
            :key="link.label"
            class="nav-item"
          >
            <NuxtLink
              :to="link.path"
              class="nav-link"
              v-if="link.visible"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped></style>
