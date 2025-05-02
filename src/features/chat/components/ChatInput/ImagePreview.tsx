import { FiX } from 'react-icons/fi';

type ImagePreviewProps = {
  imageUrl: string | null;
  onCancel: () => void;
};

export const ImagePreview = ({ imageUrl, onCancel }: ImagePreviewProps) => {
  if (!imageUrl) return null;

  return (
    <div className="max-w-4xl mx-auto mb-2 relative">
      <div className="relative h-32 overflow-hidden rounded-md border border-slate-300 w-fit">
        <img
          src={imageUrl}
          alt="プレビュー"
          className="h-full w-auto object-contain"
        />
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
          aria-label="画像選択をキャンセル"
        >
          <FiX size={16} />
        </button>
      </div>
    </div>
  );
};
