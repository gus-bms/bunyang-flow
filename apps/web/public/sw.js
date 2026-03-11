self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data = { title: "분양플로우", body: "새 알림이 있습니다." };
  try {
    data = event.data.json();
  } catch {
    data.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-72.png",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
