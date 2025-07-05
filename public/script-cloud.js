// 云端密码管理器 - 前端JavaScript
let currentUser = null;
let authToken = null;
let passwords = [];

// API基础URL
const API_BASE_URL = window.location.origin;

// 页面加载时检查登录状态
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    
    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        showMainScreen();
        loadPasswords();
    } else {
        showLoginScreen();
    }
});

// 显示登录界面
function showLoginScreen() {
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('registerScreen').classList.remove('active');
    document.getElementById('mainScreen').classList.remove('active');
}

// 显示注册界面
function showRegister() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('registerScreen').classList.add('active');
    document.getElementById('mainScreen').classList.remove('active');
}

// 显示主界面
function showMainScreen() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('registerScreen').classList.remove('active');
    document.getElementById('mainScreen').classList.add('active');
    
    if (currentUser) {
        document.getElementById('userInfo').textContent = `欢迎，${currentUser.username}`;
    }
}

// 用户注册
async function register() {
    const username = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newMasterPassword').value;
    const confirmPassword = document.getElementById('confirmMasterPassword').value;
    
    if (!username || !password || !confirmPassword) {
        showNotification('请填写所有字段', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('两次输入的密码不一致', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('密码长度至少6位', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                masterPassword: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showNotification('注册成功！', 'success');
            showMainScreen();
            loadPasswords();
        } else {
            showNotification(data.error || '注册失败', 'error');
        }
    } catch (error) {
        console.error('注册错误:', error);
        showNotification('网络错误，请稍后重试', 'error');
    }
}

// 用户登录
async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('masterPassword').value;
    
    if (!username || !password) {
        showNotification('请填写用户名和密码', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                masterPassword: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showNotification('登录成功！', 'success');
            showMainScreen();
            loadPasswords();
        } else {
            showNotification(data.error || '登录失败', 'error');
        }
    } catch (error) {
        console.error('登录错误:', error);
        showNotification('网络错误，请稍后重试', 'error');
    }
}

// 锁定密码库
function lockVault() {
    authToken = null;
    currentUser = null;
    passwords = [];
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    showNotification('已锁定', 'success');
    showLoginScreen();
}

// 加载密码列表
async function loadPasswords() {
    if (!authToken) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/passwords`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            passwords = await response.json();
            renderPasswords();
        } else {
            if (response.status === 401) {
                lockVault();
            } else {
                showNotification('加载密码失败', 'error');
            }
        }
    } catch (error) {
        console.error('加载密码错误:', error);
        showNotification('网络错误，请稍后重试', 'error');
    }
}

// 渲染密码列表
function renderPasswords() {
    const passwordsList = document.getElementById('passwordsList');
    const emptyState = document.getElementById('emptyState');
    
    if (passwords.length === 0) {
        passwordsList.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    passwordsList.style.display = 'grid';
    emptyState.style.display = 'none';
    
    passwordsList.innerHTML = passwords.map(password => `
        <div class="password-item" onclick="togglePasswordDetails('${password._id}')">
            <div class="password-header">
                <div class="password-title copyable" onclick="event.stopPropagation(); copyToClipboard('${password.siteName}', '网站名称')" title="点击复制网站名称">${password.siteName}</div>
                <div class="password-actions" onclick="event.stopPropagation()">
                    <button class="btn-view" onclick="viewPassword('${password._id}')" title="查看详情">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-copy" onclick="copyPassword('${password._id}')" title="复制密码">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn-edit" onclick="editPassword('${password._id}')" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deletePassword('${password._id}')" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="password-details" id="details-${password._id}" style="display: none;">
                <div class="password-field">
                    <label>网站:</label>
                    <span class="copyable" onclick="event.stopPropagation(); copyToClipboard('${password.siteName}', '网站名称')" title="点击复制网站名称">${password.siteName}</span>
                    ${password.category ? `<span class="category-tag ${getCategoryClass(password.category)}">${password.category}</span>` : ''}
                </div>
                ${password.siteUrl ? `<div class="password-field">
                    <label>地址:</label>
                    <span class="copyable" onclick="event.stopPropagation(); copyToClipboard('${password.siteUrl}', '网站地址')" title="点击复制网站地址">${password.siteUrl}</span>
                </div>` : ''}
                <div class="password-field">
                    <label>用户名:</label>
                    <span class="copyable" onclick="event.stopPropagation(); copyToClipboard('${password.username}', '用户名')" title="点击复制用户名">${password.username}</span>
                </div>
                <div class="password-field">
                    <label>密码:</label>
                    <span class="password-text copyable" id="pwd-${password._id}" onclick="event.stopPropagation(); copyPassword('${password._id}')" title="点击复制密码">••••••••</span>
                    <button onclick="event.stopPropagation(); togglePasswordVisibility('pwd-${password._id}')" class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
                ${password.attachment ? `<div class="password-field">
                    <label>附件:</label>
                    <img src="${password.attachment}" alt="附件" style="max-width: 100px; max-height: 60px; border-radius: 4px; cursor: pointer;" onclick="event.stopPropagation(); showImageModal('${password.attachment}')" title="点击查看大图">
                </div>` : ''}
                ${password.notes ? `<div class="password-notes">备注: <span class="copyable" onclick="event.stopPropagation(); copyToClipboard('${password.notes}', '备注')" title="点击复制备注">${password.notes}</span></div>` : ''}
                <div class="password-field">
                    <label>创建:</label>
                    <span>${new Date(password.createdAt).toLocaleString()}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// 切换密码详情显示
function togglePasswordDetails(id) {
    const details = document.getElementById(`details-${id}`);
    if (details.style.display === 'none') {
        details.style.display = 'grid';
    } else {
        details.style.display = 'none';
    }
}

// 切换密码可见性
function togglePasswordVisibility(elementId) {
    const element = document.getElementById(elementId);
    const passwordId = elementId.replace('pwd-', '');
    const password = passwords.find(p => p._id === passwordId);
    
    if (element.textContent === '••••••••') {
        element.textContent = password.password;
    } else {
        element.textContent = '••••••••';
    }
}

// 复制密码
function copyPassword(id) {
    const password = passwords.find(p => p._id === id);
    if (password) {
        copyToClipboard(password.password, '密码');
    }
}

// 通用复制功能
function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification(`${label}已复制到剪贴板`, 'success');
    }).catch(() => {
        showNotification('复制失败', 'error');
    });
}

