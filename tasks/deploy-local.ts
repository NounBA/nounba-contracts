import { default as NounsAuctionHouseABI } from '../abi/contracts/NounsAuctionHouse.sol/NounsAuctionHouse.json';
import { task, types } from 'hardhat/config';
import { Interface } from 'ethers/lib/utils';
import { Contract as EthersContract } from 'ethers';
import { ContractName } from './types';

type LocalContractName = ContractName | 'WETH' | 'MintWhitelist' | 'NounsAuctionHouseProxy2';

interface Contract {
  artifactName?: string;
  args?: (string | number | (() => string | undefined))[];
  instance?: EthersContract;
  libraries?: () => Record<string, string>;
  waitForConfirmation?: boolean;
}

task('deploy-local', 'Deploy contracts to hardhat')
  .addOptionalParam('noundersdao', 'The nounders DAO contract address')
  .addOptionalParam('auctionTimeBuffer', 'The auction time buffer (seconds)', 30, types.int) // Default: 30 seconds
  .addOptionalParam('auctionReservePrice', 'The auction reserve price (wei)', 1, types.int) // Default: 1 wei
  .addOptionalParam(
    'auctionMinIncrementBidPercentage',
    'The auction min increment bid percentage (out of 100)', // Default: 5%
    5,
    types.int,
  )
  .addOptionalParam('auctionDuration', 'The auction duration (seconds)', 60 * 3, types.int) // Default: 2 minutes
  .addOptionalParam(
    'auctionHouse1NextOneOfOneIndex',
    'The oneOfOneIndex of the next NFT to be auctioned by AH1',
    1,
    types.int,
  )
  .addOptionalParam(
    'auctionHouse1MaxOneOfOneIndex',
    'The last oneOfOneIndex that the AH1 contract should be allowed to mint',
    15,
    types.int,
  )
  .addOptionalParam(
    'auctionHouse2NextOneOfOneIndex',
    'The oneOfOneIndex of the next NFT to be auctioned by AH2',
    16,
    types.int,
  )
  .addOptionalParam(
    'auctionHouse2MaxOneOfOneIndex',
    'The last oneOfOneIndex that the AH2 contract should be allowed to mint',
    30,
    types.int,
  )
  .addOptionalParam('timelockDelay', 'The timelock delay (seconds)', 60 * 60 * 24 * 2, types.int) // Default: 2 days
  .addOptionalParam('votingPeriod', 'The voting period (blocks)', 4 * 60 * 24 * 3, types.int) // Default: 3 days
  .addOptionalParam('votingDelay', 'The voting delay (blocks)', 1, types.int) // Default: 1 block
  .addOptionalParam('proposalThresholdBps', 'The proposal threshold (basis points)', 500, types.int) // Default: 5%
  .addOptionalParam('quorumVotesBps', 'Votes required for quorum (basis points)', 1_000, types.int) // Default: 10%
  .setAction(async (args, { ethers }) => {
    const network = await ethers.provider.getNetwork();
    if (network.chainId !== 31337) {
      console.log(`Invalid chain id. Expected 31337. Got: ${network.chainId}.`);
      return;
    }

    const proxyRegistryAddress = '0xa5409ec958c83c3f309868babaca7c86dcb077c1';

    const MINT_WHITELIST_NONCE_OFFSET = 3;
    const NOUNS_ART_NONCE_OFFSET = 5 + 1;
    const AUCTION_HOUSE_PROXY_NONCE_OFFSET = 10 + 1;
    const GOVERNOR_N_DELEGATOR_NONCE_OFFSET = 13 + 1;


    const [deployer] = await ethers.getSigners();
    const nonce = await deployer.getTransactionCount();
    const expectedMintWhitelistAddress = ethers.utils.getContractAddress({
      from: deployer.address,
      nonce: nonce + MINT_WHITELIST_NONCE_OFFSET,
    });
    const expectedNounsArtAddress = ethers.utils.getContractAddress({
      from: deployer.address,
      nonce: nonce + NOUNS_ART_NONCE_OFFSET,
    });
    const expectedNounsDAOProxyAddress = ethers.utils.getContractAddress({
      from: deployer.address,
      nonce: nonce + GOVERNOR_N_DELEGATOR_NONCE_OFFSET,
    });
    const expectedAuctionHouseProxyAddress = ethers.utils.getContractAddress({
      from: deployer.address,
      nonce: nonce + AUCTION_HOUSE_PROXY_NONCE_OFFSET,
    });

    /* No longer used because MintWhitelist is the minter in NounsToken
    console.log('omg');
    console.log(ethers.utils.getContractAddress({
      from: deployer.address,
      nonce: nonce + NOUNS_ART_NONCE_OFFSET - 1,
    }));
    console.log(ethers.utils.getContractAddress({
      from: deployer.address,
      nonce: nonce + GOVERNOR_N_DELEGATOR_NONCE_OFFSET - 1,
    }));
    console.log(ethers.utils.getContractAddress({
      from: deployer.address,
      nonce: nonce + AUCTION_HOUSE_PROXY_NONCE_OFFSET - 1,
    }));
    */
    const contracts: Record<LocalContractName, Contract> = {
      WETH: {},
      NFTDescriptorV2: {},
      SVGRenderer: {},
      MintWhitelist: {},
      NounsDescriptorV2: {
        args: [expectedNounsArtAddress, () => contracts.SVGRenderer.instance?.address],
        libraries: () => ({
          NFTDescriptorV2: contracts.NFTDescriptorV2.instance?.address as string,
        }),
      },
      Inflator: {},
      NounsArt: {
        args: [
          () => contracts.NounsDescriptorV2.instance?.address,
          () => contracts.Inflator.instance?.address,
        ],
      },
      NounsSeeder: {},
      NounsToken: {
        args: [
          args.noundersdao || deployer.address,
          expectedAuctionHouseProxyAddress,
          () => contracts.NounsDescriptorV2.instance?.address,
          () => contracts.NounsSeeder.instance?.address,
          proxyRegistryAddress,
        ],
      },
      NounsAuctionHouse: {
        waitForConfirmation: true,
      },
      NounsAuctionHouseProxyAdmin: {},
      NounsAuctionHouseProxy: {
        args: [
          () => contracts.NounsAuctionHouse.instance?.address,
          () => contracts.NounsAuctionHouseProxyAdmin.instance?.address,
          () =>
            new Interface(NounsAuctionHouseABI).encodeFunctionData('initialize', [
              contracts.NounsToken.instance?.address,
              contracts.WETH.instance?.address,
              args.auctionTimeBuffer,
              args.auctionReservePrice,
              args.auctionMinIncrementBidPercentage,
              args.auctionDuration,
              args.auctionHouse1NextOneOfOneIndex,
              args.auctionHouse1MaxOneOfOneIndex,
            ]),
        ],
      },
      NounsAuctionHouseProxy2: {
        artifactName: 'NounsAuctionHouseProxy',
        args: [
          () => contracts.NounsAuctionHouse.instance?.address,
          () => contracts.NounsAuctionHouseProxyAdmin.instance?.address,
          () =>
            new Interface(NounsAuctionHouseABI).encodeFunctionData('initialize', [
              contracts.NounsToken.instance?.address,
              contracts.WETH.instance?.address,
              args.auctionTimeBuffer,
              args.auctionReservePrice,
              args.auctionMinIncrementBidPercentage,
              args.auctionDuration,
              args.auctionHouse2NextOneOfOneIndex,
              args.auctionHouse2MaxOneOfOneIndex,
            ]),
        ],
      },
      NounsDAOExecutor: {
        args: [expectedNounsDAOProxyAddress, args.timelockDelay],
      },
      NounsDAOLogicV1: {
        waitForConfirmation: true,
      },
      NounsDAOProxy: {
        args: [
          () => contracts.NounsDAOExecutor.instance?.address,
          () => contracts.NounsToken.instance?.address,
          args.noundersdao || deployer.address,
          () => contracts.NounsDAOExecutor.instance?.address,
          () => contracts.NounsDAOLogicV1.instance?.address,
          args.votingPeriod,
          args.votingDelay,
          args.proposalThresholdBps,
          args.quorumVotesBps,
        ],
      },
    };

    for (const [name, contract] of Object.entries(contracts)) {
      console.log(`Deploying ${name}`);

      const artifactName = contract.artifactName || name;

      const factory = await ethers.getContractFactory(artifactName, {
        libraries: contract?.libraries?.(),
      });

      const deployedContract = await factory.deploy(
        ...(contract.args?.map(a => (typeof a === 'function' ? a() : a)) ?? []),
      );

      if (contract.waitForConfirmation) {
        await deployedContract.deployed();
      }

      contracts[name as ContractName].instance = deployedContract;

      console.log(`${name} contract deployed to ${deployedContract.address}`);
    }

    return contracts;
  });
