import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as dotenv from 'dotenv';
import getExecStuff from '../utils/execStuff';
import { packageId, SharedContents,   } from '../utils/packageInfo';
import { bcs } from '@mysten/sui.js/bcs';
import { inspect } from 'util';
dotenv.config();

async function get_like() {
    const { keypair, client } = getExecStuff();
    const tx = new TransactionBlock();
//     bcs.registerStructType('VecMap<K, V>', {
// 	keys: 'vector<K>',
// 	values: 'vector<V>',
// });

    tx.moveCall({
        target: `${packageId}::cep::get_like`,
        arguments: [
           tx.object(SharedContents), 
           tx.pure.string('10288412229473630798885494790894940913216870955390010282598860322026327739004'),
        ],
    });

    let currentAddress = '0x821febff0631744c231a0f696f62b72576f2634b2ade78c74ff20f1df97fc9bf';

    const results =
        await client.devInspectTransactionBlock({
            transactionBlock: tx,
            sender: currentAddress,
        });

    //let keys = bcs.de('vector<string>', Uint8Array.from(results![0].returnValues![0][0]));
    let values = bcs.de('u64', Uint8Array.from(results.results![0].returnValues![0][0]));

    // console.log(`keys : ${inspect(keys, false, null, true)}\n`)
    console.log(`values: ${inspect(values, false, null, true)}\n`);
}
get_like()