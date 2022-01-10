/**
 * A simple script to airdrop SOLs into a wallet.
 */

// import dependencies
const {
	Connection,
	clusterApiUrl,
	Keypair,
	LAMPORTS_PER_SOL,
} = require('@solana/web3.js');

// get wallet balance function
const getWalletBalance = async (connection, pk) => {
	try {
		// getting the balance of the wallet
		const walletBalance = await connection.getBalance(pk);

		// logging balance
		console.log(`Wallet address: ${pk}`);
		console.log(
			`Wallet Balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`
		);
	} catch (err) {
		console.error(err);
	}
};

// airdrop function
const airdropSol = async (connection, pk) => {
	try {
		console.log('BEFORE AIRDROPPING:');
		await getWalletBalance(connection, pk);

		// airdrop signature
		console.log('AIRDROPPING...');
		const airdropSignature = await connection.requestAirdrop(
			pk,
			1 * LAMPORTS_PER_SOL
		);

		// await confirmation of the transaction
		await connection.confirmTransaction(airdropSignature);

		console.log('AFTER AIRDROPPING:');
		await getWalletBalance(connection, pk);
	} catch (err) {
		console.error(err);
	}
};

// driver function
const main = async () => {
	// Create a new Keypair
	const newPair = new Keypair();
	console.log('WALLET:');
	console.log(newPair);

	// extracting Public key from Keypair
	const publicKey = newPair.publicKey;

	// extracting Public key from Keypair
	const secretKey = newPair.secretKey;

	// create a connection object to devnet
	const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
	await airdropSol(connection, publicKey);
};
main();
