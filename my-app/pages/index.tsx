import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { DAO_CONTRACT_ABI, DAO_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS } from "../constants";
import Web3Modal from "web3modal";
import { Web3Provider, JsonRpcSigner } from "@ethersproject/providers"
import { providers, Contract, BigNumber } from "ethers";
import { useEffect, useRef, useState } from 'react';
import { formatEther } from 'ethers/lib/utils';

type Proposal = {
	proposalId: number;
	nftTokenId: number;
	deadline: Date;
	yayVotes: string;
	nayVotes: string;
	executed: boolean;
}

enum Vote {
	YES,
	NO
}

export default function Home() {

	const [treasuryBalance, setTreasuryBalance] = useState<string>("0");

	const [numProposals, setNumProposals] = useState<string>("0");

	const [proposals, setProposals] = useState<Array<Proposal>>([]);

	const [nftBalance, setNftBalance] = useState<number>(0);

	const [fakeNftTokenId, setFakeNftTokenId] = useState<string>("");

	const [selectedTab, setSelectedTab] = useState<string>("");

	const [loading, setLoading] = useState<boolean>(false);

	const [walletConnected, setWalletConnected] = useState<boolean>(false);
	const web3ModalRef = useRef<Web3Modal>();

	async function getProviderOrSigner(isSigner: boolean = false): Promise<Web3Provider | JsonRpcSigner> {
		const provider = await web3ModalRef.current?.connect();
		const web3Provider = new providers.Web3Provider(provider);
		const { chainId } = await web3Provider.getNetwork();
		if (chainId !== 5) {
			window.alert("change network to goerli!");
			throw new Error("change network to goerli!")
		}
		if (isSigner) {
			const signer = web3Provider.getSigner();
			return signer;
		}
		return web3Provider;
	}

	async function connectWallet() {
		try {
			await getProviderOrSigner();
			setWalletConnected(true);
		} catch (error) {
			console.error(error);
		}
	}

	async function getDAOTreasuryBalance() {
		try {
			const provider = await getProviderOrSigner();
			const balance = await provider.getBalance(DAO_CONTRACT_ADDRESS);
			setTreasuryBalance(balance.toString());
		} catch (e) {
			console.error(e);
		}
	}

	async function getProposalNumInDAO() {
		try {
			const provider = await getProviderOrSigner();
			const daoContract = new Contract(DAO_CONTRACT_ADDRESS, DAO_CONTRACT_ABI, provider);
			const proposalNum = await daoContract.numProposals() as BigNumber;
			setNumProposals(proposalNum.toString());
		} catch (e) {
			console.error(e);
		}
	}

	async function getUserNFTBalance() {
		try {
			const signer = await getProviderOrSigner(true) as JsonRpcSigner;
			const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);
			const nftBalance = await nftContract.balanceOf(await signer.getAddress()) as BigNumber;
			setNftBalance(nftBalance.toNumber());
		} catch (e) {
			console.error(e);
		}
	}

	async function createProposal() {
		try {
			const signer = await getProviderOrSigner(true);
			const daoContract = new Contract(DAO_CONTRACT_ADDRESS, DAO_CONTRACT_ABI, signer);
			const txn = await daoContract.createProposal(fakeNftTokenId);
			setLoading(true);
			await txn.wait();
			await getProposalNumInDAO();
			setLoading(false);
		} catch (e: any) {
			console.error(e);
			window.alert(e?.data?.message);
		}
	}

	async function getProposalById(id: number): Promise<Proposal | undefined> {
		try {
			const provider = await getProviderOrSigner();
			const daoContract = new Contract(DAO_CONTRACT_ADDRESS, DAO_CONTRACT_ABI, provider);
			const proposal = await daoContract.proposals(id);
			const parsedProposal = {
				proposalId: id,
				nftTokenId: proposal.nftTokenId.toString(),
				deadline: new Date(parseInt(proposal.deadline.toString()) * 1000),
				yayVotes: proposal.yayVotes.toString(),
				nayVotes: proposal.nayVotes.toString(),
				executed: proposal.executed as boolean,
			} as Proposal;
			return parsedProposal;
		} catch (e) {
			console.error(e);
		}
	}

	async function getAllProposals(): Promise<Proposal[] | undefined> {
		try {
			const proposals = Array<Proposal>();
			for (let i = 0; i < parseInt(numProposals); i++) {
				const proposal = await getProposalById(i);
				proposals.push(proposal!);
			}
			setProposals(proposals);
			return proposals;
		} catch (e) {
			console.error(e);
		}
	}

	async function voteProposal(proposalId: number, vote: Vote) {
		try {
			const signer = await getProviderOrSigner(true);
			const daoContract = new Contract(DAO_CONTRACT_ADDRESS, DAO_CONTRACT_ABI, signer);
			const txn = await daoContract.voteProposal(proposalId, vote);
			setLoading(true);
			await txn.wait();
			setLoading(false);
			await getAllProposals();
		} catch (e: any) {
			console.error(e);
			window.alert(e?.data?.message);
		}
	}

	async function executeProposal(proposalId: number) {
		try {
			const signer = await getProviderOrSigner(true);
			const daoContract = new Contract(DAO_CONTRACT_ADDRESS, DAO_CONTRACT_ABI, signer);
			const txn = await daoContract.executeProposal(proposalId);
			setLoading(true);
			await txn.wait();
			setLoading(false);
			await getAllProposals();
		} catch (e: any) {
			console.error(e);
			window.alert(e?.data?.message);
		}
	}

	useEffect(() => {
		if (!walletConnected) {
			web3ModalRef.current = new Web3Modal({
				network: "goerli",
				providerOptions: {},
				disableInjectedProvider: false,
			})
		}

		connectWallet().then(() => {
			getDAOTreasuryBalance();
			getUserNFTBalance();
			getProposalNumInDAO();
		});

	}, [walletConnected]);

	useEffect(() => {
		if (selectedTab === "View Proposals") {
			getAllProposals();
		}
	}, [selectedTab]);

	function renderCreateProposalTabs() {
		if (loading) {
			return (
				<div className={styles.description}>
					Loading... Waiting for transaction...
				</div>
			);
		} else if (nftBalance == 0) {
			return (
				<div className={styles.description}>
					You do not own any CryptoDevs NFTs.<br />
					<b>You Cannot create or vote on proposals</b>
				</div>
			);
		} else {
			return (
				<div className={styles.container}>
					<label>Fake NFT Token ID to Purchase: </label>
					<input
						placeholder="0"
						type="number"
						onChange={(e) => setFakeNftTokenId(e.target.value)}
					/>
					<button className={styles.button2} onClick={createProposal}>
						Create
					</button>
				</div>
			);
		}
	}

	function renderViewProposalTabs() {
		if (loading) {
			return (
				<div className={styles.description}>
					Loading... Waiting for transaction...
				</div>
			);
		} else if (proposals.length === 0) {
			return (
				<div className={styles.description}>No proposals have been created</div>
			);
		} else {
			return (
				<div>
					{proposals.map((p, index) => (
						<div key={index} className={styles.proposalCard}>
							<p>Proposal ID:{p.proposalId}</p>
							<p>Fake NFT to Purchase:{p.nftTokenId}</p>
							<p>Deadline:{p.deadline.toDateString()}</p>
							<p>Yay Votes:{p.yayVotes}</p>
							<p>Nay Votes:{p.nayVotes}</p>
							<p>Execute?:{p.executed.toString()}</p>
							{p.deadline.getTime() > Date.now() && !p.executed ? (
								<div className={styles.flex}>
									<button
										className={styles.button2}
										onClick={() => voteProposal(p.proposalId, Vote.YES)}
									>
										Vote YAY
									</button>
									<button
										className={styles.button2}
										onClick={() => voteProposal(p.proposalId, Vote.NO)}
									>
										Vote NAY
									</button>
								</div>) : p.deadline.getTime() < Date.now() && !p.executed ? (
									<div className={styles.flex}>
										<button
											className={styles.button2}
											onClick={() => executeProposal(p.proposalId)}
										>
											Execute Proposal{" "}
											{p.yayVotes > p.nayVotes ? "(YAY)" : "(NAY)"}
										</button>
									</div>
								) : (
								<div className={styles.description}>Proposal Executed</div>
							)}
						</div>
					))}
				</div>
			);
		}
	}

	function renderTabs() {
		if (selectedTab === "Create Proposal") {
			return renderCreateProposalTabs();
		} else if (selectedTab === "View Proposals") {
			return renderViewProposalTabs();
		}
		return null;
	}

	return (
		<div className={styles.container}>
			<Head>
				<title>CryptoDevs DAO</title>
				<meta name="description" content="CryptoDevs DAO" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<div className={styles.main}>
				<div>
					<h1 className={styles.title}>Welcome to Crypto Devs!</h1>
					<div className={styles.description}>Welcome to the DAO!</div>
					<div className={styles.description}>
						Your CryptoDevs NFT Balance: {nftBalance}
						<br />
						Treasury Balance: {formatEther(treasuryBalance)} ETH
						<br />
						Total Number of Proposals: {numProposals}
					</div>
					<div className={styles.flex}>
						<button
							className={styles.button}
							onClick={() => setSelectedTab("Create Proposal")}
						>
							Create Proposal
						</button>
						<button
							className={styles.button}
							onClick={() => setSelectedTab("View Proposals")}
						>
							View Proposals
						</button>
					</div>
					{renderTabs()}
				</div>
				<div>
					<img className={styles.image} src="/0.svg" />
				</div>
			</div>

			<footer className={styles.footer}>
				Made with &#10084; by Crypto Devs
			</footer>
		</div>
	)
}
