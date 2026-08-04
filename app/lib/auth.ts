const AUTH_COOKIE = "rtp_admin";
const AUTH_USER = "admin";
const AUTH_PASSWORD = "admin";

export function checkCredentials(username: string, password: string): boolean {
  return username === AUTH_USER && password === AUTH_PASSWORD;
}

export function setAuthCookie(): void {
  document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

export function clearAuthCookie(): void {
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function isLoggedIn(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((part) => part.trim() === `${AUTH_COOKIE}=1`);
}
