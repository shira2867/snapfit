"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import styles from "./MyCloset.module.css";
import close from "../../../public/remove.png";
import all from "../../../public/summer_11907165.png";
import coat from "../../../public/clothes_15930120.png";
import shirt from "../../../public/crop-top_10339535.png";
import accessories from "../../../public/accessories_5029392.png";
import pants from "../../../public/short_13387117.png";
import { FaTrash } from "react-icons/fa";
import DeleteHandleLooksModal from "../DeleteHandleLooksModal/DeleteHandleLooksModal";
import { ClothingItem } from "@/types/clothTypes";
import { fetchClothes } from "@/services/client/closet";

const COLOR_MAP: Record<string, [number, number, number]> = {
  Red: [255, 0, 0],
  Pink: [255, 192, 203],
  Orange: [255, 165, 0],
  Yellow: [255, 255, 0],
  Green: [0, 128, 0],
  Blue: [0, 0, 255],
  Purple: [128, 0, 128],
  Brown: [165, 42, 42],
  Gray: [128, 128, 128],
  Black: [0, 0, 0],
  White: [255, 255, 255],
  Beige: [245, 245, 220],
};

const CATEGORIES = [
  { key: "All", image: <Image src={all} alt="All clothes" width={30} height={30} /> },
  { key: "shirt", image: <Image src={shirt} alt="shirt" width={30} height={30} /> },
  { key: "pants", image: <Image src={pants} alt="pants" width={30} height={30} /> },
  { key: "Jacket&coat", image: <Image src={coat} alt="coat" width={30} height={30} /> },
  { key: "dress", image: <Image src={all} alt="dress" width={30} height={30} /> },
  { key: "Skirts", image: <Image src={all} alt="skirt" width={30} height={30} /> },
  { key: "Shoes", image: <Image src={all} alt="shoes" width={30} height={30} /> },
  { key: "Accessories", image: <Image src={accessories} alt="Accessories" width={30} height={30} /> },
];

const STYLES = ["casual", "sporty", "formal"];
const SEASONS = ["Spring", "Summer", "Autumn", "Winter"];

type MyClosetProps = {
  userId: string;
  inspirationColors: string[];
};

const MyCloset: React.FC<MyClosetProps> = ({ userId, inspirationColors }) => {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [styleFilter, setStyleFilter] = useState<string | null>(null);
  const [seasonFilter, setSeasonFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const filterPanelId = "closet-filter-panel";

  const [selectedClothing, setSelectedClothing] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: clothes = [], isLoading } = useQuery<ClothingItem[], Error>({
    queryKey: ["clothes", userId],
    queryFn: () => fetchClothes(userId),
  });

  const filteredClothes = clothes.filter((item) => {
    if (categoryFilter && categoryFilter !== "All" && item.category !== categoryFilter)
      return false;
    if (inspirationColors.length === 0 && colorFilter && item.colorName !== colorFilter)
      return false;
    if (inspirationColors.length > 0) {
      if (!item.colorName || !inspirationColors.includes(item.colorName)) return false;
    }
    if (styleFilter && item.style !== styleFilter) return false;
    if (seasonFilter && item.thickness) {
      const thicknessSeasonMap: Record<string, string[]> = {
        light: ["Summer", "Spring"],
        medium: ["Autumn", "Spring"],
        heavy: ["Winter"],
      };
      const seasonsForItem = thicknessSeasonMap[item.thickness] || [];
      if (!seasonsForItem.includes(seasonFilter)) return false;
    }
    return true;
  });

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        {/* CATEGORY FILTER ROW */}
        <div className={styles.categoryFilterRow}>
          <div className={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                className={`${styles.categoryButton} ${
                  categoryFilter === cat.key ? styles.active : ""
                }`}
                onClick={() => setCategoryFilter(cat.key === "All" ? null : cat.key)}
              >
                {cat.key}
              </button>
            ))}
          </div>
        </div>

        {/* CLOSET CONTENT */}
        <div className={styles.closetContent}>
          {isLoading ? (
            <p className={styles.loading}>Loading...</p>
          ) : filteredClothes.length === 0 ? (
            <p className={styles.noClothes}>No items found.</p>
          ) : (
            <div className={styles.cardsWrapper}>
              {filteredClothes.map((item) => (
                <div key={item._id} className={styles.card}>
                  <div className={styles.imageWrapper}>
                    <img
                      src={item.imageUrl}
                      alt={item.category}
                      className={styles.clothImage}
                    />
                  </div>
                  <button
                    onClick={() => {
                      setSelectedClothing(item._id);
                      setModalOpen(true);
                    }}
                    className={styles.deleteButton}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DELETE MODAL */}
      {selectedClothing && (
        <DeleteHandleLooksModal
          clothingId={selectedClothing}
          userId={userId}               // ⬅️ חשוב להעביר userId
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedClothing(null);
          }}
          onComplete={({ updated, deleted }) => {
            alert(
              updated.length + deleted.length > 0
                ? `Updated ${updated.length} looks, deleted ${deleted.length} looks.`
                : "Item deleted."
            );
          }}
        />
      )}
    </div>
  );
};

export default MyCloset;
