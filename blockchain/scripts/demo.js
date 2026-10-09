const assert = require("node:assert/strict");
const { ethers } = require("hardhat");

async function main() {
  const [, voter] = await ethers.getSigners();
  const voting = await ethers.deployContract("Voting");
  await voting.waitForDeployment();
  await (await voting.addCandidate("张三")).wait();
  await (await voting.addCandidate("李四")).wait();
  await (await voting.connect(voter).vote(0)).wait();
  const candidates = await voting.getCandidates();
  assert.equal(candidates[0].voteCount, 1n);
  assert.equal(candidates[1].voteCount, 0n);
  assert.equal(await voting.checkIfVoted(voter.address), true);
  console.log("本地投票合约部署成功：", await voting.getAddress());
  console.table(candidates.map((candidate) => ({
    编号: candidate.id.toString(),
    姓名: candidate.name,
    票数: candidate.voteCount.toString(),
  })));
  console.log("验证通过：张三 1 票，李四 0 票，投票地址已标记。");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
