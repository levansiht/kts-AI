"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/icons/Icon";
import QuickLinkButton from "./QuickLinkButton";
import type { AppTab } from "@/types/app";

interface LandingPageProps {
  onEnter: () => void;
  onQuickLink: (tab: AppTab) => void;
}

export default function LandingPage({
  onEnter,
  onQuickLink,
}: LandingPageProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(onEnter, 500);
  };

  const handleQuickLinkClick = (tab: AppTab) => {
    setIsExiting(true);
    setTimeout(() => onQuickLink(tab), 500);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-8 transition-opacity duration-500 bg-transparent ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <header className="absolute top-0 left-0 right-0 p-6 z-10">
        <div className="max-w-4xl mx-auto flex justify-center items-center gap-8 md:gap-12">
          <QuickLinkButton
            label="Render"
            icon="photo"
            onClick={() => handleQuickLinkClick("exterior")}
          />
          <QuickLinkButton
            label="Chỉnh Sửa"
            icon="brush"
            onClick={() => handleQuickLinkClick("edit")}
          />
          <QuickLinkButton
            label="Upscale"
            icon="arrow-up-circle"
            onClick={() => handleQuickLinkClick("upscale")}
          />
          <QuickLinkButton
            label="Tiện Ích"
            icon="bookmark"
            onClick={() => handleQuickLinkClick("utilities")}
          />
          <QuickLinkButton
            label="Tham Quan Ảo"
            icon="cursor-arrow-rays"
            onClick={() => handleQuickLinkClick("virtual_tour")}
          />
        </div>
      </header>

      <main className="flex flex-col items-center justify-center text-center z-10">
        <h1 className="text-5xl md:text-7xl font-bold tracking-wider uppercase font-montserrat text-[var(--text-primary)]">
          NBOX
          <span className="relative inline-block text-[var(--text-accent)] group ml-1">
            .AI
            <Image
              src="https://cdn-icons-png.flaticon.com/512/744/744546.png"
              alt="Christmas Hat"
              width={80}
              height={80}
              className="absolute -top-8 -right-4 w-12 h-12 md:-top-12 md:-right-6 md:w-20 md:h-20 transform -rotate-12 group-hover:rotate-0 transition-transform duration-300 filter drop-shadow-lg z-20 pointer-events-none"
            />
          </span>
        </h1>
        <p className="mt-4 max-w-2xl text-base md:text-lg text-[var(--text-secondary)] leading-relaxed">
          Biến Ý Tưởng Kiến Trúc Thành Hiện Thực Siêu Thực với Sức Mạnh Của Trí
          Tuệ Nhân Tạo
        </p>
        <button
          onClick={handleEnter}
          className="mt-12 bg-[var(--text-accent)] hover:bg-[var(--bg-interactive-hover)] text-[var(--bg-surface-4)] hover:text-white font-bold py-3 px-10 rounded-full text-lg flex items-center gap-2 transition-transform duration-300 ease-in-out hover:scale-105 shadow-[0_0_20px_rgba(249,115,22,0.5)]"
        >
          Vào App <span className="text-2xl leading-none">&rsaquo;</span>
        </button>
      </main>

      <footer className="absolute bottom-6 flex flex-col items-center gap-3 z-10">
        <span className="text-xs text-[var(--text-tertiary)]">
          Created by Trần Minh Nhật - NBOX.AI - SĐT 0979.038.564
        </span>
        <div className="flex items-center gap-4">
          <a
            href="https://academy.nboxvietnam.vn/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Website NBOX Academy"
          >
            <Icon name="globe" className="w-5 h-5" />
          </a>
          <a
            href="https://www.facebook.com/tran.minh.nhat.406322"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Facebook"
          >
            <Icon name="facebook" className="w-5 h-5" />
          </a>
          <a
            href="https://www.tiktok.com/@nbox.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="TikTok"
          >
            <Icon name="tiktok" className="w-5 h-5" />
          </a>
        </div>
      </footer>
    </div>
  );
}
