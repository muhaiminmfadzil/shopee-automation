/**
 * Get shop id from logged in account
 * @returns {string} shopid
 */
async function getShopId() {
  const url = 'https://shopee.com.my/api/v4/account/basic/get_account_info';
  let resp = await fetch(url);
  resp = await resp.json();
  const data = resp.data;
  if (!data) {
    throw new Error('Please login to shopee');
  }
  return resp.data.shopid;
}

/**
 * Get followee list from shopid
 * @param {string} shopId
 * @returns {Array} array of accounts data
 */
async function getFolloweeList({ shopId, offset, acc }) {
  const limit = 50;
  const url = `https://shopee.com.my/api/v4/pages/get_followee_list?limit=${limit}&offset=${offset}&shopid=${shopId}`;
  let resp = await fetch(url);
  resp = await resp.json();
  const data = resp.data;
  acc = acc.concat(data.accounts);
  // Error if no data found
  if (!acc[0]) {
    throw new Error('No followee');
  }
  if (data.nomore) {
    return acc;
  }
  // Recursive method
  const newOffset = offset + limit;
  acc = await getFolloweeList({ shopId, offset: newOffset, acc });
  return acc;
}

/**
 * Unfollow all followee based on shop ids
 * @param {Array} followeeShopIds array
 */
async function unfollowAllFollowee(followeeShopIds) {
  const url = 'https://shopee.com.my/api/v4/shop/unfollow';
  const opts = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  };
  for (let i = 0; i < followeeShopIds.length; i++) {
    const shopId = followeeShopIds[i];
    opts.body = JSON.stringify({ shopid: shopId });
    console.log(`Unfollowing ${shopId}`);
    await fetch(url, opts);
  }
}

/**
 * Run function
 */
async function run() {
  try {
    console.log('Getting shop id');
    const shopId = await getShopId();
    console.log('Getting followee list');
    const followee = await getFolloweeList({ shopId, offset: 0, acc: [] });
    const followeeShopIds = followee.map((item) => item.shopid);
    console.log('Starting to unfollow all followee');
    await unfollowAllFollowee(followeeShopIds);
    console.log('Unfollow done!');
  } catch (error) {
    console.log(error);
  }
}

run();
