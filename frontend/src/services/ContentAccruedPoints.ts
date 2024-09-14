import { TransactionBlock } from "@mysten/sui.js/transactions";
import { getFullnodeUrl } from "@mysten/sui.js/client";
import { bcs } from "@mysten/sui.js/bcs";
import { SuiClient } from "@mysten/sui.js/client";

const PACKAGE_ID = import.meta.env.VITE_APP_PACKAGE_ID as string;
const SHARED_CONTENTS = import.meta.env.VITE_APP_SHARED_CONTENTS as string;

export async function getContentAccruedPoints(
  userAddress: string,
  blobId: string,
) {
  const rpcUrl = getFullnodeUrl("testnet");
  const suiClient = new SuiClient({ url: rpcUrl });

  //   const { keypair, client } = getExecStuff();

  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::cep::get_content_accrued_points`,
    arguments: [tx.object(SHARED_CONTENTS), tx.pure.string(blobId)],
  });

  const results = await suiClient.devInspectTransactionBlock({
    transactionBlock: tx,
    sender: userAddress,
  });

  //let keys = bcs.de('vector<string>', Uint8Array.from(results![0].returnValues![0][0]));
  const get_content_accrued_points = bcs.de(
    "u64",
    Uint8Array.from(results.results![0].returnValues![0][0]),
  );

  // console.log(`keys : ${inspect(keys, false, null, true)}\n`)
  console.log(`values: ${get_content_accrued_points}\n`);
  return get_content_accrued_points;
}
