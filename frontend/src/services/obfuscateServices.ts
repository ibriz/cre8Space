const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URI;

interface ObfuscateAndUploadFileRes {
  obfuscatedImage: string;
  imageName: string;
  imageUrl: string;
  cipherUrl: string;
  imageBlobId: string;
  ephemeral: string;
  ciphertext: string;
}

interface ObfuscatedFileDetails {
  obfuscatedImageUrl: string;
  cipherUrl: string;
  ephemeral: number[];
  ciphertext: number[];
  owner: string;
}

export async function obfuscateAndUploadFile(
  imageB64: string,
  imageName: string,
  walletAddress: string,
): Promise<ObfuscateAndUploadFileRes> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/obfuscate-and-upload`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        image: imageB64,
        owner: walletAddress,
        imageName: imageName.replace(/ /g, "_"),
        type: "random",
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to obfuscate file. Error: ${res.status}`);
    }

    const result = await res.json();
    return result;
  } catch (error) {
    console.log("Error:", error);
    throw error;
  }
}

interface deobfuscateFileRes {
  deobfuscatedImage: string;
}

export async function deobfuscateFile(
  obfuscatedFileDetails: ObfuscatedFileDetails,
): Promise<deobfuscateFileRes> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/deobfuscate`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        obfuscatedImageUrl: obfuscatedFileDetails.obfuscatedImageUrl,
        cipherUrl: obfuscatedFileDetails.cipherUrl,
        ephemeral: Buffer.from(obfuscatedFileDetails.ephemeral).toString("hex"),
        ciphertext: Buffer.from(obfuscatedFileDetails.ciphertext).toString(
          "hex",
        ),
        owner: obfuscatedFileDetails.owner,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to deobfuscate file. Error: ${res.status}`);
    }

    const result = await res.json();
    return result;
  } catch (error) {
    console.log("Error:", error);
    throw error;
  }
}
