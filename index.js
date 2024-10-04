const puppeteer = require('puppeteer');

(async () => {
  // Launch the browser
  const browser = await puppeteer.launch({ headless: false, args:['--window-size=1920,1080'] }); // Set headless to false for visibility
  const page = await browser.newPage();
  page.setViewport({height: 1080,width:1920});


  // Go to Instagram login page
  await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });

  // Wait for the username and password input fields and type in the credentials
  await page.waitForSelector('input[name="username"]');
  await page.type('input[name="username"]', 'username'); // Replace with your username

  await page.waitForSelector('input[name="password"]');
  await page.type('input[name="password"]', 'password'); // Replace with your password

  // Click the login button
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }), // Wait for navigation
    page.click('button[type="submit"]'), // Click the login button
  ]);


  await new Promise(resolve => setTimeout(resolve, 1000));
  await page.goto('https://www.instagram.com/accounttofollowusersfrom/', { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 1000)); 


  const secondListItem = await page.$('ul:first-of-type li:nth-of-type(2)');
  secondListItem.click();

  await new Promise(resolve => setTimeout(resolve, 1000)); 

  // Get the dimensions of the viewport
  const viewport = await page.viewport();
  const centerX = Math.floor(viewport.width / 2);
  const centerY = Math.floor(viewport.height / 2);

  // Move the mouse to the center of the viewport
  await page.mouse.move(centerX, centerY);


  const startTime = Date.now();
  const duration = 5 * 60 * 1000; // 5 minutes in milliseconds
  let lastHeight = 0;
  let currentHeight = await page.evaluate(() => document.body.scrollHeight);
  while (Date.now() - startTime < duration) {
    // Scroll down by 1000px
    let count = 0;
    await page.mouse.wheel({ deltaY: 500 });
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    // Check if a <div> with text "Follow" inside a <button> is present and click it
    const followButtonClicked = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('button')]; // Get all buttons on the page
      let clicked = false;
      
      buttons.forEach(button => {
        const div = button.querySelector('div[dir="auto"]');
        if (div && div.innerText.trim() === 'Follow') { // Check if <div> contains 'Follow        
          setTimeout(() => {
            div.click(); // Click the <div> inside the <button>
            clicked = true;
            count++;
          }, 2000);
        }
      });
      
      return clicked;
    });

    if (followButtonClicked) {
      console.log('Clicked a "Follow" button. Total: ', count);
    }

    // Check if the page height has changed to see if we can keep scrolling
    lastHeight = currentHeight;
    currentHeight = await page.evaluate(() => document.body.scrollHeight);

    if (lastHeight === currentHeight) {
      console.log('Reached the bottom or waiting for more content to load...');
      await new Promise(resolve => setTimeout(resolve, 2000)); 
    }
  }


  await new Promise(resolve => setTimeout(resolve, 1000)); 
  await page.screenshot({ path: 'profile.png' });

  // Close the browser
  await browser.close();
})();
