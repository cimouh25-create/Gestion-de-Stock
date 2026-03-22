# Quick Start Guide - Authentication System

## ⚡ 5-Minute Setup

### 1. Start Backend (Terminal 1)
```bash
cd backend
python manage.py runserver
```
Server runs on: `http://localhost:8000`

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
App runs on: `http://localhost:5173`

### 3. Access the App
- Open browser to: `http://localhost:5173`
- You'll be redirected to **Sign In** page
- Click "S'inscrire" to create a new account

---

## 📋 Quick Features

### Sign Up
1. Go to Sign Up page
2. Fill in all required fields (*)
3. Password must be at least 8 characters
4. Choose role: **Lecteur** or **Gestionnaire**
5. Accept terms and click **S'inscrire**
6. You're logged in automatically! 🎉

### Sign In
1. Enter your username/email
2. Enter your password
3. Click **Se connecter**
4. Access the dashboard!

### Dashboard Features
- **Top-Right Profile Menu** (Desktop)
  - View your role
  - View your email
  - Settings
  - **LOGOUT**
  
- **Bottom Sidebar** (Desktop)
  - User profile at bottom
  - Quick role indicator

- **Mobile Menu** (if on phone)
  - Tap user icon for profile options

---

## 🔐 Sample Test Account

**Create this account to test:**
```
Username: testuser
Email: test@example.com
First Name: Test
Last Name: User
Password: TestPass123
Telephone: +33 6 12 34 56 78
Role: Lecteur
```

Then login with:
- Username: `testuser`
- Password: `TestPass123`

---

## 🎨 What's New

✅ Beautiful Sign In page with gradient  
✅ Beautiful Sign Up page with 2-column layout  
✅ Form validation (frontend + backend)  
✅ Real-time validation feedback  
✅ User profile in dashboard  
✅ Role badges with colors  
✅ Logout functionality  
✅ Protected routes (auto-redirect if not logged in)  
✅ Responsive design (mobile & desktop)  

---

## 📱 Responsive Design

### Desktop
- ✨ Top-right profile menu with dropdown
- ✨ Sidebar with user info at bottom
- ✨ Two-column layouts on forms
- ✨ Full feature access

### Mobile
- ✨ Touch-friendly buttons
- ✨ Simple profile menu
- ✨ Single-column layouts
- ✨ Hamburger menu

---

## 🚀 Next Page After Login

After successful login, you'll see:
1. **Dashboard** with sales overview
2. **Sidebar** with navigation menu
3. **Profile menu** in top-right (or hamburger on mobile)

---

## 🔗 Important URLs

| Page | URL |
|------|-----|
| Sign In | `http://localhost:5173/sign-in` |
| Sign Up | `http://localhost:5173/sign-up` |
| Dashboard | `http://localhost:5173/` |
| Sales | `http://localhost:5173/sales` |
| Products | `http://localhost:5173/products` |
| Clients | `http://localhost:5173/clients` |

---

## 🛠️ Common Tasks

### I forgot my password
- Click "Mot de passe oublié?" on Sign In page
- *(Feature coming soon)*

### I want to change my password
- Go to profile settings
- *(Feature coming soon)*

### I need to create more users
- Each person signs up at `/sign-up`
- Or admin can create via Django admin panel

### How do I logout?
- Click your profile (top-right on desktop)
- Click "Déconnexion" (red button)
- You'll be sent to Sign In page

---

## ❌ Troubleshooting

### "Can't connect to backend"
```
✓ Is backend running? (python manage.py runserver)
✓ Is it on port 8000?
✓ Check firewall
```

### "Sign In says invalid credentials"
```
✓ Did you create an account first?
✓ Are username/password correct?
✓ Check for CAPS LOCK
```

### "Can't access dashboard"
```
✓ You must be logged in
✓ Clear browser cache (Ctrl+Shift+Del)
✓ Sign in again
```

### "Page keeps redirecting to Sign In"
```
✓ Your token may have expired
✓ Sign in again
✓ Check browser localStorage (F12 → Application → storage)
```

---

## 🎯 Default Roles

| Role | Access |
|------|--------|
| **Lecteur** | Read-only access |
| **Gestionnaire** | Full read/write access |
| **Admin** | Full admin panel access (created manually) |

---

## 📚 Need More Info?

- Full documentation: See `AUTHENTICATION_GUIDE.md`
- Implementation details: See `AUTH_IMPLEMENTATION.md`
- API endpoints: See `AUTHENTICATION_GUIDE.md` → API Endpoints section

---

## 🎉 You're All Set!

Your authentication system is fully functional. Start by:
1. Running backend & frontend
2. Going to sign-up page
3. Creating a test account
4. Exploring the dashboard

**Happy coding! 🚀**
