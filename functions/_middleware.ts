import { isSpaRoute } from "./spa-routes";
import { shouldServeAsStaticAsset } from "./static-path";

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

  if (shouldServeAsStaticAsset(pathname)) {
    const staticResponse = await context.env.ASSETS.fetch(context.request);
    if (staticResponse.status !== 404) {
      return staticResponse;
    }
  }

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
