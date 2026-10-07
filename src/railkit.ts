export type RailKit = (path: string) => Promise<unknown>;

const STATUS_MESSAGES: Record<number, string> = {
  401: 'RailKit rejected the API key (missing, invalid, or expired).',
  403: 'RailKit key is inactive, or its plan has no REST access (the Advance plan is required).',
  404: 'RailKit found nothing for that request.',
  429: 'RailKit usage limit exceeded for this API key.',
};

export function railkit(apiKey: string, baseUrl: string): RailKit {
  return async (path) => {
    const res = await fetch(baseUrl + path, { headers: { 'x-api-key': apiKey } });
    const body = (await res.json().catch(() => null)) as { success?: boolean; error?: string } | null;
    if (!res.ok || !body?.success) {
      throw new Error(STATUS_MESSAGES[res.status] ?? `RailKit request failed (${res.status}): ${body?.error ?? 'upstream error'}`);
    }
    const { success, ...rest } = body;
    return rest;
  };
}
