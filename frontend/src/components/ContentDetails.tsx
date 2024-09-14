import { UserIcon } from "./Icons";
import CopyToClipboard from "./CopyToClipboard";

interface ContentData {
  owner: string;
  tag: string;
}

interface ContentDetailsProps {
  data: ContentData;
}

const ContentDetails: React.FC<ContentDetailsProps> = ({ data }) => {
  return (
    <div>
      <div className="flex items-center gap-5 text-[#55679C]">
        <UserIcon className="w-10" />
        <div className="flex items-center gap-2 font-medium">
          {/* {data.owner.slice(0, 6)}...{data.owner.slice(-4)} */}
          <CopyToClipboard textToCopy={data.owner} />
        </div>
        <div className="ml-10 flex items-center gap-2 text-gray-500">
          <div className="h-3 w-3 rounded-[50%] bg-[#E1D7B7]"></div>2 hours ago
        </div>
      </div>
      <p className="my-5 w-16 rounded-xl bg-white px-1 text-center font-medium text-gray-500">
        {data.tag}
      </p>
    </div>
  );
};

export default ContentDetails;
