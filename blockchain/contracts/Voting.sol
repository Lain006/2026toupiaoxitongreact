// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Voting {
    // 候选人结构体
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    // 合约管理员
    address public admin;
    Candidate[] public candidates;
    // 记录已投票的地址
    mapping(address => bool) public hasVoted;

    event CandidateAdded(uint256 id, string name);
    event Voted(address indexed voter, uint256 candidateId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function addCandidate(string memory _name) public onlyAdmin {
        uint256 candidateId = candidates.length;
        candidates.push(Candidate({id: candidateId, name: _name, voteCount: 0}));
        emit CandidateAdded(candidateId, _name);
    }

    function vote(uint256 _candidateId) public {
        require(!hasVoted[msg.sender], "You have already voted");
        require(_candidateId < candidates.length, "Invalid candidate ID");
        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;
        emit Voted(msg.sender, _candidateId);
    }

    function getCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }

    function getCandidateCount() public view returns (uint256) {
        return candidates.length;
    }

    function getCandidate(uint256 _candidateId) public view returns (Candidate memory) {
        require(_candidateId < candidates.length, "Invalid candidate ID");
        return candidates[_candidateId];
    }

    function checkIfVoted(address _voter) public view returns (bool) {
        return hasVoted[_voter];
    }
}
