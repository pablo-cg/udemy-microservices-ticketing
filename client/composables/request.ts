interface RequestOptions {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  onSuccess?: (data?: any) => void;
}

export const useRequest = () => {
  const errors = ref<any[]>([]);

  async function request({ url, method, body, onSuccess }: RequestOptions) {
    try {
      errors.value = [];

      const data = await $fetch(url, {
        method,
        body,
      });

      if (onSuccess) {
        onSuccess(data);
      }

      return data;
    } catch (error: any) {
      errors.value = error.data.errors;
    }
  }

  return {
    errors,
    request,
  };
};
