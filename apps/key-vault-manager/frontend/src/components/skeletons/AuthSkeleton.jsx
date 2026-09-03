// src/components/skeletons/AuthSkeleton.jsx

export const AuthSkeleton = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50">
    <div className="w-full max-w-md space-y-4 p-8 bg-white rounded-xl shadow-md animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto" />
      <div className="space-y-3 pt-4">
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);
