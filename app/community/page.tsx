"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Home,
  MessageCircle,
  Users,
  Plus,
  Send,
  Image as ImageIcon,
  Video,
  X,
  Heart,
  Share2,
  MessageSquare,
  Mail,
  Eye,
} from "lucide-react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  increment,
} from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  getUserProfile,
  getAllUsers,
  followUser,
  unfollowUser,
  type PublicUser,
} from "@/lib/firestore";
import { useI18n } from "@/lib/i18n";
import { useUnreadConversations } from "@/lib/use-unread";
import RequireAuth from "@/components/auth/RequireAuth";

interface Post {
  id: string;
  author: string;
  authorId: string;
  username: string;
  photoURL?: string;
  text: string;
  image?: string;
  video?: string;
  time: number;
  likes: Record<string, boolean>;
  commentCount: number;
  views?: number;
  type?: string;
}

interface Comment {
  id: string;
  author: string;
  authorId: string;
  photoURL?: string;
  text: string;
  time: number;
}

const POST_TYPES = ["general", "dua", "naat", "story", "timeline"] as const;
export type PostType = (typeof POST_TYPES)[number];

interface ChatMessage {
  id: string;
  author: string;
  authorId: string;
  photoURL?: string;
  text: string;
  time: number;
}

export default function CommunityPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { count: unreadDmCount } = useUnreadConversations();

  return (
    <RequireAuth>
      <CommunityContent
        router={router}
        t={t}
        unreadDmCount={unreadDmCount}
      />
    </RequireAuth>
  );
}

