const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Voting 投票合约", function () {
  async function deployFixture() {
    const [admin, voter, other] = await ethers.getSigners();
    const voting = await ethers.deployContract("Voting");
    await voting.waitForDeployment();
    return { voting, admin, voter, other };
  }

  it("部署者是管理员，初始候选人为空", async function () {
    const { voting, admin, voter } = await loadFixture(deployFixture);
    expect(await voting.admin()).to.equal(admin.address);
    expect(await voting.getCandidateCount()).to.equal(0n);
    expect(await voting.getCandidates()).to.deep.equal([]);
    expect(await voting.checkIfVoted(voter.address)).to.equal(false);
  });

  it("管理员添加候选人，编号、中文名称、初始票数与事件正确", async function () {
    const { voting } = await loadFixture(deployFixture);
    await expect(voting.addCandidate("张三")).to.emit(voting, "CandidateAdded").withArgs(0n, "张三");
    await expect(voting.addCandidate("李四")).to.emit(voting, "CandidateAdded").withArgs(1n, "李四");
    expect(await voting.getCandidateCount()).to.equal(2n);
    expect(await voting.getCandidate(0)).to.deep.equal([0n, "张三", 0n]);
    expect(await voting.candidates(1)).to.deep.equal([1n, "李四", 0n]);
  });

  it("非管理员添加失败且状态不变", async function () {
    const { voting, voter } = await loadFixture(deployFixture);
    await expect(voting.connect(voter).addCandidate("张三")).to.be.revertedWith("Only admin can call this function");
    expect(await voting.getCandidateCount()).to.equal(0n);
  });

  it("投票事件、状态和不同地址累计票数正确", async function () {
    const { voting, voter, other } = await loadFixture(deployFixture);
    await voting.addCandidate("张三");
    await voting.addCandidate("李四");
    await expect(voting.connect(voter).vote(0)).to.emit(voting, "Voted").withArgs(voter.address, 0n);
    await voting.connect(other).vote(0);
    expect(await voting.hasVoted(voter.address)).to.equal(true);
    expect(await voting.checkIfVoted(other.address)).to.equal(true);
    expect(await voting.getCandidates()).to.deep.equal([[0n, "张三", 2n], [1n, "李四", 0n]]);
  });

  it("禁止向同一或另一候选人重复投票", async function () {
    const { voting, voter } = await loadFixture(deployFixture);
    await voting.addCandidate("张三");
    await voting.addCandidate("李四");
    await voting.connect(voter).vote(0);
    for (const id of [0, 1]) {
      await expect(voting.connect(voter).vote(id)).to.be.revertedWith("You have already voted");
    }
    expect(await voting.getCandidates()).to.deep.equal([[0n, "张三", 1n], [1n, "李四", 0n]]);
  });

  it("空列表、边界编号和极大编号投票失败，不消耗投票资格", async function () {
    const { voting, voter } = await loadFixture(deployFixture);
    await expect(voting.connect(voter).vote(0)).to.be.revertedWith("Invalid candidate ID");
    await voting.addCandidate("张三");
    for (const id of [1n, ethers.MaxUint256]) {
      await expect(voting.connect(voter).vote(id)).to.be.revertedWith("Invalid candidate ID");
      await expect(voting.getCandidate(id)).to.be.revertedWith("Invalid candidate ID");
    }
    expect(await voting.checkIfVoted(voter.address)).to.equal(false);
    await voting.connect(voter).vote(0);
    expect((await voting.getCandidate(0)).voteCount).to.equal(1n);
  });

  it("保留截图行为：允许空名、重名以及管理员投票", async function () {
    const { voting, admin } = await loadFixture(deployFixture);
    await voting.addCandidate("");
    await voting.addCandidate("");
    await voting.vote(1);
    await voting.addCandidate("投票后添加");
    expect(await voting.getCandidateCount()).to.equal(3n);
    expect(await voting.checkIfVoted(admin.address)).to.equal(true);
  });
});
