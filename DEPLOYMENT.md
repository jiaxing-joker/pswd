# 密码管理器云端部署指南

## 方案一：Vercel + MongoDB Atlas（推荐，免费）

### 1. 准备数据库
1. 注册 [MongoDB Atlas](https://www.mongodb.com/atlas)
2. 创建免费集群
3. 获取连接字符串，格式：`mongodb+srv://username:password@cluster.mongodb.net/password-manager`

### 2. 部署到Vercel
1. 注册 [Vercel](https://vercel.com)
2. 将代码推送到GitHub
3. 在Vercel中导入项目
4. 设置环境变量：
   - `MONGODB_URI`: MongoDB连接字符串
   - `JWT_SECRET`: 随机密钥（如：`your-super-secret-key-2024`）

### 3. 访问地址
部署完成后，Vercel会提供类似 `https://your-app.vercel.app` 的地址

---

## 方案二：阿里云ECS + MongoDB

### 1. 购买阿里云ECS
- 配置：2核4G内存，40G系统盘
- 系统：Ubuntu 20.04 LTS
- 带宽：5Mbps

### 2. 服务器环境配置
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装PM2进程管理器
sudo npm install -g pm2

# 安装Nginx
sudo apt install nginx -y

# 安装MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 3. 部署应用
```bash
# 创建应用目录
mkdir -p /var/www/password-manager
cd /var/www/password-manager

# 上传代码文件
# 将server.js、package.json等文件上传到此目录

# 安装依赖
npm install

# 创建环境变量文件
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/password-manager
JWT_SECRET=your-super-secret-key-2024
PORT=3000
EOF

# 使用PM2启动应用
pm2 start server.js --name password-manager
pm2 startup
pm2 save
```

### 4. 配置Nginx反向代理
```bash
sudo nano /etc/nginx/sites-available/password-manager
```

添加以下内容：
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/password-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. 配置SSL证书（可选）
```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取SSL证书
sudo certbot --nginx -d your-domain.com
```

---

## 方案三：腾讯云轻量应用服务器

### 1. 购买轻量应用服务器
- 配置：2核4G内存，80G SSD
- 系统：Ubuntu 20.04 LTS
- 带宽：6Mbps

### 2. 一键部署脚本
```bash
#!/bin/bash
# 更新系统
apt update && apt upgrade -y

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 安装PM2
npm install -g pm2

# 安装MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod

# 创建应用目录
mkdir -p /var/www/password-manager
cd /var/www/password-manager

# 这里需要手动上传代码文件
echo "请上传代码文件到 /var/www/password-manager 目录"
```

---

## 方案四：Docker部署（推荐）

### 1. 创建Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

### 2. 创建docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/password-manager
      - JWT_SECRET=your-super-secret-key-2024
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

volumes:
  mongo_data:
```

### 3. 部署命令
```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## 前端文件部署

### 1. 创建public目录
```bash
mkdir public
```

### 2. 将前端文件放入public目录
- index.html
- add-password.html
- password-detail.html
- script.js
- styles.css

### 3. 修改前端代码以支持API调用
需要修改script.js，将localStorage操作改为API调用。

---

## 安全建议

### 1. 环境变量
- 使用强密码作为JWT_SECRET
- 不要在代码中硬编码敏感信息

### 2. 数据库安全
- 启用MongoDB认证
- 限制数据库访问IP
- 定期备份数据

### 3. 服务器安全
- 配置防火墙
- 定期更新系统
- 使用SSH密钥登录

### 4. HTTPS
- 强制使用HTTPS
- 配置安全头
- 启用HSTS

---

## 监控和维护

### 1. 日志监控
```bash
# 查看应用日志
pm2 logs password-manager

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
```

### 2. 性能监控
```bash
# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h
```

### 3. 备份策略
```bash
# 备份MongoDB数据
mongodump --db password-manager --out /backup/$(date +%Y%m%d)

# 备份应用文件
tar -czf /backup/app-$(date +%Y%m%d).tar.gz /var/www/password-manager
```

---

## 故障排除

### 1. 应用无法启动
- 检查端口是否被占用：`netstat -tlnp | grep 3000`
- 检查日志：`pm2 logs password-manager`
- 检查环境变量：`pm2 env password-manager`

### 2. 数据库连接失败
- 检查MongoDB服务状态：`sudo systemctl status mongod`
- 检查连接字符串格式
- 检查网络连接

### 3. 前端无法访问
- 检查Nginx配置：`sudo nginx -t`
- 检查防火墙设置
- 检查域名解析

---

## 成本估算

### Vercel + MongoDB Atlas（推荐）
- Vercel：免费（Hobby计划）
- MongoDB Atlas：免费（512MB存储）
- 总成本：$0/月

### 阿里云ECS
- ECS：约￥100/月
- 域名：约￥50/年
- SSL证书：免费
- 总成本：约￥100/月

### 腾讯云轻量应用服务器
- 轻量应用服务器：约￥90/月
- 域名：约￥50/年
- SSL证书：免费
- 总成本：约￥90/月 