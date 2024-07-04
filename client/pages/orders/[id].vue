<script setup lang="ts">
const { id } = useRoute().params;

const client = apiClient();

const { data: order } = useAsyncData(`orders-${id}`, () =>
  client.get(`/api/orders/${id}`).then((res) => res.data),
);

const timeLeft = ref(0);

function updateTimeLeft() {
  if (order.value) {
    const msLeft =
      new Date(order.value.expiresAt).getTime() - new Date().getTime();
    timeLeft.value = Math.round(msLeft / 1000);
  }
}

onMounted(() => {
  setInterval(updateTimeLeft, 1000);
});
</script>

<template>
  <main class="container my-3">
    <h1>Purchasing {{ order?.ticket.title }}</h1>
    <h4>Price: ${{ order?.ticket.price }}</h4>
    <h4 v-if="timeLeft < 0">Order expired</h4>
    <h4 v-else>Expires in: {{ timeLeft }} seconds</h4>
  </main>
</template>

<style scoped></style>
