document.addEventListener('DOMContentLoaded', function() {
  // حالة التطبيق
  const state = {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null
  };

  // عناصر DOM
  const elements = {
    tabs: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    registerForm: document.getElementById('registerForm'),
    loginForm: document.getElementById('loginForm'),
    generateCodeBtn: document.getElementById('generateCodeBtn'),
    linkParentForm: document.getElementById('linkParentForm'),
    logoutBtn: document.getElementById('logoutBtn'),
    childrenList: document.getElementById('childrenList'),
    parentInfo: document.getElementById('parentInfo')
  };

  // تهيئة التطبيق
  function init() {
    setupEventListeners();
    updateUI();
    
    if (state.user) {
      if (state.user.role === 'parent') {
        loadParentData();
      } else {
        loadChildData();
      }
    }
  }

  // إعداد مستمعي الأحداث
  function setupEventListeners() {
    // تبديل التبويبات
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', switchTab);
    });

    // تسجيل مستخدم جديد
    if (elements.registerForm) {
      elements.registerForm.addEventListener('submit', handleRegister);
    }

    // تسجيل الدخول
    if (elements.loginForm) {
      elements.loginForm.addEventListener('submit', handleLogin);
    }

    // إنشاء كود ربط
    if (elements.generateCodeBtn) {
      elements.generateCodeBtn.addEventListener('click', generateCode);
    }

    // ربط بالأب
    if (elements.linkParentForm) {
      elements.linkParentForm.addEventListener('submit', linkToParent);
    }

    // تسجيل الخروج
    if (elements.logoutBtn) {
      elements.logoutBtn.addEventListener('click', handleLogout);
    }
  }

  // تبديل التبويبات
  function switchTab(e) {
    const tabId = e.target.getAttribute('data-tab');
    
    elements.tabs.forEach(tab => tab.classList.remove('active'));
    elements.tabContents.forEach(content => content.classList.remove('active'));
    
    e.target.classList.add('active');
    document.getElementById(tabId).classList.add('active');
  }

  // تسجيل مستخدم جديد
  async function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      username: formData.get('username').trim(),
      password: formData.get('password'),
      role: formData.get('role')
    };

    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        showAlert('تم تسجيل المستخدم بنجاح', 'success', 'registerResult');
        e.target.reset();
      } else {
        showAlert(result.message || 'حدث خطأ أثناء التسجيل', 'error', 'registerResult');
      }
    } catch (error) {
      showAlert('حدث خطأ في الاتصال بالخادم', 'error', 'registerResult');
      console.error('Registration error:', error);
    }
  }

  // تسجيل الدخول
  async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      username: formData.get('username').trim(),
      password: formData.get('password')
    };

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        state.token = result.token;
        state.user = result.data.user;
        
        localStorage.setItem('token', state.token);
        localStorage.setItem('user', JSON.stringify(state.user));
        
        showAlert('تم تسجيل الدخول بنجاح', 'success', 'loginResult');
        e.target.reset();
        updateUI();
        
        if (state.user.role === 'parent') {
          loadParentData();
        } else {
          loadChildData();
        }
      } else {
        showAlert(result.message || 'بيانات الدخول غير صحيحة', 'error', 'loginResult');
      }
    } catch (error) {
      showAlert('حدث خطأ في الاتصال بالخادم', 'error', 'loginResult');
      console.error('Login error:', error);
    }
  }

  // إنشاء كود ربط
  async function generateCode() {
    try {
      const response = await fetch('/api/v1/parent/generate-code', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        showAlert(`كود الربط: <strong>${result.data.code}</strong><br>هذا الكود صالح لمدة ساعة`, 'success', 'codeResult');
      } else {
        showAlert(result.message || 'حدث خطأ أثناء إنشاء الكود', 'error', 'codeResult');
      }
    } catch (error) {
      showAlert('حدث خطأ في الاتصال بالخادم', 'error', 'codeResult');
      console.error('Generate code error:', error);
    }
  }

  // ربط بالأب
  async function linkToParent(e) {
    e.preventDefault();
    const code = e.target.code.value;

    try {
      const response = await fetch('/api/v1/child/link-parent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      const result = await response.json();

      if (response.ok) {
        showAlert(`تم الربط بنجاح مع الأب (ID: ${result.data.parentId})`, 'success', 'linkResult');
        e.target.reset();
        loadChildData();
      } else {
        showAlert(result.message || 'كود الربط غير صالح', 'error', 'linkResult');
      }
    } catch (error) {
      showAlert('حدث خطأ في الاتصال بالخادم', 'error', 'linkResult');
      console.error('Link to parent error:', error);
    }
  }

  // تسجيل الخروج
  function handleLogout() {
    state.token = null;
    state.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateUI();
    showAlert('تم تسجيل الخروج بنجاح', 'success', 'loginResult');
    switchToTab('login');
  }

  // تحميل بيانات الأب
  async function loadParentData() {
    try {
      const response = await fetch('/api/v1/parent/profile', {
        headers: {
          'Authorization': `Bearer ${state.token}`
        }
      });

      const result = await response.json();

      if (response.ok && elements.childrenList) {
        elements.childrenList.innerHTML = '';
        
        if (result.data.children && result.data.children.length > 0) {
          result.data.children.forEach(child => {
            const li = document.createElement('li');
            li.className = 'list-item';
            li.innerHTML = `
              <span>${child.username}</span>
              <span>ID: ${child._id}</span>
            `;
            elements.childrenList.appendChild(li);
          });
        } else {
          elements.childrenList.innerHTML = '<li class="list-item">لا يوجد أبناء مرتبطين</li>';
        }
      }
    } catch (error) {
      console.error('Error loading parent data:', error);
    }
  }

  // تحميل بيانات الابن
  async function loadChildData() {
    try {
      const response = await fetch('/api/v1/child/profile', {
        headers: {
          'Authorization': `Bearer ${state.token}`
        }
      });

      const result = await response.json();

      if (response.ok && elements.parentInfo) {
        if (result.data.parentId) {
          elements.parentInfo.innerHTML = `
            <div class="info-card">
              <h4>معلومات الأب</h4>
              <p><strong>اسم المستخدم:</strong> ${result.data.parentId.username}</p>
              <p><strong>ID:</strong> ${result.data.parentId._id}</p>
            </div>
          `;
        } else {
          elements.parentInfo.innerHTML = '<p>غير مرتبط بأب</p>';
        }
      }
    } catch (error) {
      console.error('Error loading child data:', error);
    }
  }

  // التبديل إلى تبويب معين
  function switchToTab(tabId) {
    elements.tabs.forEach(tab => tab.classList.remove('active'));
    elements.tabContents.forEach(content => content.classList.remove('active'));
    
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
  }

  // تحديث واجهة المستخدم حسب حالة المصادقة
  function updateUI() {
    const authElements = document.querySelectorAll('[data-auth]');
    
    authElements.forEach(el => {
      const requiredAuth = el.getAttribute('data-auth');
      
      if (requiredAuth === 'authenticated') {
        el.style.display = state.user ? 'block' : 'none';
      } else if (requiredAuth === 'not-authenticated') {
        el.style.display = state.user ? 'none' : 'block';
      } else if (requiredAuth === 'parent') {
        el.style.display = (state.user && state.user.role === 'parent') ? 'block' : 'none';
      } else if (requiredAuth === 'child') {
        el.style.display = (state.user && state.user.role === 'child') ? 'block' : 'none';
      }
    });
  }

  // عرض رسائل التنبيه
  function showAlert(message, type, elementId) {
    const alertElement = document.getElementById(elementId);
    alertElement.innerHTML = `
      <div class="alert alert-${type}">
        ${message}
      </div>
    `;
    
    setTimeout(() => {
      alertElement.innerHTML = '';
    }, 5000);
  }

  // بدء التطبيق
  init();
});