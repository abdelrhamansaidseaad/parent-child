document.addEventListener('DOMContentLoaded', function() {
  // حالة التطبيق
  const appState = {
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user'))
  };

  // عناصر DOM
  const elements = {
    // النماذج
    registerForm: document.getElementById('registerForm'),
    loginForm: document.getElementById('loginForm'),
    linkParentForm: document.getElementById('linkParentForm'),
    
    // حقول الإدخال
    registerUsername: document.getElementById('registerUsername'),
    registerPassword: document.getElementById('registerPassword'),
    registerRole: document.getElementById('registerRole'),
    loginUsername: document.getElementById('loginUsername'),
    loginPassword: document.getElementById('loginPassword'),
    linkCode: document.getElementById('linkCode'),
    
    // الأزرار
    generateCodeBtn: document.getElementById('generateCodeBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    
    // مناطق النتائج
    registerResult: document.getElementById('registerResult'),
    loginResult: document.getElementById('loginResult'),
    codeResult: document.getElementById('codeResult'),
    linkResult: document.getElementById('linkResult'),
    
    // مناطق البيانات
    childrenList: document.getElementById('childrenList'),
    parentInfo: document.getElementById('parentInfo'),
    
    // التبويبات
    tabs: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content')
  };

  // تهيئة التطبيق
  function init() {
    setupEventListeners();
    updateUI();
    validateInputs();
    
    // إذا كان المستخدم مسجل الدخول، تحميل البيانات المناسبة
    if (appState.user) {
      loadUserData();
    }
  }

  // إعداد مستمعي الأحداث
  function setupEventListeners() {
    // أحداث التبويبات
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', switchTab);
    });

    // أحداث النماذج
    if (elements.registerForm) {
      elements.registerForm.addEventListener('submit', handleRegister);
    }
    
    if (elements.loginForm) {
      elements.loginForm.addEventListener('submit', handleLogin);
    }
    
    if (elements.linkParentForm) {
      elements.linkParentForm.addEventListener('submit', handleLinkParent);
    }

    // أحداث الأزرار
    if (elements.generateCodeBtn) {
      elements.generateCodeBtn.addEventListener('click', generateCode);
    }
    
    if (elements.logoutBtn) {
      elements.logoutBtn.addEventListener('click', handleLogout);
    }
  }

  // التحقق من صحة المدخلات
  function validateInputs() {
    // التحقق من اسم المستخدم أثناء الكتابة
    if (elements.registerUsername) {
      elements.registerUsername.addEventListener('input', function() {
        this.value = this.value.trim();
        validateUsername(this);
      });
    }
    
    if (elements.loginUsername) {
      elements.loginUsername.addEventListener('input', function() {
        this.value = this.value.trim();
      });
    }
  }

  // التحقق من صحة اسم المستخدم
  function validateUsername(inputElement) {
    const username = inputElement.value;
    const arabicLetters = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z0-9_]+$/;
    
    if (!arabicLetters.test(username)) {
      showAlert('مسموح فقط بالأحرف العربية/الإنجليزية والأرقام والشرطة السفلية', 'error', 'usernameError');
      inputElement.value = username.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z0-9_]/g, '');
    }
  }

  // تبديل التبويبات
  function switchTab(e) {
    const tabId = e.target.getAttribute('data-tab');
    
    // إزالة النشاط من جميع التبويبات
    elements.tabs.forEach(tab => tab.classList.remove('active'));
    elements.tabContents.forEach(content => content.classList.remove('active'));
    
    // إضافة النشاط للتبويب المحدد
    e.target.classList.add('active');
    document.getElementById(tabId).classList.add('active');
  }

  // تسجيل مستخدم جديد
  async function handleRegister(e) {
    e.preventDefault();
    const username = elements.registerUsername.value.trim();
    const password = elements.registerPassword.value;
    const role = elements.registerRole.value;

    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, role })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ أثناء التسجيل');
      }

      // حفظ حالة المستخدم
      appState.token = data.token;
      appState.user = data.data.user;
      saveAuthState();
      
      showAlert('تم التسجيل بنجاح!', 'success', 'registerResult');
      elements.registerForm.reset();
      updateUI();
      loadUserData();

    } catch (error) {
      showAlert(error.message, 'error', 'registerResult');
      console.error('Registration error:', error);
    }
  }

  // تسجيل الدخول
  async function handleLogin(e) {
    e.preventDefault();
    const username = elements.loginUsername.value.trim();
    const password = elements.loginPassword.value;

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'بيانات الاعتماد غير صحيحة');
      }

      // حفظ حالة المستخدم
      appState.token = data.token;
      appState.user = data.data.user;
      saveAuthState();
      
      showAlert('تم تسجيل الدخول بنجاح!', 'success', 'loginResult');
      elements.loginForm.reset();
      updateUI();
      loadUserData();

    } catch (error) {
      showAlert(error.message, 'error', 'loginResult');
      console.error('Login error:', error);
    }
  }

  // إنشاء كود ربط
  async function generateCode() {
  try {
    const response = await fetch('/api/v1/parent/generate-code', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) throw new Error(data.message || 'فشل إنشاء الكود');

    document.getElementById('codeResult').innerHTML = `
      <div class="alert success">
        <h3>كود الربط:</h3>
        <div class="code">${data.data.code}</div>
        <p>صلاحيته حتى: ${new Date(data.data.expiresAt).toLocaleString()}</p>
      </div>
    `;
  } catch (error) {
    document.getElementById('codeResult').innerHTML = `
      <div class="alert error">${error.message}</div>
    `;
  }
}

