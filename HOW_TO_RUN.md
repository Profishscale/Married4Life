# How to Run Marriaged4Life

## 🚀 Quick Start

Just run:
```bash
cd C:\married4life
START_APP.bat
```

This will open two windows:
1. **Backend server** (runs on port 5000)
2. **Mobile app** (runs on port 8081, shows QR code)

## 📱 On Your Phone

### Option 1: Expo Go App (Easiest)

1. Install **Expo Go** from App Store or Play Store
2. Open the mobile window (it shows a QR code)
3. Open Expo Go app
4. Tap "Scan QR code"
5. Scan the QR code from the mobile window
6. App loads!

### Option 2: Manual URL Entry

If QR code doesn't work:
1. Look for a URL like: `exp://192.168.0.148:8081`
2. In Expo Go, tap "Enter URL manually"
3. Enter the URL
4. Connect!

## 🌐 In Browser

If you want to test in browser:
1. In the mobile window, press **`w`** key
2. Browser opens automatically
3. App loads at http://localhost:8081

## ❌ Troubleshooting

### "Can't connect to backend"
- Make sure backend window shows "✅ Server running on port 5000"
- Check that both phone and computer are on same Wi-Fi

### "No QR code showing"
- The mobile window shows the QR code
- If not visible, look for connection URLs in the terminal

### "App crashes on load"
- Check backend is running
- Check browser console for errors
- Make sure all dependencies installed: `cd mobile && npm install`

## 🔧 Current Status

- ✅ Backend: Fixed import paths
- ✅ Assets: Removed problematic images
- ✅ Expo: Configured properly
- ✅ Both servers: Starting automatically

## 📍 Your Connection Info

- **Local IP:** 192.168.0.148
- **Backend:** http://localhost:5000
- **Mobile:** http://localhost:8081
- **Connection:** LAN mode (same Wi-Fi needed)

## 🎯 What You Should See

**In Mobile Window:**
```
█▀█▀▀ ██
█▀█▀▀ ██
█▀█▀▀ ██  <- QR Code here
```

Plus options:
- Press `w` → Open in web browser  
- Press `a` → Open on Android emulator
- Press `i` → Open on iOS simulator

**In Backend Window:**
```
✅ Server running on port 5000
Database initialized
```

## 📱 Testing Promo Codes

Once app loads, you can test:
1. Open Subscription screen
2. Enter promo code: `FULLACCESS-DEV-2025`
3. Tap Redeem
4. All features unlocked!

## 🛠️ Manual Commands (if batch doesn't work)

**Terminal 1 - Backend:**
```bash
cd C:\married4life\backend
npm run dev
```

**Terminal 2 - Mobile:**
```bash
cd C:\married4life\mobile
npx expo start
```

Then in the mobile terminal, you'll see the QR code!

