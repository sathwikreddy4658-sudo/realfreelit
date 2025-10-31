import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    navigate(-1);
  };

  const handleDoubleClick = () => {
    navigate("/");
  };

  // Don't render on home page
  if (location.pathname === "/") {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className="fixed left-4 top-20 z-40 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#534338] transition-colors duration-200 group"
      aria-label="Go back"
    >
      <ArrowLeft className="w-6 h-6 text-black group-hover:text-white transition-colors duration-200" />
    </button>
  );
};

export default BackButton;
