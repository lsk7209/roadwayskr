async (page) => {
  // The existing static asset headers are immutable even in dev; bypass stale
  // cached chunks when checking an uncommitted HMR iteration.
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', {cacheDisabled:true});
  const origin = 'http://127.0.0.1:3020';
  const checks = [];
  const require = (condition, message) => { if (!condition) throw new Error(message); checks.push(message); };
  await page.goto(origin);
  await page.keyboard.press('Tab');
  require(await page.getByRole('link', {name:'본문 바로가기'}).evaluate(el => el === document.activeElement), 'First Tab focuses skip link');
  require(await page.getByRole('link', {name:'본문 바로가기'}).evaluate(el => getComputedStyle(el).outlineStyle !== 'none' && el.getBoundingClientRect().width > 1), 'Skip link visible with focus outline');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.activeElement?.id === 'main-content');
  require(await page.locator('main').evaluate(el => el === document.activeElement), 'Skip link moves focus to main');
  await page.getByRole('combobox', {name:'어디'}).focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  require(await page.getByRole('combobox').inputValue() === '서울', 'Region chosen with keyboard');
  require(await page.getByRole('combobox').evaluate(el => getComputedStyle(el).outlineStyle !== 'none'), 'Region keyboard focus visible');
  await page.keyboard.press('Tab');
  require(await page.getByRole('button', {name:'갈 곳 찾기 →'}).evaluate(el => el === document.activeElement), 'Tab reaches search submit');
  await page.keyboard.press('Enter');
  await page.waitForURL('**/regions/**');
  await page.getByRole('heading', {name:'서울특별시 축제·행사', exact:true}).waitFor();
  const selected = new URL(page.url());
  const from = selected.searchParams.get('from');
  const to = selected.searchParams.get('to');
  require(Boolean(from && to), 'Region submission retains displayed weekend dates');
  require(await page.locator('main').innerText().then(t => t.includes(`${from} ~ ${to}`) && !t.includes('주말 범위 밖 행사')), 'Results show selected period and exclude outside-weekend event');
  await page.reload();
  require(page.url() === selected.href, 'Refresh preserves selected filters');
  await page.getByRole('heading', {name:'서울특별시 축제·행사', exact:true}).waitFor();
  require(!(await page.locator('main').innerText()).includes('주말 범위 밖 행사'), 'Refreshed results keep date filter');
  await page.goBack();
  await page.getByRole('heading', {level:1,name:/나갈 핑계가/}).waitFor();
  require(new URL(page.url()).pathname === '/', 'Back returns to home');
  await page.getByRole('combobox').selectOption('');
  await page.getByRole('button', {name:'갈 곳 찾기 →'}).click();
  await page.waitForURL(url => url.pathname === '/weekend');
  await page.getByRole('heading', {level:1}).waitFor();
  require(!(await page.locator('main').innerText()).includes('주말 범위 밖 행사'), 'Nationwide search opens weekend and excludes outside event');
  const layouts = [];
  for (const width of [360,390,768,1440]) {
    await page.setViewportSize({width,height:900});
    for (const [name,path] of [['home','/'],['weekend','/weekend'],['region',selected.pathname+selected.search],['detail','/festivals/9900100/local-test-0']]) {
      const response = await page.goto(origin+path);
      require(response.status() === 200, `${name} ${width}px HTTP 200`);
      await page.locator('main h1').waitFor();
      const measure = await page.evaluate(() => ({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
      require(measure.scrollWidth <= measure.width, `${name} ${width}px no horizontal overflow`);
      if (name === 'home') {
        const select = await page.getByRole('combobox').boundingBox();
        const button = await page.getByRole('button',{name:'갈 곳 찾기 →'}).boundingBox();
        require(select.width > 40 && button.height >= 44 && button.y+button.height < 900, `home ${width}px search controls fit first viewport`);
      }
      await page.screenshot({path:`output/playwright/redesign-${name}-${width}.png`,fullPage:true});
      layouts.push({name,...measure});
    }
  }
  console.log(JSON.stringify({checks,layouts,selectedPeriod:{from,to},dataset:'synthetic only'},null,2));
}
