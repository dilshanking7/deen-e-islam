"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";

export interface ConversationSummary {
  id: string;
  otherUid: string;
  lastMessage?: string;
  lastTime?: number;
  unread: boolean;
}

export function useUnreadConversations() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "conversations"),
      where("members", "array-contains", user.uid)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: ConversationSummary[] = [];
        let unreadCount = 0;
        snap.docs.forEach((d) => {
          const data = d.data();
          const members = (data.members as string[]) || [];
          const otherUid = members.find((m) => m !== user.uid) || "";
          const lastTime = Number(data.lastTime) || 0;
          const lastRead = Number((data.lastRead && data.lastRead[user.uid]) || 0);
          const unread = lastTime > 0 && lastTime > lastRead;
          if (unread) unreadCount++;
          list.push({
            id: d.id,
            otherUid,
            lastMessage: data.lastMessage,
            lastTime,
            unread,
          });
        });
        list.sort((a, b) => (b.lastTime || 0) - (a.lastTime || 0));
        setConversations(list);
        setCount(unreadCount);
      },
      () => {
        setConversations([]);
        setCount(0);
      }
    );

    return () => unsub();
  }, []);

  return { conversations, count };
}
