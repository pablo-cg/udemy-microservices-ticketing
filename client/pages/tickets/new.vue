<script setup lang="ts">
const { errors, request } = useRequest();

const ticket = reactive({
  title: '',
  price: '',
});

async function onSubmit() {
  await request({
    url: '/api/tickets',
    method: 'POST',
    body: ticket,
    onSuccess: () => navigateTo('/'),
  });
}

function formatNumber() {
  const value = parseFloat(ticket.price);

  if (isNaN(value)) {
    ticket.price = '';
    return;
  }

  ticket.price = value.toFixed(2);
}
</script>

<template>
  <main class="container my-3">
    <h1>Create a Ticket</h1>
    <form @submit.prevent="onSubmit">
      <div class="form-group mb-3">
        <label>Title</label>
        <input
          type="text"
          class="form-control"
          v-model="ticket.title"
        />
      </div>
      <div class="form-group mb-3">
        <label>Price</label>
        <input
          type="text"
          class="form-control"
          v-model="ticket.price"
          @blur="formatNumber"
        />
      </div>
      <RequestErrors :errors="errors" />
      <button class="btn btn-primary">Submit</button>
    </form>
  </main>
</template>

<style scoped></style>
