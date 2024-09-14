import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as dotenv from 'dotenv';
import getExecStuff from '../utils/execStuff';
import { packageId, SharedContents,   } from '../utils/packageInfo';
import { bcs } from '@mysten/sui.js/bcs';
import { inspect } from 'util';
dotenv.config();

async function get_register_content() {
    const { keypair, client } = getExecStuff();
    const tx = new TransactionBlock();

    tx.moveCall({
        target: `${packageId}::cep::get_registered_content`,
        arguments: [
           tx.object(SharedContents), 
        ],
    });

    let currentAddress = '0x821febff0631744c231a0f696f62b72576f2634b2ade78c74ff20f1df97fc9bf';

    const results =
        await client.devInspectTransactionBlock({
            transactionBlock: tx,
            sender: currentAddress,
        });

    //let keys = bcs.de('vector<string>', Uint8Array.from(results![0].returnValues![0][0]));
    let values = bcs.de('vector<address>', Uint8Array.from(results.results![0].returnValues![0][0]));

    // console.log(`keys : ${inspect(keys, false, null, true)}\n`)
    console.log(`values: ${inspect(values, false, null, true)}\n`);
}
get_register_content()