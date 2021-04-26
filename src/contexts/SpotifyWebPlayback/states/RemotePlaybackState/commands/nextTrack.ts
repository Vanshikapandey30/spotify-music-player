import type { AxiosInstance } from 'axios';

export async function nextTrack(params: {
  apiClient: AxiosInstance;
  deviceId: string;
}) {
  const { apiClient, deviceId } = params;
  await apiClient.request({
    method: 'POST',
    params: {
      device_id: deviceId,
    },
    url: 'me/player/next',
  });
}
