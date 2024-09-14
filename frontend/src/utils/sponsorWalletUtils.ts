import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { fromB64 } from "@mysten/bcs";
import { genAddressSeed, getZkLoginSignature } from "@mysten/zklogin";
import { jwtDecode } from "jwt-decode";
import { SerializedSignature } from "@mysten/sui.js/cryptography";
import { EnokiFlow } from "@mysten/enoki";

const SPONSER_WALLET_PASSPHRASE = import.meta.env
  .VITE_APP_SPONSER_WALLET_PASSPHRASE as string;

export async function getSponsorPaymentObject(sponserAddress: string) {
  const rpcUrl = getFullnodeUrl("testnet");
  const suiClient = new SuiClient({ url: rpcUrl });

  let payment: { objectId: string; version: string; digest: string }[] = [];
  let retires = 10;
  while (retires !== 0) {
    const coins = await suiClient.getCoins({
      owner: sponserAddress,
      limit: 10,
    });
    if (coins.data.length > 0) {
      payment = coins.data.map((coin) => ({
        objectId: coin.coinObjectId,
        version: coin.version,
        digest: coin.digest,
      }));
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    retires -= 1;
  }

  return payment;
}

export async function executeSponsoredTxn(
  txb: TransactionBlock,
  enokiFlow: EnokiFlow,
  userDetails: {
    provider: string;
    salt: string;
    address: string;
  },
) {
  const rpcUrl = getFullnodeUrl("testnet");
  const suiClient = new SuiClient({ url: rpcUrl });

  const sponsorKeypair = Ed25519Keypair.deriveKeypair(
    SPONSER_WALLET_PASSPHRASE,
  );
  const sponserAddress = sponsorKeypair.getPublicKey().toSuiAddress();
  console.log("sponserAddress", sponserAddress);

  const payment = await getSponsorPaymentObject(sponserAddress);
  if (payment.length === 0) {
    throw new Error("No payment object found in Sponsor wallet.");
  }

  await enokiFlow.getProof();
  const session = await enokiFlow.getSession();

  if (!session?.jwt) throw new Error("No JWT!");
  if (!session?.proof) throw new Error("No ZKProof!");
  if (!session?.ephemeralKeyPair) throw new Error("No ephemeralKeyPair!");
  if (!userDetails?.address) throw new Error("No wallet address!");
  if (!userDetails?.salt) throw new Error("No user salt!");

  const kindBytes = await txb.build({
    client: suiClient,
    onlyTransactionKind: true,
  });

  // construct a sponsored transaction from the kind bytes
  const sponsoredTxb = TransactionBlock.fromKind(kindBytes);
  sponsoredTxb.setSender(userDetails.address);
  sponsoredTxb.setGasOwner(sponserAddress);
  sponsoredTxb.setGasPayment(payment);

  const sponsoredTxnBuild = await sponsoredTxb.build({ client: suiClient });
  const sponsoredSignedTxn =
    await sponsorKeypair.signTransactionBlock(sponsoredTxnBuild);

  const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(
    fromB64(session?.ephemeralKeyPair),
  );
  const userSignedTxn =
    await ephemeralKeyPair.signTransactionBlock(sponsoredTxnBuild);

  const decodedJwt = jwtDecode(session.jwt);

  // Generate addressSeed using userSalt, sub, and aud (JWT Payload)
  // as parameters for obtaining zkLoginSignature
  const addressSeed: string = genAddressSeed(
    BigInt(userDetails.salt),
    "sub",
    decodedJwt.sub as string,
    decodedJwt.aud as string,
  ).toString();

  const zkLoginSignature: SerializedSignature = getZkLoginSignature({
    inputs: {
      ...session.proof,
      addressSeed,
    },
    maxEpoch: session.maxEpoch,
    userSignature: userSignedTxn!.signature,
  });

  const txnRes = await suiClient.executeTransactionBlock({
    transactionBlock: userSignedTxn!.bytes,
    signature: [zkLoginSignature, sponsoredSignedTxn!.signature],
    options: {
      showEffects: true,
      showEvents: true,
      showObjectChanges: true,
    },
  });

  return txnRes;
}
