<script setup lang="ts">
const { user } = useUser();

const client = apiClient();

const { data: tickets } = useAsyncData('tickets', () =>
  client.get('/api/tickets').then((res) => res.data),
);
</script>

<template>
  <main class="container my-3">
    <h1>The Tickets</h1>
    <table class="table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Price</th>
          <th>Link</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="ticket in tickets"
          :key="ticket.id"
        >
          <td>{{ ticket.title }}</td>
          <td>{{ ticket.price }}</td>
          <td>
            <NuxtLink
              :to="`/tickets/${ticket.id}`"
              class="btn btn-primary"
            >
              View
            </NuxtLink>
          </td>
        </tr>
      </tbody>
    </table>
  </main>
</template>

<style scoped></style>
