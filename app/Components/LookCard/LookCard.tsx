"use client";
import React, { useState, useEffect } from "react";
import styles from "./LookCard.module.css";
import { FiShare2, FiMail, FiMessageCircle, FiUpload } from "react-icons/fi";
import { FaFacebookF, FaTimes, FaTrash } from "react-icons/fa";
import { ClothingItem } from "@/types/clothTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";

type LookCardProps = {
  items: ClothingItem[];
  lookId?: string;
};

const LookCard: React.FC<LookCardProps> = ({ items, lookId }) => {
  const [isShared, setIsShared] = useState(false);
  const [sharedLookId, setSharedLookId] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false); // ← הוספתי
  const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";
  const lookUrl = `${BASE_URL}/sharelookpersonal/${lookId}`;
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.userId);
  const router = useRouter();

  const { data: shareStatus } = useQuery({
    queryKey: ["shareLookStatus", lookId],
    queryFn: async () => {
      if (!lookId) return null;
      const res = await fetch(`/api/sharelook/${lookId}`);
      return res.json();
    },
    enabled: !!lookId,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!shareStatus) return;

    setIsShared(shareStatus.isShared);
    setSharedLookId(shareStatus.isShared ? shareStatus._id : null);
  }, [shareStatus]);

  const openPopup = (url: string) => {
    window.open(url, "_blank", "width=600,height=500,noopener,noreferrer");
  };

  const shareCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(lookUrl);
    alert("Link copied!");
  };

  const shareEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    openPopup(`mailto:?subject=Check out this look&body=${lookUrl}`);
  };

  const shareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    openPopup(`https://wa.me/?text=${encodeURIComponent(lookUrl)}`);
  };

  const shareFacebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    openPopup(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        lookUrl
      )}`
    );
  };

  const addLookMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/sharelook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lookId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not share look");
      return data;
    },
    onSuccess: (data) => {
      setIsShared(true);
      setSharedLookId(data._id);
      queryClient.invalidateQueries({ queryKey: ["shareLookStatus", lookId] });
      alert("Look added to StyleFeed!");
    },
  });

  const removeLookMutation = useMutation({
    mutationFn: async () => {
      if (!sharedLookId) throw new Error("Missing shared look ID");

      const res = await fetch(`/api/sharelook/${sharedLookId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not remove");
      return data;
    },
    onSuccess: () => {
      setIsShared(false);
      setSharedLookId(null);
      queryClient.invalidateQueries({ queryKey: ["shareLookStatus", lookId] });
      alert("Look removed from StyleFeed");
    },
  });

  const deleteLook = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lookId || !userId) return;
    if (!confirm("Are you sure you want to delete this look?")) return;

    try {
      const res = await fetch(`/api/looks/${lookId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete look");

      alert("Look deleted successfully!");
      setIsDeleted(true); // ← מוסיף כאן כדי להסתיר את הלוק
      queryClient.invalidateQueries({ queryKey: ["userLooks", userId] });
      setIsPopupOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to delete look");
    }
  };

  // ← אם הלוק נמחק, לא מציגים אותו בכלל
  if (isDeleted) return null;

  return (
    <div className={styles.card} style={{ cursor: "pointer" }}>
      <div className={styles.grid}>
        {items.map((item) => (
          <div
            key={item._id}
            className={styles.itemWrapper}
            onClick={() => setIsPopupOpen(true)}
          >
            <img src={item.imageUrl} alt={item.category} className={styles.image} />
          </div>
        ))}
      </div>

      <div className={styles.shareButtons}>
        <button className={styles.shareButton} onClick={shareCopyLink}>
          <FiShare2 size={18} />
        </button>
        <button className={styles.shareButton} onClick={shareEmail}>
          <FiMail size={18} />
        </button>
        <button className={styles.shareButton} onClick={shareWhatsApp}>
          <FiMessageCircle size={18} />
        </button>
        <button className={styles.shareButton} onClick={shareFacebook}>
          <FaFacebookF size={18} />
        </button>

        {!isShared ? (
          <button
            className={`${styles.shareButton} ${styles.styleFeed}`}
            onClick={(e) => {
              e.stopPropagation();
              addLookMutation.mutate();
            }}
          >
            <FiUpload size={18} />
          </button>
        ) : (
          <button
            className={`${styles.shareButton} ${styles.styleFeed}`}
            onClick={(e) => {
              e.stopPropagation();
              removeLookMutation.mutate();
            }}
          >
            ✖
          </button>
        )}

        {lookId && (
          <button
            className={`${styles.shareButton} ${styles.deleteButton}`}
            onClick={deleteLook}
          >
            <FaTrash size={18} />
          </button>
        )}
      </div>

      {isPopupOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setIsPopupOpen(false)}
        >
          <div
            className={styles.modalContentLarge}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeButton}
              onClick={() => setIsPopupOpen(false)}
            >
              <FaTimes />
            </button>
            <div className={styles.gridLarge}>
              {items.map((item) => (
                <div
                  key={item._id}
                  className={styles.itemWrapperLarge}
                  onClick={() => setIsPopupOpen(true)}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.category}
                    className={styles.imageLarge}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LookCard;
