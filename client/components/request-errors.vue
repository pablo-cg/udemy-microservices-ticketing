<script setup lang="ts">
interface Props {
  errors: any[];
}
defineProps<Props>();
</script>

<template>
  <div
    class="alert alert-danger"
    v-if="errors.length"
  >
    <h4>Ooops...</h4>
    <ul class="my-0">
      <li
        v-for="error in errors"
        :key="error.message"
      >
        {{ error.message }}
      </li>
    </ul>
  </div>
</template>

<style scoped></style>
