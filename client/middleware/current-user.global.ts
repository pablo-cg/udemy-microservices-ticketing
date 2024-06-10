interface Response {
  currentUser: {
    email: string;
    id: string;
  };
}

export default defineNuxtRouteMiddleware(async () => {
  const client = apiClient();

  const { user } = useUser();

  const { data } = await client.get<Response>('/api/users/currentuser');

  user.value = data?.currentUser || null;
});
