"use client";

import { useState, KeyboardEvent } from "react";
import type React from "react";
import axios from "axios";
import styles from "./LikeAndComment.module.css";
import Image from "next/image";

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  profileImage?: string | null;
  createdAt: Date; 
}

export function LikeButton({
  lookId,
  userId,
  likes,
  onLike,
}: {
  lookId: string;
  userId: string;
  likes: string[];
  onLike: (newLikes: string[]) => void;
}) {
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;

    try {
      const res = await axios.post(`/api/sharelook/${lookId}/like`, { userId });
      const updatedLikes = res.data.likes || [];
      onLike(updatedLikes);
    } catch (err) {
      console.error("Failed to like:", err);
    }
  };

  const isLiked = userId && likes.includes(userId);

  return (
    <button
      onClick={handleLike}
      className={`${styles.likeButton} ${isLiked ? styles.liked : ""}`}
    >
      <span className={styles.likeIcon}>❤️</span>
      <span className={styles.likeCount}>{likes?.length || 0}</span>
    </button>
  );
}

export function CommentForm({
  lookId,
  userId,
  userName,
  profileImage,
  onNewComment,
}: {
  lookId: string;
  userId: string;
  userName: string;
  profileImage?: string | null;
  onNewComment: (comments: Comment[]) => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState<"all" | "hearts" | "clothes">("all");

  const allEmojis = {
    all: ["😀", "😂", "😍", "😢", "😎", "👍", "💖", "🎉"],
    hearts: ["❤️", "💖", "💘", "💞", "💕"],
    clothes: ["👕", "👗", "👖", "🧥", "👟", "🥿", "🧢"],
  } as const;

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/api/sharelook/${lookId}/comment`);
      const comments: Comment[] = (res.data.comments || []).map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt || c.date || Date.now()),
      }));
      onNewComment(comments);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !text.trim()) return;

    setLoading(true);
    try {
      await axios.post(`/api/sharelook/${lookId}/comment`, {
        text: text.trim(),
        userId,
        userName,
      });

      await fetchComments();
      setText("");
      setShowEmojiPicker(false);
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setLoading(false);
    }
  };

  const addEmoji = (emoji: string) => setText((prev) => prev + emoji);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
      setShowEmojiPicker(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.commentForm}>
      {profileImage ? (
        <Image
          src={profileImage}
          alt={userName}
          width={32}
          height={32}
          className={styles.commentAvatar}
          onError={(e) => ((e.target as HTMLImageElement).src = "/default-avatar.png")}
        />
      ) : (
        <div className={styles.commentAvatarFallback}>
          {userName?.charAt(0).toUpperCase() || "U"}
        </div>
      )}

      <div className={styles.commentInputWrapper}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment..."
          className={styles.commentInput}
          disabled={loading}
          aria-label="Add a comment"
        />

        <button
          type="button"
          className={styles.emojiButton}
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          aria-label="Open emoji picker"
        >
          😀
        </button>

        {showEmojiPicker && (
          <div className={styles.emojiPicker}>
            <div className={styles.emojiCategories}>
              {(["all", "hearts", "clothes"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setEmojiCategory(cat)}
                  className={emojiCategory === cat ? styles.activeCategory : ""}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            <div className={styles.emojiGrid}>
              {allEmojis[emojiCategory].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={styles.emojiItem}
                  onClick={() => addEmoji(emoji)}
                  aria-label={`Insert emoji ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        className={styles.commentSendIcon}
        disabled={loading || !text.trim()}
        aria-label={loading ? "Sending comment" : "Send comment"}
      >
        {loading ? <div className={styles.spinner} /> : "➤"}
      </button>
    </form>
  );
}
