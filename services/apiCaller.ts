import { http, getErrorMessage } from "./http";

export async function callApi<TResponse, TPayload extends object = object>(
  folder: string,
  action: string,
  payload?: TPayload,
  fallbackMessage?: string,
): Promise<TResponse> {
  try {
    const { data } = await http.post<TResponse>(`/${folder}`, { action, ...payload });
    return data;
  } catch (err) {
    throw new Error(getErrorMessage(err, fallbackMessage));
  }
}

export async function callApiGet<TResponse>(
  folder: string,
  action: string,
  params?: Record<string, string>,
  fallbackMessage?: string,
): Promise<TResponse> {
  try {
    const { data } = await http.get<TResponse>(`/${folder}`, { params: { action, ...params } });
    return data;
  } catch (err) {
    throw new Error(getErrorMessage(err, fallbackMessage));
  }
}
