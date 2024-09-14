import { useState } from "react";
import { ImageIcon, UserIcon } from "../Icons";
import UploadPopUp from "./UploadPopUp";

const UploadContent = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleClick = () => {
    setIsModalVisible(true);
  };

  return (
    <>
      <div
        className="mx-10 cursor-pointer rounded-[163px] border-2 border-[#7C93C3] px-10 py-2"
        onClick={handleClick}
      >
        <div className="flex justify-between">
          <div className="flex items-center gap-10 text-[#1E2A5E]">
            <div>
              <UserIcon className="w-10 text-[#1E2A5E]" />
            </div>
            <div className="text-lg font-semibold">Upload Content</div>
          </div>
          <div>
            <ImageIcon className="w-14 text-[#1E2A5E]" />
          </div>
        </div>
      </div>

      <UploadPopUp
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </>
  );
};

export default UploadContent;
