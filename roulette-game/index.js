import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';

import {
	Connection,
	Keypair,
	clusterApiUrl,
	Transaction,
	LAMPORTS_PER_SOL,
	SystemProgram,
	sendAndConfirmTransaction,
	PublicKey,
} from '@solana/web3.js';

// function to transfer SOL
const transferSol = async (from, to, amt) => {
	try {
		// Create connection
		const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

		// Create transaction object
		const transaction = new Transaction().add(
			SystemProgram.transfer({
				fromPubkey: from.publicKey,
				toPubkey: to.publicKey,
				lamports: amt * LAMPORTS_PER_SOL,
			})
		);

		// sign transaction
		const signature = await sendAndConfirmTransaction(connection, transaction, [
			from,
		]);
		return signature;
	} catch (err) {
		console.error(err);
	}
};

// Function to get the balance of account with public key pk
const getWalletBalance = async (pk) => {
	try {
		// Create connection
		const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

		// get balance
		const balance = await connection.getBalance(pk);
		return balance / LAMPORTS_PER_SOL;
	} catch (err) {
		console.error(err);
	}
};

// Function to airdrop SOL to wallet
const airDropSol = async (pk, amt) => {
	try {
		// Create connection
		const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

		// Create airdrop signature
		const fromAirDropSignature = await connection.requestAirdrop(
			pk,
			amt * LAMPORTS_PER_SOL
		);

		// confirm transaction
		await connection.confirmTransaction(fromAirDropSignature);
	} catch (err) {
		console.log(err);
	}
};

// Function to return the amount of SOL user receives on winning
const getReturnAmt = (investment, stake) => {
	return investment * stake;
};

const userKeyPair = Keypair.generate();
const treasuryKeyPair = Keypair.generate();

const init = () => {
	console.log(
		chalk.yellow(
			figlet.textSync('SOL Stake', {
				font: 'Big Money-ne',
			})
		)
	);
	console.log(chalk.yellow`The max bidding amount is 1 SOL`);
	airDropSol(userKeyPair.publicKey, 1);
	console.log(chalk.yellow.inverse`You have been airdropped 1 SOL!`);
	console.log(`Your remaining balance: 1 SOL`);
};

const askQuestions = () => {
	const questions = [
		{
			name: 'SOL',
			type: 'number',
			message: 'What is the amount of SOL you want to stake?',
		},
		{
			type: 'rawlist',
			name: 'RATIO',
			message: 'What is the ratio of your staking?',
			choices: ['1:1.25', '1:1.5', '1:1.75', '1:2'],
			filter: function (val) {
				const stakeFactor = val.split(':')[1];
				return stakeFactor;
			},
		},
		{
			type: 'number',
			name: 'RANDOM',
			message: 'Guess a random number from 1 to 5 (both 1, 5 included)',
			when: async (val) => {
				if (parseFloat(val.SOL) > 1) {
					console.log(
						chalk.red`You have violated the max stake limit. Stake with smaller amount.`
					);
					return false;
				} else {
					console.log(
						`You need to pay ${chalk.green`${val.SOL}`} to move forward`
					);
					const userBalance = await getWalletBalance(userKeyPair.publicKey);
					if (userBalance < val.SOL) {
						console.log(
							chalk.red`You don't have enough balance in your wallet`
						);
						return false;
					} else {
						console.log(
							chalk.green`You will get ${getReturnAmt(
								val.SOL,
								parseFloat(val.RATIO)
							)} if guessing the number correctly`
						);
						return true;
					}
				}
			},
		},
	];
	return inquirer.prompt(questions);
};

const gameExecution = async () => {
	init();
	const generateRandomNumber = Math.floor(Math.random() * 5) + 1;
	const answers = await askQuestions();
	let balance;
	if (answers.RANDOM) {
		console.log(`The random number is: ${generateRandomNumber}`);
		// Transfer SOL from user to treasury
		const paymentSignature = await transferSol(
			userKeyPair,
			treasuryKeyPair,
			answers.SOL
		);
		console.log(
			`Signature of payment for playing the game` +
				chalk.green`${paymentSignature}`
		);

		// if guess is correct
		if (answers.RANDOM === generateRandomNumber) {
			//AirDrop Winning Amount
			await airDropSol(
				treasuryWallet,
				getReturnAmt(answers.SOL, parseFloat(answers.RATIO))
			);

			// transfer winning SOL from treasury to user
			const prizeSignature = await transferSol(
				treasuryWallet,
				userWallet,
				getReturnAmt(answers.SOL, parseFloat(answers.RATIO))
			);

			console.log(chalk.green`Your guess is absolutely correct`);
			console.log(
				`Money sent!Here is the price signature ` +
					chalk.green`${prizeSignature}`
			);
			balance = await getWalletBalance(userKeyPair.publicKey);
			console.log(`Your remaining balance: ${balance} SOL`);
		} else {
			console.log(
				chalk.yellowBright`Guess was not correct, Better luck next time!`
			);
			balance = await getWalletBalance(userKeyPair.publicKey);
			console.log(`Your remaining balance: ${balance} SOL`);
		}
	}
};

gameExecution();
