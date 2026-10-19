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
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Do not call next() for unknown paths — Pages dev serves index.html with 200 otherwise.
  if (!isSpaRoute(pathname)) {
    return new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const response = await context.next();
  if (response.ok) {
    return response;
  }

  const indexRequest = new Request(new URL("/index.html", url), context.request);
  const indexResponse = await context.env.ASSETS.fetch(indexRequest);
  if (!indexResponse.ok) {
    return response;
  }

  const headers = new Headers(indexResponse.headers);
  headers.set("Content-Type", "text/html; charset=utf-8");
  return new Response(indexResponse.body, { status: 200, headers });
};
