import React from "react";

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
