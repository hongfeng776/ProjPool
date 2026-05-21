const http = require('http');

const testCases = [
  {
    name: '10位数字手机号',
    phone: '1234567890',
    expectError: true
  },
  {
    name: '包含非数字字符',
    phone: '138abc8901',
    expectError: true
  },
  {
    name: '11位但以2开头',
    phone: '23812345678',
    expectError: true
  },
  {
    name: '11位但以10开头',
    phone: '10812345678',
    expectError: true
  },
  {
    name: '11位但以11开头',
    phone: '11812345678',
    expectError: true
  },
  {
    name: '11位但以12开头',
    phone: '12812345678',
    expectError: true
  },
  {
    name: '正确格式11位手机号(138)',
    phone: '13812345678',
    expectError: false
  },
  {
    name: '正确格式11位手机号(159)',
    phone: '15912345678',
    expectError: false
  },
  {
    name: '正确格式11位手机号(186)',
    phone: '18612345678',
    expectError: false
  },
  {
    name: '空手机号',
    phone: '',
    expectError: true
  }
];

const postData = (name, phone) => JSON.stringify({ name, phone });

const runTest = (testCase) => {
  return new Promise((resolve) => {
    const data = postData('测试用户', testCase.phone);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/members',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        const result = JSON.parse(body);
        const pass = testCase.expectError 
          ? (result.code !== 0 && result.message.includes('手机'))
          : (result.message !== '手机号长度' && result.message !== '手机号格式' && result.message !== '手机号必须');
        console.log(`[${pass ? '✓' : '✗'}] ${testCase.name}: ${testCase.phone}`);
        if (!pass) {
          console.log(`    期望: ${testCase.expectError ? '校验失败' : '校验通过'}`);
          console.log(`    实际: ${result.message}`);
        }
        resolve(pass);
      });
    });

    req.on('error', (e) => {
      console.log(`[✗] ${testCase.name}: 请求失败 - ${e.message}`);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
};

async function runAllTests() {
  console.log('=== 手机号校验测试 ===\n');
  let passed = 0;
  for (const test of testCases) {
    const result = await runTest(test);
    if (result) passed++;
    await new Promise(r => setTimeout(r, 100));
  }
  console.log(`\n=== 测试结果: ${passed}/${testCases.length} 通过 ===`);
}

runAllTests();
