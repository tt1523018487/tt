// 全局变量
let currentUser = null;
let healthRecords = [];
let chatMode = 'health';
let trendsChart = null;
let recoveryPlan = null;
let dailyProgress = {
    nutrition: false,
    exercise: false
};
let labReports = [];
let userPoints = 0;
let dailyEducation = null;
let smartReminders = [];
let isVoiceRecording = false;

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkLoginStatus();
});

// 初始化应用
function initializeApp() {
    // 设置当前日期
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('zh-CN');
    
    // 加载本地数据
    loadHealthRecords();
    loadUserProfile();
    updateDashboard();
    
    // 生成每日内容
    generateDailyEducation();
    generateSmartReminders();
    
    // 加载康复计划和其他数据
    const saved = localStorage.getItem('recoveryPlan');
    if (saved) {
        recoveryPlan = JSON.parse(saved);
    }
    
    loadLabReports();
    loadUserPoints();
    generateDailyEducation();
    generateSmartReminders();
}

// 设置事件监听器
function setupEventListeners() {
    // 登录表单
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('sendCode').addEventListener('click', sendVerificationCode);
    
    // 健康记录表单
    document.getElementById('healthForm').addEventListener('submit', saveHealthRecord);
    
    // 疼痛和疲劳滑块
    const painSlider = document.querySelector('input[name="painLevel"]');
    const fatigueSlider = document.querySelector('input[name="fatigueLevel"]');
    const sleepSlider = document.querySelector('input[name="sleepQuality"]');
    
    painSlider.addEventListener('input', (e) => {
        document.getElementById('painValue').textContent = e.target.value;
    });
    
    fatigueSlider.addEventListener('input', (e) => {
        document.getElementById('fatigueValue').textContent = e.target.value;
    });
    
    sleepSlider.addEventListener('input', (e) => {
        document.getElementById('sleepValue').textContent = e.target.value;
    });
    
    // 底部导航
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const page = e.currentTarget.dataset.page;
            switchPage(page);
        });
    });
    
    // AI聊天
    document.getElementById('sendMessage').addEventListener('click', sendChatMessage);
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
    
    // 聊天模式切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchChatMode(e.target.dataset.mode);
        });
    });
    
    // 登出按钮
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

// 检查登录状态
function checkLoginStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
    } else {
        showLoginPage();
    }
}

// 显示登录页面
function showLoginPage() {
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('mainApp').classList.remove('active');
}

// 显示主应用
function showMainApp() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('mainApp').classList.add('active');
    document.getElementById('userName').textContent = currentUser?.name || '用户';
}

