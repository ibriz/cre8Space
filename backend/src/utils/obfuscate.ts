import { Image } from "image-js";
import { bls12_381 } from "@noble/curves/bls12-381";
import { sha256 } from "@noble/hashes/sha256";
import * as crypto from "crypto";
import pako from 'pako';

interface ColorValues {
  [key: string]: number[];
}

// can be fine-tuned
const initializationVector = Uint8Array.from([
  138, 55, 153, 253, 198, 46, 121, 219, 160, 128, 89, 7, 214, 156, 148, 220,
]);

export const obfuscate = async (image: string) => {
  console.log("START OBFUSCATE");
  
  const selectedPixels = await randomTemplate(image);

  const img = await Image.load(image);
  const values: ColorValues = {};
  for (let [x, y] of selectedPixels) {
    values[`${x},${y}`] = img.getPixelXY(x, y);
    img.setPixelXY(x, y, [0, 0, 0]);
  }
  const obfuscatedImage = new Image(img.width, img.height, img.data);

  // generate a new secret key
  const secretKey = generateSecretKey();
  const secretKeyHash = sha256.create().update(secretKey).digest();
  // encrypt the color values  
  const imageCipher = await aesEncrypt(JSON.stringify(values), secretKeyHash);

  return {
    obfuscatedImage: imgToBase64(obfuscatedImage),
    imageCipher,
    secretKey,
  };
};

// export const obfuscate = async (image: string) => {
//   console.log("Start Obfuscate");
  
//   // Generate a list of selected pixels from the random template
//   const selectedPixels = await randomTemplate(image);

//   // Load the image
//   const img = await Image.load(image);
//   const values: Record<string, any> = {};

//   // Extract and obfuscate pixel values
//   for (let [x, y] of selectedPixels) {
//     values[`${x},${y}`] = img.getPixelXY(x, y);
//     img.setPixelXY(x, y, [0, 0, 0]);  // Set the pixel to black
//   }
//   const obfuscatedImage = new Image(img.width, img.height, img.data);

//   // Generate a new secret key
//   const secretKey = generateSecretKey();
//   const secretKeyHash = sha256.create().update(secretKey).digest();

//   // Compress the color values
//   const jsonData = JSON.stringify(values);
//   const compressedValues = pako.deflate(jsonData, {level: 9});

//   // Convert compressed data to base64 for encryption
//   const compressedBase64 = Buffer.from(compressedValues).toString('base64');

//   // Encrypt the compressed base64 string
//   const imageCipher = await aesEncrypt(compressedBase64, secretKeyHash);

//   // Return the obfuscated image, encrypted data, and secret key
//   return {
//     obfuscatedImage: imgToBase64(obfuscatedImage),
//     imageCipher,
//     secretKey,
//   };
// };
const randomTemplate = async (image: string): Promise<number[][]> => {
  const img = await Image.load(image);

  const startXYs: number[][] = [];
  const obscureWidth = img.width / 5;
  const obscureHeight = img.height / 5;
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      startXYs.push([
        Math.floor(obscureWidth * i),
        Math.floor(obscureHeight * j),
      ]);
    }
  }
  const choices: number[][] = [];

  for (let i = 0; i < 15; i++) {
    const rand = Math.floor(Math.random() * startXYs.length);
    const choice = startXYs.splice(rand, 1)[0];
    choices.push(choice);
  }

  // Convert the 1D thresholded edge array into a 2D boolean array
  const selectedPixels: number[][] = [];

  for (let choice of choices) {
    const x = choice[0];
    const y = choice[1];
    for (let j = y; j < y + obscureHeight; j++) {
      for (let i = x; i < x + obscureWidth; i++) {
        selectedPixels.push([i, j]);
      }
    }
  }
  return selectedPixels;
};

const aesEncrypt = async (data: string, secretKey: Uint8Array) => {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    secretKey,
    initializationVector
  );
  let encrypted = cipher.update(data, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

const imgToBase64 = (img: Image) => {
  const data = img.toDataURL("image/png");
  return data;
};


export const generateSecretKey = () => {
  const random = BigInt(`0x${crypto.randomBytes(8).toString("hex")}`);
  return bls12_381.G1.ProjectivePoint.BASE.multiply(random).toRawBytes();
};


export const generatePrivateKey = () => {
  return bls12_381.utils.randomPrivateKey();
};

export const encryptSecretKeyBLS = (
  secretKey: Uint8Array,
  privateKey: Uint8Array,
  encryptionRandomness: Uint8Array
) => {
  const publicKey = bls12_381.G1.ProjectivePoint.BASE.multiply(
    BigInt(`0x${Buffer.from(privateKey).toString("hex")}`)
  );
  const randomBytes = BigInt(
    `0x${Buffer.from(encryptionRandomness).toString("hex")}`
  );
  const ephemeral = bls12_381.G1.ProjectivePoint.BASE.multiply(randomBytes);
  const cipher_ = publicKey.multiply(randomBytes);
  const cipher = cipher_.add(
    bls12_381.G1.ProjectivePoint.fromHex(Buffer.from(secretKey).toString("hex"))
  );

  return { ephemeral, cipher };
};


export const decryptSecretKeyBLS = (
  ephemeralHex: string,
  ciphertextHex: string,
  privateKey: Uint8Array
) => {  
  const ephemeral = bls12_381.G1.ProjectivePoint.fromHex(ephemeralHex);
  const cipher = bls12_381.G1.ProjectivePoint.fromHex(ciphertextHex);
  const dec = ephemeral.multiply(
    bls12_381.G1.normPrivateKeyToScalar(privateKey)
  );
  return cipher.subtract(dec).toRawBytes();
};

export const deobfuscate = async (
  obfuscatedImage: string | Uint8Array,
  ciphertext: string,
  secretKey: Uint8Array
) => {
  const img = await Image.load(obfuscatedImage);
  const secretKeyHash = sha256.create().update(secretKey).digest();
  const d = await aesDecrypt(ciphertext, secretKeyHash);
  const decrypted: ColorValues = JSON.parse(d);
  for (let [key, value] of Object.entries(decrypted)) {
    const [x, y] = key.split(",").map(Number);
    img.setPixelXY(x, y, value as number[]);
  }

  return imgToBase64(img);
};


const aesDecrypt = async (data: string, secretKey: Uint8Array) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    secretKey,
    initializationVector
  );
  let decrypted = decipher.update(data, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
};