import express from "express";
import * as crypto from "crypto";
import Creator from "../models/Creator";
import { uploadCipherText, uploadImage } from "../utils/walrus";
import { decryptSecretKeyBLS, deobfuscate, encryptSecretKeyBLS, generatePrivateKey, obfuscate } from "../utils/obfuscate";

export const obfuscateContent = async (
  req: express.Request,
  res: express.Response,
) => {
  console.log("obfuscateContent");
  
  try {
    const { image, owner, imageName} = req.body;
    console.time()
    const { obfuscatedImage, imageCipher, secretKey } = await obfuscate(image);
    console.timeEnd()

    // Try to find the creator by public_key
    let creator = await Creator.findOne({ public_key: owner });

    // If the creator does not exist, create it
    if (!creator) {
      const privateKey = generatePrivateKey();
      creator = await Creator.create({
        private_key: Buffer.from(privateKey).toString("hex"),
        public_key: owner
      });
    }

    const encryptionRandomness = Uint8Array.from(crypto.randomBytes(20));
    const encryptedSecretKey = encryptSecretKeyBLS(
      secretKey,
      Uint8Array.from(Buffer.from(creator.private_key!, "hex")),
      encryptionRandomness
    );
    console.time("Upload Cipher")
    const cipherUrl = await uploadCipherText(imageCipher);
    console.timeEnd("Upload Cipher")

    const{ url: imageUrl, blobID: imageBlobId }= await uploadImage(obfuscatedImage, imageName);

    console.log(imageBlobId);
    
    return res.send({
      obfuscatedImage,
      imageName,
      imageUrl,
      cipherUrl,
      imageBlobId,
      ephemeral: encryptedSecretKey.ephemeral.toHex(),
      ciphertext: encryptedSecretKey.cipher.toHex(),
    });
  } catch (error) {
    console.error('Error obfuscating content:', error);
    res.status(500).json({ error: 'An error occurred while obfuscating content' });
  }
};

export const deObfuscateContent = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    let { obfuscatedImageUrl, cipherUrl, ephemeral, ciphertext, owner } = req.body;

    // Try to find the creator by public_key
    let creator = await Creator.findOne({ public_key: owner });

    if (!creator) return res.status(400).send({ message: "User not found" });
    let response = await fetch(cipherUrl);

    const ciphertextImg = await response.text();
    let cipherVal = JSON.parse(ciphertextImg).cipher

    response = await fetch(obfuscatedImageUrl);
    const blob = await response.blob();
    const obfuscatedImage = new Uint8Array(await blob.arrayBuffer());
    console.log(creator.private_key!);

    const secretKey = decryptSecretKeyBLS(
      ephemeral,
      ciphertext,
      Uint8Array.from(Buffer.from(creator.private_key!, "hex"))
    );

    const deobfuscatedImage = await deobfuscate(
      obfuscatedImage,
      cipherVal,
      secretKey
    );
    return res.send({ deobfuscatedImage });
  } catch (error) {
    console.error('Error on deobfuscation content:', error);
    res.status(500).json({ error: 'An error occurred while on deobfuscation content' });
  }
}

export const uploadContents = async (
  req: express.Request,
  res: express.Response,
) => {
  try {

    const { obfuscatedImage, imageCipher, ephemeral, ciphertext, imageName } = req.body;
    const cipherUrl = await uploadCipherText(imageCipher);
    const{ url: imageUrl, blobID: imageBlobId }= await uploadImage(obfuscatedImage, imageName);

    return res.send({
      cipherUrl,
      imageUrl,
      imageBlobId,
      ephemeral,
      ciphertext,
    });
  } catch (error) {
    console.error('Error uploading content:', error);
    res.status(500).json({ error: 'An error occurred while uploading content' });
  }
}