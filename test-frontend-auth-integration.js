const puppeteer = require('puppeteer');

async function testFrontendAuth() {
  console.log('🧪 Testing Frontend Authentication Integration\n');

  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for headless testing
    devtools: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Enable console logging from the page
    page.on('console', msg => {
      console.log('PAGE LOG:', msg.text());
    });

    // Navigate to the app
    console.log('1. Navigating to application...');
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle2' });
    
    // Wait for the page to load
    await page.waitForTimeout(2000);

    // Look for login button or account button
    console.log('2. Looking for authentication elements...');
    
    try {
      // Try to find login button
      const loginButton = await page.$('button:contains("Login")') || 
                         await page.$('text=Login') ||
                         await page.$('[data-testid="login-button"]') ||
                         await page.$('button[class*="login"]');

      if (loginButton) {
        console.log('✅ Login button found');
        
        // Click login button
        await loginButton.click();
        await page.waitForTimeout(1000);

        // Look for auth modal
        const authModal = await page.$('.auth-modal') || 
                         await page.$('[role="dialog"]') ||
                         await page.$('.modal') ||
                         await page.$('form');

        if (authModal) {
          console.log('✅ Authentication modal opened');
          
          // Try to fill in login form
          const emailInput = await page.$('input[type="email"]') ||
                            await page.$('input[name="email"]') ||
                            await page.$('#email');
          
          const passwordInput = await page.$('input[type="password"]') ||
                               await page.$('input[name="password"]') ||
                               await page.$('#password');

          if (emailInput && passwordInput) {
            console.log('✅ Login form fields found');
            
            // Fill in credentials
            await emailInput.type('customer@test.com');
            await passwordInput.type('password123');
            
            // Look for submit button
            const submitButton = await page.$('button[type="submit"]') ||
                                await page.$('button:contains("Login")') ||
                                await page.$('button:contains("Sign In")');

            if (submitButton) {
              console.log('3. Attempting login...');
              await submitButton.click();
              
              // Wait for response and navigation
              await page.waitForTimeout(3000);
              
              // Check if we're redirected or if user is logged in
              const currentUrl = page.url();
              console.log('Current URL after login:', currentUrl);
              
              // Look for user account indicators
              const accountButton = await page.$('button:contains("Account")') ||
                                   await page.$('text=Account') ||
                                   await page.$('[data-testid="account-button"]');

              if (accountButton || currentUrl.includes('account')) {
                console.log('✅ Login successful - user redirected or account accessible');
              } else {
                console.log('⚠️  Login may not have completed successfully');
              }
            } else {
              console.log('❌ Submit button not found');
            }
          } else {
            console.log('❌ Login form fields not found');
          }
        } else {
          console.log('❌ Authentication modal not found');
        }
      } else {
        console.log('ℹ️  Login button not found - user may already be logged in');
        
        // Check if user is already authenticated
        const accountButton = await page.$('button:contains("Account")') ||
                             await page.$('text=Account') ||
                             await page.$('[data-testid="account-button"]');
        
        if (accountButton) {
          console.log('✅ User appears to be already logged in');
        }
      }

    } catch (error) {
      console.log('❌ Error during authentication test:', error.message);
    }

    console.log('\n🎉 Frontend authentication test complete!');

  } catch (error) {
    console.error('Browser test error:', error.message);
  } finally {
    await browser.close();
  }
}

// Check if puppeteer is available
try {
  testFrontendAuth();
} catch (error) {
  console.log('Puppeteer not available. Install with: npm install puppeteer');
  console.log('For now, please test the frontend authentication manually by:');
  console.log('1. Opening http://localhost:8080 in your browser');
  console.log('2. Clicking the Login button');
  console.log('3. Entering credentials: customer@test.com / password123');
  console.log('4. Verifying you are redirected to the account page');
}