// 搜索密码
function filterPasswords() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const passwordItems = document.querySelectorAll('.password-item');
    
    passwordItems.forEach(item => {
        const title = item.querySelector('.password-title').textContent.toLowerCase();
        const username = item.querySelector('.password-field span').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || username.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// 获取分类CSS类名
function getCategoryClass(category) {
    const categoryMap = {
        '社交': 'social',
        '工作': 'work',
        '购物': 'shopping',
        '银行': 'bank',
        '游戏': 'game',
        '学习': 'study',
        '其他': 'other'
    };
    return categoryMap[category] || 'other';
}

// 显示图片模态框
function showImageModal(imageSrc) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 80%; max-height: 80%;">
            <div class="modal-header">
                <h2>图片预览</h2>
                <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div class="modal-body" style="text-align: center;">
                <img src="${imageSrc}" style="max-width: 100%; max-height: 60vh; object-fit: contain;">
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

// 查看密码详情
function viewPassword(id) {
    window.location.href = `password-detail.html?id=${id}`;
}

// 编辑密码
function editPassword(id) {
    window.location.href = `add-password.html?id=${id}`;
}

// 删除密码
async function deletePassword(id) {
    if (!confirm('确定要删除这个密码吗？')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/passwords/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            showNotification('密码删除成功', 'success');
            loadPasswords();
        } else {
            showNotification('删除失败', 'error');
        }
    } catch (error) {
        console.error('删除密码错误:', error);
        showNotification('网络错误，请稍后重试', 'error');
    }
}

// 导出密码数据
async function exportPasswords() {
    if (!passwords.length) {
        showNotification('没有可导出的密码', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/export`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const dataStr = JSON.stringify(data, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'passwords_backup.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showNotification('密码已导出', 'success');
        } else {
            showNotification('导出失败', 'error');
        }
    } catch (error) {
        console.error('导出错误:', error);
        showNotification('网络错误，请稍后重试', 'error');
    }
}

// 导入密码数据
async function importPasswords(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (!Array.isArray(imported)) throw new Error('格式错误');
            
            const response = await fetch(`${API_BASE_URL}/api/import`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ passwords: imported })
            });
            
            if (response.ok) {
                showNotification('导入成功', 'success');
                loadPasswords();
            } else {
                const data = await response.json();
                showNotification(data.error || '导入失败', 'error');
            }
        } catch (err) {
            showNotification('导入失败，文件格式错误', 'error');
        }
        event.target.value = '';
    };
    reader.readAsText(file);
}

// 跳转到添加密码页面
function goToAddPassword() {
    window.location.href = 'add-password.html';
}

// 显示通知
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 键盘事件监听
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const activeScreen = document.querySelector('.screen.active');
        if (activeScreen.id === 'loginScreen') {
            login();
        } else if (activeScreen.id === 'registerScreen') {
            register();
        }
    }
}); 