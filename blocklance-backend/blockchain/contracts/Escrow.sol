// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Escrow {
    struct Deal {
        address client;
        address freelancer;
        uint256 amount;
        bool funded;
        bool released;
        bool cancelled;
    }

    mapping(uint256 => Deal) public deals;
    uint256 public dealCount;

    event EscrowCreated(uint256 indexed dealId, address indexed client, address indexed freelancer, uint256 amount);
    event EscrowFunded(uint256 indexed dealId);
    event EscrowReleased(uint256 indexed dealId);
    event EscrowCancelled(uint256 indexed dealId);

    function createDeal(address _freelancer) external payable returns (uint256) {
        require(msg.value > 0, "Must fund escrow");

        dealCount++;
        deals[dealCount] = Deal({
            client: msg.sender,
            freelancer: _freelancer,
            amount: msg.value,
            funded: true,
            released: false,
            cancelled: false
        });

        emit EscrowCreated(dealCount, msg.sender, _freelancer, msg.value);
        return dealCount;
    }

    function releaseFunds(uint256 _dealId) external {
        Deal storage deal = deals[_dealId];
        require(deal.client == msg.sender, "Only client can release");
        require(deal.funded && !deal.released, "Invalid state");

        deal.released = true;
        payable(deal.freelancer).transfer(deal.amount);

        emit EscrowReleased(_dealId);
    }

    function cancelDeal(uint256 _dealId) external {
        Deal storage deal = deals[_dealId];
        require(deal.client == msg.sender, "Only client can cancel");
        require(!deal.released, "Already released");

        deal.cancelled = true;
        payable(deal.client).transfer(deal.amount);

        emit EscrowCancelled(_dealId);
    }

    function getDeal(uint256 _dealId) external view returns (Deal memory) {
        return deals[_dealId];
    }
}
