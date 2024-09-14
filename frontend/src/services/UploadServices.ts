import { TransactionBlock } from "@mysten/sui.js/transactions";
import { executeSponsoredTxn } from "../utils/sponsorWalletUtils";
import { EnokiFlow } from "@mysten/enoki";

const PACKAGE_ID = import.meta.env.VITE_APP_PACKAGE_ID as string;
const SharedContents = import.meta.env.VITE_APP_SHARED_CONTENTS as string;
const OBFUSCATE_PACKAGE_ID = import.meta.env
  .VITE_APP_OBFUSCATE_PACKAGE_ID as string;
const OBFUSCATE_CONFIG_ID = import.meta.env
  .VITE_APP_OBFUSCATE_CONFIG_ID as string;

export interface UploadContentParams {
  blobId: string;
  title: string;
  body: string;
  fileType: string;
  tags: string;
  userDetails: any;
}

export const UploadContent = async (
  blobId: string,
  zkFlow: EnokiFlow,
  title: string,
  body: string,
  fileType: string,
  tags: string,
  userDetails: any,
) => {
  console.log(
    "details",
    blobId,
    zkFlow,
    title,
    body,
    fileType,
    tags,
    userDetails,
  );

  try {
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${PACKAGE_ID}::cep::mint_content`,
      arguments: [
        tx.pure.string(title),
        tx.pure.string(body),
        tx.pure.string(tags),
        tx.pure.string(fileType),
        tx.pure.string(blobId),
        tx.object(SharedContents),
        tx.pure.string(""),
      ],
    });

    const txnRes = await executeSponsoredTxn(tx, zkFlow, userDetails);
    console.log("txnRes", txnRes);
    console.log("digest", txnRes.digest);
  } catch (error) {
    console.error("Error in content", error);
    throw error;
  }
};

interface ObfuscatedFile {
  cipherText: string;
  ephemeral: string;
  imageName: string;
  imageUrl: string;
  cipherUrl: string;
}

interface UploadFileDetails {
  blobId: string;
  title: string;
  body: string;
  fileType: string;
  tags: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mintObfuscatedItem = async (
  zkFlow: EnokiFlow,
  userDetails: any,
  obfusFile: ObfuscatedFile,
  uploadDetails: UploadFileDetails,
) => {
  const { cipherText, ephemeral, imageName, imageUrl, cipherUrl } = obfusFile;
  const { blobId, title, body, fileType, tags } = uploadDetails;

  console.log("details", cipherText, ephemeral, imageUrl, cipherUrl);
  console.log("Upload details", blobId, title, body, fileType, tags);

  try {
    const tx = new TransactionBlock();
    const nft = tx.moveCall({
      target: `${OBFUSCATE_PACKAGE_ID}::private_nft::new`,
      arguments: [
        tx.pure.string(imageName),
        tx.pure.string(imageUrl),
        tx.pure.string(cipherUrl),
        tx.pure(Array.from(Buffer.from(ephemeral, "hex"))),
        tx.pure(Array.from(Buffer.from(cipherText, "hex"))),
        tx.object(OBFUSCATE_CONFIG_ID),
      ],
    });

    tx.transferObjects([nft], tx.pure.address(userDetails.address));

    const txnRes = await executeSponsoredTxn(tx, zkFlow, userDetails);
    console.log("txnRes", txnRes);
    console.log("digest", txnRes.digest);

    const objectId =
      (txnRes?.effects?.created &&
        txnRes?.effects?.created[0].reference?.objectId) ||
      "";

    console.log("Created Object Id:", objectId);

    await delay(3000);

    const txb = new TransactionBlock();
    txb.moveCall({
      target: `${PACKAGE_ID}::cep::mint_content`,
      arguments: [
        txb.pure.string(title),
        txb.pure.string(body),
        txb.pure.string(tags),
        txb.pure.string(fileType),
        txb.pure.string(blobId),
        txb.object(SharedContents),
        txb.pure.string(objectId),
      ],
    });
    const cepTxnRes = await executeSponsoredTxn(txb, zkFlow, userDetails);
    console.log("cepTxnRes", cepTxnRes);
    console.log("digest", cepTxnRes.digest);

    return true;
  } catch (error) {
    console.error("Error in content", error);
    throw error;
  }
};
