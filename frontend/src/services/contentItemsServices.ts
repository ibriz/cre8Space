import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URI;

export const fetchContentDetails = async (blobId: string) => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/getContent/${blobId}`);
    const resJson = await res.json();
    return resJson[0];
  } catch (error) {
    console.log("Error:", error);
  }
};

interface DeobfuscateDataRes {
  id: string;
  name: string;
  image_url: string;
  ciphertext_url: string;
  ephemeral: number[];
  ciphertext: number[];
  public_key: string;
}

export const fetchObjectDetails = async (
  itemId: string,
): Promise<DeobfuscateDataRes | undefined> => {
  try {
    const rpcUrl = getFullnodeUrl("testnet");
    const suiClient = new SuiClient({ url: rpcUrl });
    const res = await suiClient.getObject({
      id: itemId,
      options: {
        showType: true,
        showOwner: true,
        showPreviousTransaction: true,
        showDisplay: false,
        showContent: true,
        showBcs: false,
        showStorageRebate: true,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fields = (res.data?.content as any).fields;

    return {
      id: fields?.id.id || "",
      name: fields?.name || "",
      image_url: fields?.image_url || "",
      ciphertext_url: fields?.ciphertext_url || "",
      ephemeral:
        fields?.encrypted_master_key?.fields?.ephemeral?.fields?.bytes || "",
      ciphertext:
        fields?.encrypted_master_key?.fields?.ciphertext?.fields?.bytes || "",
      public_key: fields?.public_key || "",
    };
  } catch (error) {
    console.log("Error:", error);
    throw error;
  }
};
