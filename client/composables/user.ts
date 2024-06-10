export interface User {
  id: string;
  email: string;
}

export const useUser = () => {
  const user = useState<User | null>('user', () => null);

  const authenticatedUser = computed(() => {
    const userValue = unref(user);

    if (!userValue) {
      throw createError(
        'authenticatedUser can only be used in protected pages',
      );
    }

    return userValue;
  });

  return { user, authenticatedUser };
};
