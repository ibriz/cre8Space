import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as dotenv from 'dotenv';
import { Ed25519Keypair, } from '@mysten/sui.js/keypairs/ed25519';
import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
dotenv.config();

export async function contentIncentivization(blob_id: string) {
    const keypair = Ed25519Keypair.deriveKeypair(process.env.MNEMONICS || '');
    const validNetworks = ["mainnet", "testnet", "devnet", "localnet"] as const;
    const client = new SuiClient({
        url: getFullnodeUrl(process.env.NETWORK as typeof validNetworks[number]),
    });
    const tx = new TransactionBlock();

    let admin_cap = process.env.ADMIN_CAP || "";
    let content_info = process.env.CONTENT_INFO || "";
    // Move call with the received blob_id
    tx.moveCall({
        target: `${process.env.PACKAGE_ID}::cep::content_incentivized`,
        arguments: [
            tx.pure(admin_cap),
            tx.pure(blob_id),  
            tx.object(content_info),
        ]
    });

    // Execute the transaction
    const result = await client.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: tx,
    });

    return result;
}

export async function transfer_sui(amount: number, address: string) {
    try {
        const keypair = Ed25519Keypair.deriveKeypair(process.env.MNEMONICS || '');
        const validNetworks = ["mainnet", "testnet", "devnet", "localnet"] as const;
        const client = new SuiClient({
            url: getFullnodeUrl(process.env.NETWORK as typeof validNetworks[number]),
        });        const tx = new TransactionBlock();
        
        // for (let i = 0; i < addresses.length; i++) {
            const coin = tx.splitCoins(tx.gas, [tx.pure(amount)]);
            tx.transferObjects([coin], address);
        // }

        const result = await client.signAndExecuteTransactionBlock({
            signer: keypair,
            transactionBlock: tx,
        });

        console.log(result);
    } catch (error) {
        console.error('Trannsaction Failed', error);
    }
}

