// ===== 自动主密码解锁（必须在最顶部，优先执行） =====
let masterPassword = '';
let passwords = [];
let currentEditingId = null;

// 立即检查并执行自动解锁
(function autoUnlock() {
    const tempPwd = sessionStorage.getItem('tempMasterPassword');
    const storedHash = localStorage.getItem('masterPasswordHash');
    
    if (tempPwd && storedHash) {
        // 简单的哈希验证（临时使用，与generateHash函数保持一致）
        let hash = 0;
        for (let i = 0; i < tempPwd.length; i++) {
            const char = tempPwd.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        const tempHash = hash.toString();
        
        if (tempHash === storedHash) {
            masterPassword = tempPwd;
            
            // 立即设置页面状态，不等待DOMContentLoaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    unlockUI();
                    // 解锁成功后再删除临时密码
                    sessionStorage.removeItem('tempMasterPassword');
                });
            } else {
                unlockUI();
                // 解锁成功后再删除临时密码
                sessionStorage.removeItem('tempMasterPassword');
            }
        }
    }
})();

// 解锁UI的辅助函数
function unlockUI() {
    const loginScreen = document.getElementById('loginScreen');
    const mainScreen = document.getElementById('mainScreen');
    
    if (loginScreen && mainScreen) {
        loginScreen.classList.remove('active');
        mainScreen.classList.add('active');
        loadPasswords();
        renderPasswords();
    }
}

// ===== 其余功能代码 =====

document.addEventListener('DOMContentLoaded', function() {
    // 只有未解锁时才执行首次设置和登录流程
    if (!masterPassword) {
        checkFirstTimeSetup();
        loadPasswords();
        renderPasswords();
    }
});

// 检查是否首次使用
function checkFirstTimeSetup() {
    const hashedMasterPassword = localStorage.getItem('masterPasswordHash');
    if (!hashedMasterPassword) {
        document.getElementById('setupSection').style.display = 'block';
    }
}

