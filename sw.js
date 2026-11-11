/* Service worker – nhận thông báo đẩy "có đơn mới" cho trang quản trị Hoàng Đế */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { b: e.data ? e.data.text() : "" }; }
  const code = d.code || "";
  e.waitUntil(self.registration.showNotification(d.t || "🔔 Có đơn Nhật ơi!", {
    body: d.b || "Mở trang quản trị để xem đơn hàng mới",
    tag: code || "order",
    renotify: true,
    icon: "icon-192.png",
    badge: "icon-192.png",
    vibrate: [300, 150, 300, 150, 300],
    requireInteraction: true,
    data: { code }
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const code = (e.notification.data && e.notification.data.code) || "";
  const open = code && code !== "TEST" ? code : "";
  const scope = self.registration.scope;
  const url = scope + (open ? "?order=" + encodeURIComponent(open) : "") + "#admin";
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of list) {
      if (c.url.startsWith(scope)) {
        try { await c.focus(); c.postMessage({ type: "open-order", code: open }); return; } catch (_) {}
      }
    }
    await self.clients.openWindow(url);
  })());
});
