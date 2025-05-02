import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { FiCornerUpRight } from 'react-icons/fi';

type ReplyPreviewProps = {
  content: string | null;
  replyRef: React.RefObject<HTMLDivElement>;
};

export const ReplyPreview = ({ content, replyRef }: ReplyPreviewProps) => {
  if (!content) return null;

  return (
    <div className="max-w-5xl mx-auto mb-2" ref={replyRef}>
      <div className="p-2 bg-blue-50 text-blue-600 rounded-md text-xs flex items-start">
        <FiCornerUpRight className="mr-1 mt-0.5 flex-shrink-0" size={14} />
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
};