// 设置主密码
function setupMasterPassword() {
    const newPassword = document.getElementById('newMasterPassword').value;
    const confirmPassword = document.getElementById('confirmMasterPassword').value;
    
    if (!newPassword || !confirmPassword) {
        showNotification('请填写所有字段', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('两次输入的密码不一致', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('密码长度至少6位', 'error');
        return;
    }
    
    // 生成密码哈希
    const hash = generateHash(newPassword);
    localStorage.setItem('masterPasswordHash', hash);
    
    masterPassword = newPassword;
    document.getElementById('setupSection').style.display = 'none';
    showNotification('主密码设置成功', 'success');
    
    // 清空输入框
    document.getElementById('newMasterPassword').value = '';
    document.getElementById('confirmMasterPassword').value = '';
}

// 解锁密码库
function unlockVault() {
    const inputPassword = document.getElementById('masterPassword').value;
    
    if (!inputPassword) {
        showNotification('请输入主密码', 'error');
        return;
    }
    
    const storedHash = localStorage.getItem('masterPasswordHash');
    const inputHash = generateHash(inputPassword);
    
    if (inputHash === storedHash) {
        masterPassword = inputPassword;
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('mainScreen').classList.add('active');
        document.getElementById('masterPassword').value = '';
        loadPasswords();
        renderPasswords();
        showNotification('密码库已解锁', 'success');
    } else {
        showNotification('主密码错误', 'error');
    }
}

// 锁定密码库
function lockVault() {
    masterPassword = '';
    document.getElementById('mainScreen').classList.remove('active');
    document.getElementById('loginScreen').classList.add('active');
    showNotification('密码库已锁定', 'success');
}

// 生成密码哈希
function generateHash(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 转换为32位整数
    }
    return hash.toString();
}

// 加密数据（暂时禁用加密）
function encryptData(data) {
    // 暂时禁用加密，直接返回数据
    return data;
}

// 解密数据（暂时禁用解密）
function decryptData(encryptedData) {
    // 暂时禁用解密，直接返回数据
    return encryptedData;
}

// 加载密码数据
function loadPasswords() {
    const encryptedData = localStorage.getItem('encryptedPasswords');
    console.log('加载密码数据，localStorage中的数据长度:', encryptedData ? encryptedData.length : 0);
    
    if (encryptedData) {
        try {
            const decryptedData = decryptData(encryptedData);
            console.log('解密成功，解密后数据长度:', decryptedData.length);
            passwords = JSON.parse(decryptedData);
            console.log('密码数据加载成功，共', passwords.length, '条');
        } catch (error) {
            console.error('密码数据解密失败:', error);
            // 不解锁时不显示错误，避免用户困惑
            if (masterPassword) {
                showNotification('密码数据解密失败，请检查主密码是否正确', 'error');
            }
            passwords = [];
        }
    } else {
        console.log('localStorage中没有密码数据');
        passwords = [];
    }
}

// 保存密码数据
function savePasswords() {
    const data = JSON.stringify(passwords);
    console.log('保存密码数据，当前密码数量:', passwords.length);
    const encryptedData = encryptData(data);
    localStorage.setItem('encryptedPasswords', encryptedData);
    console.log('密码数据已保存到localStorage');
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
        <div class="password-item" onclick="togglePasswordDetails('${password.id}')">
            <div class="password-header">
                <div class="password-title copyable" onclick="event.stopPropagation(); copyToClipboard('${password.siteName}', '网站名称')" title="点击复制网站名称">${password.siteName}</div>
                <div class="password-actions" onclick="event.stopPropagation()">
                    <button class="btn-view" onclick="viewPassword('${password.id}')" title="查看详情">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-copy" onclick="copyPassword('${password.id}')" title="复制密码">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn-edit" onclick="editPassword('${password.id}')" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deletePassword('${password.id}')" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="password-details" id="details-${password.id}" style="display: none;">
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
                    <span class="password-text copyable" id="pwd-${password.id}" onclick="event.stopPropagation(); copyPassword('${password.id}')" title="点击复制密码">••••••••</span>
                    <button onclick="event.stopPropagation(); togglePasswordVisibility('pwd-${password.id}')" class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;">
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
    const password = passwords.find(p => `pwd-${p.id}` === elementId);
    
    if (element.textContent === '••••••••') {
        element.textContent = password.password;
    } else {
        element.textContent = '••••••••';
    }
}

// 显示添加密码模态框
function showAddPasswordModal() {
    document.getElementById('addPasswordModal').style.display = 'block';
    clearAddPasswordForm();
}

// 关闭添加密码模态框
function closeAddPasswordModal() {
    document.getElementById('addPasswordModal').style.display = 'none';
    clearAddPasswordForm();
}

// 清空添加密码表单
function clearAddPasswordForm() {
    document.getElementById('siteName').value = '';
    document.getElementById('siteUrl').value = '';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('category').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('attachment').value = '';
    document.getElementById('attachmentPreview').innerHTML = '';
}

// 保存密码
function savePassword() {
    console.log('savePassword函数被调用');
    
    // 确保先加载现有的密码数据
    loadPasswords();
    
    const siteName = document.getElementById('siteName').value.trim();
    const siteUrl = document.getElementById('siteUrl').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const category = document.getElementById('category').value;
    const notes = document.getElementById('notes').value.trim();
    const attachmentFile = document.getElementById('attachment').files[0];
    const expiryDate = document.getElementById('expiryDate') ? document.getElementById('expiryDate').value : '';
    
    console.log('表单数据:', {
        siteName,
        username,
        password: password ? '已填写' : '未填写',
        hasAttachment: !!attachmentFile
    });
    
    if (!siteName || !username || !password) {
        console.log('必填字段验证失败');
        showNotification('请填写必填字段', 'error');
        return;
    }
    
    const newPassword = {
        id: generateId(),
        siteName,
        siteUrl,
        username,
        password,
        category,
        notes,
        expiryDate,
        createdAt: new Date().toISOString()
    };
    
    // 处理图片附件
    if (attachmentFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newPassword.attachment = e.target.result;
            passwords.push(newPassword);
            savePasswords();
            // 检查是否在新页面
            if (window.location.pathname.includes('add-password.html')) {
                showNotification('密码保存成功', 'success');
                // 立即设置sessionStorage，然后跳转
                if (masterPassword) {
                    sessionStorage.setItem('tempMasterPassword', masterPassword);
                }
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                renderPasswords();
                closeAddPasswordModal();
                showNotification('密码保存成功', 'success');
            }
        };
        reader.readAsDataURL(attachmentFile);
    } else {
        console.log('无附件，直接保存');
        passwords.push(newPassword);
        savePasswords();
        console.log('密码已保存到localStorage');
        
        if (window.location.pathname.includes('add-password.html')) {
            console.log('在add-password页面，准备跳转');
            showNotification('密码保存成功', 'success');
            // 立即设置sessionStorage，然后跳转
            if (masterPassword) {
                sessionStorage.setItem('tempMasterPassword', masterPassword);
                console.log('已设置sessionStorage');
            } else {
                console.log('masterPassword为空，无法设置sessionStorage');
            }
            setTimeout(() => {
                console.log('开始跳转到主页');
                window.location.href = 'index.html';
            }, 1000);
        } else {
            console.log('在主页，更新UI');
            renderPasswords();
            closeAddPasswordModal();
            showNotification('密码保存成功', 'success');
        }
    }
}

