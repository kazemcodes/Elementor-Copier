# Donation Features - Visual Guide

This guide shows what users will see with the new donation features.

## 1. Welcome Notification (First Install)

```
┌─────────────────────────────────────────┐
│ 👋 Welcome to Elementor Copier!        │
│                                         │
│ Thanks for installing! This extension  │
│ is free and open-source.               │
│                                         │
│ Press Ctrl+Shift+C to start copying    │
│ elements! 🚀                            │
└─────────────────────────────────────────┘
```

**When**: First time extension is installed
**Dismissible**: Yes (auto-dismisses after a few seconds)
**Frequency**: Once only

---

## 2. Milestone Celebrations

### At 10 Copies
```
┌─────────────────────────────────────────┐
│ 🎉 Milestone Reached!                   │
│                                         │
│ You've used Elementor Copier 10 times! │
│ 🎉                                      │
│                                         │
│ If you find this extension helpful,    │
│ consider supporting development! 💝     │
│                                         │
│ [💝 Support Developer] [Maybe Later]   │
└─────────────────────────────────────────┘
```

### At 50 Copies
```
┌─────────────────────────────────────────┐
│ 🎉 Milestone Reached!                   │
│                                         │
│ Wow! 50 copies and counting! 🚀        │
│                                         │
│ If you find this extension helpful,    │
│ consider supporting development! 💝     │
│                                         │
│ [💝 Support Developer] [Maybe Later]   │
└─────────────────────────────────────────┘
```

### At 100 Copies
```
┌─────────────────────────────────────────┐
│ 🎉 Milestone Reached!                   │
│                                         │
│ Amazing! 100 elements copied! 💯       │
│                                         │
│ If you find this extension helpful,    │
│ consider supporting development! 💝     │
│                                         │
│ [💝 Support Developer] [Maybe Later]   │
└─────────────────────────────────────────┘
```

**When**: At specific usage milestones (10, 50, 100, 250, 500)
**Dismissible**: Yes
**Frequency**: Once per milestone

---

## 3. Periodic Donation Reminder

```
┌─────────────────────────────────────────┐
│ 💝 Support Elementor Copier             │
│                                         │
│ You've copied 42 elements so far!      │
│                                         │
│ This extension is free and open-source.│
│ If it saves you time, consider         │
│ supporting development! 🙏              │
│                                         │
│ [💝 Donate Bitcoin] [Remind Me Later]  │
└─────────────────────────────────────────┘
```

**When**: Every 7 days after installation
**Dismissible**: Yes (click "Remind Me Later")
**Frequency**: Every 7 days (not intrusive)

---

## 4. Extension Popup - Support Section

