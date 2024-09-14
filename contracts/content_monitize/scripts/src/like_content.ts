import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as dotenv from 'dotenv';
import getExecStuff from '../utils/execStuff';
import { packageId , SharedContents, } from '../utils/packageInfo';
dotenv.config();

async function like_content() {

    const { keypair, client } = getExecStuff();
    const tx = new TransactionBlock();

    tx.moveCall({
        target: `${packageId}::cep::like_content`,
        arguments: [
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
like_content();