// 编辑密码
function editPassword(id) {
    const password = passwords.find(p => p.id === id);
    if (!password) return;
    
    currentEditingId = id;
    document.getElementById('editSiteName').value = password.siteName || '';
    document.getElementById('editSiteUrl').value = password.siteUrl || '';
    document.getElementById('editUsername').value = password.username;
    document.getElementById('editPassword').value = password.password;
    document.getElementById('editCategory').value = password.category || '';
    document.getElementById('editNotes').value = password.notes || '';
    
    // 显示现有附件
    const preview = document.getElementById('editAttachmentPreview');
    if (password.attachment) {
        preview.innerHTML = `
            <img src="${password.attachment}" alt="附件">
            <button class="remove-image" onclick="removeAttachment('editAttachmentPreview')">删除附件</button>
        `;
    } else {
        preview.innerHTML = '';
    }
    
    document.getElementById('editPasswordModal').style.display = 'block';
}

// 关闭编辑密码模态框
function closeEditPasswordModal() {
    document.getElementById('editPasswordModal').style.display = 'none';
    currentEditingId = null;
}

// 更新密码
function updatePassword() {
    if (!currentEditingId) return;
    
    // 确保先加载现有的密码数据
    loadPasswords();
    
    const siteName = document.getElementById('editSiteName').value.trim();
    const siteUrl = document.getElementById('editSiteUrl').value.trim();
    const username = document.getElementById('editUsername').value.trim();
    const password = document.getElementById('editPassword').value;
    const category = document.getElementById('editCategory').value;
    const notes = document.getElementById('editNotes').value.trim();
    const attachmentFile = document.getElementById('editAttachment').files[0];
    
    if (!siteName || !username || !password) {
        showNotification('请填写必填字段', 'error');
        return;
    }
    
    const passwordIndex = passwords.findIndex(p => p.id === currentEditingId);
    if (passwordIndex !== -1) {
        const updatedPassword = {
            ...passwords[passwordIndex],
            siteName,
            siteUrl,
            username,
            password,
            category,
            notes,
            updatedAt: new Date().toISOString()
        };
        
        // 处理新的图片附件
        if (attachmentFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                updatedPassword.attachment = e.target.result;
                passwords[passwordIndex] = updatedPassword;
                savePasswords();
                if (window.location.pathname.includes('add-password.html')) {
                    showNotification('密码更新成功', 'success');
                    // 立即设置sessionStorage，然后跳转
                    if (masterPassword) {
                        sessionStorage.setItem('tempMasterPassword', masterPassword);
                    }
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    renderPasswords();
                    closeEditPasswordModal();
                    showNotification('密码更新成功', 'success');
                }
            };
            reader.readAsDataURL(attachmentFile);
        } else {
            passwords[passwordIndex] = updatedPassword;
            savePasswords();
            if (window.location.pathname.includes('add-password.html')) {
                showNotification('密码更新成功', 'success');
                // 立即设置sessionStorage，然后跳转
                if (masterPassword) {
                    sessionStorage.setItem('tempMasterPassword', masterPassword);
                }
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                renderPasswords();
                closeEditPasswordModal();
                showNotification('密码更新成功', 'success');
            }
        }
    }
}

// 删除密码
function deletePassword(id) {
    if (confirm('确定要删除这个密码吗？')) {
        // 确保先加载现有的密码数据
        loadPasswords();
        
        passwords = passwords.filter(p => p.id !== id);
        savePasswords();
        renderPasswords();
        showNotification('密码删除成功', 'success');
        // 跳转主页时自动解锁
        if (window.location.pathname.includes('password-detail.html') || window.location.pathname.includes('add-password.html')) {
            // 立即设置sessionStorage，然后跳转
            if (masterPassword) {
                sessionStorage.setItem('tempMasterPassword', masterPassword);
            }
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }
}

// 复制密码
function copyPassword(id) {
    const password = passwords.find(p => p.id === id);
    if (password) {
        navigator.clipboard.writeText(password.password).then(() => {
            showNotification('密码已复制到剪贴板', 'success');
        }).catch(() => {
            showNotification('复制失败', 'error');
        });
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

// 生成随机密码
function generatePassword(mode = 'add') {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    if (mode === 'add') {
        document.getElementById('password').value = password;
    } else if (mode === 'edit') {
        document.getElementById('editPassword').value = password;
    }
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

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 显示通知
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 键盘快捷键
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + N: 添加新密码
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        if (document.getElementById('mainScreen').classList.contains('active')) {
            showAddPasswordModal();
        }
    }
    
    // Ctrl/Cmd + L: 锁定密码库
    if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
        event.preventDefault();
        if (document.getElementById('mainScreen').classList.contains('active')) {
            lockVault();
        }
    }
    
    // Enter: 解锁密码库
    if (event.key === 'Enter' && document.getElementById('loginScreen').classList.contains('active')) {
        unlockVault();
    }
});

