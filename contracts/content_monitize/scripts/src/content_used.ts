import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as dotenv from 'dotenv';
import getExecStuff from '../utils/execStuff';
import { AdminCap, packageId , SharedContents, } from '../utils/packageInfo';
dotenv.config();

async function content_used() {

    const { keypair, client } = getExecStuff();
    const tx = new TransactionBlock();

    tx.moveCall({
        target: `${packageId}::cep::content_incentivized`,
        arguments: [
            tx.object(AdminCap),
            tx.pure.string('10288412229473630798885494790894940913216870955390010282598860322026327739004'), // blob_id params
            tx.object(SharedContents),
        ]
    });
    const result = await client.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: tx,
    });
    console.log(result); 
}
content_used();