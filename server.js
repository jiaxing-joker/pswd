const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 连接MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/password-manager', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// 用户模型
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    masterPasswordHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// 密码模型
const passwordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    siteName: { type: String, required: true },
    siteUrl: String,
    username: { type: String, required: true },
    password: { type: String, required: true },
    category: String,
    notes: String,
    port: String,
    attachment: String,
    expiryDate: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Password = mongoose.model('Password', passwordSchema);

// 认证中间件
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: '访问令牌缺失' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findById(decoded.userId);
        if (!req.user) {
            return res.status(401).json({ error: '用户不存在' });
        }
        next();
    } catch (error) {
        return res.status(403).json({ error: '无效的访问令牌' });
    }
};

// 路由

// 用户注册
app.post('/api/register', async (req, res) => {
    try {
        const { username, masterPassword } = req.body;

        if (!username || !masterPassword) {
            return res.status(400).json({ error: '用户名和主密码不能为空' });
        }

        // 检查用户是否已存在
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: '用户名已存在' });
        }

        // 加密主密码
        const saltRounds = 12;
        const masterPasswordHash = await bcrypt.hash(masterPassword, saltRounds);

        // 创建用户
        const user = new User({
            username,
            masterPasswordHash
        });

        await user.save();

        // 生成JWT令牌
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: '注册成功',
            token,
            user: { id: user._id, username: user.username }
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 用户登录
app.post('/api/login', async (req, res) => {
    try {
        const { username, masterPassword } = req.body;

        if (!username || !masterPassword) {
            return res.status(400).json({ error: '用户名和主密码不能为空' });
        }

        // 查找用户
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        // 验证主密码
        const isValidPassword = await bcrypt.compare(masterPassword, user.masterPasswordHash);
        if (!isValidPassword) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        // 生成JWT令牌
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: '登录成功',
            token,
            user: { id: user._id, username: user.username }
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 获取所有密码
app.get('/api/passwords', authenticateToken, async (req, res) => {
    try {
        const passwords = await Password.find({ userId: req.user._id }).sort({ updatedAt: -1 });
        res.json(passwords);
    } catch (error) {
        console.error('获取密码错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 创建新密码
app.post('/api/passwords', authenticateToken, async (req, res) => {
    try {
        const {
            siteName,
            siteUrl,
            username,
            password,
            category,
            notes,
            port,
            attachment,
            expiryDate
        } = req.body;

        if (!siteName || !username || !password) {
            return res.status(400).json({ error: '必填字段不能为空' });
        }

        const newPassword = new Password({
            userId: req.user._id,
            siteName,
            siteUrl,
            username,
            password,
            category,
            notes,
            port,
            attachment,
            expiryDate
        });

        await newPassword.save();
        res.json({ message: '密码创建成功', password: newPassword });
    } catch (error) {
        console.error('创建密码错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 更新密码
app.put('/api/passwords/:id', authenticateToken, async (req, res) => {
    try {
        const passwordId = req.params.id;
        const {
            siteName,
            siteUrl,
            username,
            password,
            category,
            notes,
            port,
            attachment,
            expiryDate
        } = req.body;

        if (!siteName || !username || !password) {
            return res.status(400).json({ error: '必填字段不能为空' });
        }

        const updatedPassword = await Password.findOneAndUpdate(
            { _id: passwordId, userId: req.user._id },
            {
                siteName,
                siteUrl,
                username,
                password,
                category,
                notes,
                port,
                attachment,
                expiryDate,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!updatedPassword) {
            return res.status(404).json({ error: '密码不存在' });
        }

        res.json({ message: '密码更新成功', password: updatedPassword });
    } catch (error) {
        console.error('更新密码错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 删除密码
app.delete('/api/passwords/:id', authenticateToken, async (req, res) => {
    try {
        const passwordId = req.params.id;
        const deletedPassword = await Password.findOneAndDelete({
            _id: passwordId,
            userId: req.user._id
        });

        if (!deletedPassword) {
            return res.status(404).json({ error: '密码不存在' });
        }

        res.json({ message: '密码删除成功' });
    } catch (error) {
        console.error('删除密码错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 导出密码数据
app.get('/api/export', authenticateToken, async (req, res) => {
    try {
        const passwords = await Password.find({ userId: req.user._id });
        res.json(passwords);
    } catch (error) {
        console.error('导出错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 导入密码数据
app.post('/api/import', authenticateToken, async (req, res) => {
    try {
        const { passwords } = req.body;

        if (!Array.isArray(passwords)) {
            return res.status(400).json({ error: '数据格式错误' });
        }

        // 为每个密码添加用户ID
        const passwordsWithUserId = passwords.map(pwd => ({
            ...pwd,
            userId: req.user._id,
            createdAt: pwd.createdAt || new Date(),
            updatedAt: new Date()
        }));

        await Password.insertMany(passwordsWithUserId);
        res.json({ message: '导入成功' });
    } catch (error) {
        console.error('导入错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 服务静态文件
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
}); 