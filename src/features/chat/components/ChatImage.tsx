'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { FiMaximize2, FiX } from 'react-icons/fi';

interface Props {
  imageUrl: string;
  alt?: string;
  fullWidth?: boolean;
}

export const ChatImage = ({ imageUrl, alt = '', fullWidth = false }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // モーダルを開く
  const openModal = () => {
    setIsModalOpen(true);
    // スクロールを無効化
    document.body.style.overflow = 'hidden';
  };

  // モーダルを閉じる
  const closeModal = () => {
    setIsModalOpen(false);
    // スクロールを有効化
    document.body.style.overflow = 'auto';
  };

  // キーボードでのモーダル操作
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      openModal();
    }
  };

  // モーダルが開いたらフォーカスを閉じるボタンに移動
  useEffect(() => {
    if (isModalOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isModalOpen]);

  // Escキーでモーダルを閉じる
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (isModalOpen && e.key === 'Escape') {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isModalOpen]);

  // モーダル外クリックで閉じる
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeModal();
    }
  };

  const imageProps = fullWidth
    ? {
        fill: true,
      }
    : {
        width: 300,
        height: 300,
      };

  return (
    <>
      {/* サムネイル表示 */}
      <div
        className={`relative my-4 rounded-lg overflow-hidden shadow-md ${
          fullWidth ? 'h-[300px]' : 'max-w-[300px]'
        } relative`}
      >
        <Image
          src={imageUrl}
          alt={alt}
          objectFit="contain"
          className={'rounded-lg min-h-[60px]'}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={true} // 初期表示の画像はプリロード
          quality={100} // 画質と容量のバランス
          placeholder="blur" // ロード中にぼかし効果
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAeEAABBAIDAQAAAAAAAAAAAAABAAIDEQQFBhIhMf/EABUBAQEAAAAAAAAAAAAAAAAAAAME/8QAFxEBAQEBAAAAAAAAAAAAAAAAAQACEv/aAAwDAQACEQMRAD8Aq9c1o2cOsazFjMhlGzzSxw9OcWjZaQO+nz88IiJQlH//2Q=="
          {...imageProps}
        />
        <button
          type="button"
          onClick={openModal}
          onKeyDown={handleKeyDown}
          className="absolute bottom-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          aria-label="画像を拡大"
        >
          <FiMaximize2 size={16} />
        </button>
      </div>

      {/* モーダル（アクセシビリティ改善） */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={handleModalClick}
          onKeyDown={handleKeyDown}
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            ref={modalRef}
            className="relative max-w-screen-lg max-h-screen-90 overflow-auto p-4"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="閉じる"
            >
              <FiX size={24} />
            </button>
            <div className="relative">
              <span id="modal-title" className="sr-only">
                {alt}
              </span>
              {/* 実際のサイズで表示 */}
              <img
                src={imageUrl}
                alt={alt}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
