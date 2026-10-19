import { isSpaRoute } from "./spa-routes";

interface PagesEnv {
  ASSETS: { fetch: (request: Request | string) => Promise<Response> };
}

type PagesContext = {
  request: Request;
  next: () => Promise<Response>;
  env: PagesEnv;
};

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const response = await context.next();
  const pathname = new URL(context.request.url).pathname;

  if (response.status !== 404 || !isSpaRoute(pathname)) {
    return response;
  }

  const indexRequest = new Request(new URL("/index.html", context.request.url), context.request);
  const indexResponse = await context.env.ASSETS.fetch(indexRequest);
  if (!indexResponse.ok) {
    return response;
  }

  const headers = new Headers(indexResponse.headers);
  headers.set("Content-Type", "text/html; charset=utf-8");
  return new Response(indexResponse.body, { status: 200, headers });
};