```
┌─────────────────────────────────────────────────┐
│  Elementor Copier                    v1.1.0     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                 │
│  ✓ Elementor Detected                          │
│                                                 │
│  Elements on this page:                        │
│  Widgets: 15                                   │
│  Sections: 5                                   │
│  Columns: 8                                    │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │ 💝 Support Development                   │  │
│  │                    [🚀 Active User!]     │  │
│  │                                          │  │
│  │ This extension is completely free! If   │  │
│  │ it saves you time, consider supporting  │  │
│  │ development.                             │  │
│  │                                          │  │
│  │ ┌────────────────────────────────────┐  │  │
│  │ │ 📊 Elements copied:            52  │  │  │
│  │ │ 📅 Days using:                 14  │  │  │
│  │ └────────────────────────────────────┘  │  │
│  │                                          │  │
│  │ Bitcoin (BTC):                           │  │
│  │ ┌────────────────────────────────────┐  │  │
│  │ │ bc1qwncc5gfrzt0hwhwt9ad9vyv6eg... │📋│  │
│  │ └────────────────────────────────────┘  │  │
│  │                                          │  │
│  │ [💝 View Donation Info]                 │  │
│  │                                          │  │
│  │ Thank you for your support! 🙏          │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  📖 Quick Guide:                               │
│  1. Press Ctrl+Shift+C to enable selector     │
│  2. Click on any Elementor element to copy    │
│  3. Go to another Elementor editor            │
│  4. Press Ctrl+V to paste                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

**When**: Anytime user opens extension popup
**Always visible**: Yes
**Interactive**: Bitcoin copy button, donation link

---

## 5. User Badges (Based on Usage)

### Default (0-49 copies)
```
┌──────────────────────────┐
│ [Free & Open Source]     │
└──────────────────────────┘
```

### Active User (50-99 copies)
```
┌──────────────────────────┐
│ [🚀 Active User!]        │
└──────────────────────────┘
```

### Super User (100-249 copies)
```
┌──────────────────────────┐
│ [💯 Super User!]         │
└──────────────────────────┘
```

### Power User (250-499 copies)
```
┌──────────────────────────┐
│ [⭐ Power User!]         │
└──────────────────────────┘
```

### Legendary User (500+ copies)
```
┌──────────────────────────┐
│ [🏆 Legendary User!]     │
└──────────────────────────┘
```

**When**: Displayed in popup support section
**Updates**: Automatically as usage increases
**Purpose**: Gamification and appreciation

---

## 6. Bitcoin Copy Success

When user clicks the copy button (📋):

```
┌─────────────────────────────────────────┐
│ ✓ Bitcoin address copied!               │
└─────────────────────────────────────────┘
```

Button changes from 📋 to ✓ for 2 seconds, then back.

---

## User Flow Examples

### Example 1: New User (Day 1)
1. **Installs extension** → Sees welcome notification
2. **Copies 5 elements** → No notifications (working normally)
3. **Copies 5 more (total 10)** → 🎉 Milestone celebration!
4. **Opens popup** → Sees stats: "10 copies, 1 day using"

### Example 2: Active User (Day 8)
1. **Copies element** → Sees periodic reminder (7 days passed)
2. **Clicks "Remind Me Later"** → Dismissed, won't see for 7 more days
3. **Opens popup** → Sees updated stats and badge
4. **Clicks Bitcoin copy** → Address copied, success message

### Example 3: Power User (Day 30)
1. **Reaches 250 copies** → 🎉 "Incredible! Power User!" notification
2. **Opens popup** → Badge shows "⭐ Power User!"
3. **Sees stats** → "250 copies, 30 days using"
4. **Clicks donate button** → Opens GitHub donation page

---

## Notification Timing

```
Timeline:
│
├─ Day 0: Install → Welcome notification
│
├─ Day 1: 10 copies → First milestone 🎉
│
├─ Day 7: → First donation reminder 💝
│
├─ Day 14: → Second donation reminder 💝
│
├─ Day 15: 50 copies → Milestone celebration 🚀
│
├─ Day 21: → Third donation reminder 💝
│
├─ Day 25: 100 copies → Milestone celebration 💯
│
└─ Day 28: → Fourth donation reminder 💝
```

**Key Points**:
- Reminders every 7 days (not every use)
- Milestones shown once each
- All notifications dismissible
- Extension always works fully

---

## Color Scheme

### Support Section
- **Background**: Pink gradient (#fff5f5 to #ffe8f0)
- **Border**: Pink (#ff6b9d)
- **Buttons**: Pink gradient
- **Badge**: Changes color based on level
  - Green: Free & Open Source
  - Blue: Active User
  - Purple: Super User
  - Orange: Power User
  - Gold: Legendary User

### Notifications
- **Success**: Green background
- **Info**: Blue background
- **Celebration**: Purple/Pink theme

---

## Accessibility

All features are:
- ✅ **Keyboard accessible**
- ✅ **Screen reader friendly**
- ✅ **High contrast**
- ✅ **Clear messaging**
- ✅ **Dismissible**

---

## Privacy Notice

All data shown is:
- ✅ Stored locally only
- ✅ Never sent to servers
- ✅ User can clear anytime
- ✅ No tracking
- ✅ No analytics

---

**This is what users will experience - respectful, helpful, and never intrusive!**
