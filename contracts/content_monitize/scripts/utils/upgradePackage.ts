
import { TransactionBlock, UpgradePolicy } from '@mysten/sui.js/transactions';
import getExecStuff from './execStuff';
import { packageId, UpgradeCap } from './packageInfo';

const { execSync } = require('child_process');

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

const getPackageId = async (packageId: string, capId: string) => {
    try {
        const { keypair, client } = getExecStuff();
        // const account = "0x821febff0631744c231a0f696f62b72576f2634b2ade78c74ff20f1df97fc9bf";
        const packagePath = process.cwd();
        const { modules, dependencies, digest } = JSON.parse(
            execSync(`sui move build --dump-bytecode-as-base64 --path ${packagePath} --skip-fetch-latest-git-deps`, {
                encoding: "utf-8",
            })
        );
        const tx = new TransactionBlock();

        const cap = tx.object(capId);
        const ticket = tx.moveCall({
            target: '0x2::package::authorize_upgrade',
            arguments: [cap, tx.pure(UpgradePolicy.COMPATIBLE), tx.pure(digest)],
        });
        const receipt = tx.upgrade({
            modules,
            dependencies,
            packageId,
            ticket,
        })
        tx.moveCall({
		    target: '0x2::package::commit_upgrade',
		    arguments: [cap, receipt],
	    });

        const result = await client.signAndExecuteTransactionBlock({
            transactionBlock: tx,
            signer: keypair,
            options: {
                showEffects: true,
                showObjectChanges: true,
            },
        });
        console.log(result); 
        return { result};
    } catch (error) {
        // Handle potential errors if the promise rejects
        console.error(error);
        return {result: ''};
    }
};

// Call the async function and handle the result.
getPackageId(packageId, UpgradeCap)
    .then((result) => {
        console.log(result);
    })
    .catch((error) => {
        console.error(error);
    });

export default getPackageId;
