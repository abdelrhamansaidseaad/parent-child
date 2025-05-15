document.addEventListener('DOMContentLoaded', function() {
  // Application state
  const state = {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null
  };

  // DOM elements
  const elements = {
    tabs: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    registerForm: document.getElementById('registerForm'),
    loginForm: document.getElementById('loginForm'),
    generateCodeBtn: document.getElementById('generateCodeBtn'),
    linkParentForm: document.getElementById('linkParentForm'),
    logoutBtn: document.getElementById('logoutBtn'),
    refreshChildrenBtn: document.getElementById('refreshChildrenBtn'),
    childrenList: document.getElementById('childrenList'),
    parentInfo: document.getElementById('parentInfo'),
    parentUsername: document.getElementById('parentUsername'),
    parentId: document.getElementById('parentId'),
    childUsername: document.getElementById('childUsername'),
    childId: document.getElementById('childId'),
    parentInfoCard: document.getElementById('parentInfoCard')
  };

  // Initialize app
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

  // Setup event listeners
  function setupEventListeners() {
    // Tab switching
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', switchTab);
    });

    // Register form
    if (elements.registerForm) {
      elements.registerForm.addEventListener('submit', handleRegister);
    }

    // Login form
    if (elements.loginForm) {
      elements.loginForm.addEventListener('submit', handleLogin);
    }

    // Generate code
    if (elements.generateCodeBtn) {
      elements.generateCodeBtn.addEventListener('click', generateCode);
    }

    // Link to parent
    if (elements.linkParentForm) {
      elements.linkParentForm.addEventListener('submit', linkToParent);
    }

    // Logout
    if (elements.logoutBtn) {
      elements.logoutBtn.addEventListener('click', handleLogout);
    }

    // Refresh children list
    if (elements.refreshChildrenBtn) {
      elements.refreshChildrenBtn.addEventListener('click', loadParentData);
    }
  }

  // Switch tabs
  function switchTab(e) {
    const tabId = e.target.getAttribute('data-tab');
    
    // Update active tab
    elements.tabs.forEach(tab => {
      tab.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Show corresponding content
    elements.tabContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === tabId) {
        content.classList.add('active');
      }
    });
  }

  // Update UI based on auth state
  function updateUI() {
    const authElements = document.querySelectorAll('[data-auth]');
    
    authElements.forEach(el => {
      const authState = el.getAttribute('data-auth');
      
      switch(authState) {
        case 'authenticated':
          el.style.display = state.user ? 'block' : 'none';
          break;
        case 'not-authenticated':
          el.style.display = state.user ? 'none' : 'block';
          break;
        case 'parent':
          el.style.display = (state.user && state.user.role === 'parent') ? 'block' : 'none';
          break;
        case 'child':
          el.style.display = (state.user && state.user.role === 'child') ? 'block' : 'none';
          break;
      }
    });
  }

  // Handle register
  async function handleRegister(e) {
    e.preventDefault();
    const formData = {
      username: e.target.username.value,
      password: e.target.password.value,
      role: e.target.role.value
    };

    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        // Save token and user data
        state.token = result.token;
        state.user = result.data.user;
        
        localStorage.setItem('token', state.token);
        localStorage.setItem('user', JSON.stringify(state.user));
        
        updateUI();
        showAlert('تم التسجيل بنجاح!', 'success', 'register');
        
        // Redirect based on role
        if (state.user.role === 'parent') {
          loadParentData();
          switchToTab('parent');
        } else {
          loadChildData();
          switchToTab('child');
        }
      } else {
        showAlert(result.message || 'حدث خطأ أثناء التسجيل', 'error', 'register');
      }
    } catch (error) {
      showAlert('حدث خطأ في الاتصال بالخادم', 'error', 'register');
    }
  }

  // Handle login
  async function handleLogin(e) {
    e.preventDefault();
    const formData = {
      username: e.target.username.value,
      password: e.target.password.value
    };

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        // Save token and user data
        state.token = result.token;
        state.user = result.data.user;
        
        localStorage.setItem('token', state.token);
        localStorage.setItem('user', JSON.stringify(state.user));
        
        updateUI();
        showAlert('تم تسجيل الدخول بنجاح!', 'success', 'login');
        
        // Redirect based on role
        if (state.user.role === 'parent') {
          loadParentData();
          switchToTab('parent');
        } else {
          loadChildData();
          switchToTab('child');
        }
      } else {
        showAlert(result.message || 'بيانات الاعتماد غير صحيحة', 'error', 'login');
      }
    } catch (error) {
      showAlert('حدث خطأ في الاتصال بالخادم', 'error', 'login');
    }
  }

  // Generate code
  // async function generateCode() {
  //   try {
  //     const response = await fetch('/api/v1/parent/generate-code', {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${state.token}`
  //       }
  //     });

  //     const result = await response.json();

  //     if (response.ok) {
  //       const codeElement = document.createElement('div');
  //       codeElement.className = 'alert alert-success';
  //       codeElement.innerHTML = `
  //         <p><strong>كود الربط:</strong> ${result.data.code}</p>
  //         <p>ينتهي في: ${new Date(result.data.expiresAt).toLocaleString()}</p>
  //         <p>أعط هذا الكود للابن ليربط حسابه بحسابك</p>
  //       `;
        
  //       elements.codeResult.innerHTML = '';
  //       elements.codeResult.appendChild(codeElement);
  //     } else {
  //       showAlert(result.message || 'حدث خطأ أثناء إنشاء الكود', 'error', 'parent');
  //     }
  //   } catch (error) {
  //     showAlert('حدث خطأ في الاتصال بالخادم', 'error', 'parent');
  //   }
  // }
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
      // إنشاء عنصر لعرض الكود
      const codeElement = document.createElement('div');
      codeElement.className = 'alert alert-success';
      codeElement.innerHTML = `
        <h4>كود الربط</h4>
        <p><strong>الكود:</strong> ${result.data.code}</p>
       
      `;
      //  <p><strong>ينتهي في:</strong> ${new Date(result.data.expiresAt).toLocaleString()}</p>
      //   <p class="note">أعط هذا الكود للابن ليربط حسابه بحسابك</p>
      
      // مسح المحتوى السابق وإظهار الجديد
      const codeResult = document.getElementById('codeResult');
      codeResult.innerHTML = '';
      codeResult.appendChild(codeElement);
      
      // إظهار تنبيه نجاح
      showAlert('تم إنشاء كود الربط بنجاح!', 'success', 'parent');
    } else {
      showAlert(result.message || 'حدث خطأ أثناء إنشاء الكود', 'error', 'parent');
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert('حدث خطأ في الاتصال بالخادم', 'error', 'parent');
  }
}
  // Link to parent
  async function linkToParent(e) {
    e.preventDefault();
    const code = e.target.code.value;

    try {
      const response = await fetch('/api/v1/child/link-parent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({ code })
      });

      const result = await response.json();

      if (response.ok) {
        showAlert('تم الربط بالأب بنجاح!', 'success', 'child');
        loadChildData();
        elements.linkParentForm.reset();
      } else {
        showAlert(result.message || 'حدث خطأ أثناء الربط', 'error', 'child');
      }
    } catch (error) {
      showAlert('حدث خطأ في الاتصال بالخادم', 'error', 'child');
    }
  }

  // Load parent data
  // async function loadParentData() {
  //   try {
  //     const response = await fetch('/api/v1/parent/profile', {
  //       headers: {
  //         'Authorization': `Bearer ${state.token}`
  //       }
  //     });

  //     const result = await response.json();

  //     if (response.ok) {
  //       // Update parent info
  //       elements.parentUsername.textContent = `مرحباً ${result.data.user.username}`;
  //       elements.parentId.textContent = `ID: ${result.data.user.id}`;
        
  //       // Render children list
  //       renderChildrenList(result.data.user.children || []);
  //     } else {
  //       showAlert(result.message || 'حدث خطأ في تحميل بيانات الأب', 'error', 'parent');
  //     }
  //   } catch (error) {
  //     showAlert('حدث خطأ في الاتصال بالخادم', 'error', 'parent');
  //   }
  // }
  async function loadParentData() {
  try {
    const response = await fetch('/api/v1/parent/profile', {
      headers: {
        'Authorization': `Bearer ${state.token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'فشل في جلب البيانات');
    }

    const result = await response.json();
    
    // تحديث واجهة المستخدم
    elements.parentUsername.textContent = `مرحباً ${result.data.user.username}`;
    elements.parentId.textContent = `ID: ${result.data.user.id}`;
    
    // عرض الأبناء
    renderChildrenList(result.data.user.children);
    
  } catch (error) {
    console.error('Error loading parent data:', error);
    showAlert(error.message || 'حدث خطأ في جلب بيانات الأب', 'error', 'parent');
  }
}

function renderChildrenList(children = []) {
  const childrenList = document.getElementById('childrenList');
  childrenList.innerHTML = '';

  if (children.length === 0) {
    childrenList.innerHTML = `
      <li class="list-item no-children">
        <i class="fas fa-child"></i>
        <span>لا يوجد أبناء مرتبطين بعد</span>
      </li>
    `;
    return;
  }

  children.forEach(child => {
    const li = document.createElement('li');
    li.className = 'list-item child-item';
    li.innerHTML = `
      <div class="child-info">
        <span class="child-name">${child.username}</span>
        <span class="child-id">ID: ${child._id}</span>
        <span class="child-date">${child.createdAt}</span>
      </div>
    `;
    childrenList.appendChild(li);
  });
}

  // Render children list
  function renderChildrenList(children) {
    elements.childrenList.innerHTML = '';
    
    if (children.length > 0) {
      children.forEach(child => {
        const li = document.createElement('li');
        li.className = 'list-item';
        li.innerHTML = `
          <div class="child-info">
            <span class="child-name">${child.username}</span>
            <span class="child-id">ID: ${child._id}</span>
            <span class="child-date">${new Date(child.createdAt).toLocaleString()}</span>
          </div>
        `;
        elements.childrenList.appendChild(li);
      });
    } else {
      elements.childrenList.innerHTML = `
        <li class="list-item no-children">
          <i class="fas fa-child"></i>
          <span>لا يوجد أبناء مرتبطين بعد</span>
        </li>
      `;
    }
  }

  // Load child data
  async function loadChildData() {
    try {
      const response = await fetch('/api/v1/child/profile', {
        headers: {
          'Authorization': `Bearer ${state.token}`
        }
      });

      const result = await response.json();

      if (response.ok) {
        // Update child info
        elements.childUsername.textContent = `مرحباً ${result.data.user.username}`;
        elements.childId.textContent = `ID: ${result.data.user.id}`;
        
        // Show parent info if linked
        if (result.data.user.parent) {
          elements.parentInfoCard.style.display = 'block';
          elements.parentInfo.innerHTML = `
            <p><strong>اسم الأب:</strong> ${result.data.user.parent.username}</p>
            <p><strong>معرف الأب:</strong> ${result.data.user.parent._id}</p>
          `;
        } else {
          elements.parentInfoCard.style.display = 'none';
        }
      } else {
        showAlert(result.message || 'حدث خطأ في تحميل بيانات الابن', 'error', 'child');
      }
    } catch (error) {
      showAlert('حدث خطأ في الاتصال بالخادم', 'error', 'child');
    }
  }

  // Handle logout
  function handleLogout() {
    state.token = null;
    state.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateUI();
    switchToTab('login');
  }

  // Show alert message
  function showAlert(message, type, tabId) {
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type}`;
    alertElement.textContent = message;
    
    const resultElement = document.getElementById(`${tabId}Result`);
    if (resultElement) {
      resultElement.innerHTML = '';
      resultElement.appendChild(alertElement);
    }
  }

  // Switch to specific tab
  function switchToTab(tabId) {
    elements.tabs.forEach(tab => {
      tab.classList.remove('active');
      if (tab.getAttribute('data-tab') === tabId) {
        tab.classList.add('active');
      }
    });
    
    elements.tabContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === tabId) {
        content.classList.add('active');
      }
    });
  }

  // Start the app
  init();
});