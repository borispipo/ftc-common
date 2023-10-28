
function defaultUnfetch(url, options) {
    if(typeof XMLHttpRequest ==='undefined' || typeof window =='undefined') throw "unfetch function is not supported on the current platform. Please install required dependencies";;
    options = options || {};
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        const keys = [];
        const headers = {};
        const response = () => ({
            ok: ((request.status / 100) | 0) == 2, // 200-299
            statusText: request.statusText,
            status: request.status,
            url: request.responseURL,
            text: () => Promise.resolve(request.responseText),
            json: () => Promise.resolve(request.responseText).then(JSON.parse),
            blob: () => Promise.resolve(new Blob([request.response])),
            clone: response,
            headers: {
                keys: () => keys,
                entries: () => keys.map((n) => [n, request.getResponseHeader(n)]),
                get: (n) => request.getResponseHeader(n),
                has: (n) => request.getResponseHeader(n) != null,
            },
        });
        request.open(options.method || "get", url, true);
        request.onload = () => {
            request
                .getAllResponseHeaders()
                .toLowerCase()
                .replace(/^(.+?):/gm, (m, key) => {
                    headers[key] || keys.push((headers[key] = key));
                });
            resolve(response());
        };
        request.onerror = reject;
        request.withCredentials = options.credentials == "include";
        for (const i in options.headers) {
            request.setRequestHeader(i, options.headers[i]);
        }
        request.send(options.body || null);
    });
}
const unfetch = (typeof XMLHttpRequest !=='undefined' && typeof window !=="undefined" && XMLHttpRequest && window?.XMLHttpRequest) ?
    defaultUnfetch : 
    typeof global !='undefined' && global && typeof global?.fetch =='function' ? global.fetch : 
    typeof globalThis != "undefined" && globalThis && typeof globalThis?.fetch =='function'? globalThis.fetch : 
    typeof window !=='undefined' && window && typeof window?.fetch === "function"? window?.fetch : undefined;

export default unfetch;