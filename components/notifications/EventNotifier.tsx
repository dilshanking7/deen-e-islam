"use client";

import { useEffect } from "react";
import { isEventToday, shouldNotifyEventToday } from "@/lib/islamic-events";

export default function EventNotifier() {
  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    if (!shouldNotifyEventToday()) return;
    const ev = isEventToday();
    if (!ev) return;
    new Notification(`🌙 ${ev.titleUrdu}`, {
      body: ev.description,
      icon: "/logo-icon.png",
    });
  }, []);

  return null;
}
