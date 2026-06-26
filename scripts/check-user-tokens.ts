import 'dotenv/config';
import { prisma } from '../src/lib/db';

async function checkUserTokens() {
  const user = await prisma.user.findUnique({
    where: { email: 'imd 2026 at itbieeewebsite@gmail.com' },
    include: {
      activateTokens: {
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
  });

  if (!user) {
    console.log('❌ User not found');
    return;
  }

  console.log('👤 User:', user.email);
  console.log('Name:', user.name);
  console.log('Active:', user.active);
  console.log('Email Verified:', user.emailVerified);
  console.log('\n📧 Recent Activation Tokens:');

  user.activateTokens.forEach((token, i) => {
    const age = Date.now() - token.createdAt.getTime();
    const ageMinutes = Math.floor(age / 1000 / 60);
    console.log(`\nToken ${i + 1}:`);
    console.log('  Token:', token.token);
    console.log('  Created:', token.createdAt.toISOString());
    console.log('  Age:', ageMinutes, 'minutes ago');
    console.log(
      '  Activated:',
      token.activatedAt ? token.activatedAt.toISOString() : 'Not yet',
    );
  });

  if (user.activateTokens.length > 0 && !user.active) {
    const latestToken = user.activateTokens[0];
    console.log('\n🔗 Activation Link:');
    console.log(`http://localhost:3000/activate?token=${latestToken.token}`);
  }

  await prisma.$disconnect();
}

checkUserTokens();
