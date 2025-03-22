class edBrowserInfo {
  static getBrowserDetails() {
    const userAgentData = navigator.userAgentData || null;
    const userAgent = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const language = navigator.language || '';

    let browser = {
      name: 'Unknown',
      version: 'Unknown',
      platform,
      language,
    };

    if (userAgentData && userAgentData.brands) {
      const primaryBrand = userAgentData.brands[0];
      browser.name = primaryBrand.brand || 'Unknown';
      browser.version = this.getFullVersionFromUserAgent(userAgent, primaryBrand.brand);
      browser.mobile = userAgentData.mobile || false;
      browser.brands = userAgentData.brands;
    } else {
      const match = userAgent.match(/(firefox|msie|trident|chrome|safari|edg|opera|opr)\/?\s*([\d.]+)/i) || [];
      const nameMap = {
        msie: 'Internet Explorer',
        trident: 'Internet Explorer',
        edg: 'Microsoft Edge',
        opr: 'Opera',
        chrome: 'Chrome',
        safari: 'Safari',
        firefox: 'Firefox',
        opera: 'Opera',
      };

      const browserName = match[1]?.toLowerCase() || '';
      browser.name = nameMap[browserName] || browserName || 'Unknown';
      browser.version = match[2] || 'Unknown';
    }

    return browser;

  }

  static getFullVersionFromUserAgent(userAgent, brand) {
    const browserMatchers = {
      'Google Chrome': /chrome\/([\d.]+)/i,
      Chromium: /chrome\/([\d.]+)/i,
      'Microsoft Edge': /edg\/([\d.]+)/i,
      Firefox: /firefox\/([\d.]+)/i,
      Safari: /version\/([\d.]+)/i,
      Opera: /opr\/([\d.]+)/i,
    };

    const regex = browserMatchers[brand];
    if (regex) {
      const match = userAgent.match(regex);
      return match ? match[1] : 'Unknown';
    }
    return 'Unknown';
  }

  static isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
  }

  static supportsWebUSB() {
    return 'usb' in navigator;
  }

  static isIOS() {
    const userAgent = navigator.userAgent || '';
    const platform = navigator.platform || '';
  
    // Check for iOS-specific patterns
    const iOSDevices = /iPhone|iPod|iPad/i.test(userAgent);
  
    // Check if platform indicates an iPad or iOS device (for iOS 13+)
    const iPadOS13Plus =
      platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  
    return iOSDevices || iPadOS13Plus;
  }
  
}




  
// Usage Example
// const browserDetails = edBrowserInfo.getBrowserDetails();
// console.log('Browser Details:', browserDetails);

// const isMobile = edBrowserInfo.isMobile();
// console.log(`Is Mobile: ${isMobile}`);

// const supportsWebUSB = edBrowserInfo.supportsWebUSB();
// console.log(`Supports WebUSB: ${supportsWebUSB ? 'Yes' : 'No'}`);

// const isIOS = edBrowserInfo.isIOS();
// console.log(`Is iOS: ${isIOS ? 'Yes' : 'No'}`);
  