# Vercel 部署指南

## 第一步：注册 Vercel 账户

1. 访问 [Vercel](https://vercel.com)
2. 点击 "Sign Up"
3. 选择 "Continue with GitHub"（推荐）
4. 授权 GitHub 账户访问

## 第二步：导入项目

1. 登录 Vercel 后，点击 "New Project"
2. 在 "Import Git Repository" 部分，找到你的 `password-manager-cloud` 仓库
3. 点击 "Import"

## 第三步：配置项目

1. **项目名称**：保持默认或自定义（如：`password-manager-cloud`）
2. **Framework Preset**：选择 "Node.js"
3. **Root Directory**：保持默认（`./`）
4. **Build Command**：保持默认（`npm run build` 或留空）
5. **Output Directory**：保持默认（`.vercel/output`）
6. **Install Command**：保持默认（`npm install`）

## 第四步：设置环境变量

在部署前，点击 "Environment Variables" 添加以下变量：

### 必需的环境变量：

1. **MONGODB_URI**
   - 值：你的 MongoDB Atlas 连接字符串
   - 示例：`mongodb+srv://password-manager-user:MySecurePassword123@cluster0.abc123.mongodb.net/password-manager?retryWrites=true&w=majority`

2. **JWT_SECRET**
   - 值：一个强密码字符串（至少32位）
   - 示例：`your-super-secret-jwt-key-2024-very-long-and-secure`

### 可选的环境变量：

3. **NODE_ENV**
   - 值：`production`

## 第五步：部署

1. 点击 "Deploy" 按钮
2. 等待部署完成（通常需要1-3分钟）
3. 部署成功后，你会看到类似这样的地址：
   ```
   https://password-manager-cloud-xxx.vercel.app
   ```

## 第六步：测试应用

1. 访问部署后的地址
2. 点击 "注册新用户"
3. 创建账户并测试功能

## 第七步：自定义域名（可选）

1. 在 Vercel 项目页面，点击 "Settings"
2. 选择 "Domains"
3. 添加你的自定义域名
4. 按照提示配置 DNS 记录

## 故障排除

### 部署失败

**问题**：部署时出现错误
**解决方案**：
1. 检查 `package.json` 文件是否正确
2. 确认所有文件都已上传到 GitHub
3. 检查环境变量是否正确设置
4. 查看 Vercel 部署日志

### 数据库连接失败

**问题**：应用无法连接到 MongoDB
**解决方案**：
1. 检查 `MONGODB_URI` 环境变量
2. 确认 MongoDB Atlas 网络访问设置
3. 验证数据库用户名和密码

### 应用无法访问

**问题**：部署后无法访问应用
**解决方案**：
1. 检查 Vercel 部署状态
2. 确认域名配置正确
3. 查看 Vercel 函数日志

## 常用命令

### 本地测试
```bash
# 安装依赖
npm install

# 本地运行
npm start

# 开发模式
npm run dev
```

### Vercel CLI（可选）
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 查看部署状态
vercel ls
```

## 监控和维护

### 查看日志
1. 在 Vercel 项目页面点击 "Functions"
2. 查看 API 函数的执行日志

### 性能监控
1. 在 Vercel 项目页面查看 "Analytics"
2. 监控请求数量、响应时间等

### 自动部署
- 每次推送到 GitHub 主分支时，Vercel 会自动重新部署
- 可以在 "Settings" → "Git" 中配置部署设置

## 安全建议

1. **定期更新 JWT_SECRET**
2. **监控异常访问**
3. **定期备份数据**
4. **使用强密码**

## 成本说明

- **Vercel Hobby 计划**：免费
  - 每月 100GB 带宽
  - 每月 100GB 存储
  - 每月 6000 次函数调用
  - 对于个人使用完全够用

- **MongoDB Atlas 免费计划**：免费
  - 512MB 存储
  - 共享集群
  - 对于密码管理器完全够用

## 成功部署后的地址

部署完成后，你会得到类似这样的地址：
```
https://password-manager-cloud-xxx.vercel.app
```

这个地址可以在任何设备上访问，实现真正的多设备同步！ 