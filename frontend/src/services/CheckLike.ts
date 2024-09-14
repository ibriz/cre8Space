import { TransactionBlock } from "@mysten/sui.js/transactions";
import { getFullnodeUrl } from "@mysten/sui.js/client";
import { bcs } from "@mysten/sui.js/bcs";
import { SuiClient } from "@mysten/sui.js/client";

const PACKAGE_ID = import.meta.env.VITE_APP_PACKAGE_ID as string;
const SHARED_CONTENTS = import.meta.env.VITE_APP_SHARED_CONTENTS as string;

export async function checkContentLike(blobId: string, userAddress: string) {
  const rpcUrl = getFullnodeUrl("testnet");
  const suiClient = new SuiClient({ url: rpcUrl });

  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::cep::check_content_like`,
    arguments: [
      tx.object(SHARED_CONTENTS),
      tx.pure.string(blobId), // blob_id
      tx.pure.address(userAddress),
    ],
  });

  const results = await suiClient.devInspectTransactionBlock({
    transactionBlock: tx,
    sender: userAddress,
  });

  //let keys = bcs.de('vector<string>', Uint8Array.from(results![0].returnValues![0][0]));
  const values = bcs.de(
    "bool",
    Uint8Array.from(results.results![0].returnValues![0][0]),
  );

  console.log(`keys : ${values}\n`);
  return values;
}
