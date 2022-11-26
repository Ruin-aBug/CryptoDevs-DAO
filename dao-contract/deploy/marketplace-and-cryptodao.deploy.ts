import { DeployFunction, DeployResult } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { NFT_CONTRACT_ADDRESS } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { deployments, getChainId, getNamedAccounts } = hre;
	const { deployer } = await getNamedAccounts();

	const { deploy } = deployments;
	const fakeMarketplace = await deploy("FakeNFTMarketplace", {
		from: deployer,
		log: true,
		args: []
	});

	console.log("Fake Marketplace address:", fakeMarketplace.address);
	let cryptoDevsDao: DeployResult | undefined;
	if (fakeMarketplace.address) {
		cryptoDevsDao = await deploy("CryptoDevsDAO", {
			from: deployer,
			log: true,
			args: [fakeMarketplace.address, NFT_CONTRACT_ADDRESS]
		})
		console.log("Crypto Dev DAO address:", cryptoDevsDao.address)
	}

	const chainId = await getChainId();
	if (chainId !== "31337") {
		// if (fakeMarketplace) {
		// 	await hre.run("verify:verify", {
		// 		address: fakeMarketplace.address,
		// 	})
		// }
		if (cryptoDevsDao) {
			await hre.run("verify:verify", {
				address: cryptoDevsDao.address,
				constructorArguments: [fakeMarketplace.address, NFT_CONTRACT_ADDRESS]
			})
		}
	}
}

export default func;
func.tags = ["dao"];