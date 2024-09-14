import CopyToClipboard from "../components/CopyToClipboard";
import { UserIcon, CoinIcon, ImageIcon, TextIcon } from "../components/Icons";
import { getContentByOwner, getIncentivizedPoints } from "../apis/api";
import { useEffect, useState } from "react";
import { useLogin } from "../context/UserContext";
import { Link } from "react-router-dom";
import { get_total_accrued_points } from "../services/AccumulatedPoints";
import { getContentLike } from "../services/GetContentLike";
import { getContentAccruedPoints } from "../services/ContentAccruedPoints";
import { DollarIcon } from "../components/Icons";
interface ProfileProps {
  address: string;
}

interface PostData {
  blob_id: string;
  description: string;
  title: string;
  file_type: string;
  date: string;
  likes?: number;
  points?: number;
  tag?: string;
  owner: string;
}

const Profile: React.FC<ProfileProps> = ({ address }) => {
  const { userDetails } = useLogin();
  const [profileData, setProfileData] = useState<PostData[]>([]);
  const [totalAccruedPoints, setTotalAccruedPoints] = useState<number>(0);
  const [totalIncentivizedPoints, setTotalIncentivizedPoints] =
    useState<number>(0);
  const [isDataUpdated, setIsDataUpdated] = useState(false);

  useEffect(() => {
    const getProfileData = async () => {
      try {
        const data = await getContentByOwner(userDetails.address);
        console.log("data by owner 1", data);
        setProfileData(data);
        setIsDataUpdated(true);
      } catch (e) {
        console.log(e);
      }
    };
    getProfileData();
  }, [userDetails]);

  useEffect(() => {
    const updatePostData = async () => {
      if (isDataUpdated) {
        const updatedData = await Promise.all(
          profileData.map(async (item) => {
            const likes = await getContentLike(
              userDetails.address,
              item.blob_id,
            );
            const points = await getContentAccruedPoints(
              userDetails.address,
              item.blob_id,
            );
            console.log("1");
            return { ...item, likes, points };
          }),
        );
        setProfileData(updatedData);
        setIsDataUpdated(false);
      }
    };
    updatePostData();
  }, [isDataUpdated, userDetails.address, profileData]);

  useEffect(() => {
    const getTotalAccruedPoints = async () => {
      const response = await get_total_accrued_points(userDetails.address);

      setTotalAccruedPoints(Number(response));
      if (response === undefined) {
        setTotalAccruedPoints(0);
      }

      console.log(response, "total accrrrr");
    };

    const fetchIncentivizedPoints = async () => {
      const pt = await getIncentivizedPoints(userDetails.address);
      if (pt.results) {
        setTotalIncentivizedPoints(pt.results.incentivizedPoints / 100);
      }
    };
    getTotalAccruedPoints();
    fetchIncentivizedPoints();
  }, []);

  return (
    <div className="md:pl-10">
      <div className="">
        {/* <h1 className="py-3 text-2xl">Profile</h1> */}
        <div className="flex h-[205px] w-auto flex-col items-center justify-between rounded-[16px] border border-primary p-5 md:w-[853px] md:flex-row">
          <div className="flex flex-row items-center gap-5">
            <UserIcon className="h-10 md:h-32" />

            <div className="flex flex-col">
              <p className="text-[16px] font-bold text-primary">
                Wallet Address
              </p>
              <div className="my-2 flex items-center justify-between gap-2 font-medium">
                <span>
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <CopyToClipboard textToCopy={address} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row">
            <div className="flex flex-row items-center gap-2 md:flex-col">
              <CoinIcon className="w-6 stroke-primary md:w-16" />

              <p className="text text-xl font-bold md:text-5xl">
                {totalAccruedPoints}
              </p>
              <p className="text-center text-sm font-bold md:w-32">
                Accumulated point
              </p>
            </div>
            <div className="flex flex-row items-center gap-2 md:flex-col">
              <DollarIcon className="w-6 md:w-16" />

              <p className="text text-xl font-bold md:text-4xl">
                {totalIncentivizedPoints} SUI
              </p>
              <p className="text-center text-sm font-bold md:w-32">
                Total Incentives Earned
              </p>
            </div>
          </div>
        </div>
      </div>
      <div>
        {/* <h1 className="py-2 text-2xl">Content</h1> */}
        <div className="overflow-x-auto">
          <table className="w-auto min-w-full table-auto border-separate border-spacing-y-4 md:w-[833px]">
            <thead className="bg-gray-200 text-left text-xs sm:text-lg">
              <tr className="text-primary">
                <th className="px-2 py-2 sm:px-4">Posts</th>
                <th className="px-2 py-2 sm:px-4">BlobId</th>
                <th className="px-2 py-2 sm:px-4">Incentivized point</th>
                <th className="px-2 py-2 sm:px-4">Likes</th>
              </tr>
            </thead>
            <tbody>
              {profileData ? (
                profileData.map((post, index) => (
                  <tr key={index} className="rounded-lg bg-gray-200 shadow-sm">
                    <td className="px-2 py-2 sm:px-4">
                      <div className="flex items-center gap-3">
                        <div>
                          {[
                            ".png",
                            ".jpg",
                            ".jpeg",
                            "image/png",
                            "image/jpeg",
                          ].includes(post.file_type) ? (
                            <ImageIcon className="h-6 w-6 text-[#1E2A5E] sm:h-12 sm:w-12" />
                          ) : [".txt", "text/plain"].includes(
                              post.file_type,
                            ) ? (
                            <TextIcon className="h-6 w-6 text-[#1E2A5E] sm:h-12 md:w-12" />
                          ) : null}
                        </div>
                        <Link
                          to={`/content/${post.blob_id}`}
                          state={{
                            description: post.description,
                            type: post.file_type,
                            title: post.title,
                            owner: post.owner,
                          }}
                          className="mb-4"
                        >
                          <span>{post.title}</span>
                        </Link>
                      </div>
                    </td>
                    <td className="bg-gray-200 px-2 sm:px-4">
                      <div className="flex items-center gap-1 sm:gap-3">
                        <span>
                          {post.blob_id.slice(0, 4)}....
                          {post.blob_id.slice(
                            post.blob_id.length - 5,
                            post.blob_id.length - 1,
                          )}
                        </span>
                        <CopyToClipboard textToCopy={post.blob_id} />
                      </div>
                    </td>
                    <td className="bg-gray-200 px-2 py-2 sm:px-4">
                      {post.points ?? "Loading..."}
                    </td>
                    <td className="bg-gray-200 px-2 py-2 sm:px-4">
                      {post.likes ?? "Loading..."}
                    </td>
                  </tr>
                ))
              ) : (
                <div className="my-5 text-lg font-semibold">
                  No Content Uploaded
                </div>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Profile;
