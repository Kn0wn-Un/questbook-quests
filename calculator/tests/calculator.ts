import assert from 'assert';
import * as anchor from '@project-serum/anchor';
const { SystemProgram } = anchor.web3;
// import { Program } from '@project-serum/anchor';
// import { Calculator } from '../target/types/calculator';

describe('calculator', () => {
	// Configure the client to use the local cluster.
	const provider = anchor.Provider.local();
	anchor.setProvider(provider);
	const calculator = anchor.web3.Keypair.generate();
	const program = anchor.workspace.Calculator;

	it('Creates a calculator', async () => {
		await program.rpc.create('Welcome to Solana', {
			accounts: {
				calculator: calculator.publicKey,
				user: provider.wallet.publicKey,
				systemProgram: SystemProgram.programId,
			},
			signers: [calculator],
		});
		const account = await program.account.calculator.fetch(
			calculator.publicKey
		);
		assert.ok(account.greeting === 'Welcome to Solana');
	});

	it('Adds two numbers', async function () {
		await program.rpc.add(new anchor.BN(2), new anchor.BN(3), {
			accounts: {
				calculator: calculator.publicKey,
			},
		});

		const account = await program.account.calculator.fetch(
			calculator.publicKey
		);
		assert.ok(account.result.eq(new anchor.BN(5)));
		assert.ok(account.greeting === 'Welcome to Solana');
	});

	it('Subtracts two numbers', async function () {
		await program.rpc.subtract(new anchor.BN(1), new anchor.BN(70), {
			accounts: {
				calculator: calculator.publicKey,
			},
		});

		const account = await program.account.calculator.fetch(
			calculator.publicKey
		);
		assert.ok(account.result.eq(new anchor.BN(-69)));
		assert.ok(account.greeting === 'Welcome to Solana');
	});

	it('Multiplies two numbers', async function () {
		await program.rpc.multiply(new anchor.BN(3), new anchor.BN(3), {
			accounts: {
				calculator: calculator.publicKey,
			},
		});

		const account = await program.account.calculator.fetch(
			calculator.publicKey
		);
		assert.ok(account.result.eq(new anchor.BN(9)));
		assert.ok(account.greeting === 'Welcome to Solana');
	});

	it('Divides two numbers', async function () {
		await program.rpc.divide(new anchor.BN(7), new anchor.BN(3), {
			accounts: {
				calculator: calculator.publicKey,
			},
		});

		const account = await program.account.calculator.fetch(
			calculator.publicKey
		);
		assert.ok(account.result.eq(new anchor.BN(2)));
		assert.ok(account.remainder.eq(new anchor.BN(1)));
		assert.ok(account.greeting === 'Welcome to Solana');
	});
});