// 处理登录
function handleLogin(e) {
    e.preventDefault();
    const phone = document.getElementById('phone').value;
    const code = document.getElementById('verifyCode').value;
    
    if (!phone || !code) {
        alert('请填写完整信息');
        return;
    }
    
    // 模拟登录验证
    if (code === '1234') {
        currentUser = {
            phone: phone,
            name: '患者' + phone.slice(-4),
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMainApp();
        showNotification('登录成功', 'success');
    } else {
        alert('验证码错误');
    }
}

// 发送验证码
function sendVerificationCode() {
    const phone = document.getElementById('phone').value;
    if (!phone) {
        alert('请先输入手机号');
        return;
    }
    
    // 模拟发送验证码
    showNotification('验证码已发送（测试码：1234）', 'info');
    
    // 倒计时
    const btn = document.getElementById('sendCode');
    let countdown = 60;
    btn.disabled = true;
    
    const timer = setInterval(() => {
        btn.textContent = `${countdown}秒后重发`;
        countdown--;
        
        if (countdown < 0) {
            clearInterval(timer);
            btn.textContent = '发送验证码';
            btn.disabled = false;
        }
    }, 1000);
}

// 页面切换
function switchPage(pageName) {
    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
    
    // 更新页面内容
    document.querySelectorAll('.content-page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageName).classList.add('active');
    
    // 特殊页面处理
    if (pageName === 'trends') {
        updateTrendsChart();
    } else if (pageName === 'ai-chat') {
        initializeChat();
    } else if (pageName === 'recovery-plan') {
        updateRecoveryPlan();
    } else if (pageName === 'reports') {
        loadReportsHistory();
    }
}

// 保存健康记录
function saveHealthRecord(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const record = {
        id: Date.now(),
        date: new Date().toISOString(),
        heartRate: formData.get('heartRate'),
        weight: formData.get('weight'),
        temperature: formData.get('temperature'),
        systolic: formData.get('systolic'),
        diastolic: formData.get('diastolic'),
        painLevel: formData.get('painLevel'),
        fatigueLevel: formData.get('fatigueLevel'),
        sleepQuality: formData.get('sleepQuality'),
        appetite: formData.get('appetite'),
        mood: formData.get('mood'),
        steps: formData.get('steps'),
        wbc: formData.get('wbc'),
        hemoglobin: formData.get('hemoglobin'),
        platelet: formData.get('platelet'),
        albumin: formData.get('albumin')
    };
    
    healthRecords.push(record);
    localStorage.setItem('healthRecords', JSON.stringify(healthRecords));
    
    // 重置表单
    e.target.reset();
    document.getElementById('painValue').textContent = '0';
    document.getElementById('fatigueValue').textContent = '0';
    document.getElementById('sleepValue').textContent = '5';
    
    // 更新仪表板和康复计划
    updateDashboard();
    checkHealthAlerts(record);
    generateAdaptivePlan(record);
    
    // 增加积分
    addUserPoints(10, '每日记录体征');
    
    showNotification('记录保存成功，康复计划已更新', 'success');
    switchPage('dashboard');
}

// 加载健康记录
function loadHealthRecords() {
    const saved = localStorage.getItem('healthRecords');
    if (saved) {
        healthRecords = JSON.parse(saved);
    }
}

// 更新仪表板
function updateDashboard() {
    if (healthRecords.length === 0) return;
    
    const latest = healthRecords[healthRecords.length - 1];
    
    document.getElementById('lastHeartRate').textContent = latest.heartRate ? latest.heartRate + ' bpm' : '--';
    document.getElementById('lastWeight').textContent = latest.weight ? latest.weight + ' kg' : '--';
    document.getElementById('lastTemp').textContent = latest.temperature ? latest.temperature + ' °C' : '--';
}

// 健康警报检查
function checkHealthAlerts(record) {
    const alerts = [];
    
    if (record.heartRate && (record.heartRate < 60 || record.heartRate > 100)) {
        alerts.push({
            type: 'warning',
            message: `心率异常：${record.heartRate} bpm，建议咨询医生`
        });
    }
    
    if (record.temperature && record.temperature > 37.5) {
        alerts.push({
            type: 'danger',
            message: `体温偏高：${record.temperature} °C，请注意休息`
        });
    }
    
    if (record.systolic && record.diastolic) {
        if (record.systolic > 140 || record.diastolic > 90) {
            alerts.push({
                type: 'warning',
                message: `血压偏高：${record.systolic}/${record.diastolic} mmHg`
            });
        }
    }
    
    displayAlerts(alerts);
}

// 生成自适应康复计划
function generateAdaptivePlan(record) {
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const recentRecords = healthRecords.slice(-7);
    
    // 分析健康状况
    const healthStatus = analyzeHealthStatus(record, recentRecords, profile);
    
    // 生成个性化计划
    recoveryPlan = {
        nutrition: generateNutritionPlan(healthStatus),
        exercise: generateExercisePlan(healthStatus),
        tips: generateHealthTips(healthStatus),
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('recoveryPlan', JSON.stringify(recoveryPlan));
}

// 分析健康状况
function analyzeHealthStatus(record, recentRecords, profile) {
    const status = {
        stage: profile.stage || '康复期',
        riskFactors: [],
        strengths: [],
        needsAttention: []
    };
    
    // 血象分析
    if (record.wbc && record.wbc < 4.0) {
        status.riskFactors.push('白细胞偏低');
        status.needsAttention.push('增强免疫力');
    }
    
    if (record.hemoglobin && record.hemoglobin < 120) {
        status.riskFactors.push('血红蛋白偏低');
        status.needsAttention.push('补充铁质');
    }
    
    if (record.albumin && record.albumin < 35) {
        status.riskFactors.push('营养不良');
        status.needsAttention.push('增加蛋白质摄入');
    }
    
    // 体征分析
    if (record.painLevel && record.painLevel > 5) {
        status.riskFactors.push('疼痛较重');
    }
    
    if (record.fatigueLevel && record.fatigueLevel > 6) {
        status.riskFactors.push('疲劳明显');
    }
    
    if (record.sleepQuality && record.sleepQuality < 5) {
        status.riskFactors.push('睡眠质量差');
    }
    
    // 积极因素
    if (record.steps && record.steps > 5000) {
        status.strengths.push('运动量充足');
    }
    
    if (record.appetite === '很好' || record.appetite === '良好') {
        status.strengths.push('食欲良好');
    }
    
    return status;
}

// 生成营养计划
function generateNutritionPlan(healthStatus) {
    let plan = [];
    
    if (healthStatus.riskFactors.includes('白细胞偏低')) {
        plan.push('早餐：燕麦粥 + 鸡蛋 + 牛奶，增强免疫力');
        plan.push('午餐：瘦肉 + 绿叶菜 + 粗粮，促进造血功能');
    } else {
        plan.push('早餐：全麦面包 + 豆浆 + 水果');
        plan.push('午餐：鱼肉 + 蒸蛋 + 新鲜蔬菜');
    }
    
    if (healthStatus.riskFactors.includes('血红蛋白偏低')) {
        plan.push('加餐：红枣 + 桂圆 + 花生，补血养气');
    }
    
    if (healthStatus.riskFactors.includes('营养不良')) {
        plan.push('晚餐：鸡肉汤 + 豆腐 + 绿叶菜，高蛋白质配方');
    } else {
        plan.push('晚餐：清淡易消化，少量多餐');
    }
    
    return plan;
}

// 生成运动计划
function generateExercisePlan(healthStatus) {
    let plan = [];
    
    if (healthStatus.riskFactors.includes('白细胞偏低')) {
        plan.push('低强度散步 15-20分钟，避免过度疲劳');
        plan.push('室内拉伸运动，增强柔韧性');
    } else if (healthStatus.riskFactors.includes('疲劳明显')) {
        plan.push('轻度太极或瑜伽，缓解疲劳');
        plan.push('深呼吸练习 10分钟，放松身心');
    } else {
        plan.push('快走 30分钟，目标 6000-8000步');
        plan.push('力量训练：哑铃或弹力带运动');
    }
    
    if (healthStatus.riskFactors.includes('疼痛较重')) {
        plan.push('温和水中运动，减轻关节压力');
    }
    
    return plan;
}

// 生成健康提示
function generateHealthTips(healthStatus) {
    let tips = [];
    
    if (healthStatus.riskFactors.includes('睡眠质量差')) {
        tips.push('建议晚上9点后避免使用电子设备');
        tips.push('睡前可喝热牛奶或温水泡脚');
    }
    
    if (healthStatus.riskFactors.includes('疼痛较重')) {
        tips.push('疼痛评分超过5分时，建议及时联系医生');
        tips.push('可尝试冰敷或热敷缓解疼痛');
    }
    
    if (healthStatus.needsAttention.includes('增强免疫力')) {
        tips.push('避免到人群密集场所，注意个人卫生');
        tips.push('保持充足睡眠，增强身体抵抗力');
    }
    
    tips.push('定期复查，及时与医生沟通病情变化');
    
    return tips;
}

// 更新康复计划页面
function updateRecoveryPlan() {
    const saved = localStorage.getItem('recoveryPlan');
    if (saved) {
        recoveryPlan = JSON.parse(saved);
    } else {
        // 生成默认计划
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const defaultStatus = { stage: profile.stage || '康复期', riskFactors: [], strengths: [], needsAttention: [] };
        recoveryPlan = {
            nutrition: generateNutritionPlan(defaultStatus),
            exercise: generateExercisePlan(defaultStatus),
            tips: generateHealthTips(defaultStatus)
        };
    }
    
    // 更新页面内容
    document.getElementById('nutritionPlan').innerHTML = recoveryPlan.nutrition.map(item => 
        `<div class="plan-item">${item}</div>`
    ).join('');
    
    document.getElementById('exercisePlan').innerHTML = recoveryPlan.exercise.map(item => 
        `<div class="plan-item">${item}</div>`
    ).join('');
    
    document.getElementById('healthTips').innerHTML = recoveryPlan.tips.map(item => 
        `<div class="plan-item">${item}</div>`
    ).join('');
    
    // 更新进度
    updateDailyProgress();
}

// 更新每日进度
function updateDailyProgress() {
    const today = new Date().toDateString();
    const savedProgress = localStorage.getItem(`progress_${today}`);
    
    if (savedProgress) {
        dailyProgress = JSON.parse(savedProgress);
    } else {
        dailyProgress = { nutrition: false, exercise: false };
    }
    
    // 更新进度条
    const nutritionFill = document.querySelector('.progress-item:nth-child(1) .progress-fill');
    const exerciseFill = document.querySelector('.progress-item:nth-child(2) .progress-fill');
    const nutritionBtn = document.querySelector('.progress-item:nth-child(1) .mark-done');
    const exerciseBtn = document.querySelector('.progress-item:nth-child(2) .mark-done');
    
    if (nutritionFill && exerciseFill) {
        nutritionFill.style.width = dailyProgress.nutrition ? '100%' : '0%';
        exerciseFill.style.width = dailyProgress.exercise ? '100%' : '0%';
        
        nutritionBtn.disabled = dailyProgress.nutrition;
        exerciseBtn.disabled = dailyProgress.exercise;
        
        if (dailyProgress.nutrition) nutritionBtn.textContent = '已完成';
        if (dailyProgress.exercise) exerciseBtn.textContent = '已完成';
    }
}

// 标记进度完成
function markProgress(type) {
    dailyProgress[type] = true;
    const today = new Date().toDateString();
    localStorage.setItem(`progress_${today}`, JSON.stringify(dailyProgress));
    
    updateDailyProgress();
    showNotification(`${type === 'nutrition' ? '营养计划' : '运动计划'}已完成！`, 'success');
    
    // 检查是否全部完成
    if (dailyProgress.nutrition && dailyProgress.exercise) {
        setTimeout(() => {
            showNotification('今日康复任务全部完成！继续加油！🎉', 'success');
        }, 1000);
    }
}

// 生成每日健康教育内容
function generateDailyEducation() {
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const stage = profile.stage || '康复期';
    
    const educationContent = {
        '术前': {
            title: '术前准备：营养与心理调适',
            summary: '手术前的营养储备和心理准备对术后康复至关重要...',
            content: '手术前的营养储备和心理准备对术后康复至关重要。建议增加蛋白质摄入，保持充足睡眠，进行适度运动以增强体质。同时要保持积极心态，与医生充分沟通，了解手术过程和注意事项。'
        },
        '术后': {
            title: '术后康复：伤口护理与功能锻炼',
            summary: '术后早期康复对预防并发症、促进功能恢复具有重要意义...',
            content: '术后早期康复对预防并发症、促进功能恢复具有重要意义。注意伤口清洁干燥，按医嘱进行功能锻炼。饮食应循序渐进，从流质到半流质再到普食。适当活动有助于预防血栓形成。'
        },
        '化疗中': {
            title: '化疗期间：副作用管理与营养支持',
            summary: '化疗期间合理的营养支持和副作用管理能提高治疗耐受性...',
            content: '化疗期间合理的营养支持和副作用管理能提高治疗耐受性。多食用高蛋白、高维生素食物，少量多餐。注意口腔卫生，预防感染。如出现恶心呕吐，可尝试生姜茶或少量多次进食。'
        },
        '放疗中': {
            title: '放疗期间：皮肤护理与疲劳管理',
            summary: '放疗期间的皮肤护理和疲劳管理是治疗成功的关键...',
            content: '放疗期间的皮肤护理和疲劳管理是治疗成功的关键。放疗部位皮肤要保持清洁，避免摩擦，使用温和的护肤品。合理安排作息，保证充足睡眠。适度运动有助于缓解疲劳。'
        },
        '康复期': {
            title: '康复期指导：生活方式与定期随访',
            summary: '康复期是重建健康生活方式的重要阶段...',
            content: '康复期是重建健康生活方式的重要阶段。建立规律的作息时间，坚持适度运动，保持营养均衡。定期复查不可忽视，及时发现问题。保持积极心态，参与社交活动，重建生活信心。'
        }
    };
    
    dailyEducation = educationContent[stage] || educationContent['康复期'];
    
    // 更新页面显示
    const educationCard = document.getElementById('educationCard');
    if (educationCard) {
        educationCard.querySelector('.education-content').textContent = dailyEducation.summary;
    }
}

// 生成智能提醒
function generateSmartReminders() {
    smartReminders = [];
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const latestRecord = healthRecords.length > 0 ? healthRecords[healthRecords.length - 1] : null;
    
    // 基于治疗阶段的提醒
    if (profile.stage === '化疗中') {
        smartReminders.push({
            type: 'urgent',
            icon: 'fas fa-vial',
            message: '化疗后第3天，建议进行血常规检查'
        });
    }
    
    // 基于健康数据的提醒
    if (latestRecord) {
        if (latestRecord.wbc && latestRecord.wbc < 4.0) {
            smartReminders.push({
                type: 'urgent',
                icon: 'fas fa-shield-alt',
                message: '白细胞偏低，请避免到人群密集场所，注意个人卫生'
            });
        }
        
        if (latestRecord.painLevel && latestRecord.painLevel > 6) {
            smartReminders.push({
                type: 'normal',
                icon: 'fas fa-pills',
                message: '疼痛程度较高，建议联系医生调整止痛方案'
            });
        }
    }
    
    // 通用提醒
    smartReminders.push({
        type: 'normal',
        icon: 'fas fa-water',
        message: '记得多饮水，每日至少8杯水'
    });
    
    smartReminders.push({
        type: 'normal',
        icon: 'fas fa-moon',
        message: '保持规律作息，建议晚上10点前入睡'
    });
    
    // 更新页面显示
    updateRemindersDisplay();
}

// 更新提醒显示
function updateRemindersDisplay() {
    const reminderList = document.getElementById('reminderList');
    if (reminderList && smartReminders.length > 0) {
        reminderList.innerHTML = smartReminders.map(reminder => `
            <div class="reminder-item ${reminder.type}">
                <i class="${reminder.icon}"></i>
                <span>${reminder.message}</span>
            </div>
        `).join('');
    }
}

// 显示教育详情
function showEducationDetail() {
    if (dailyEducation) {
        document.getElementById('educationTitle').textContent = dailyEducation.title;
        document.getElementById('educationFullContent').textContent = dailyEducation.content;
        document.getElementById('educationModal').style.display = 'block';
    }
}

// 关闭教育模态框
function closeEducationModal() {
    document.getElementById('educationModal').style.display = 'none';
}

// 点赞教育内容
function likeEducation() {
    addUserPoints(5, '阅读健康文章');
    showNotification('感谢您的点赞！', 'success');
    closeEducationModal();
}

// 收藏教育内容
function collectEducation() {
    addUserPoints(5, '收藏健康文章');
    showNotification('已收藏到我的文章', 'success');
    closeEducationModal();
}

// 上传报告
function uploadReport(input) {
    const file = input.files[0];
    if (file) {
        const report = {
            id: Date.now(),
            name: file.name,
            type: file.type.includes('pdf') ? 'PDF报告' : '图片报告',
            date: new Date().toLocaleDateString('zh-CN'),
            file: file
        };
        
        labReports.push(report);
        localStorage.setItem('labReports', JSON.stringify(labReports.map(r => ({...r, file: null}))));
        
        showNotification('报告上传成功', 'success');
        loadReportsHistory();
        
        // 模拟AI解读
        setTimeout(() => {
            generateAIInterpretation(report);
        }, 2000);
    }
}

// 保存检验结果
function saveLabResults() {
    const labData = {
        id: Date.now(),
        date: new Date().toLocaleDateString('zh-CN'),
        type: '手动录入',
        cea: document.getElementById('cea').value,
        ca199: document.getElementById('ca199').value,
        alt: document.getElementById('alt').value,
        creatinine: document.getElementById('creatinine').value
    };
    
    labReports.push(labData);
    localStorage.setItem('labReports', JSON.stringify(labReports));
    
    // 清空输入
    ['cea', 'ca199', 'alt', 'creatinine'].forEach(id => {
        document.getElementById(id).value = '';
    });
    
    showNotification('检验数据保存成功', 'success');
    loadReportsHistory();
    generateAIInterpretation(labData);
}

// 加载报告历史
function loadReportsHistory() {
    const reportsList = document.getElementById('reportsList');
    if (reportsList) {
        if (labReports.length === 0) {
            reportsList.innerHTML = '暂无报告记录';
        } else {
            reportsList.innerHTML = labReports.map(report => `
                <div class="report-item">
                    <div>
                        <div class="report-date">${report.date}</div>
                        <div class="report-type">${report.type}</div>
                    </div>
                    <button class="view-report" onclick="viewReport(${report.id})">
                        查看详情
                    </button>
                </div>
            `).join('');
        }
    }
}

// 生成AI解读
function generateAIInterpretation(report) {
    let interpretation = 'AI正在分析您的检查结果...';
    
    if (report.cea || report.ca199 || report.alt || report.creatinine) {
        interpretation = '根据您的检验结果分析：';
        
        if (report.cea && parseFloat(report.cea) > 5) {
            interpretation += '\n• CEA水平略高，建议密切随访，结合影像学检查评估。';
        }
        
        if (report.alt && parseFloat(report.alt) > 40) {
            interpretation += '\n• 肝功能指标偏高，建议注意休息，避免肝毒性药物。';
        }
        
        if (report.creatinine && parseFloat(report.creatinine) > 110) {
            interpretation += '\n• 肾功能指标需关注，建议多饮水，避免肾毒性药物。';
        }
        
        if (interpretation === '根据您的检验结果分析：') {
            interpretation += '\n• 各项指标基本正常，请继续保持良好的生活习惯。';
        }
        
        interpretation += '\n\n请注意：此解读仅供参考，具体情况请咨询您的主治医生。';
    }
    
    const interpretationElement = document.querySelector('.interpretation-content');
    if (interpretationElement) {
        interpretationElement.textContent = interpretation;
    }
}

// 加载检验报告
function loadLabReports() {
    const saved = localStorage.getItem('labReports');
    if (saved) {
        labReports = JSON.parse(saved);
    }
}

// 积分系统
function loadUserPoints() {
    const saved = localStorage.getItem('userPoints');
    if (saved) {
        userPoints = parseInt(saved);
    }
    updatePointsDisplay();
}

function addUserPoints(points, reason) {
    userPoints += points;
    localStorage.setItem('userPoints', userPoints.toString());
    updatePointsDisplay();
    showNotification(`获得${points}积分：${reason}`, 'success');
}

function updatePointsDisplay() {
    const pointsElement = document.getElementById('userPoints');
    if (pointsElement) {
        pointsElement.textContent = userPoints;
    }
}

// 医生问诊功能
function openDoctorChat() {
    document.getElementById('doctorChat').style.display = 'flex';
}

function closeDoctorChat() {
    document.getElementById('doctorChat').style.display = 'none';
}

function sendDoctorMessage() {
    const input = document.getElementById('doctorMessageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const messagesContainer = document.getElementById('doctorMessages');
    
    // 添加用户消息
    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.innerHTML = `<div class="message-content">${message}</div>`;
    messagesContainer.appendChild(userMessage);
    
    input.value = '';
    
    // 模拟医生回复
    setTimeout(() => {
        const doctorMessage = document.createElement('div');
        doctorMessage.className = 'message doctor';
        doctorMessage.innerHTML = `<div class="message-content">感谢您的咨询，我已收到您的信息。根据您的描述，建议您注意休息，如有异常请及时复诊。具体用药调整需要面诊确定。</div>`;
        messagesContainer.appendChild(doctorMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 2000);
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 语音输入功能
function toggleVoiceInput() {
    const voiceBtn = document.getElementById('voiceBtn');
    
    if (!isVoiceRecording) {
        // 开始录音
        isVoiceRecording = true;
        voiceBtn.classList.add('recording');
        voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
        
        // 模拟语音识别
        setTimeout(() => {
            const messageInput = document.getElementById('messageInput');
            messageInput.value = '我最近感觉有些疲劳，这正常吗？';
            stopVoiceInput();
        }, 3000);
        
        showNotification('正在录音...', 'info');
    } else {
        stopVoiceInput();
    }
}

function stopVoiceInput() {
    const voiceBtn = document.getElementById('voiceBtn');
    isVoiceRecording = false;
    voiceBtn.classList.remove('recording');
    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    showNotification('录音完成', 'success');
}

// 显示警报
function displayAlerts(alerts) {
    const container = document.getElementById('alertsContainer');
    container.innerHTML = '';
    
    alerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alert.type}`;
        alertDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            ${alert.message}
        `;
        container.appendChild(alertDiv);
    });
}

// 更新趋势图表
function updateTrendsChart() {
    const ctx = document.getElementById('trendsChart').getContext('2d');
    
    if (trendsChart) {
        trendsChart.destroy();
    }
    
    const last7Days = healthRecords.slice(-7);
    const labels = last7Days.map(record => new Date(record.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
    
    trendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '心率',
                data: last7Days.map(r => r.heartRate || null),
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                tension: 0.4
            }, {
                label: '体重',
                data: last7Days.map(r => r.weight || null),
                borderColor: '#4ecdc4',
                backgroundColor: 'rgba(78, 205, 196, 0.1)',
                tension: 0.4,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: '心率 (bpm)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: '体重 (kg)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
    
    updateTrendSummary();
}

// 更新趋势摘要
function updateTrendSummary() {
    const container = document.getElementById('trendSummary');
    
    if (healthRecords.length < 2) {
        container.innerHTML = '<p>数据不足，请继续记录以查看趋势分析</p>';
        return;
    }
    
    const recent = healthRecords.slice(-7);
    const avgHeartRate = recent.filter(r => r.heartRate).reduce((sum, r) => sum + parseFloat(r.heartRate), 0) / recent.filter(r => r.heartRate).length;
    const avgWeight = recent.filter(r => r.weight).reduce((sum, r) => sum + parseFloat(r.weight), 0) / recent.filter(r => r.weight).length;
    
    container.innerHTML = `
        <h3>7天趋势分析</h3>
        <div class="trend-stats">
            <div class="trend-item">
                <span class="trend-label">平均心率：</span>
                <span class="trend-value">${avgHeartRate.toFixed(1)} bpm</span>
            </div>
            <div class="trend-item">
                <span class="trend-label">平均体重：</span>
                <span class="trend-value">${avgWeight.toFixed(1)} kg</span>
            </div>
        </div>
    `;
}

// 初始化聊天
function initializeChat() {
    const messages = document.getElementById('chatMessages');
    if (messages.children.length === 0) {
        addChatMessage('ai', '您好！我是您的AI健康助手。有什么可以帮助您的吗？');
    }
}

// 切换聊天模式
function switchChatMode(mode) {
    chatMode = mode;
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    const messages = document.getElementById('chatMessages');
    messages.innerHTML = '';
    
    if (mode === 'health') {
        addChatMessage('ai', '我是您的健康咨询助手，可以为您解答关于康复、用药、饮食等问题。');
    } else {
        addChatMessage('ai', '我是您的心理支持助手，愿意倾听您的心声，为您提供情感支持。');
    }
}

// 发送聊天消息
function sendChatMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addChatMessage('user', message);
    input.value = '';
    
    // 模拟AI回复
    setTimeout(() => {
        const aiResponse = generateAIResponse(message, chatMode);
        addChatMessage('ai', aiResponse);
    }, 1000);
}

// 添加聊天消息
function addChatMessage(sender, content) {
    const messages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    messageDiv.innerHTML = `
        <div class="message-content">${content}</div>
    `;
    
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

// 生成AI回复
function generateAIResponse(message, mode) {
    // 获取最新健康数据用于个性化回复
    const latestRecord = healthRecords.length > 0 ? healthRecords[healthRecords.length - 1] : null;
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    
    if (mode === 'health') {
        // 基于实际数据的健康建议
        if (latestRecord) {
            if (latestRecord.wbc && latestRecord.wbc < 4.0) {
                return '根据您的白细胞数值偏低，建议增加蛋白质摄入，避免生食，注意休息。如有发热等症状请及时就医。';
            }
            if (latestRecord.painLevel && latestRecord.painLevel > 6) {
                return '您的疼痛程度较高，建议及时与医生沟通调整止痛方案。同时可尝试放松技巧和温和的伸展运动。';
            }
            if (latestRecord.fatigueLevel && latestRecord.fatigueLevel > 7) {
                return '疲劳感较重时，请适当减少活动强度，保证充足睡眠。可尝试分次少量进食，增加营养密度。';
            }
        }
        
        const healthResponses = [
            '根据您的描述，建议您保持规律作息，适量运动。如有持续不适，请及时就医。',
            '康复期间要注意营养均衡，多吃新鲜蔬果，避免辛辣刺激食物。',
            '定期复查很重要，请按医嘱进行相关检查，有异常及时联系医生。',
            '适度的运动有助于康复，建议从散步开始，逐渐增加运动量。'
        ];
        return healthResponses[Math.floor(Math.random() * healthResponses.length)];
    } else {
        // 心理支持模式
        if (latestRecord && latestRecord.mood) {
            if (latestRecord.mood === '很差' || latestRecord.mood === '较差') {
                return '我注意到您最近的心情不太好，这在康复过程中是很正常的。请记住，每一小步的进步都值得鼓励。不如试试深呼吸或听听轻柔的音乐？';
            }
        }
        
        const psychologyResponses = [
            '我理解您现在的感受，这是很正常的情绪反应。请记住，您并不孤单。',
            '每一天的坚持都是勇敢的表现，您已经做得很好了。',
            '焦虑和担心是可以理解的，试试深呼吸，专注当下的美好。',
            '康复是一个过程，请对自己耐心一些，相信自己的力量。'
        ];
        return psychologyResponses[Math.floor(Math.random() * psychologyResponses.length)];
    }
}

// 保存个人资料
function saveProfile() {
    const profile = {
        name: document.getElementById('profileName').value,
        age: document.getElementById('profileAge').value,
        diagnosis: document.getElementById('profileDiagnosis').value,
        stage: document.getElementById('profileStage').value
    };
    
    localStorage.setItem('userProfile', JSON.stringify(profile));
    showNotification('资料保存成功', 'success');
}

// 加载用户资料
function loadUserProfile() {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
        const profile = JSON.parse(saved);
        document.getElementById('profileName').value = profile.name || '';
        document.getElementById('profileAge').value = profile.age || '';
        document.getElementById('profileDiagnosis').value = profile.diagnosis || '';
        document.getElementById('profileStage').value = profile.stage || '';
    }
}

// 登出
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showLoginPage();
    showNotification('已安全退出', 'info');
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'danger' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'danger' ? '#721c24' : '#0c5460'};
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
