import React, { useState } from "react";
import { CrossIcon, ImageIcon, PaperClipIcon } from "../Icons";
import {
  mintObfuscatedItem,
  UploadContent,
} from "../../services/UploadServices";
import { useEnokiFlow } from "@mysten/enoki/react";
import { blobIdToU256 } from "../../services/BlobIdConverter";
import { useLogin } from "../../context/UserContext";
import { obfuscateAndUploadFile } from "../../services/obfuscateServices";

const WALRUS_PUBLISHER_URL = import.meta.env.VITE_APP_WALRUS_PUBLISHER_URL;

interface UploadPopUpProps {
  isVisible: boolean;
  onClose: () => void;
}

interface ObfuscatedImgResponse {
  obfuscatedImage: string;
  imageName: string;
  imageUrl: string;
  cipherUrl: string;
  imageBlobId: string;
  ephemeral: string;
  ciphertext: string;
}

const AllowedObfucatedFileTypes = ["image/png", "image/jpeg"];

const UploadPopUp: React.FC<UploadPopUpProps> = ({ isVisible, onClose }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState("");
  const [imageFileb64, setImageFileb64] = useState("");
  const [tags, setTags] = useState<string>("");
  const [inputTag, setInputTag] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fileSizeError, setFileSizeError] = useState(false);
  const [obfuscatedFileData, setObfuscatedFileData] =
    useState<ObfuscatedImgResponse | null>();
  const [isObfuscating, setIsObfuscating] = useState(false);

  const flow = useEnokiFlow();
  const { userDetails } = useLogin();

  if (!isVisible) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];

      if (selectedFile.size > 1024 * 1024) {
        setFileSizeError(true);
        setFile(null);
        return;
      }

      // Convert image file into base64
      if (AllowedObfucatedFileTypes.includes(selectedFile.type)) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          setImageFileb64(base64String);
          setObfuscatedFileData(null);
        };
        reader.readAsDataURL(selectedFile);
      }

      setFileSizeError(false);
      setFile(selectedFile);
      const imgFile =
        selectedFile?.type === "image/png" ||
        selectedFile?.type === "image/jpeg"
          ? URL.createObjectURL(selectedFile)
          : "";
      setImageFile(imgFile);
    }
  };

  const handleFileObfuscation = async () => {
    try {
      setIsObfuscating(true);
      if (!file) throw new Error("No file found.");
      const res = await obfuscateAndUploadFile(
        imageFileb64,
        file.name,
        userDetails.address,
      );

      if (res?.obfuscatedImage) {
        setObfuscatedFileData(res);
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setIsObfuscating(false);
    }
  };

  const handleFileObfusUploadAndMint = async () => {
    try {
      setIsUploading(true);
      if (!obfuscatedFileData)
        throw new Error("No obfuscatedFileData data found.");
      const mintSuccess = await mintObfuscatedItem(
        flow,
        userDetails,
        {
          cipherText: obfuscatedFileData.ciphertext,
          ephemeral: obfuscatedFileData.ephemeral,
          imageName: obfuscatedFileData.imageName,
          imageUrl: obfuscatedFileData.imageUrl,
          cipherUrl: obfuscatedFileData.cipherUrl,
        },
        {
          blobId: blobIdToU256(obfuscatedFileData.imageBlobId),
          title,
          body,
          fileType: file?.type || "",
          tags: tags ? tags : "CEP",
        },
      );
      console.log("mintSuccess", mintSuccess);
      if (mintSuccess) {
        setIsSuccess(true);

        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 3000);
      }
    } catch (error) {
      console.log("Error:", error);
      setErrorMessage(`An error occurred while uploading the file. ${error}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileSizeError(false);
  };

  const handleUploadClick = () => {
    if (obfuscatedFileData?.obfuscatedImage) {
      handleFileObfusUploadAndMint();
    } else {
      handleUpload();
    }
  };

  const handleUpload = async () => {
    if (!file || !title || !body) {
      setErrorMessage(
        "Please fill in all required fields (title, body, and file).",
      );
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    setIsUploading(true);
    setIsSuccess(false);
    setErrorMessage("");

    try {
      const fileType = file.type;
      const storageInfo = await storeBlob(file, fileType);
      console.log("Blob ID:", storageInfo.blobId);
      setTitle("");
      setBody("");
      setFile(null);
      setTags("");
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    } catch (error) {
      console.error(error);
      setErrorMessage("An error occurred while uploading the file.");
    }

    setIsUploading(false);
  };

  const storeBlob = async (file: File, fileType: string) => {
    const basePublisherUrl = WALRUS_PUBLISHER_URL;
    const numEpochs = "1";
    // const keypair = await flow.getKeypair();

    const response = await fetch(
      `${basePublisherUrl}/v1/store?epochs=${numEpochs}`,
      {
        method: "PUT",
        body: file,
      },
    );

    if (response.status === 200) {
      const info = await response.json();
      console.log(info);
      if ("alreadyCertified" in info) {
        const blob = blobIdToU256(info.alreadyCertified.blobId);
        await UploadContent(
          blob,
          flow,
          title,
          body,
          fileType,
          tags.length > 0 ? tags : "CEP",
          userDetails,
        );

        return { blobId: info.alreadyCertified.blobId };
      } else if ("newlyCreated" in info) {
        const blob = blobIdToU256(info.newlyCreated.blobObject.blobId);
        await UploadContent(
          blob,
          flow,
          title,
          body,
          fileType,
          tags.length > 0 ? tags : "CEP",
          userDetails,
        );

        return { blobId: info.newlyCreated.blobObject.blobId };
      } else {
        throw new Error("Unhandled successful response!");
      }
    } else {
      throw new Error("Something went wrong when storing the blob!");
    }
  };

  const handleTagInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && inputTag.trim() !== "" && !tags) {
      setTags(inputTag.trim());
      setInputTag("");
    }
  };

  const removeTag = () => {
    setTags("");
  };

  return (
    <div
      className="fixed inset-0 z-40 flex h-auto items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center rounded-lg bg-white p-8 md:h-[640px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-[#1E2A5E] p-1"
          >
            <CrossIcon className="w-4 md:w-7" />
          </button>

          <h2 className="mb-4 text-lg font-semibold md:text-xl">Upload</h2>
        </div>

        <div className="upload-form flex gap-4 border-t border-[#1E2A5E]">
          <div className="mb-4 flex flex-col gap-4 py-5">
            <div className="flex flex-col">
              <span className="text-base font-semibold md:text-lg">Title</span>
              <input
                placeholder="Title..."
                className="h-14 w-[600px] rounded-lg border"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold md:text-lg">Body</span>
              <textarea
                placeholder="Describe..."
                className="min-h-24 w-[600px] rounded-lg border"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
            </div>
            <div className="w-full">
              {!tags.length && (
                <div className="w-20 rounded-3xl bg-[#7C93C3] px-4 py-2 text-center font-semibold text-white">
                  Tag
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {tags && (
                  <div className="flex items-center gap-2 rounded-3xl bg-[#7C93C3] px-4 py-2 text-center font-semibold text-white">
                    {tags}
                    <button
                      type="button"
                      onClick={removeTag}
                      className="text-white-500"
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>

              <input
                type="text"
                value={inputTag}
                onChange={(e) => setInputTag(e.target.value)}
                onKeyDown={handleTagInput}
                placeholder="Press Enter to add a tag"
                className={`${tags.length > 0 ? "cursor-not-allowed" : "cursor-auto"} mt-2 w-full rounded-lg border px-3 py-2`}
                disabled={tags.length > 0}
              />
            </div>
            <label
              htmlFor="file-upload"
              className="flex w-[600px] cursor-pointer items-center justify-between rounded-2xl border px-4 py-2 font-semibold"
            >
              {file ? (
                <div className="flex items-center">
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="ml-4 rounded-xl bg-red-500"
                  >
                    <CrossIcon className="w-5" />
                  </button>
                </div>
              ) : (
                <>
                  <span>Add to your content</span>
                  <div className="flex items-center gap-2 text-[#7C93C3]">
                    <ImageIcon className="w-8" />
                    <PaperClipIcon className="w-5" />
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg, text/plain"
                    onChange={handleFileChange}
                    required
                  />
                </>
              )}
            </label>
          </div>

          <div>
            {/* Todo: UPDATE */}
            {file &&
              AllowedObfucatedFileTypes.includes(file.type) &&
              imageFile && (
                <div className="image-obfuscation-container m-4 flex w-[400px] flex-col items-center gap-4">
                  <div className="h-[400px] w-[400px] rounded-2xl bg-slate-300">
                    <img
                      src={obfuscatedFileData?.obfuscatedImage || imageFile}
                      alt={file.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="w-[200px] cursor-pointer rounded-3xl bg-green-700 px-4 py-2 text-center text-lg font-semibold text-white"
                      onClick={handleFileObfuscation}
                      disabled={isObfuscating || isUploading}
                      style={{
                        backgroundColor:
                          isObfuscating || isUploading ? "gray" : "",
                      }}
                    >
                      {isObfuscating ? "Obfuscating..." : "Obfuscate"}
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>

        {isSuccess ? (
          <div className="mt-4 text-2xl font-semibold text-primary">
            Upload successful!
          </div>
        ) : (
          <button
            className={`w-full max-w-[250px] rounded-3xl px-4 py-2 text-center text-lg font-semibold text-white ${
              isUploading || fileSizeError || errorMessage
                ? "cursor-not-allowed bg-gray-500"
                : "cursor-pointer bg-[#1E2A5E]"
            }`}
            onClick={handleUploadClick}
            disabled={isUploading || fileSizeError || isObfuscating}
            style={{
              backgroundColor: isUploading || isObfuscating ? "gray" : "",
            }}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        )}
        {fileSizeError && (
          <div className="mt-1 text-lg font-semibold text-red-500">
            File size must be less than 1 MB.
          </div>
        )}
        {errorMessage && (
          <div className="mt-1 text-lg font-semibold text-red-500">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPopUp;