async function linkParent() {
  const code = document.getElementById('linkCode').value.trim();
  
  try {
    const response = await fetch('/api/v1/child/link-parent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code })
    });

    const data = await response.json();
    
    if (!response.ok) throw new Error(data.message || 'فشل عملية الربط');

    document.getElementById('linkResult').innerHTML = `
      <div class="alert success">
        تم الربط بنجاح مع الأب: ${data.parent.username}
      </div>
    `;
    
    // تحديث واجهة المستخدم
    loadUserData();
  } catch (error) {
    document.getElementById('linkResult').innerHTML = `
      <div class="alert error">${error.message}</div>
    `;
  }
}

  // ربط الابن بالأب
  async function handleLinkParent(e) {
    e.preventDefault();
    const code = elements.linkCode.value.trim();

    try {
      const response = await fetch('/api/v1/child/link-parent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${appState.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'كود الربط غير صالح');
      }

      showAlert(`تم الربط بنجاح مع الأب!`, 'success', 'linkResult');
      elements.linkParentForm.reset();
      loadUserData();

    } catch (error) {
      showAlert(error.message, 'error', 'linkResult');
      console.error('Link parent error:', error);
    }
  }

  // تسجيل الخروج
  function handleLogout() {
    appState.token = null;
    appState.user = null;
    clearAuthState();
    
    showAlert('تم تسجيل الخروج بنجاح', 'success', 'loginResult');
    updateUI();
  }

  // تحميل بيانات المستخدم حسب الدور
  async function loadUserData() {
    if (!appState.user) return;
    
    if (appState.user.role === 'parent') {
      await loadParentData();
    } else {
      await loadChildData();
    }
  }

  // تحميل بيانات الأب
  async function loadParentData() {
  try {
    const response = await fetch('/api/v1/parent/profile', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Cache-Control': 'no-cache' // إضافة هذا السطر
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      renderChildrenList(data.data.user.children || []);
    }
  } catch (error) {
    console.error('Failed to load parent data:', error);
  }
}

  // تحميل بيانات الابن
  async function loadChildData() {
    try {
      const response = await fetch('/api/v1/child/profile', {
        headers: {
          'Authorization': `Bearer ${appState.token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        renderParentInfo(data.parentId);
      }

    } catch (error) {
      console.error('Failed to load child data:', error);
    }
  }

  // عرض قائمة الأبناء
  function renderChildrenList(children) {
    elements.childrenList.innerHTML = '';
    
    if (children.length === 0) {
      elements.childrenList.innerHTML = '<li class="list-item">لا يوجد أبناء مرتبطين</li>';
      return;
    }

    children.forEach(child => {
      const li = document.createElement('li');
      li.className = 'list-item';
      li.innerHTML = `
        <span>${child.username}</span>
        <span>ID: ${child._id}</span>
      `;
      elements.childrenList.appendChild(li);
    });
  }

  // عرض معلومات الأب
  function renderParentInfo(parent) {
    if (!parent) {
      elements.parentInfo.innerHTML = '<p>غير مرتبط بأب</p>';
      return;
    }

    elements.parentInfo.innerHTML = `
      <div class="info-card">
        <h4>معلومات الأب</h4>
        <p><strong>اسم المستخدم:</strong> ${parent.username}</p>
        <p><strong>ID:</strong> ${parent._id}</p>
      </div>
    `;
  }

  // حفظ حالة المصادقة
  function saveAuthState() {
    localStorage.setItem('token', appState.token);
    localStorage.setItem('user', JSON.stringify(appState.user));
  }

  // مسح حالة المصادقة
  function clearAuthState() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // تحديث واجهة المستخدم حسب حالة المصادقة
  function updateUI() {
    const authElements = document.querySelectorAll('[data-auth]');
    
    authElements.forEach(el => {
      const requiredAuth = el.getAttribute('data-auth');
      let shouldShow = false;
      
      switch (requiredAuth) {
        case 'authenticated':
          shouldShow = !!appState.user;
          break;
        case 'not-authenticated':
          shouldShow = !appState.user;
          break;
        case 'parent':
          shouldShow = appState.user?.role === 'parent';
          break;
        case 'child':
          shouldShow = appState.user?.role === 'child';
          break;
      }
      
      el.style.display = shouldShow ? 'block' : 'none';
    });
  }

  // عرض رسائل التنبيه
  function showAlert(message, type, elementId) {
    const alertElement = document.getElementById(elementId);
    if (!alertElement) return;
    
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