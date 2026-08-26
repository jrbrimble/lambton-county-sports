const fs = require('fs');
let content = fs.readFileSync('server/_core/index.ts', 'utf8');

// add import
if (!content.includes('programSubmissionWebhookHandler')) {
  content = content.replace(
    'import { monthlyUrlCheckHandler } from "../cronHandler.js";',
    'import { monthlyUrlCheckHandler } from "../cronHandler.js";\nimport { programSubmissionWebhookHandler } from "../webhookHandler.js";'
  );
}

// add route
if (!content.includes('/api/webhook/program-submission')) {
  content = content.replace(
    'app.all("/api/cron/monthly-url-check", monthlyUrlCheckHandler);',
    'app.all("/api/cron/monthly-url-check", monthlyUrlCheckHandler);\n\n  // Webhook endpoint from GoHighLevel\n  app.post("/api/webhook/program-submission", programSubmissionWebhookHandler);'
  );
}

fs.writeFileSync('server/_core/index.ts', content);
console.log('Updated server/_core/index.ts with webhook');
