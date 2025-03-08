import React from "react";

interface ToastNotificationProps {
  id: number;
  title: string;
  message: string;
  imageUrl?: string;
  time?: string;
  onClose: (id: number) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  id,
  title,
  message,
  imageUrl,
  time = "a few seconds ago",
  onClose,
}) => {
  return (
    <div
      id={`toast-notification-${id}`}
      className="w-full max-w-xs p-4 text-gray-900 bg-white rounded-lg shadow-sm dark:bg-gray-800 dark:text-gray-300"
      role="alert"
    >
      <div className="flex items-center mb-3">
        <span className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
          {title}
        </span>
        <button
          type="button"
          onClick={() => onClose(id)}
          className="ms-auto -mx-1.5 -my-1.5 bg-white justify-center items-center shrink-0 text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
          aria-label="Close"
        >
          <span className="sr-only">X</span>
          <svg
            className="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>
      </div>
      <div className="flex items-center">
        <div className="relative inline-block shrink-0">
          {imageUrl && (
            <img
              className="w-12 h-12 rounded-full"
              src={imageUrl}
              alt="Notification"
            />
          )} 
        </div>
        <div className="ms-3 text-sm font-normal">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {title}
          </div>
          <div className="text-sm font-normal">{message}</div>
         {/*  <span className="text-xs font-medium text-blue-600 dark:text-blue-500">
            {time}
          </span> */}
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;