function CommunityContent({
  router,
  t,
  unreadDmCount,
}: {
  router: ReturnType<typeof useRouter>;
  t: (key: string, params?: Record<string, string | number>) => string;
  unreadDmCount: number;
}) {

  const [myName, setMyName] = useState("You");
  const [myUsername, setMyUsername] = useState("@you");
  const [myUid, setMyUid] = useState("");
  const [myFollowing, setMyFollowing] = useState<Record<string, boolean>>({});

  const [tab, setTab] = useState<"feed" | "chat" | "members">("feed");

  const [posts, setPosts] = useState<Post[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<PublicUser[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState("");
  const [postVideo, setPostVideo] = useState("");
  const [postVideoFile, setPostVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [videoUploading, setVideoUploading] = useState(false);
  const [postType, setPostType] = useState<PostType>("general");
  const [filter, setFilter] = useState<"all" | PostType>("all");
  const [commentsFor, setCommentsFor] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");

  const [chatInput, setChatInput] = useState("");

  const [now, setNow] = useState(() => Date.now());
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("create") === "1") {
      const t = setTimeout(() => setShowCreate(true), 0);
      window.history.replaceState({}, "", "/community");
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    async function loadProfile() {
      const user = auth.currentUser;
      if (user) {
        setMyUid(user.uid);
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setMyName(profile.fullName || "You");
          setMyUsername(profile.username ? `@${profile.username}` : "@you");
          if (profile.following) {
            const map: Record<string, boolean> = {};
            profile.following.forEach((id) => {
              map[id] = true;
            });
            setMyFollowing(map);
          }
        }
      }
    }
    loadProfile();
  }, []);

  useEffect(() => {
    const nowTimer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(nowTimer);
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "community-posts"),
      orderBy("time", "desc"),
      limit(100)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Post, "id">),
        }));
        setPosts(list);
        setFeedLoading(false);

        const user = auth.currentUser;
        if (!user) return;
        const myUid = user.uid;
        const viewedThisSession = new Set<string>(
          JSON.parse(sessionStorage.getItem("islaam-viewed-posts") || "[]") as string[]
        );
        const toRecord: string[] = [];
        list.forEach((p) => {
          if (p.authorId !== myUid && !viewedThisSession.has(p.id)) {
            viewedThisSession.add(p.id);
            toRecord.push(p.id);
            void updateDoc(doc(db, "community-posts", p.id), { views: increment(1) });
          }
        });
        if (toRecord.length) {
          sessionStorage.setItem("islaam-viewed-posts", JSON.stringify([...viewedThisSession]));
        }
      },
      () => setFeedLoading(false)
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!commentsFor) {
      const t = setTimeout(() => setComments([]), 0);
      return () => clearTimeout(t);
    }
    const q = query(
      collection(db, "community-posts", commentsFor.id, "comments"),
      orderBy("time", "asc"),
      limit(200)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Comment, "id">),
        }));
        setComments(list);
      },
      () => {}
    );
    return () => unsub();
  }, [commentsFor]);

  useEffect(() => {
    const q = query(
      collection(db, "community-chat"),
      orderBy("time", "asc"),
      limit(100)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ChatMessage, "id">),
      }));
      setChatMessages(list);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    getAllUsers()
      .then((users) => setMembers(users.filter((u) => u.uid !== myUid)))
      .catch(() => {});
  }, [myUid]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, tab]);

  function handleImageUpload(file: File) {
    const reader = new FileReader();
    reader.onload = () => setPostImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleVideoFileSelect(file: File) {
    setPostVideoFile(file);
    setPostVideo("");
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(URL.createObjectURL(file));
  }

  async function uploadVideoFile(file: File): Promise<string> {
    const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
    const storageRef = ref(storage, `community-posts/videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`);
    const snapshot = await uploadBytesResumable(storageRef, file, {
      contentType: file.type || "video/mp4",
    });
    return getDownloadURL(snapshot.ref);
  }

  async function createPost(e: React.FormEvent) {
    e.preventDefault();
    if (!postText.trim() && !postImage && !postVideo && !postVideoFile) return;
    if (postVideoFile && postVideoFile.size > 100 * 1024 * 1024) {
      return;
    }
    if (!postVideoFile && !postVideo && !postImage && !postText.trim()) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      let videoUrl = postVideo.trim();
      if (postVideoFile) {
        setVideoUploading(true);
        videoUrl = await uploadVideoFile(postVideoFile);
      }

      await addDoc(collection(db, "community-posts"), {
        author: myName,
        authorId: user.uid,
        username: myUsername,
        text: postText.trim(),
        image: postImage,
        video: videoUrl,
        type: postType,
        time: Date.now(),
        likes: {},
        commentCount: 0,
        views: 0,
      });
    } catch (error) {
      console.error("Error creating post:", error);
    }

    setVideoUploading(false);
    setPostText("");
    setPostImage("");
    setPostVideo("");
    setPostVideoFile(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview("");
    setPostType("general");
    setShowCreate(false);
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentsFor || !commentInput.trim()) return;
    const user = auth.currentUser;
    if (!user) return;
    try {
      await addDoc(collection(db, "community-posts", commentsFor.id, "comments"), {
        author: myName,
        authorId: user.uid,
        text: commentInput.trim(),
        time: Date.now(),
      });
      await updateDoc(doc(db, "community-posts", commentsFor.id), {
        commentCount: increment(1),
      });
    } catch (error) {
      console.error("Error adding comment:", error);
    }
    setCommentInput("");
  }

  async function toggleLike(post: Post) {
    const user = auth.currentUser;
    if (!user) return;

    const liked = !!post.likes[user.uid];
    await updateDoc(doc(db, "community-posts", post.id), {
      [`likes.${user.uid}`]: !liked,
    });
  }

  async function toggleFollow(member: PublicUser) {
    const user = auth.currentUser;
    if (!user) return;

    const isFollowing = !!myFollowing[member.uid];

    setMyFollowing((prev) => ({ ...prev, [member.uid]: !isFollowing }));

    try {
      if (isFollowing) {
        await unfollowUser(user.uid, member.uid);
      } else {
        await followUser(user.uid, member.uid);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      setMyFollowing((prev) => ({ ...prev, [member.uid]: isFollowing }));
    }
  }

  async function sendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, "community-chat"), {
        author: myName,
        authorId: user.uid,
        text: chatInput.trim(),
        time: Date.now(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setChatInput("");
  }

  function sharePost(post: Post) {
    const text = `${post.author}: ${post.text}`;
    if (navigator.share) {
      navigator.share({ title: "Islaam-E-Deen Community", text });
    } else {
      navigator.clipboard?.writeText(text);
    }
  }

  function closeComposer() {
    setShowCreate(false);
    setPostVideoFile(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview("");
  }

  function timeAgo(ts: number) {
    const diff = Math.floor((now - ts) / 60000);
    if (diff < 1) return "now";
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
  }

  const likeCount = (likes: Record<string, boolean>) =>
    Object.values(likes).filter(Boolean).length;

  const postLikeCount = (p: Post) =>
    likeCount(p.likes || {});

  const TYPE_KEY: Record<string, string> = {
    dua: "community.typeDua",
    naat: "community.typeNaat",
    story: "community.typeStory",
    timeline: "community.typeTimeline",
    general: "community.typeGeneral",
  };

  const TYPE_ICON: Record<string, string> = {
    dua: "🤲",
    naat: "🎵",
    story: "🕊️",
    timeline: "⏳",
    general: "💬",
  };

  const filteredPosts =
    filter === "all" ? posts : posts.filter((p) => (p.type || "general") === filter);

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100">
      <div className="sticky top-0 z-30 border-b border-white/40 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-icon.png"
              alt="Islaam-E-Deen"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
            <div>
              <h1 className="text-xl font-extrabold text-emerald-800">
                {t("community.title")}
              </h1>
              <p className="text-xs text-gray-500">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                {" "}
                <span className="font-semibold text-green-600">
                  {members.length} {t("community.members")}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/messages")}
              className="relative flex items-center gap-1.5 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow ring-1 ring-emerald-100 transition hover:bg-emerald-50"
            >
              <Mail size={16} />
              {t("community.dm")}
              {unreadDmCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                  {unreadDmCount}
                </span>
              )}
            </button>
            <button
              onClick={() => router.push("/home")}
              className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow ring-1 ring-emerald-100 transition hover:bg-emerald-50"
            >
              {t("community.home")}
            </button>
          </div>
        </div>

        <div className="mx-auto flex max-w-3xl gap-2 px-5 pb-3">
          {(
            [
              { key: "feed", label: t("community.feed"), icon: Home },
              { key: "chat", label: t("community.chat"), icon: MessageCircle },
              { key: "members", label: t("community.membersTab"), icon: Users },
            ] as const
          ).map((tabItem) => (
            <button
              key={tabItem.key}
              onClick={() => setTab(tabItem.key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                tab === tabItem.key
                  ? "bg-emerald-700 text-white shadow-lg"
                  : "bg-white text-gray-600 ring-1 ring-gray-100 hover:bg-emerald-50"
              }`}
            >
              <tabItem.icon size={17} />
              {tabItem.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 pb-28 pt-6">
        <AnimatePresence mode="wait">
          {tab === "feed" && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                {(["all", "dua", "naat", "story", "timeline"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                      filter === f
                        ? "bg-emerald-700 text-white shadow"
                        : "bg-white text-gray-600 ring-1 ring-gray-100 hover:bg-emerald-50"
                    }`}
                  >
                    {f === "all" ? t("community.filterAll") : `${TYPE_ICON[f]} ${t(TYPE_KEY[f])}`}
                  </button>
                ))}
              </div>

              <div className="rounded-3xl bg-gradient-to-r from-emerald-700 to-green-800 p-6 text-white shadow-xl">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-emerald-200" />
                  <div>
                    <h2 className="text-xl font-bold">{t("community.welcome", { name: myName })}</h2>
                    <p className="text-sm text-emerald-100">
                      {t("community.welcomeDesc")}
                    </p>
                  </div>
                </div>
              </div>

              {feedLoading && (
                <p className="py-10 text-center text-gray-400">{t("community.loadingPosts")}</p>
              )}

              {!feedLoading && filteredPosts.length === 0 && (
                <div className="rounded-3xl bg-white p-10 text-center shadow-xl">
                  <p className="text-5xl">🌱</p>
                  <p className="mt-4 font-semibold text-gray-700">
                    {t("community.noPosts")}
                  </p>
                </div>
              )}

              {filteredPosts.map((post) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-emerald-50/50"
                >
                  <div className="flex items-center gap-3">
                    {post.photoURL ? (
                      <img
                        src={post.photoURL}
                        alt={post.author}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-green-700 text-lg font-bold text-white">
                        {post.author.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-800">{post.author}</h3>
                      <p className="text-xs text-gray-400">
                        {post.username} • {timeAgo(post.time)}
                      </p>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                      {(post.type && post.type !== "general" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                          {TYPE_ICON[post.type] || TYPE_ICON.general} {t(TYPE_KEY[post.type] || TYPE_KEY.general)}
                        </span>
                      )) || null}
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1 text-[11px] font-semibold text-gray-500">
                        <Eye size={13} /> {post.views || 0}
                      </span>
                    </div>
                  </div>

                  {post.text && (
                    <p className="mt-4 leading-relaxed text-gray-700">{post.text}</p>
                  )}

                  {post.image && (
                    <img
                      src={post.image}
                      alt="Community post"
                      className="mt-4 max-h-96 w-full rounded-2xl object-cover"
                    />
                  )}

                  {post.video && (
                    <video
                      src={post.video}
                      controls
                      className="mt-4 max-h-96 w-full rounded-2xl bg-black"
                    />
                  )}

                  <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4">
                    <button
                      onClick={() => toggleLike(post)}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        post.likes?.[myUid]
                          ? "bg-red-50 text-red-600"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <Heart size={18} className={post.likes?.[myUid] ? "fill-red-500 text-red-500" : ""} />
                      {postLikeCount(post)}
                    </button>
                    <button
                    onClick={() => setCommentsFor(post)}
                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-50"
                  >
                    <MessageSquare size={18} />
                    {post.commentCount || 0}
                  </button>
                    <button
                      onClick={() => sharePost(post)}
                      className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-50"
                    >
                      <Share2 size={18} />
                      {t("community.share")}
                    </button>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}

          {tab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <div className="rounded-3xl bg-white shadow-xl ring-1 ring-emerald-50/50">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h2 className="font-bold text-gray-800">{t("community.chatTitle")}</h2>
                  <p className="text-xs text-gray-400">
                    {t("community.chatDesc")}
                  </p>
                </div>

                <div className="h-[60vh] space-y-4 overflow-y-auto p-5">
                  {chatMessages.length === 0 && (
                    <p className="py-10 text-center text-gray-400">
                      {t("community.noMessagesYet")}
                    </p>
                  )}
                  {chatMessages.map((msg) => {
                    const mine = msg.authorId === myUid;
                    return (
                      <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            mine
                              ? "bg-emerald-700 text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {!mine && (
                            <p className="mb-1 text-xs font-bold text-emerald-700">
                              {msg.author}
                            </p>
                          )}
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <p className={`mt-1 text-[10px] ${mine ? "text-emerald-200" : "text-gray-400"}`}>
                            {new Date(msg.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={sendChat} className="flex gap-2 border-t border-gray-100 p-4">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={t("community.writeMessage")}
                    className="flex-1 rounded-2xl bg-gray-50 px-5 py-3.5 text-sm outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-emerald-500"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="rounded-2xl bg-emerald-700 px-5 text-white shadow-lg transition hover:bg-emerald-800"
                  >
                    <Send size={18} />
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}

          {tab === "members" && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {members.length === 0 && (
                <p className="py-10 text-center text-gray-400">{t("community.noMembers")}</p>
              )}
              {members.map((member) => {
                const isFollowing = !!myFollowing[member.uid];
                const followerCount = member.followers?.length || 0;
                return (
                  <div
                    key={member.uid}
                    className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-xl ring-1 ring-emerald-50/50"
                  >
                    {member.photoURL ? (
                      <img
                        src={member.photoURL}
                        alt={member.fullName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-green-700 text-lg font-bold text-white">
                        {member.fullName?.charAt(0) || "U"}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold text-gray-800">
                        {member.fullName || "User"}
                      </h3>
                      <p className="text-xs text-gray-400">
                        @{member.username} • {member.country || t("community.noLocation")}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {followerCount} {t("community.followers")}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => toggleFollow(member)}
                        className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                          isFollowing
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : "bg-gradient-to-r from-emerald-600 to-green-700 text-white hover:opacity-90"
                        }`}
                      >
                        {isFollowing ? t("community.following") : t("community.follow")}
                      </button>
                      <button
                        onClick={() => router.push(`/messages/${member.uid}`)}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
                      >
                        {t("community.message")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {tab === "feed" && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCreate(true)}
          className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-emerald-700 to-green-700 text-white shadow-2xl"
        >
          <Plus size={30} />
        </motion.button>
      )}

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-5"
            onClick={closeComposer}
          >
            <motion.form
              onClick={(e) => e.stopPropagation()}
              onSubmit={createPost}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">{t("community.createPost")}</h2>
                <button
                  type="button"
                  onClick={closeComposer}
                  className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </div>

              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder={t("community.shareThoughts", { name: myName })}
                rows={4}
                className="mt-5 w-full resize-none rounded-2xl bg-gray-50 p-5 text-gray-800 outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-emerald-500"
              />

              <div className="mt-4 flex flex-wrap gap-2">
                {POST_TYPES.map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => setPostType(pt)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                      postType === pt
                        ? "bg-emerald-700 text-white shadow"
                        : "bg-gray-100 text-gray-600 hover:bg-emerald-50"
                    }`}
                  >
                    {TYPE_ICON[pt]} {t(TYPE_KEY[pt])}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex gap-3">
                <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-4 text-sm font-semibold text-gray-500 transition hover:border-emerald-500 hover:text-emerald-600">
                  <ImageIcon size={18} />
                  {t("community.photo")}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  />
                </label>

                <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-4 text-sm font-semibold text-gray-500 transition hover:border-emerald-500 hover:text-emerald-600">
                  <Video size={18} />
                  {t("community.uploadVideo")}
                  <input
                    type="file"
                    accept="video/*,.mp4,.webm,.ogg,.mov"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleVideoFileSelect(e.target.files[0])}
                  />
                </label>
              </div>

              <div className="mt-3">
                <input
                  type="url"
                  value={postVideo}
                  onChange={(e) => {
                    setPostVideo(e.target.value);
                    if (e.target.value) setPostVideoFile(null);
                  }}
                  placeholder={t("community.videoUrlPlaceholder")}
                  className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {postImage && (
                <div className="relative mt-4">
                  <img src={postImage} alt="Preview" className="max-h-64 w-full rounded-2xl object-cover" />
                  <button
                    type="button"
                    onClick={() => setPostImage("")}
                    className="absolute right-3 top-3 rounded-full bg-black/60 p-1.5 text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {(postVideo || videoPreview) && (
                <div className="relative mt-4">
                  {postVideoFile && (
                    <p className="mb-1 truncate text-xs font-semibold text-emerald-700">
                      {postVideoFile.name} ({(postVideoFile.size / 1024 / 1024).toFixed(1)} MB)
                    </p>
                  )}
                  <video
                    src={videoPreview || postVideo}
                    controls
                    className="max-h-64 w-full rounded-2xl bg-black"
                  />
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={videoUploading}
                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-emerald-700 to-green-700 py-4 font-bold text-white shadow-xl disabled:opacity-60"
              >
                {videoUploading ? t("community.uploadingVideo") : t("community.publish")}
              </motion.button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {commentsFor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-5"
            onClick={() => setCommentsFor(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  {t("community.comments")}
                </h2>
                <button
                  type="button"
                  onClick={() => setCommentsFor(null)}
                  className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </div>

              {commentsFor.text && (
                <p className="mt-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
                  {commentsFor.text}
                </p>
              )}

              <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
                {comments.length === 0 && (
                  <p className="py-8 text-center text-sm text-gray-400">
                    {t("community.noComments")}
                  </p>
                )}
                {comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-green-700 text-sm font-bold text-white">
                      {c.author.charAt(0)}
                    </div>
                    <div className="min-w-0 rounded-2xl rounded-tl-none bg-emerald-50 px-4 py-2.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-xs font-bold text-emerald-800">{c.author}</p>
                        <p className="text-[10px] text-gray-400">{timeAgo(c.time)}</p>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-700">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={addComment} className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                <input
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder={t("community.leaveComment")}
                  className="flex-1 rounded-2xl bg-gray-50 px-5 py-3 text-sm outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-emerald-500"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="rounded-2xl bg-emerald-700 px-5 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-800"
                >
                  {t("community.postComment")}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
