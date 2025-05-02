import { FiAlertCircle } from 'react-icons/fi';

type ErrorMessageProps = {
  message: string | null;
};

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  if (!message) return null;

  return (
    <div className="max-w-4xl mx-auto mb-2">
      <div className="p-2 bg-red-50 text-red-600 rounded-md text-xs flex items-start">
        <FiAlertCircle className="mr-1 mt-0.5 flex-shrink-0" size={14} />
        <span>{message}</span>
      </div>
    </div>
  );
};
