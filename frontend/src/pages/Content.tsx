import { useEffect, useState } from "react";
import { ArrowLeftIcon, LikeIcon, UserIcon } from "../components/Icons";
// import ContentDetails from "../components/ContentDetails";
import { Link, useLocation, useParams } from "react-router-dom";
import { useLogin } from "../context/UserContext";
import { getBlobContentProfile } from "../apis/api";
import { useEnokiFlow } from "@mysten/enoki/react";
import { likeContent } from "../services/LikeContent";
import { checkContentLike } from "../services/CheckLike";
import { getContentLike } from "../services/GetContentLike";
import Spinner from "../components/Spinner";
import CopyToClipboard from "../components/CopyToClipboard";
import { deobfuscateFile } from "../services/obfuscateServices";
import {
  fetchContentDetails,
  fetchObjectDetails,
} from "../services/contentItemsServices";

interface DeobfuscateData {
  id: string;
  name: string;
  image_url: string;
  ciphertext_url: string;
  ephemeral: number[];
  ciphertext: number[];
  public_key: string;
}

const Content = () => {
  const { blob_id } = useParams<{ blob_id: string }>();
  const { state } = useLocation();
  // Todo: Improve
  const { description, type, title, owner, encryptedObj } = state || {};
  const [details] = useState("");
  const flow = useEnokiFlow();
  const { userDetails } = useLogin();
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [deobfusData, setDeobfusData] = useState<DeobfuscateData | undefined>(
    undefined,
  );
  const [obfuscatedImg, setObfuscatedImg] = useState("");
  const [isDeobfuscating, setIsDeobfuscating] = useState(false);

  const toggleLike = async () => {
    if (blob_id && !isLiked && !isLiking) {
      setIsLiking(true);
      try {
        await handleLikeContent(blob_id);
        await isContentLiked();
        await getNoOfLikes();
        console.log("liked");
      } catch (e) {
        console.log(e);
      } finally {
        setIsLiking(false);
      }
    } else {
      console.error(
        "ID is undefined, content is already liked, or like process is in progress",
      );
    }
  };

  const handleLikeContent = async (blob_id: string) => {
    await likeContent(blob_id, flow, userDetails);
  };

  const isContentLiked = async () => {
    if (blob_id && userDetails?.address) {
      const response = await checkContentLike(blob_id, userDetails.address);
      setIsLiked(response);
    } else {
      console.error("Blob ID or User Address is undefined");
    }
  };

  const getNoOfLikes = async () => {
    if (blob_id && userDetails?.address) {
      const noOfLikes = await getContentLike(userDetails.address, blob_id);
      setLikes(Number(noOfLikes));
    } else {
      console.error("Blob ID or User Address is undefined");
    }
  };

  const handleDeobfuscation = async () => {
    try {
      setIsDeobfuscating(true);
      if (!deobfusData) throw new Error("No Deobfuscate data found.");
      const deobfData = {
        obfuscatedImageUrl: deobfusData?.image_url,
        cipherUrl: deobfusData?.ciphertext_url,
        ephemeral: deobfusData?.ephemeral,
        ciphertext: deobfusData?.ciphertext,
        owner: deobfusData?.public_key,
      };
      const res = await deobfuscateFile(deobfData);
      if (res?.deobfuscatedImage) setObfuscatedImg(res?.deobfuscatedImage);
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setIsDeobfuscating(false);
    }
  };

  useEffect(() => {
    if (blob_id) {
      const getContentDetails = async () => {
        setLoading(true);
        try {
          const response = await getBlobContentProfile(blob_id);

          // for image
          if (
            type === ".png" ||
            type === ".jpg" ||
            type === ".jpeg" ||
            type === "image/jpeg" ||
            type === "image/png"
          ) {
            const url = URL.createObjectURL(new Blob([response?.data]));
            setImageUrl(url);
            setTextContent(null);
          }

          //for text
          if (type === ".txt" || type === "text/plain") {
            const text = await new Response(response?.data).text();
            setTextContent(text);
            setImageUrl(null);
          }
        } catch (e) {
          console.error("Error fetching content details:", e);
        } finally {
          setLoading(false);
        }
      };

      getContentDetails();
    } else {
      console.error("ID is undefined");
    }
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [blob_id]);

  useEffect(() => {
    if (blob_id && userDetails?.address) {
      isContentLiked();
    }
  }, [blob_id, userDetails?.address]);

  useEffect(() => {
    if (blob_id && userDetails?.address) {
      getNoOfLikes();
    }
  }, [blob_id, userDetails?.address]);

  useEffect(() => {
    const getContentDetails = async (blobId: string) => {
      const res = await fetchContentDetails(blobId);
      if (res.encrypted_obj) {
        const objectDetails = await fetchObjectDetails(res.encrypted_obj);
        console.log(objectDetails);
        setDeobfusData(objectDetails);
      }
    };

    if (blob_id) getContentDetails(blob_id);
  }, [blob_id]);

  return (
    <div className="mx-2 w-auto md:ml-10 md:w-[500px] xl:w-[833px]">
      <Link to="/">
        <div className="mb-6 text-[#604CC3]">
          <ArrowLeftIcon className="h-7" />
        </div>
      </Link>
      {/* <ContentDetails data={} /> */}

      <div>
        {/* content div */}
        <div className="mt-10 flex flex-col gap-5">
          {loading ? (
            <Spinner />
          ) : (
            <>
              <div>
                <div className="flex flex-col items-start justify-between border-b border-primary lg:flex-row lg:items-center">
                  <h1 className="text-[35px] font-bold text-primary">
                    {title}
                  </h1>
                  <div className="my-5 flex items-center">
                    <div className="mr-3 rounded-full bg-primary p-2">
                      <UserIcon className="h-5 text-white" />
                    </div>
                    <span className="flex items-center gap-2 text-base font-semibold text-primary">
                      {owner.slice(0, 5)}...{owner.slice(-3)}
                      <CopyToClipboard textToCopy={owner} />
                    </span>
                  </div>
                </div>
                <h1 className="text-[24px]"> {description}</h1>
                {imageUrl ? (
                  <div>
                    <img
                      src={obfuscatedImg || imageUrl}
                      className="mt-10 w-96"
                      alt="content"
                    />
                  </div>
                ) : textContent ? (
                  <pre className="mt-5 whitespace-pre-wrap rounded-md border p-3">
                    {textContent}
                  </pre>
                ) : null}
              </div>
              <div>
                <p className="text-[14px]">{details}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {encryptedObj && !obfuscatedImg && (
        <div>
          <button
            className="w-[200px] cursor-pointer rounded-3xl bg-green-700 px-4 py-2 text-center text-lg font-semibold text-white"
            onClick={handleDeobfuscation}
            disabled={loading || isDeobfuscating}
            style={{ backgroundColor: isDeobfuscating ? "gray" : "" }}
          >
            {isDeobfuscating ? "Deobfuscating..." : "Deobfuscate"}
          </button>
        </div>
      )}

      <div className="mt-5 flex w-auto flex-row items-center gap-3">
        <div
          className={`w-10 ${isLiked || isLiking ? "cursor-not-allowed" : "cursor-pointer"}`}
          onClick={toggleLike}
        >
          {isLiking ? (
            <Spinner spinnerColor="red" />
          ) : (
            <LikeIcon
              className={`w-10 ${
                isLiked
                  ? "fill-red-600"
                  : "fill-white stroke-black text-gray-500 hover:fill-red-200"
              }`}
            />
          )}
        </div>
        <p>
          <p>
            {likes} {likes === 1 ? "like" : "likes"}
          </p>
        </p>
      </div>
    </div>
  );
};

export default Content;
