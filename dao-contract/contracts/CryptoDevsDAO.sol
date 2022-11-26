// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ICryptoDevsNFT.sol";
import "./interfaces/IFakeNFTMarketplace.sol";

contract CryptoDevsDAO is Ownable {
    /**
     * @dev 提案存储结构体
     */
    struct Proposal {
        //NFT Token Id
        uint256 nftTokenId;
        // 截止时间
        uint256 deadline;
        // 投票数量
        uint256 yayVotes;
        // 否决票数
        uint256 nayVotes;
        // 是否已经执行  在截止日期前不可执行
        bool executed;
        // NFT TokenId=>bool  判断该tokenId是否已经投票
        mapping(uint256 => bool) voters;
    }

    mapping(uint256 => Proposal) public proposals;

    uint256 public numProposals;

    IFakeNFTMarketplace nftMarketPlace;
    ICryptoDevsNFT cryptoDevsNFT;

    constructor(address _nftMarketPlace, address _cryptoDevsNFT) {
        nftMarketPlace = IFakeNFTMarketplace(_nftMarketPlace);
        cryptoDevsNFT = ICryptoDevsNFT(_cryptoDevsNFT);
    }

    modifier nftHolderOnly() {
        require(cryptoDevsNFT.balanceOf(msg.sender) > 0, "NOT_A_DAO_MEMBER");
        _;
    }

    modifier activeProposalOnly(uint256 proposalIndex) {
        require(
            proposals[proposalIndex].deadline > block.timestamp,
            "DEADLINE_EXCEEDED"
        );
        _;
    }
    modifier inactiveProposalOnly(uint256 proposalIndex) {
        require(
            proposals[proposalIndex].deadline <= block.timestamp,
            "DEADLINE_NOT_EXCEEDED"
        );
        require(
            proposals[proposalIndex].executed == false,
            "PROPOSAL_ALREADY_EXECUTED"
        );
        _;
    }

    enum Vote {
        YES,
        NO
    }

    function createProposal(
        uint256 nftTokenId
    ) external nftHolderOnly returns (uint256) {
        require(nftMarketPlace.available(nftTokenId), "NFT_NOT_FOR_SALE");
        Proposal storage proposal = proposals[numProposals];
        proposal.nftTokenId = nftTokenId;
        proposal.deadline = block.timestamp + 5 minutes;
        numProposals++;
        return numProposals - 1;
    }

    function voteProposal(
        uint256 proposalIndex,
        Vote vote
    ) external nftHolderOnly activeProposalOnly(proposalIndex) {
        Proposal storage proposal = proposals[proposalIndex];
        uint256 voteNFTBalance = cryptoDevsNFT.balanceOf(msg.sender);
        uint256 voteAmount = 0;

        for (uint i = 0; i < voteNFTBalance; i++) {
            uint256 tokenId = cryptoDevsNFT.tokenOfOwnerByIndex(msg.sender, i);
            if (!proposal.voters[tokenId]) {
                voteAmount++;
                proposal.voters[tokenId] = true;
            }
        }

        require(voteAmount > 0, "ALREADY_VOTED");
        if (vote == Vote.YES) {
            proposal.yayVotes += voteAmount;
        } else {
            proposal.nayVotes += voteAmount;
        }
    }

    function executeProposal(
        uint256 proposalIndex
    ) external nftHolderOnly inactiveProposalOnly(proposalIndex) {
        Proposal storage proposal = proposals[proposalIndex];

        if (proposal.yayVotes > proposal.nayVotes) {
            uint256 nftPrice = nftMarketPlace.getPrice();
            require(address(this).balance >= nftPrice, "NOT_ENOUGH_FUNDS");
            nftMarketPlace.purchase{value: nftPrice}(proposal.nftTokenId);
        }
        proposal.executed = true;
    }

    function withdrawEther() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}

    fallback() external payable {}
}
