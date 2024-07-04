<script setup lang="ts">
const { id } = useRoute().params;

const client = apiClient();
const { errors, request } = useRequest();

const { data: ticket } = useAsyncData(`tickets-${id}`, () =>
  client.get(`/api/tickets/${id}`).then((res) => res.data),
);

async function purchase() {
  await request({
    url: '/api/orders',
    method: 'POST',
    body: {
      ticketId: ticket.value?.id,
    },
    onSuccess: (order) => navigateTo(`/orders/${order.id}`),
  });
}
</script>

<template>
  <main class="container my-3">
    <h1>{{ ticket?.title }}</h1>
    <h4>Price: ${{ ticket?.price }}</h4>
    <RequestErrors :errors="errors" />
    <button
      @click="purchase"
      class="btn btn-primary"
    >
      Purchase
    </button>
  </main>
</template>

<style scoped></style>
