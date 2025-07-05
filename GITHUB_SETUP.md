# GitHub 仓库设置指南

## 1. 创建 GitHub 账户（如果还没有）

1. 访问 [GitHub](https://github.com)
2. 点击 "Sign up"
3. 填写注册信息

## 2. 创建新仓库

1. 登录 GitHub
2. 点击右上角 "+" → "New repository"
3. 设置仓库信息：
   - Repository name: `password-manager-cloud`
   - Description: `云端密码管理器 - 支持多设备同步`
   - 选择 "Public"
   - 不要勾选 "Add a README file"
4. 点击 "Create repository"

## 3. 上传代码文件

### 方法一：使用 GitHub Desktop（推荐）

1. 下载并安装 [GitHub Desktop](https://desktop.github.com/)
2. 登录 GitHub 账户
3. 克隆仓库到本地
4. 将以下文件复制到仓库文件夹：
   ```
   server.js
   package.json
   public/
   ├── index.html
   ├── add-password.html
   ├── password-detail.html
   ├── script.js
   └── styles.css
   MONGODB_SETUP.md
   GITHUB_SETUP.md
   DEPLOYMENT.md
   README.md
   ```
5. 在 GitHub Desktop 中提交并推送

### 方法二：使用网页上传

1. 在仓库页面点击 "uploading an existing file"
2. 拖拽所有文件到上传区域
3. 填写提交信息："Initial commit"
4. 点击 "Commit changes"

## 4. 验证文件结构

确保仓库包含以下文件：
```
password-manager-cloud/
├── server.js
├── package.json
├── public/
│   ├── index.html
│   ├── add-password.html
│   ├── password-detail.html
│   ├── script.js
│   └── styles.css
├── MONGODB_SETUP.md
├── GITHUB_SETUP.md
├── DEPLOYMENT.md
└── README.md
```

## 5. 仓库地址

创建完成后，你会得到类似这样的仓库地址：
```
https://github.com/你的用户名/password-manager-cloud
```

记住这个地址，下一步部署到 Vercel 时会用到！ 