import React from "react";
import ContentCard from "../components/ContentCard";
import UploadContent from "../components/Upload/UploadContent";


const HomePage: React.FC = () => {
  return (
    <div className="flex w-[100%] flex-wrap ">
      <div className="">
        <UploadContent />
        <ContentCard />
      </div>
    </div>
  );
};

export default HomePage;
