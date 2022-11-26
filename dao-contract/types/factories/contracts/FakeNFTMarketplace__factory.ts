/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  FakeNFTMarketplace,
  FakeNFTMarketplaceInterface,
} from "../../contracts/FakeNFTMarketplace";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
    ],
    name: "available",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
    ],
    name: "purchase",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "tokens",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405267016345785d8a000060015534801561001c57600080fd5b506101ea8061002c6000396000f3fe60806040526004361061003f5760003560e01c80634f64b2be1461004457806396e494e81461009757806398d5fdca146100c7578063efef39a1146100e5575b600080fd5b34801561005057600080fd5b5061007a61005f36600461019b565b6000602081905290815260409020546001600160a01b031681565b6040516001600160a01b0390911681526020015b60405180910390f35b3480156100a357600080fd5b506100b76100b236600461019b565b6100fa565b604051901515815260200161008e565b3480156100d357600080fd5b5060015460405190815260200161008e565b6100f86100f336600461019b565b610126565b005b6000818152602081905260408120546001600160a01b031661011e57506001919050565b506000919050565b600154341461017b5760405162461bcd60e51b815260206004820152601860248201527f54686973204e465420636f73747320302e312065746865720000000000000000604482015260640160405180910390fd5b600090815260208190526040902080546001600160a01b03191633179055565b6000602082840312156101ad57600080fd5b503591905056fea2646970667358221220f73d97a13abac41ca67908c72d1f4e990b86aee202848afc3e6850df4136052064736f6c63430008110033";

type FakeNFTMarketplaceConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: FakeNFTMarketplaceConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class FakeNFTMarketplace__factory extends ContractFactory {
  constructor(...args: FakeNFTMarketplaceConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<FakeNFTMarketplace> {
    return super.deploy(overrides || {}) as Promise<FakeNFTMarketplace>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): FakeNFTMarketplace {
    return super.attach(address) as FakeNFTMarketplace;
  }
  override connect(signer: Signer): FakeNFTMarketplace__factory {
    return super.connect(signer) as FakeNFTMarketplace__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): FakeNFTMarketplaceInterface {
    return new utils.Interface(_abi) as FakeNFTMarketplaceInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): FakeNFTMarketplace {
    return new Contract(address, _abi, signerOrProvider) as FakeNFTMarketplace;
  }
}
