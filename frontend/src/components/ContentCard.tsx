import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ImageIcon, TextIcon, UserIcon } from "./Icons";
import { getMetaData } from "../apis/api";

interface MetaDataItem {
  _id: string;
  blob_id: string;
  file_type: string;
  description: string;
  owner: string;
  title: string;
  tag: string;
  createdAt: string;
  encrypted_obj: string | null;
}

const ContentCard: React.FC = () => {
  function formatRelativeTime(dateString: string): string {
    const now = new Date();
    const past = new Date(dateString);
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = now.getTime() - past.getTime();

    if (elapsed < msPerMinute) {
      return "just now";
    } else if (elapsed < msPerHour) {
      const minutes = Math.round(elapsed / msPerMinute);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (elapsed < msPerDay) {
      const hours = Math.round(elapsed / msPerHour);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (elapsed < msPerMonth) {
      const days = Math.round(elapsed / msPerDay);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (elapsed < msPerYear) {
      const months = Math.round(elapsed / msPerMonth);
      return `${months} month${months > 1 ? "s" : ""} ago`;
    } else {
      const years = Math.round(elapsed / msPerYear);
      return `${years} year${years > 1 ? "s" : ""} ago`;
    }
  }

  const [data, setData] = useState<MetaDataItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMetaData = async () => {
    try {
      const response = await getMetaData();
      console.log("Raw API response:", response);
      setData(response);
    } catch (e) {
      console.error("Error fetching data", e);
      setError("Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchMetaData();
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  // if (!data) {
  //   return <div>Loading...</div>;
  // }

  return (
    <div className="mx-1 w-auto sm:ml-10 sm:w-[500px] xl:w-[833px]">
      {data?.map((item) => (
        <Link
          to={`/content/${item.blob_id}`}
          key={item.blob_id}
          state={{
            description: item.description,
            type: item.file_type,
            title: item.title,
            owner: item.owner,
            encryptedObj: item.encrypted_obj,
          }}
          className="mb-4 block"
        >
          <div className="mt-5 rounded-lg bg-gray-300 p-4">
            <div className="mb-2 flex items-center">
              <div className="mr-3 rounded-full bg-gray-300 p-2">
                <UserIcon className="h-9 w-9" />
              </div>
              <span className="text-sm font-bold text-primary">
                {item.owner.substring(0, 8)}...
                {item.owner.substring(item.owner.length - 4)}
              </span>
              <span className="ml-auto text-lg text-gray-500">
                {formatRelativeTime(item.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{item.title}</h2>
                <p className="text-xs text-gray-500">{item.tag}</p>
              </div>
              {/* {item.file_type.startsWith("image") ? (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200">
                  <ImageIcon className="h-8 w-8" />
                </div>
              ) : ( */}
              <div>
                {[".png", ".jpg", ".jpeg", "image/png", "image/jpeg"].includes(
                  item.file_type,
                ) ? (
                  <ImageIcon className="h-16 w-16 text-[#1E2A5E]" />
                ) : [".txt", "text/plain"].includes(item.file_type) ? (
                  <TextIcon className="h-16 w-16 text-[#1E2A5E]" />
                ) : null}
              </div>
              {/* )} */}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ContentCard;
