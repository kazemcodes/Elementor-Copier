/**
 * Donation Manager
 * Handles ethical donation reminders and usage tracking
 */

const DONATION_CONFIG = {
  reminderInterval: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  usageThresholds: [10, 50, 100, 250, 500], // Show thank you at these usage counts
  bitcoinAddress: 'bc1qwncc5gfrzt0hwhwt9ad9vyv6eg8gxk4wlg6atm'
};

class DonationManager {
  constructor() {
    this.init();
  }

  async init() {
    // Initialize donation tracking on first install
    const data = await chrome.storage.local.get(['donationData', 'firstInstallDate']);
    
    if (!data.firstInstallDate) {
      // First time install
      await chrome.storage.local.set({
        firstInstallDate: new Date().toISOString(),
        donationData: {
          usageCount: 0,
          lastReminderDate: null,
          reminderDismissCount: 0,
          hasShownWelcome: false,
          thankYouShown: []
        }
      });
    }
  }

  /**
   * Increment usage counter
   */
  async incrementUsage() {
    const data = await chrome.storage.local.get('donationData');
    const donationData = data.donationData || {
      usageCount: 0,
      lastReminderDate: null,
      reminderDismissCount: 0,
      hasShownWelcome: false,
      thankYouShown: []
    };

    donationData.usageCount++;
    await chrome.storage.local.set({ donationData });

    // Check if we should show a thank you message
    this.checkThankYouMessage(donationData.usageCount, donationData.thankYouShown);

    return donationData.usageCount;
  }

  /**
   * Check if we should show a thank you message at usage milestones
   */
  async checkThankYouMessage(usageCount, thankYouShown = []) {
    for (const threshold of DONATION_CONFIG.usageThresholds) {
      if (usageCount === threshold && !thankYouShown.includes(threshold)) {
        // Show thank you message
        this.showThankYouNotification(usageCount);
        
        // Mark as shown
        thankYouShown.push(threshold);
        const data = await chrome.storage.local.get('donationData');
        data.donationData.thankYouShown = thankYouShown;
        await chrome.storage.local.set({ donationData: data.donationData });
        
        break;
      }
    }
  }

  /**
   * Show thank you notification at usage milestones
   */
  showThankYouNotification(usageCount) {
    const messages = {
      10: "You've used Elementor Copier 10 times! 🎉",
      50: "Wow! 50 copies and counting! 🚀",
      100: "Amazing! 100 elements copied! 💯",
      250: "Incredible! 250 uses! You're a power user! ⭐",
      500: "Legendary! 500 copies! Thank you! 🏆"
    };

    const message = messages[usageCount] || `${usageCount} elements copied!`;
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '🎉 Milestone Reached!',
      message: `${message}\n\nIf you find this extension helpful, consider supporting development! 💝`,
      buttons: [
        { title: '💝 Support Developer' },
        { title: 'Maybe Later' }
      ],
      requireInteraction: false,
      priority: 1
    });
  }

  /**
   * Check if we should show donation reminder
   */
  async shouldShowReminder() {
    const data = await chrome.storage.local.get(['donationData', 'firstInstallDate']);
    const donationData = data.donationData || {};
    
    // Don't show if never dismissed before (wait for first natural reminder)
    if (!donationData.lastReminderDate) {
      // Check if 7 days have passed since install
      const installDate = new Date(data.firstInstallDate);
      const now = new Date();
      const daysSinceInstall = (now - installDate) / (24 * 60 * 60 * 1000);
      
      if (daysSinceInstall >= 7) {
        return true;
      }
      return false;
    }

    // Check if enough time has passed since last reminder
    const lastReminder = new Date(donationData.lastReminderDate);
    const now = new Date();
    const timeSinceLastReminder = now - lastReminder;

    return timeSinceLastReminder >= DONATION_CONFIG.reminderInterval;
  }

  /**
   * Show donation reminder
   */
  async showReminder() {
    const shouldShow = await this.shouldShowReminder();
    
    if (!shouldShow) {
      return false;
    }

    const data = await chrome.storage.local.get('donationData');
    const usageCount = data.donationData?.usageCount || 0;

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '💝 Support Elementor Copier',
      message: `You've copied ${usageCount} elements so far!\n\nThis extension is free and open-source. If it saves you time, consider supporting development! 🙏`,
      buttons: [
        { title: '💝 Donate Bitcoin' },
        { title: 'Remind Me Later' }
      ],
      requireInteraction: false,
      priority: 1
    });

    // Update last reminder date
    data.donationData.lastReminderDate = new Date().toISOString();
    await chrome.storage.local.set({ donationData: data.donationData });

    return true;
  }

  /**
   * Dismiss reminder
   */
  async dismissReminder() {
    const data = await chrome.storage.local.get('donationData');
    const donationData = data.donationData || {};
    
    donationData.reminderDismissCount = (donationData.reminderDismissCount || 0) + 1;
    donationData.lastReminderDate = new Date().toISOString();
    
    await chrome.storage.local.set({ donationData });
  }

  /**
   * Show welcome screen (first time only)
   */
  async showWelcomeIfNeeded() {
    const data = await chrome.storage.local.get('donationData');
    const donationData = data.donationData || {};

    if (!donationData.hasShownWelcome) {
      // Mark as shown
      donationData.hasShownWelcome = true;
      await chrome.storage.local.set({ donationData });

      // Show welcome notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: '👋 Welcome to Elementor Copier!',
        message: 'Thanks for installing! This extension is free and open-source.\n\nPress Ctrl+Shift+C to start copying elements! 🚀',
        requireInteraction: false,
        priority: 1
      });

      return true;
    }

    return false;
  }

  /**
   * Get donation stats
   */
  async getStats() {
    const data = await chrome.storage.local.get(['donationData', 'firstInstallDate']);
    const donationData = data.donationData || {};
    const installDate = data.firstInstallDate ? new Date(data.firstInstallDate) : new Date();
    const daysSinceInstall = Math.floor((new Date() - installDate) / (24 * 60 * 60 * 1000));

    return {
      usageCount: donationData.usageCount || 0,
      daysSinceInstall: daysSinceInstall,
      reminderDismissCount: donationData.reminderDismissCount || 0,
      bitcoinAddress: DONATION_CONFIG.bitcoinAddress
    };
  }

  /**
   * Open donation page
   */
  openDonationPage() {
    const url = `https://github.com/kazemcodes/elementor-copy#-support-the-project`;
    chrome.tabs.create({ url });
  }

  /**
   * Copy Bitcoin address to clipboard
   */
  async copyBitcoinAddress() {
    try {
      await navigator.clipboard.writeText(DONATION_CONFIG.bitcoinAddress);
      return true;
    } catch (error) {
      console.error('Failed to copy Bitcoin address:', error);
      return false;
    }
  }
}

// Export singleton instance
const donationManager = new DonationManager();

// Make available globally
if (typeof window !== 'undefined') {
  window.donationManager = donationManager;
}

// For module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = donationManager;
}

