import { TransactionBlock } from "@mysten/sui.js/transactions";
import { executeSponsoredTxn } from "../utils/sponsorWalletUtils";

const PACKAGE_ID = import.meta.env.VITE_APP_PACKAGE_ID as string;
const SHARED_CONTENTS = import.meta.env.VITE_APP_SHARED_CONTENTS as string;

export async function likeContent(blobId: string, flow: any, userDetails: any) {
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::cep::like_content`,
    arguments: [
      tx.pure.string(blobId), // blob_id params
      tx.object(SHARED_CONTENTS),
    ],
  });
  const txnRes = await executeSponsoredTxn(tx, flow, userDetails);
  console.log("txnRes", txnRes);
  console.log("digest", txnRes.digest);
}
