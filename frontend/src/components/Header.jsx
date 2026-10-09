import "./Header.css";
// 尝试 Ctrl+U 与 AI 聊天，Ctrl+I 与 AI 一起编写代码。

function Header({ account }) {
  const isConnected = Boolean(account);

  return (
    <div className="header">
      {/* 左上角状态徽章，看我们是不是连接到了区块链账户了？*/}
      <div className="status-badge">
        <span className={`status-dot ${isConnected ? "connected" : ""}`}></span>
        <span>
          {isConnected
            ? `${account.slice(0, 6)}...${account.slice(-4)}`
            : "未连接"}
        </span>
      </div>

      {/* 居中的标题和副标题 */}
      <div className="title-area">
        <h1 className="main-title">区块链投票</h1>
        <p className="sub-title">去中心化、透明、不可篡改</p>
      </div>
    </div>
  );
}
export default Header;
