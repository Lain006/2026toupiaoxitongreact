# 区块链投票系统（2026toupiaoxitongreact）

课程实践项目：用 **Hardhat** 编写投票智能合约，用 **React + Vite** 搭建前端界面。

合约负责存候选人和票数，前端负责显示。目前前端还是静态页面，尚未与合约连接。

## 目录结构

```
2026toupiaoxitongreact/
├── .gitignore                  仓库忽略规则
├── blockchain/                 智能合约工程（Hardhat）
│   ├── contracts/Voting.sol        投票合约源码
│   ├── scripts/deploy.js           部署脚本（部署 + 加初始候选人）
│   ├── scripts/demo.js             本地演示（部署 + 投票 + 自动校验）
│   ├── test/Voting.js              合约测试，共 7 个用例
│   └── hardhat.config.js
└── frontend/                   前端工程（React + Vite）
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx                入口，挂载 App
        ├── App.jsx                 页面骨架（voting-card 卡片容器）
        ├── App.css                 卡片样式
        ├── index.css               全局样式（背景、居中）
        └── components/
            ├── Header.jsx          页头：状态徽章 + 标题
            └── Header.css
```

## 环境要求

- **Node.js 22.x**（本项目在 v22.20.0 上开发）
- **npm 10.x**

检查版本：

```powershell
node -v
npm -v
```

## 快速上手

`node_modules` 未提交到仓库，首次使用需要先装依赖。

### 一、智能合约（blockchain）

```powershell
cd blockchain
npm ci
```

然后按需执行：

```powershell
npx hardhat compile    # 编译合约，生成 artifacts/ 和 cache/
npm test               # 运行测试，应显示 7 passing
npm run demo           # 在本地临时链上跑一次完整投票流程
npm run deploy         # 部署合约并添加 Alice / Bob / Charlie 三个候选人
```

`demo` 和 `deploy` 都跑在**临时本地链**上，脚本结束链就没了，不需要钱包，也不消耗任何真实资产。

`npm run deploy` 最后会打印一行合约地址，那是留给前端调用合约用的。

### 二、前端（frontend）

```powershell
cd frontend
npm ci
npm run dev
```

浏览器打开 **http://localhost:5173** 。改动代码后页面会自动刷新（热更新）。

其他命令：

```powershell
npm run build      # 打包生产版本到 dist/
npm run preview    # 本地预览打包结果
npm run lint       # 代码规范检查
```

## 合约原理

源码在 `blockchain/contracts/Voting.sol`，Solidity `^0.8.24`。

**部署时**，调用部署的那个地址自动成为**管理员（admin）**。

**可用函数**：

| 函数 | 谁可以调用 | 作用 |
| --- | --- | --- |
| `addCandidate(name)` | 仅管理员 | 添加候选人，编号从 0 开始自动递增 |
| `vote(candidateId)` | 任何人 | 给指定编号的候选人投一票 |
| `getCandidates()` | 任何人 | 返回全部候选人及各自票数 |
| `getCandidateCount()` | 任何人 | 返回候选人总数 |
| `getCandidate(id)` | 任何人 | 按编号查单个候选人 |
| `checkIfVoted(address)` | 任何人 | 查某个地址是否已投票 |

**两条核心规则**：

1. 只有管理员能添加候选人，其他人调用会被拒绝（`Only admin can call this function`）。
2. **每个地址只能投一次票**，重复投票会被拒绝（`You have already voted`）；给不存在的编号投票也会被拒绝（`Invalid candidate ID`）。

**事件**：`CandidateAdded(id, name)`、`Voted(voter, candidateId)`，方便前端监听链上变化。

## 需要清楚的限制

这是一个**教学合约**，不是可直接用于真实选举的系统：

- 它是「**每个地址一票**」，不是「每人一票」。同一个人可以创建多个钱包地址重复投票，合约无法阻止。
- **没有实名验证**，没有投票截止时间，允许空名和重名。
- 没有隐私保护，所有投票记录在链上公开可查。
- 本项目只在本地测试链运行，**没有部署到任何公共网络**。

## 当前进度

- [x] 合约编写、编译通过
- [x] 合约测试：7 个用例全部通过
- [x] 本地 demo 验证：张三 1 票、李四 0 票、投票地址被正确标记
- [x] 前端页面骨架 + Header 组件（状态徽章、标题、副标题）
- [ ] 前端接入 MetaMask 连接钱包
- [ ] 前端读取链上候选人列表并展示票数
- [ ] 前端发起投票交易

## 注意事项

- 所有操作都在本地临时测试链上，**不涉及真实资产和真实私钥**。
- 不要把 `.env`、私钥或助记词写进代码或提交到仓库（`.gitignore` 已排除 `.env`）。
- 若 `npm ci` 或编译报网络错误，先检查本机代理设置是否正常。

## 相关文件

- `blockchain/README.md`：合约工程的补充说明
- `blockchain/contracts/Voting.sol`：合约源码，函数上方有中文注释