// 点击模态框外部关闭
window.onclick = function(event) {
    const addModal = document.getElementById('addPasswordModal');
    const editModal = document.getElementById('editPasswordModal');
    
    if (event.target === addModal) {
        closeAddPasswordModal();
    }
    if (event.target === editModal) {
        closeEditPasswordModal();
    }
}

// 自动锁定功能（30分钟无操作后自动锁定）
let autoLockTimer;
function resetAutoLockTimer() {
    clearTimeout(autoLockTimer);
    autoLockTimer = setTimeout(() => {
        if (document.getElementById('mainScreen').classList.contains('active')) {
            lockVault();
            showNotification('由于长时间无操作，密码库已自动锁定', 'error');
        }
    }, 30 * 60 * 1000); // 30分钟
}

// 监听用户活动
document.addEventListener('mousemove', resetAutoLockTimer);
document.addEventListener('keypress', resetAutoLockTimer);
document.addEventListener('click', resetAutoLockTimer);

// 导出密码数据为JSON文件
function exportPasswords() {
    if (!passwords.length) {
        showNotification('没有可导出的密码', 'error');
        return;
    }
    const dataStr = JSON.stringify(passwords, null, 2);
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
}

// 导入密码数据
function importPasswords(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (!Array.isArray(imported)) throw new Error('格式错误');
            // 合并导入（去重，按id）
            const existingIds = new Set(passwords.map(p => p.id));
            let added = 0;
            imported.forEach(item => {
                if (item.id && !existingIds.has(item.id)) {
                    passwords.push(item);
                    added++;
                }
            });
            savePasswords();
            renderPasswords();
            showNotification(`导入成功，共新增${added}条密码`, 'success');
        } catch (err) {
            showNotification('导入失败，文件格式错误', 'error');
        }
        // 清空文件选择
        event.target.value = '';
    };
    reader.readAsText(file);
}

// 调试数据功能
function debugData() {
    const hashedMasterPassword = localStorage.getItem('masterPasswordHash');
    const encryptedData = localStorage.getItem('encryptedPasswords');
    
    let debugInfo = '=== 密码管理器调试信息 ===\n\n';
    debugInfo += `主密码哈希: ${hashedMasterPassword ? '已设置' : '未设置'}\n`;
    debugInfo += `加密数据: ${encryptedData ? '存在' : '不存在'}\n`;
    debugInfo += `当前密码数量: ${passwords.length}\n`;
    debugInfo += `主密码状态: ${masterPassword ? '已设置' : '未设置'}\n`;
    
    if (encryptedData) {
        debugInfo += `加密数据长度: ${encryptedData.length} 字符\n`;
    }
    
    if (passwords.length > 0) {
        debugInfo += '\n前3个密码条目:\n';
        passwords.slice(0, 3).forEach((pwd, index) => {
            debugInfo += `${index + 1}. ${pwd.siteName} - ${pwd.username}\n`;
        });
    }
    
    console.log(debugInfo);
    alert(debugInfo);
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

// 图片预览功能
function previewImage(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const file = input.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <img src="${e.target.result}" alt="预览">
                <button class="remove-image" onclick="removeAttachment('${previewId}')">删除附件</button>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
}

// 删除附件
function removeAttachment(previewId) {
    const preview = document.getElementById(previewId);
    preview.innerHTML = '';
    
    // 清空对应的文件输入
    if (previewId === 'attachmentPreview') {
        document.getElementById('attachment').value = '';
    } else if (previewId === 'editAttachmentPreview') {
        document.getElementById('editAttachment').value = '';
    }
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
    
    // 点击背景关闭
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

// 查看密码详情
function viewPassword(id) {
    // 设置sessionStorage以便在详情页面保持解锁状态
    if (masterPassword) {
        sessionStorage.setItem('tempMasterPassword', masterPassword);
    }
    window.location.href = `password-detail.html?id=${id}`;
}

// 跳转到添加密码页面
function goToAddPassword() {
    // 设置sessionStorage以便在添加页面保持解锁状态
    if (masterPassword) {
        sessionStorage.setItem('tempMasterPassword', masterPassword);
    }
    window.location.href = 'add-password.html';
} 