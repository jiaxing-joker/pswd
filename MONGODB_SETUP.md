# MongoDB Atlas 设置指南

## 1. 注册 MongoDB Atlas 账户

1. 访问 [MongoDB Atlas](https://www.mongodb.com/atlas)
2. 点击 "Try Free" 或 "Get Started Free"
3. 填写注册信息：
   - 邮箱地址
   - 密码
   - 账户名称

## 2. 创建免费集群

1. 选择 "FREE" 计划（M0）
2. 选择云服务商：
   - AWS（推荐）
   - Google Cloud
   - Azure
3. 选择地区：
   - 选择离你最近的地区
   - 如：N. Virginia (us-east-1)
4. 点击 "Create"

## 3. 设置数据库用户

1. 在 "Security" → "Database Access" 中
2. 点击 "Add New Database User"
3. 设置：
   - Username: `password-manager-user`
   - Password: 生成强密码（保存好）
   - Database User Privileges: "Read and write to any database"
4. 点击 "Add User"

## 4. 设置网络访问

1. 在 "Security" → "Network Access" 中
2. 点击 "Add IP Address"
3. 选择 "Allow Access from Anywhere"（0.0.0.0/0）
4. 点击 "Confirm"

## 5. 获取连接字符串

1. 在集群页面点击 "Connect"
2. 选择 "Connect your application"
3. 选择 Driver: "Node.js"
4. 复制连接字符串，格式如下：
   ```
   mongodb+srv://password-manager-user:your-password@cluster0.xxxxx.mongodb.net/password-manager?retryWrites=true&w=majority
   ```

## 6. 测试连接

连接字符串示例：
```
mongodb+srv://password-manager-user:MySecurePassword123@cluster0.abc123.mongodb.net/password-manager?retryWrites=true&w=majority
```

⚠️ 重要：请将 `your-password` 替换为你实际设置的密码！ 