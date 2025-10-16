# Donation Features Documentation

## Overview

Elementor Copier includes ethical, non-intrusive donation encouragement features that respect users while supporting development.

## Features Implemented

### 1. Welcome Message (First Install Only)
- Shows once when the extension is first installed
- Welcomes users and explains the extension is free and open-source
- Provides quick start instructions
- **Non-intrusive**: Dismissible notification, shown only once

### 2. Usage Counter
- Tracks how many elements users have copied
- Displayed in the extension popup
- Helps users see the value they're getting from the extension
- **Privacy**: All data stored locally, never sent anywhere

### 3. Milestone Celebrations
- Shows congratulatory messages at usage milestones:
  - 10 copies: "You've used Elementor Copier 10 times! 🎉"
  - 50 copies: "Wow! 50 copies and counting! 🚀"
  - 100 copies: "Amazing! 100 elements copied! 💯"
  - 250 copies: "Incredible! 250 uses! You're a power user! ⭐"
  - 500 copies: "Legendary! 500 copies! Thank you! 🏆"
- Each milestone shown only once
- Includes gentle reminder about supporting development
- **Non-intrusive**: Brief notification with option to support or dismiss

### 4. Periodic Donation Reminders
- Shows every 7 days after first install
- Reminds users about donation option
- Shows total usage count to demonstrate value
- **Completely dismissible**: Users can click "Remind Me Later"
- **Respectful timing**: Only checks every 25 uses to avoid spam
- **Never blocks functionality**: Extension works fully regardless of donation

### 5. Support Section in Popup
- Prominent but tasteful section in extension popup
- Shows:
  - Total elements copied
  - Days since installation
  - User milestone badge (Power User, Super User, etc.)
  - Bitcoin donation address with one-click copy
  - Link to donation information
- **Always accessible**: Users can donate anytime they want
- **Visual feedback**: Badge changes based on usage (Active User, Power User, Legendary User)

### 6. User Badges
Based on usage, users earn badges:
- **Free & Open Source** (default)
- **🚀 Active User** (50+ copies)
- **💯 Super User** (100+ copies)
- **⭐ Power User** (250+ copies)
- **🏆 Legendary User** (500+ copies)

## Ethical Design Principles

### ✅ What We Do
- Show appreciation for users at milestones
- Provide easy access to donation information
- Track usage locally to show value
- Remind users periodically (every 7 days)
- Make Bitcoin address easy to copy
- Celebrate user achievements

### ❌ What We DON'T Do
- Never block functionality
- Never require payment
- Never nag excessively
- Never send data to external servers
- Never show intrusive popups
- Never guilt-trip users
- Never track users online
- Never sell user data

## Technical Implementation

### Files
- `donation-manager.js` - Core donation tracking logic
- `background.js` - Integration with extension lifecycle
- `popup.html` - Support section UI
- `popup.css` - Support section styling
- `popup.js` - Support section functionality

### Storage
All data stored in `chrome.storage.local`:
```javascript
{
  firstInstallDate: "2024-01-01T00:00:00.000Z",
  donationData: {
    usageCount: 42,
    lastReminderDate: "2024-01-08T00:00:00.000Z",
    reminderDismissCount: 2,
    hasShownWelcome: true,
    thankYouShown: [10, 50]
  }
}
```

### Privacy
- **100% Local**: All data stored locally in browser
- **No Tracking**: No analytics, no external calls
- **No PII**: No personal information collected
- **Transparent**: Open source, anyone can verify

## Configuration

Donation settings in `donation-manager.js`:
```javascript
const DONATION_CONFIG = {
  reminderInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
  usageThresholds: [10, 50, 100, 250, 500], // Milestone celebrations
  bitcoinAddress: 'bc1qwncc5gfrzt0hwhwt9ad9vyv6eg8gxk4wlg6atm'
};
```

## User Experience Flow

### First Time User
1. Installs extension
2. Sees welcome notification (dismissible)
3. Uses extension normally
4. After 10 copies: Sees first milestone celebration
5. After 7 days: Sees first donation reminder (dismissible)
6. Can view stats and donate anytime via popup

### Returning User
1. Opens extension popup
2. Sees usage stats and badge
3. Can copy Bitcoin address with one click
4. Continues using extension
5. Gets gentle reminder every 7 days (dismissible)
6. Celebrates milestones at 50, 100, 250, 500 copies

## Benefits

### For Users
- Free, fully functional extension
- No payment required ever
- Appreciation for their usage
- Easy way to support if they want
- Transparent about development needs

### For Developer
- Sustainable funding option
- User engagement metrics (local only)
- Community support
- Ethical monetization
- No compromise on values

## Comparison with Other Approaches

| Approach | Elementor Copier | Typical Freemium | Typical Nagware |
|----------|------------------|------------------|-----------------|
| Full functionality | ✅ Always | ❌ Limited | ⚠️ Time-limited |
| Donation requests | ✅ Gentle | ❌ Aggressive | ❌ Constant |
| User respect | ✅ High | ⚠️ Medium | ❌ Low |
| Privacy | ✅ 100% Local | ❌ Tracking | ❌ Tracking |
| Open source | ✅ Yes | ❌ Usually no | ❌ Usually no |

## Future Enhancements (Optional)

Potential additions while maintaining ethical approach:
- Thank you message for donors (if they identify themselves)
- Hall of fame for supporters (opt-in only)
- Special badge for donors (optional, cosmetic only)
- Alternative donation methods (if requested by users)
- Donation goal progress (transparent about development costs)

## Support

If you have feedback about these features:
- [Open an Issue](https://github.com/kazemcodes/Elementor-Copier/issues)
- Suggest improvements
- Report any bugs

## Donation Information

**Bitcoin (BTC)**: `bc1qwncc5gfrzt0hwhwt9ad9vyv6eg8gxk4wlg6atm`

Your support helps:
- Maintain the extension
- Add new features
- Fix bugs
- Keep it free for everyone

Thank you! 🙏

---

**Made with ❤️ for the WordPress & Elementor community**
