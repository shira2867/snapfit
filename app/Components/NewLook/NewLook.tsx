"use client";

import React, { useState, FC } from "react";
import Image from "next/image";
import styles from "./NewLook.module.css";
import down from '../../../public/down.png';
import { useUserStore } from "../../../store/userStore"; 
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClothingItem } from "@/types/clothTypes";
import { LookType } from "@/types/lookTypes";

// פונקציה ששולחת את ה-look לשרת
const postLook = async (look: LookType) => {
  const res = await fetch("/api/looks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(look),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to save look");
  }

  return res.json();
};

const NewLook: FC = () => {
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const userId = useUserStore((state) => state.userId); // נטען ישירות מה-store
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: postLook,
    onSuccess: (data) => {
      console.log("Look saved:", data.look);
      setSelectedItems([]);
      setIsOpen(false);
      alert("Look saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["looks"] });
    },
    onError: (error: any) => {
      console.error("Error saving Look:", error.message);
      alert("Failed to save Look.");
    },
  });

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    const data = event.dataTransfer.getData("application/json");
    if (!data) return;

    try {
      const item: ClothingItem = JSON.parse(data);
      if (!selectedItems.some((i) => i._id === item._id)) {
        setSelectedItems((prev) => [...prev, item]);
      }
    } catch (err) {
      console.error("Invalid dragged item data", err);
    }
  };

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
  };

  const removeItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((i) => i._id !== id));
  };

  const saveLook = () => {
    if (!userId) {
      alert("User not found. Please log in.");
      return;
    }
    if (selectedItems.length === 0) {
      alert("Add at least one clothing item before saving!");
      return;
    }

    const look: LookType = {
      _id: "",
      userId,
      items: selectedItems,
      createdAt: new Date(),
    };

    mutation.mutate(look);
  };

  return (
    <div className={styles.container}>
      {!isOpen ? (
        <>
          <h1 className={styles.title}>
            You want to create a new look? <br /> Click here
          </h1>
          <Image src={down} alt="down arrow" width={60} height={60} />
          <br />
          <button className={styles.openBtn} onClick={() => setIsOpen(true)}>
            Create New Look
          </button>
        </>
      ) : (
        <div className={styles.lookWrapper}>
          <button
            className={styles.closeBtn}
            onClick={() => setIsOpen(false)}
            title="Close Look Area"
          >
            ❌
          </button>

          <div
            className={styles.lookArea}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {selectedItems.length === 0 ? (
              <p className={styles.hint}>Drag clothes here</p>
            ) : (
              selectedItems.map((item) => (
                <div key={item._id} className={styles.lookItem}>
                  <img src={item.imageUrl} alt={item.category} />
                  <button onClick={() => removeItem(item._id)}>🗑️</button>
                </div>
              ))
            )}
          </div>

          <div className={styles.buttons}>
            <button
              className={styles.saveBtn}
              onClick={saveLook}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Saving..." : "SAVE"}
            </button>
            <button
              className={styles.cancelBtn}
              onClick={() => setSelectedItems([])}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewLook;
