// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract BlocklanceEscrow {
    address public client;
    address public freelancer;
    uint public amount;
    bool public funded;
    bool public released;
    string public projectId;

    event Funded(address indexed client, uint amount, string projectId);
    event Released(address indexed freelancer, uint amount, string projectId);

    constructor(address _client, address _freelancer, string memory _projectId) payable {
        client = _client;
        freelancer = _freelancer;
        projectId = _projectId;
        funded = false;
        released = false;
    }

    function fundEscrow() external payable {
        require(msg.sender == client, "Only client can fund");
        require(!funded, "Already funded");
        amount = msg.value;
        funded = true;
        emit Funded(client, amount, projectId);
    }

    function releaseFunds() external {
        require(msg.sender == client, "Only client can release");
        require(funded && !released, "Invalid state");
        payable(freelancer).transfer(amount);
        released = true;
        emit Released(freelancer, amount, projectId);
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
