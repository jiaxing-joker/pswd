# 多设备部署指南

## 方案1：GitHub Pages（推荐）

### 步骤1：创建GitHub仓库
1. 登录GitHub账号
2. 点击右上角"+"号，选择"New repository"
3. 仓库名称填写：`password-manager`
4. 选择"Public"（公开）
5. 不要勾选"Add a README file"
6. 点击"Create repository"

### 步骤2：上传文件
1. 在新建的仓库页面，点击"uploading an existing file"
2. 将所有文件拖拽到上传区域：
   - `index.html`
   - `add-password.html`
   - `password-detail.html`
   - `script.js`
   - `styles.css`
   - `README.md`
3. 在下方填写提交信息："Initial commit"
4. 点击"Commit changes"

### 步骤3：启用GitHub Pages
1. 在仓库页面，点击"Settings"标签
2. 左侧菜单找到"Pages"
3. 在"Source"部分，选择"Deploy from a branch"
4. 在"Branch"下拉菜单中选择"main"，文件夹选择"/(root)"
5. 点击"Save"
6. 等待几分钟，页面会显示部署成功的网址

### 步骤4：访问应用
- 访问生成的网址（格式：`https://你的用户名.github.io/password-manager/`）
- 在任何设备上都可以访问这个网址

## 方案2：Netlify部署

### 步骤1：注册Netlify
1. 访问 https://netlify.com
2. 点击"Sign up"注册账号
3. 可以使用GitHub账号直接登录

### 步骤2：部署应用
1. 登录后，将包含所有文件的文件夹拖拽到Netlify的部署区域
2. 等待部署完成
3. 获得一个随机的网址（如：`https://random-name-123.netlify.app`）

### 步骤3：自定义域名（可选）
1. 在Netlify控制台点击"Domain settings"
2. 可以设置自定义域名

## 方案3：Vercel部署

### 步骤1：注册Vercel
1. 访问 https://vercel.com
2. 使用GitHub账号登录

### 步骤2：导入项目
1. 点击"New Project"
2. 选择你的GitHub仓库
3. 点击"Deploy"
4. 等待部署完成

## 数据同步说明

### 当前限制
- 数据存储在浏览器的localStorage中
- 不同设备间数据不会自动同步
- 同一台设备的不同浏览器间数据不共享

### 手动同步方法
1. **导出数据**：在设备A上点击"导出"按钮，下载JSON文件
2. **传输文件**：将JSON文件传输到设备B（邮件、云盘等）
3. **导入数据**：在设备B上点击"导入"按钮，选择JSON文件

### 建议的工作流程
1. 在一台设备上管理所有密码
2. 定期导出备份数据
3. 需要时在其他设备上导入数据
4. 使用强主密码保护数据安全

## 安全注意事项

### 数据安全
- 密码数据存储在浏览器本地，不会上传到服务器
- 使用主密码加密保护数据
- 建议定期更换主密码

### 访问安全
- 部署后的网址是公开的，任何人都可以访问
- 但只有知道主密码的人才能解锁查看密码
- 建议使用强主密码

### 备份建议
- 每周导出一次数据备份
- 将备份文件存储在安全的地方
- 考虑使用加密云盘存储备份

## 故障排除

### 部署后无法访问
1. 检查文件是否全部上传
2. 确认`index.html`在根目录
3. 等待几分钟让部署生效

### 数据丢失
1. 检查浏览器localStorage是否被清除
2. 尝试从备份文件恢复
3. 确认主密码输入正确

### 功能异常
1. 清除浏览器缓存
2. 尝试不同的浏览器
3. 检查浏览器是否支持现代JavaScript特性 