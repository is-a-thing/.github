import { OAuth2Tokens, OAuth2RequestError, UnexpectedErrorResponseBodyError, UnexpectedResponseError, ArcticFetchError } from "arctic";
import { GITHUB_AUTHORIZATION_DOMAIN } from '$util/env.ts'
const authorizationEndpoint = `${GITHUB_AUTHORIZATION_DOMAIN}/login/oauth/authorize`;
const tokenEndpoint = `${GITHUB_AUTHORIZATION_DOMAIN}/login/oauth/access_token`;

import { encodeBase64 } from "jsr:@std/encoding/base64";


function createOAuth2RequestError(result: object) {
    let code;
    if ("error" in result && typeof result.error === "string") {
        code = result.error;
    }
    else {
        throw new Error("Invalid error response");
    }
    let description = null;
    let uri = null;
    let state = null;
    if ("error_description" in result) {
        if (typeof result.error_description !== "string") {
            throw new Error("Invalid data");
        }
        description = result.error_description;
    }
    if ("error_uri" in result) {
        if (typeof result.error_uri !== "string") {
            throw new Error("Invalid data");
        }
        uri = result.error_uri;
    }
    if ("state" in result) {
        if (typeof result.state !== "string") {
            throw new Error("Invalid data");
        }
        state = result.state;
    }
    const error = new OAuth2RequestError(code, description, uri, state);
    return error;
}
function createOAuth2Request(endpoint: string, body: URLSearchParams) {
    const bodyBytes = new TextEncoder().encode(body.toString());
    const request = new Request(endpoint, {
        method: "POST",
        body: bodyBytes
    });
    request.headers.set("Content-Type", "application/x-www-form-urlencoded");
    request.headers.set("Accept", "application/json");
    // Required by GitHub, and probably by others as well
    request.headers.set("User-Agent", "arctic");
    // Required by Reddit
    request.headers.set("Content-Length", bodyBytes.byteLength.toString());
    return request;
}
function encodeBasicCredentials(username: string, password: string) {
    const bytes = new TextEncoder().encode(`${username}:${password}`);
    return encodeBase64(bytes);
}

export class GitHub {
    clientId;
    clientSecret;
    redirectURI;
    constructor(clientId: string, clientSecret: string, redirectURI: string | null) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectURI = redirectURI;
    }
    createAuthorizationURL(state: string, scopes: string[]) {
        const url = new URL(authorizationEndpoint);
        url.searchParams.set("response_type", "code");
        url.searchParams.set("client_id", this.clientId);
        url.searchParams.set("state", state);
        if (scopes.length > 0) {
            url.searchParams.set("scope", scopes.join(" "));
        }
        if (this.redirectURI !== null) {
            url.searchParams.set("redirect_uri", this.redirectURI);
        }
        return url;
    }
    async validateAuthorizationCode(code: string) {
        const body = new URLSearchParams();
        body.set("grant_type", "authorization_code");
        body.set("code", code);
        if (this.redirectURI !== null) {
            body.set("redirect_uri", this.redirectURI);
        }
        const request = createOAuth2Request(tokenEndpoint, body);
        const encodedCredentials = encodeBasicCredentials(this.clientId, this.clientSecret);
        request.headers.set("Authorization", `Basic ${encodedCredentials}`);
        const tokens = await sendTokenRequest(request);
        return tokens;
    }
    async refreshAccessToken(refreshToken: string) {
        const body = new URLSearchParams();
        body.set("grant_type", "refresh_token");
        body.set("refresh_token", refreshToken);
        const request = createOAuth2Request(tokenEndpoint, body);
        const encodedCredentials = encodeBasicCredentials(this.clientId, this.clientSecret);
        request.headers.set("Authorization", `Basic ${encodedCredentials}`);
        const tokens = await sendTokenRequest(request);
        return tokens;
    }
}
async function sendTokenRequest(request: Request): Promise<OAuth2Tokens> {
    let response;
    try {
        response = await fetch(request);
    }
    catch (e) {
        throw new ArcticFetchError(e);
    }
    if (response.status !== 200) {
        if (response.body !== null) {
            await response.body.cancel();
        }
        throw new UnexpectedResponseError(response.status);
    }
    let data;
    try {
        data = await response.json();
    }
    catch {
        throw new UnexpectedResponseError(response.status);
    }
    if (typeof data !== "object" || data === null) {
        throw new UnexpectedErrorResponseBodyError(response.status, data);
    }
    if ("error" in data && typeof data.error === "string") {
        let error;
        try {
            error = createOAuth2RequestError(data);
        }
        catch {
            throw new UnexpectedErrorResponseBodyError(response.status, data);
        }
        throw error;
    }
    const tokens = new OAuth2Tokens(data);
    return tokens;
}
