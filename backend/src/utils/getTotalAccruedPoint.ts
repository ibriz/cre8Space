import { bcs } from '@mysten/sui.js/bcs';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Ed25519Keypair, } from '@mysten/sui.js/keypairs/ed25519';
import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import * as dotenv from 'dotenv';
dotenv.config();

export async function getTotalAccruedPointsForOwner(ownerAddress: string) {
    const keypair = Ed25519Keypair.deriveKeypair(process.env.MNEMONICS || '');
    const validNetworks = ["mainnet", "testnet", "devnet", "localnet"] as const;
    const client = new SuiClient({
        url: getFullnodeUrl(process.env.NETWORK as typeof validNetworks[number]),
    });
    const tx = new TransactionBlock();
    let content_info = process.env.CONTENT_INFO || "";

    tx.moveCall({
        target: `${process.env.PACKAGE_ID}::cep::get_total_accrued_points`,
        arguments: [
            tx.object(content_info), 
            tx.pure.address(ownerAddress),
        ],
    });

    const currentAddress = process.env.ADDRESS || "";

    const results = await client.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: currentAddress,
    });

    console.log(results);

    const accruedPoints = bcs.de('u64', Uint8Array.from(results.results![0].returnValues![0][0]));

    return { ownerAddress, accruedPoints };
}