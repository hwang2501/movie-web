/** Đồng bộ navbar / menu sau đăng nhập–đăng xuất khi pathname không đổi (ví dụ đang ở `/`). */
export const AUTH_CHANGED_EVENT = 'movie-web-auth';

export function notifyAuthChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}
