import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useKeyboard } from '@/contexts/KeyboardContext';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { FiSend } from 'react-icons/fi';
import { useMessageAction } from '../../contexts/MessageActionContext';
import { ALLOWED_IMAGE_TYPES, useFileInput } from '../../hooks/useFileInput';
import { AttachMenu } from './AttachMenu';
import { ErrorMessage } from './ErrorMessage';
import { ImagePreview } from './ImagePreview';
import { ReplyPreview } from './ReplyPreview';

interface ChatInputProps {
  onSend: ({
    imagePath,
    message,
  }: {
    imagePath: string | undefined;
    message: string;
  }) => Promise<void>;
  isDisabled: boolean;
  onHeightChange: (height: number) => void;
}

export function ChatInput({
  onSend,
  isDisabled,
  onHeightChange,
}: ChatInputProps) {
  const { selectedMessage, mode, replyMessageRef } = useMessageAction();
  const [message, setMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  const {
    handleUpload,
    handleCancelImage,
    handleImageClick,
    handleCameraClick,
    handleImageChange,
    isUploading,
    uploadError,
    fileInputRef,
    cameraInputRef,
    textareaRef,
    selectedImage,
    imagePreviewUrl,
  } = useFileInput();

  const { isKeyboardVisible, focusOut, focusIn, inputRef } = useKeyboard();

  useEffect(() => {
    if (selectedMessage) {
      switch (mode) {
        case 'edit':
          setMessage(selectedMessage);
          break;
        case 'reply':
          setMessage('');
          break;
      }
    }
  }, [selectedMessage, mode]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useLayoutEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const isButtonDisabled =
    (!message.trim() && !selectedImage) || isDisabled || isUploading;

  // 添付メニューの外側をクリックした時に閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        attachMenuRef.current &&
        !attachMenuRef.current.contains(event.target as Node)
      ) {
        setShowAttachMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 添付ボタンの状態を切り替える
  const toggleAttachMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAttachMenu(!showAttachMenu);
  };

  // メッセージ送信処理
  const handleSend = async () => {
    if (isButtonDisabled) return;

    if (selectedImage) {
      const imagePath = await handleUpload(selectedImage);
      if (imagePath) {
        await onSend({ imagePath, message });
      }
    } else {
      await onSend({ imagePath: undefined, message });
    }

    setMessage('');
    focusOut();

    if (textareaRef.current) {
      textareaRef.current.blur();
      textareaRef.current.style.height = '40px';
      handleCalcHeight({
        hasImage: false,
        hasError: false,
        isKeyboardVisible: false,
        mode,
      });
    }
  };

  // キーボードイベントの処理
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Shift+Enterで送信、通常のEnterは改行
    if (e.key === 'Enter' && e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const updateMessage = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  // Textareaの高さを自動調整する関数
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;

    if (!textarea) return;
    // 高さをリセットして、スクロールの高さに基づいて再設定
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  const placeholder = useMemo(() => {
    if (isDisabled) {
      return 'チャット送信はできません';
    }

    if (isUploading) {
      return '画像をアップロード中...';
    }

    return 'メッセージを入力...';
  }, [isDisabled, isUploading]);

  const handleCalcHeight = ({
    hasImage,
    hasError,
    isKeyboardVisible,
  }: {
    hasImage: boolean;
    hasError: boolean;
    isKeyboardVisible: boolean;
    mode: 'edit' | 'reply' | null;
  }) => {
    if (!textareaRef.current) return;

    const textareaHeight = textareaRef.current.scrollHeight;
    const replyMessageHeight = replyMessageRef.current?.scrollHeight || 0;
    const additionalHeight = textareaHeight > 150 ? 150 : textareaHeight;
    const bottomPadding = isKeyboardVisible ? 0 : 64;

    let height = 78 + bottomPadding + additionalHeight; // Textareaと送信ボタンなどのベース高さ

    if (hasImage) {
      height += 128 + 8; // 画像プレビュー + 余白
    }

    if (hasError) {
      height += 40; // エラー文の高さ
    }

    if (mode === 'reply') {
      height += replyMessageHeight + 8; // 返信メッセージ + 余白
    }

    onHeightChange(height);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    handleCalcHeight({
      hasImage: !!selectedImage,
      hasError: !!uploadError,
      isKeyboardVisible,
      mode,
    });
  }, [
    message,
    imagePreviewUrl,
    uploadError,
    isKeyboardVisible,
    mode,
    selectedMessage,
  ]);

  return (
    <div
      ref={inputRef}
      className={`bg-white border-t border-slate-200 p-3 w-full z-[60] transition-all duration-300 ${
        isKeyboardVisible ? 'bottom-0 overflow-y-auto' : 'bottom-[64px]'
      }`}
    >
      <ErrorMessage message={uploadError} />
      <ImagePreview imageUrl={imagePreviewUrl} onCancel={handleCancelImage} />
      <ReplyPreview
        content={mode === 'reply' ? selectedMessage : null}
        replyRef={replyMessageRef}
      />

      {/* 入力エリア */}
      <div className="flex gap-2 max-w-5xl mx-auto items-center relative">
        <AttachMenu
          isOpen={showAttachMenu}
          isDisabled={isDisabled}
          isUploading={isUploading}
          toggleMenu={toggleAttachMenu}
          onSelectImage={handleImageClick}
          onSelectCamera={handleCameraClick}
          menuRef={attachMenuRef}
        />

        {/* 通常のファイル選択入力 */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          className="hidden"
          disabled={isUploading}
        />

        {/* カメラ用の入力 */}
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleImageChange}
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          capture="environment"
          className="hidden"
          disabled={isUploading}
        />

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={updateMessage}
          placeholder={placeholder}
          className="flex-1 rounded-lg py-2 px-4 border border-slate-300 focus-visible:ring-2 focus-visible:ring-indigo-400 min-h-[40px] max-h-[150px] resize-none"
          onKeyDown={handleKeyDown}
          onFocus={focusIn}
          disabled={isDisabled || isUploading}
          rows={1}
        />
        <Button
          onClick={() => handleSend()}
          disabled={isButtonDisabled}
          className={`rounded-full w-10 h-10 flex items-center justify-center p-0 shadow-md transition-all duration-200 ${
            isButtonDisabled
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 hover:shadow-lg transform hover:scale-105'
          }`}
          aria-label="メッセージを送信"
        >
          {isUploading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <FiSend className="text-white" size={20} />
          )}
        </Button>
      </div>
    </div>
  );
}
