import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as dotenv from 'dotenv';
import getExecStuff from '../utils/execStuff';
import { packageId, SharedContents,   } from '../utils/packageInfo';
import { bcs } from '@mysten/sui.js/bcs';
import { inspect } from 'util';
dotenv.config();

async function get_total_accrued_points() {
    const { keypair, client } = getExecStuff();
    const tx = new TransactionBlock();
//     bcs.registerStructType('VecMap<K, V>', {
// 	keys: 'vector<K>',
// 	values: 'vector<V>',
// });

    tx.moveCall({
        target: `${packageId}::cep::get_total_accrued_points`,
        arguments: [
           tx.object(SharedContents), 
           tx.pure.address('e65f125538ff216c12106adfa9004813bba39b5fd58f45f453fb1a866e89c800'),

        ],
    });

    let currentAddress = '0x821febff0631744c231a0f696f62b72576f2634b2ade78c74ff20f1df97fc9bf';

    const results =
        await client.devInspectTransactionBlock({
            transactionBlock: tx,
            sender: currentAddress,
        });

    //let keys = bcs.de('vector<string>', Uint8Array.from(results![0].returnValues![0][0]));
    let get_content_accrued_points = bcs.de('u64', Uint8Array.from(results.results![0].returnValues![0][0]));

    // console.log(`keys : ${inspect(keys, false, null, true)}\n`)
    console.log(`values: ${inspect(get_content_accrued_points, false, null, true)}\n`);
}
get_total_accrued_points()