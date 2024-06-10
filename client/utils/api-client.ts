import axios from 'axios';

export default function () {
  if (import.meta.server) {
    return axios.create({
      baseURL:
        'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: useRequestHeaders(),
    });
  } else {
    return axios.create({ baseURL: '/' });
  }
}
