import { serve } from "https://deno.land/std/http/server.ts";
import { cheerio } from "https://deno.land/x/cheerio@1.0.7/mod.ts";
function error(code: number): Promise<Response> {
  const response = new Response(null, {
    status: code,
  });
  return Promise.resolve(response);
}


function options(): Promise<Response> {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Expose-Headers":
      "Date, Etag, Content-Length, Accept-Ranges, Content-Range, Server, Location",
    "Access-Control-Max-Age": "2073600",
  };
  const response = new Response(null, {
    headers,
    status: 204,
  });
  return Promise.resolve(response);
}

async function proxy(request: Request): Promise<Response> {
  const { href, origin } = new URL(request.url);
  const url = href.replace(origin, "").replace(/^\//, "");
  if (!urlTest(url)) {
    return error(400);
  }
  const { host } = new URL(url);

  async function getProxyRequest(req: Request): Promise<Request> {
    const init = {
      body: req.body,
      cache: req.cache,
      headers: getRequestHeaders(req),
      keepalive: req.keepalive,
      method: req.method,
      redirect: "follow" as RequestRedirect,
    };
    const proxyReq = new Request(url, init);
    return proxyReq;

    function getRequestHeaders(_req: Request) {
      const headers: Record<string, string> = {};
      [..._req.headers.entries()].forEach((kv) => {
        if (kv[0].toLowerCase() === "host") {
          return (headers["host"] = host);
        } else if (isIgnore(kv[0])) {
          return;
        } else {
          return (headers[kv[0]] = kv[1]);
        }
      });
      return headers;

      function isIgnore(name: string) {
        const ignoreList = [
          "content-length",
          /^cf\-/,
          /^x\-forwarded\-/,
          "x-real-ip",
        ];

        for (const i of ignoreList) {
          if (typeof i === "string") {
            if (i === name.toLocaleLowerCase()) {
              return true;
            }
          }
          if (i instanceof RegExp) {
            if (i.test(name)) {
              return true;
            }
          }
        }
        return false;
      }
    }
  }

  async function getProxyResponse(req: Request): Promise<Response> {
    const resp = await fetch(req);
    const headers = getResponseHeaders(resp);
    const status = resp.status;
    const body = resp.body ? bodyHandler(resp.body) : resp.body;
    const response = new Response(body, {
      headers,
      status,
    });
    return response;

    function getResponseHeaders(_resp: Response): HeadersInit {
      const _headers = _resp.headers;
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Expose-Headers": [..._headers.keys()].join(", "),
        "Access-Control-Max-Age": "2073600",
      };

      const headers: Record<string, string> = {};
      [..._headers.entries()].forEach(
        (kv) => (headers[kv[0].toLocaleLowerCase()] = kv[1])
      );
      Object.entries(corsHeaders).forEach(
        (kv) => (headers[kv[0].toLocaleLowerCase()] = kv[1])
      );
      return headers;
    }

    function bodyHandler(
      body: ReadableStream<Uint8Array>
    ): ReadableStream<Uint8Array> {
      // See also: https://zhuanlan.zhihu.com/p/98848420
      let aborter: (reason: any) => void;
      let aborted = false;

      const reader = body.getReader();
      const stream = new ReadableStream({
        start(controller) {
          function push() {
            reader
              .read()
              .then(({ value, done }) => {
                if (done) {
                  if (!aborted) {
                    controller.close();
                  }
                  return;
                }
                controller.enqueue(value);
                push();
              })
              .catch((error) => console.error(error));
          }
          aborter = (reason) => {
            controller.error(new Error(reason));
            aborted = true;
          };

          push();
        },
        cancel(reason) {
          reader.cancel(reason);
          aborter(reason);
        },
      });
      return stream;
    }
  }

  const proxyRequest = await getProxyRequest(request);
  const proxyResponse = await getProxyResponse(proxyRequest);
  return proxyResponse;

  function urlTest(url: string) {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }
}

function logError(request: Request, error: Error) {
  const logObj = {
    time: new Date().toISOString(),
    type: "error",
    request: {
      url: request.url,
      method: request.method,
      headers: [...request.headers.entries()],
    },
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
  };
  console.log(JSON.stringify(logObj));
}

function log(request: Request, response: Response) {
  const logObj = {
    time: new Date().toISOString(),
    type: "info",
    request: {
      url: request.url,
      method: request.method,
      headers: [...request.headers.entries()],
    },
    response: {
      status: response.status,
      headers: [...response.headers.entries()],
    },
  };
  console.log(JSON.stringify(logObj));
}

async function handler(request: Request): Promise<Response> {
  let response;
  if (request.method === "OPTIONS") {
    response = await options();
  } else {
    try {
      response = await proxy(request);
    } catch (err) {
      logError(request, err);
      response = await error(500);
    }
  }
 // log(request, response);
  htm = await response.text() 
  const $ = cheerio.load( htm )
  return $.html()
}

serve(handler);
