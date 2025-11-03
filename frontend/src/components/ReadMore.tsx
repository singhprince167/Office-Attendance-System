import React, { useState } from "react";

interface ReadMoreProps {
  text: string;
  limit?: number;
}

const ReadMore: React.FC<ReadMoreProps> = ({ text, limit = 50 }) => {
  const [showAll, setShowAll] = useState(false);

  if (text.length <= limit) return <span>{text}</span>;

  return (
    <span>
      {showAll ? text : text.substring(0, limit) + "... "}
      <button
        onClick={() => setShowAll(!showAll)}
        className={`ml-1 text-sm font-medium underline transition-colors duration-200 ${
          showAll
            ? "text-red-600 hover:text-red-800"
            : "text-blue-600 hover:text-blue-800"
        }`}
      >
        {showAll ? "Read less" : "Read more"}
      </button>
    </span>
  );
};

export default ReadMore;
