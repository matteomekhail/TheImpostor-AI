export const onRequestGet: PagesFunction = async (context) => {
  const keys = Object.keys(context.env);
  const hasApiKey = 'OPENROUTER_API_KEY' in context.env;
  const apiKeyType = typeof (context.env as any).OPENROUTER_API_KEY;
  const apiKeyLength = hasApiKey ? String((context.env as any).OPENROUTER_API_KEY).length : 0;

  return Response.json({
    envKeys: keys,
    hasApiKey,
    apiKeyType,
    apiKeyLength,
  });
};
