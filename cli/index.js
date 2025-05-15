#!/usr/bin/env node

const { Command } = require('commander');

const program = new Command();

// Email templates
const EMAILS = {
  apply: 'access@pi-bb.com',
  updates: 'updates@pi-bb.com',
  sell: 'access@pi-bb.com',
  buy: 'access@pi-bb.com',
};

const SUBJECTS = {
  apply: 'PIBB Application',
  updates: 'Subscribe to PIBB Weekly Market Update',
  sell: 'Sell Inquiry',
  buy: 'Buy Inquiry',
};

const BODIES = {
  apply: `I would like to apply to PIBB. My credentials are as follows:

Name:
Company:
AUM/Investment Size:
Role:
Background:

I understand this is an invite-only platform for private transactions with a minimum transaction size of $5M+.`,
  
  updates: `Please add me to the PIBB weekly market update list.

Name:
Company:
Role:
Email:`,
  
  sell: `I would like to sell. Details:

Company:
Size:
Stage:
Valuation:
Key Metrics:
Reason for Selling:
Timeline:`,
  
  buy: `I would like to buy. Details:

Company:
Size:
Stage:
Valuation:
Key Metrics:
Reason for Buying:
Timeline:`
};

// Helper function to open email client
async function openMail(type) {
  const open = (await import('open')).default;
  const to = EMAILS[type];
  const subject = encodeURIComponent(SUBJECTS[type]);
  const body = encodeURIComponent(BODIES[type]);
  const mailto = `mailto:${to}?subject=${subject}&body=${body}`;
  await open(mailto);
}

// CLI Commands
program
  .name('pibb')
  .description('Private Institutional Bulletin Board CLI')
  .version('1.0.0');

program
  .command('apply')
  .description('Apply to PIBB')
  .action(() => openMail('apply'));

program
  .command('updates')
  .description('Join weekly market update list')
  .action(() => openMail('updates'));

program
  .command('sell')
  .description('Send a sell inquiry')
  .action(() => openMail('sell'));

program
  .command('buy')
  .description('Send a buy inquiry')
  .action(() => openMail('buy'));

program.parse(process.argv); 