import { FiCamera, FiImage, FiPaperclip } from 'react-icons/fi';

type AttachMenuProps = {
  isOpen: boolean;
  isDisabled: boolean;
  isUploading: boolean;
  toggleMenu: (e: React.MouseEvent) => void;
  onSelectImage: () => void;
  onSelectCamera: () => void;
  menuRef: React.RefObject<HTMLDivElement>;
};

export const AttachMenu = ({
  isOpen,
  isDisabled,
  isUploading,
  toggleMenu,
  onSelectImage,
  onSelectCamera,
  menuRef,
}: AttachMenuProps) => {
  // 添付メニューから選択時の処理
  const handleAttachOption = (callback: () => void) => {
    callback();
  };

  if (isDisabled) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleMenu}
        disabled={isUploading}
        className={`rounded-full w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors ${
          isUploading ? 'opacity-50 cursor-not-allowed' : ''
        } ${isOpen ? 'bg-slate-200' : ''}`}
        aria-label="ファイルを添付"
        title="ファイルを添付"
      >
        <FiPaperclip size={20} className="text-slate-600" />
      </button>

      {/* 添付オプションメニュー */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute left-0 bottom-12 bg-white shadow-lg rounded-md py-1 min-w-[120px] border border-slate-200 z-10"
        >
          <button
            type="button"
            onClick={() => handleAttachOption(onSelectImage)}
            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center"
          >
            <FiImage className="mr-2" size={16} />
            <span>写真</span>
          </button>
          <button
            type="button"
            onClick={() => handleAttachOption(onSelectCamera)}
            className="md:hidden w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center"
          >
            <FiCamera className="mr-2" size={16} />
            <span>カメラ</span>
          </button>
        </div>
      )}
    </div>
  );
};
